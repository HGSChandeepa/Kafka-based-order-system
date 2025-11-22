import { OrderProducer } from "../src/producers/order.producer";
import { Order } from "../src/schemas/order.schema";
import { producer } from "../src/config/kafka.config";

const products = [
  "Laptop",
  "Mouse",
  "Keyboard",
  "Monitor",
  "Headphones",
  "Webcam",
];
const orderProducer = new OrderProducer(producer);

async function generateOrders(count: number = 100) {
  await producer.connect();

  for (let i = 1; i <= count; i++) {
    const order: Order = {
      orderId: `ORD-${Date.now()}-${i}`,
      product: products[Math.floor(Math.random() * products.length)],
      price: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
    };

    await orderProducer.produceOrder(order);

    // Random delay between orders
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  }

  await producer.disconnect();
}

// Run if called directly
if (require.main === module) {
  const count = parseInt(process.argv[2]) || 50;
  console.log(`📤 Generating ${count} mock orders...`);
  generateOrders(count).catch(console.error);
}

export { generateOrders };
