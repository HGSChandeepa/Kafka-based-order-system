# Kafka-Based Order Processing System

A distributed order-processing system built with **Kafka**, **Avro**, and **TypeScript**.  
Implements real-time price aggregation, retry handling with exponential backoff, and dead-letter queue processing.

**Repository:** https://github.com/HGSChandeepa/Kafka-based-order-system

---

## Features

- Avro serialization with schema validation  
- Real-time price aggregation  
- Exponential backoff retry logic  
- Dead letter queue (DLQ) for permanently failed messages  
- Dockerized Kafka infrastructure  
- Full TypeScript implementation

---

## Quick Start

```bash
git clone https://github.com/HGSChandeepa/Kafka-based-order-system.git
cd Kafka-based-order-system
npm install
npm run demo
````

---

## Manual Execution

### Start Kafka

```bash
npm run kafka:up
```

### Run the system

```bash
npm run build
npm start
```

### Generate sample orders

```bash
npm run produce 100
```

---

## Monitoring

Open **AKHQ UI** at:

**[http://localhost:8080](http://localhost:8080)**

Use it to inspect topics, messages, partitions, and consumer groups in real time.

---

## Kafka Topics

* **orders** — main topic
* **orders-retry** — retry attempts with increasing backoff
* **orders-dlq** — messages failed after max retries

---

## Assignment Coverage

This system demonstrates:

* Avro-based serialization and schema validation
* Streaming calculation of running price averages
* Three retry attempts using exponential backoff
* Automatic DLQ routing of permanently failed events
* Real-time message flow visibility via AKHQ

