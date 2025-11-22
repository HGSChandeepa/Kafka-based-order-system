import { kafkaAdmin, producer } from './config/kafka.config';
import { OrderConsumer } from './consumers/order.consumer';
import { DLQConsumer } from './consumers/dlq.consumer';

async function main() {
  try {
    console.log('starting Kafka Order Processing System...');
    
    // Create topics if they don't exist
    await kafkaAdmin.connect();
    const topics = [
      { topic: 'orders', numPartitions: 3 },
      { topic: 'orders-retry', numPartitions: 3 },
      { topic: 'orders-dlq', numPartitions: 1 },
    ];
    
    for (const { topic, numPartitions } of topics) {
      const topicExists = await kafkaAdmin.listTopics();
      if (!topicExists.includes(topic)) {
        await kafkaAdmin.createTopics({
          topics: [{ topic, numPartitions }],
        });
        console.log(`Created topic: ${topic}`);
      }
    }
    await kafkaAdmin.disconnect();

    // Start producer
    await producer.connect();
    console.log('Producer connected');

    // Start consumers
    const orderConsumer = new OrderConsumer(kafka.consumer({ groupId: 'order-processor-group' }));
    const dlqConsumer = new DLQConsumer(kafka.consumer({ groupId: 'order-dlq-group' }));
    
    await orderConsumer.start();
    await dlqConsumer.start();

    console.log('System running. Press Ctrl+C to exit.');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down...');
      await orderConsumer.stop();
      await dlqConsumer.stop();
      await producer.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();