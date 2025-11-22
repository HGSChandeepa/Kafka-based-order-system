import { Consumer, EachMessagePayload } from 'kafkajs';
import { OrderAvroType, Order } from '../schemas/order.schema';
import { PriceAggregator } from '../aggregators/price.aggregator';
import { TOPICS, RETRY_CONFIG, producer } from '../config/kafka.config';

export class OrderConsumer {
  private retryCounts = new Map<string, number>();
  private priceAggregator: PriceAggregator;

  constructor(private consumer: Consumer) {
    this.priceAggregator = new PriceAggregator();
  }

  async start(): Promise<void> {
    await this.consumer.subscribe({ 
      topic: TOPICS.ORDERS, 
      fromBeginning: true 
    });

    // Also subscribe to retry topic
    await this.consumer.subscribe({ 
      topic: TOPICS.RETRY, 
      fromBeginning: true 
    });

    await this.consumer.run({
      eachMessage: async (messagePayload: EachMessagePayload) => {
        const { topic, partition, message } = messagePayload;
        const key = message.key?.toString() || '';
        
        try {
          // Deserialize Avro message
          const order = OrderAvroType.fromBuffer(message.value as Buffer) as Order;
          
          // Process the order
          await this.processOrder(order);
          
          // Commit offset on success
          await this.consumer.commitOffsets([{
            topic,
            partition,
            offset: (parseInt(message.offset) + 1).toString(),
          }]);
          
        } catch (error) {
          console.error(`Error processing message ${key}:`, error);
          await this.handleFailure(messagePayload, error as Error);
        }
      },
    });
  }

  private async processOrder(order: Order): Promise<void> {
    console.log(` Processing order: ${order.orderId} | ${order.product} | $${order.price.toFixed(2)}`);
    
    // Simulate random failures (10% chance) for demonstration
    if (Math.random() < 0.1) {
      throw new Error('Simulated temporary failure');
    }

    // Update running average
    const avg = this.priceAggregator.update(order.price);
    
    console.log(` Running average price: $${avg.toFixed(2)}`);
  }

  private async handleFailure(payload: EachMessagePayload, error: Error): Promise<void> {
    const { topic, message } = payload;
    const key = message.key?.toString() || '';
    
    // Track retry count
    const currentCount = this.retryCounts.get(key) || 0;
    const nextCount = currentCount + 1;
    this.retryCounts.set(key, nextCount);

    if (nextCount >= RETRY_CONFIG.dlqThreshold) {
      // Send to DLQ after threshold
      console.log(` Sending to DLQ after ${nextCount} attempts: ${key}`);
      await producer.send({
        topic: TOPICS.DLQ,
        messages: [{
          key,
          value: message.value,
          headers: {
            'original-topic': topic,
            'failure-reason': error.message,
            'retry-count': nextCount.toString(),
          },
        }],
      });
      this.retryCounts.delete(key);
    } else {
      // Retry with exponential backoff
      const delay = RETRY_CONFIG.retryDelay * Math.pow(2, currentCount);
      console.log(`🔄 Retrying (${nextCount}/${RETRY_CONFIG.dlqThreshold}) after ${delay}ms: ${key}`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      await producer.send({
        topic: TOPICS.RETRY,
        messages: [{
          key,
          value: message.value,
          headers: {
            'retry-count': nextCount.toString(),
          },
        }],
      });
    }
  }

  async stop(): Promise<void> {
    await this.consumer.stop();
  }

  getAveragePrice(): number {
    return this.priceAggregator.getCurrentAverage();
  }
}