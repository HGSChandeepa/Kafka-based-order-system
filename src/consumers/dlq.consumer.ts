import { Consumer, EachMessagePayload } from 'kafkajs';
import { OrderAvroType, Order } from '../schemas/order.schema';

export class DLQConsumer {
  constructor(private consumer: Consumer) {}

  async start(): Promise<void> {
    await this.consumer.subscribe({ 
      topic: 'orders-dlq', 
      fromBeginning: true 
    });

    await this.consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        try {
          const order = OrderAvroType.fromBuffer(message.value as Buffer) as Order;
          const failureReason = message.headers?.['failure-reason']?.toString() || 'Unknown';
          const retryCount = message.headers?.['retry-count']?.toString() || '0';
          
          console.log(`   DLQ Message: ${order.orderId} | ${order.product} | $${order.price.toFixed(2)}`);
          console.log(`   Reason: ${failureReason} | Retries: ${retryCount}`);
          
          // In production, you might:
          // - Send alerts
          // - Store in a database
          // - Log to monitoring system
          
        } catch (error) {
          console.error('Error processing DLQ message:', error);
        }
      },
    });
  }

  async stop(): Promise<void> {
    await this.consumer.stop();
  }
}