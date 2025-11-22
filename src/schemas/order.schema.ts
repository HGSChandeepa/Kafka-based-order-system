import * as avro from 'avsc';
import * as fs from 'fs';
import * as path from 'path';

const schemaPath = path.join(__dirname, '../../avro/Order.avsc');
const schemaJSON = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

// Compile Avro schema for TypeScript
export const OrderAvroType = avro.Type.forSchema(schemaJSON);

export interface Order {
  orderId: string;
  product: string;
  price: number;
}

// Validate order against Avro schema
export function validateOrder(order: Order): boolean {
  try {
    OrderAvroType.isValid(order, { errorHook: (path, val) => {
      throw new Error(`Validation error at ${path}: ${val}`);
    }});
    return true;
  } catch (error) {
    console.error('Order validation failed:', error);
    return false;
  }
}