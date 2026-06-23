import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Transaction from './models/Transaction.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to MongoDB
connectDB();

// Import Data
const importData = async () => {
  try {
    const filePath = path.resolve(__dirname, 'data/transactions.json');
    const transactions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Clear existing data
    await Transaction.deleteMany();
    console.log('Database Cleared (existing transactions deleted)...');

    // Insert new data
    await Transaction.insertMany(transactions);
    console.log('Sample Data Imported Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

// Destroy Data
const destroyData = async () => {
  try {
    await Transaction.deleteMany();
    console.log('Database Cleared (all transactions deleted)...');
    process.exit(0);
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

// Execute action based on CLI flags
if (process.argv[2] === '-d' || process.argv[2] === '-destroy') {
  destroyData();
} else {
  importData();
}
