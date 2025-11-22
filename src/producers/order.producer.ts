import { Producer } from 'kafkajs';
import { OrderAvroType, Order } from '../schemas/order.schema';

export class OrderProducer {
  constructor(private producer: Producer) {}

  async produceOrder(order: Order, topic: string = 'orders'): Promise<void> {
    // Validate against Avro schema
    if (!OrderAvroType.isValid(order)) {
      throw new Error(`Invalid order format: ${JSON.stringify(order)}`);
    }

    // Serialize with Avro
    const serialized = OrderAvroType.toBuffer(order);

    await this.producer.send({
      topic,
      messages: [
        {
          key: order.orderId,
          value: serialized,
        },
      ],
    });

    console.log(`✅ Order produced: ${order.orderId} | ${order.product} | $${order.price.toFixed(2)}`);
  }
}