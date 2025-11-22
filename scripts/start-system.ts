import { exec } from "child_process";
import { promisify } from "util";
import { OrderProducer } from "../src/producers/order.producer";
import { Order } from "../src/schemas/order.schema";
import { producer, TOPICS } from "../src/config/kafka.config";

const execAsync = promisify(exec);

async function runDemo() {
  console.log("🎬 Starting Live Demo...");

  // 1. Build the project
  console.log("📦 Building project...");
  await execAsync("npm run build");

  // 2. Start Kafka
  console.log("🐳 Starting Kafka...");
  await execAsync("docker-compose up -d");

  // Wait for Kafka to be ready
  console.log("⏳ Waiting for Kafka to be ready...");
  await new Promise((resolve) => setTimeout(resolve, 15000));

  // 3. Start main system in background
  console.log("🚀 Starting order processing system...");
  const systemProcess = exec("npm run start");

  systemProcess.stdout?.on("data", (data) => {
    console.log(`[SYSTEM] ${data}`);
  });

  systemProcess.stderr?.on("data", (data) => {
    console.error(`[SYSTEM ERROR] ${data}`);
  });

  // Wait for system to initialize
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // 4. Produce demo orders
  console.log("📤 Sending demo orders...");
  await producer.connect();

  const demoOrders: Order[] = [
    { orderId: "DEMO-001", product: "Gaming Laptop", price: 1299.99 },
    { orderId: "DEMO-002", product: "RGB Mouse", price: 79.5 },
    { orderId: "DEMO-003", product: "Mechanical Keyboard", price: 149.99 },
    { orderId: "DEMO-004", product: "4K Monitor", price: 599.0 },
    { orderId: "DEMO-005", product: "Gaming Headset", price: 199.99 },
  ];

  const orderProducer = new OrderProducer(producer);

  for (const order of demoOrders) {
    await orderProducer.produceOrder(order);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  await producer.disconnect();

  console.log("✅ Demo orders sent!");
  console.log("📊 Watch the aggregation and retry logic in action...");

  // 5. Show instructions
  console.log("\n📋 Demo running! Check:");
  console.log("   - Console output for processing logs");
  console.log("   - Kafka UI at http://localhost:8080");
  console.log("\n🛑 Press Ctrl+C to stop...");
}

runDemo().catch(console.error);
