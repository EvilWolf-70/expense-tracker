import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title or description'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Please add a positive amount'],
      min: [0.01, 'Amount must be greater than 0']
    },
    type: {
      type: String,
      required: [true, 'Please specify if transaction is income or expense'],
      enum: {
        values: ['income', 'expense'],
        message: '{VALUE} is not a valid transaction type'
      }
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
      default: Date.now
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot be more than 500 characters']
    }
  },
  {
    timestamps: true
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
