import { Kafka, KafkaConfig } from 'kafkajs';
import * as dotenv from 'dotenv';

dotenv.config();

export const kafkaConfig: KafkaConfig = {
  clientId: process.env.KAFKA_CLIENT_ID || 'order-system',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
};

export const kafka = new Kafka(kafkaConfig);

export const TOPICS = {
  ORDERS: process.env.ORDER_TOPIC || 'orders',
  RETRY: process.env.RETRY_TOPIC || 'orders-retry',
  DLQ: process.env.DLQ_TOPIC || 'orders-dlq',
};

export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds
  dlqThreshold: 3, // After 3 failures, send to DLQ
};

export const kafkaAdmin = kafka.admin();
export const producer = kafka.producer();
export const consumer = kafka.consumer({ 
  groupId: 'order-processor-group',
  retry: {
    retries: RETRY_CONFIG.maxRetries,
  },
});

export const dlqConsumer = kafka.consumer({ 
  groupId: 'order-dlq-group',
});