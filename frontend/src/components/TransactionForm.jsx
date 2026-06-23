import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, X, Calendar, DollarSign, Tag, FileText } from 'lucide-react';

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: [
    'Food & Dining',
    'Rent & Utilities',
    'Shopping',
    'Entertainment',
    'Travel',
    'Health & Medical',
    'Education',
    'Other'
  ]
};

const TransactionForm = ({ transaction, onSave, onCancel }) => {
  const isEditing = !!transaction;
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  // Update state when editing transaction changes
  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title || '');
      setAmount(transaction.amount || '');
      setType(transaction.type || 'expense');
      setCategory(transaction.category || '');
      setDate(transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setNotes(transaction.notes || '');
    } else {
      resetForm();
    }
  }, [transaction]);

  // Set default category when type changes
  useEffect(() => {
    if (!transaction) {
      setCategory(CATEGORIES[type][0]);
    }
  }, [type, transaction]);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory(CATEGORIES.expense[0]);
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!category) return;

    const transactionData = {
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      date: new Date(date).toISOString(),
      notes: notes.trim()
    };

    onSave(transactionData);
    
    if (!isEditing) {
      resetForm();
    }
  };

  return (
    <div className={`glass-card ${type === 'income' ? 'success-accent' : 'danger-accent'}`}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {isEditing ? (
          <>
            <Save size={20} className={type === 'income' ? 'text-success' : 'text-danger'} />
            Edit Transaction
          </>
        ) : (
          <>
            <PlusCircle size={20} className="primary" />
            Add Transaction
          </>
        )}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Type Selector Tabs */}
        <div className="tabs-container">
          <button
            type="button"
            className={`tab-btn ${type === 'expense' ? 'active' : ''}`}
            style={{ backgroundColor: type === 'expense' ? 'var(--danger)' : 'transparent', boxShadow: type === 'expense' ? '0 4px 10px rgba(244, 63, 94, 0.3)' : 'none' }}
            onClick={() => setType('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={`tab-btn ${type === 'income' ? 'active' : ''}`}
            style={{ backgroundColor: type === 'income' ? 'var(--success)' : 'transparent', boxShadow: type === 'income' ? '0 4px 10px rgba(16, 185, 129, 0.3)' : 'none' }}
            onClick={() => setType('income')}
          >
            Income
          </button>
        </div>

        {/* Title Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="title">Description</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              id="title"
              className="form-control"
              placeholder="e.g. Weekly Grocery Run"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
          </div>
        </div>

        {/* Amount and Date Inputs */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="amount">Amount ($)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                id="amount"
                className="form-control"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Category Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="category">Category</label>
          <select
            id="category"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {CATEGORIES[type].map((cat) => (
              <option key={cat} value={cat} style={{ backgroundColor: 'var(--bg-dark)' }}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Notes Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            className="form-control"
            placeholder="Add extra details..."
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          {isEditing && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancel}
              style={{ flex: 1 }}
            >
              <X size={18} />
              Cancel
            </button>
          )}
          <button
            type="submit"
            className={`btn ${type === 'income' ? 'btn-success' : 'btn-danger'}`}
            style={{ flex: 2 }}
          >
            {isEditing ? <Save size={18} /> : <PlusCircle size={18} />}
            {isEditing ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
export { CATEGORIES };
