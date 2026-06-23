import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, Calendar, Tag, ArrowUpDown, Filter } from 'lucide-react';
import { CATEGORIES } from './TransactionForm';

// Emoji mapping for categories to give a premium, visual aesthetic
const CATEGORY_EMOJIS = {
  // Income
  'Salary': '💼',
  'Freelance': '💻',
  'Investment': '📈',
  'Gift': '🎁',
  
  // Expense
  'Food & Dining': '🍔',
  'Rent & Utilities': '🏠',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Travel': '✈️',
  'Health & Medical': '🏥',
  'Education': '📚',
  
  // General fallback
  'Other': '🏷️'
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // Compute all unique categories dynamically based on type filter
  const availableCategories = useMemo(() => {
    if (typeFilter === 'all') {
      return Array.from(new Set([...CATEGORIES.income, ...CATEGORIES.expense]));
    }
    return CATEGORIES[typeFilter] || [];
  }, [typeFilter]);

  // Reset category filter if it becomes invalid when changing type
  const handleTypeFilterChange = (e) => {
    const val = e.target.value;
    setTypeFilter(val);
    setCategoryFilter('all');
  };

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search filter
        const matchesSearch = 
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Type filter
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        
        // Category filter
        const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date_desc':
            return new Date(b.date) - new Date(a.date);
          case 'date_asc':
            return new Date(a.date) - new Date(b.date);
          case 'amount_desc':
            return b.amount - a.amount;
          case 'amount_asc':
            return a.amount - b.amount;
          case 'title_asc':
            return a.title.localeCompare(b.title);
          case 'title_desc':
            return b.title.localeCompare(a.title);
          default:
            return 0;
        }
      });
  }, [transactions, searchTerm, typeFilter, categoryFilter, sortBy]);

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="list-header">
        <h2 className="list-title">Recent Transactions</h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing {filteredAndSortedTransactions.length} of {transactions.length}
        </span>
      </div>

      {/* Controls: Search, Filters, Sorting */}
      <div className="controls-row">
        {/* Search */}
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <select
          className="form-control filter-select"
          value={typeFilter}
          onChange={handleTypeFilterChange}
        >
          <option value="all" style={{ backgroundColor: 'var(--bg-dark)' }}>All Types</option>
          <option value="income" style={{ backgroundColor: 'var(--bg-dark)' }}>Income Only</option>
          <option value="expense" style={{ backgroundColor: 'var(--bg-dark)' }}>Expense Only</option>
        </select>

        {/* Category Filter */}
        <select
          className="form-control filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all" style={{ backgroundColor: 'var(--bg-dark)' }}>All Categories</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat} style={{ backgroundColor: 'var(--bg-dark)' }}>
              {cat}
            </option>
          ))}
        </select>

        {/* Sorting */}
        <select
          className="form-control filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date_desc" style={{ backgroundColor: 'var(--bg-dark)' }}>Newest First</option>
          <option value="date_asc" style={{ backgroundColor: 'var(--bg-dark)' }}>Oldest First</option>
          <option value="amount_desc" style={{ backgroundColor: 'var(--bg-dark)' }}>Highest Amount</option>
          <option value="amount_asc" style={{ backgroundColor: 'var(--bg-dark)' }}>Lowest Amount</option>
          <option value="title_asc" style={{ backgroundColor: 'var(--bg-dark)' }}>A - Z</option>
          <option value="title_desc" style={{ backgroundColor: 'var(--bg-dark)' }}>Z - A</option>
        </select>
      </div>

      {/* Transaction List Items */}
      <div className="transaction-list-container">
        {filteredAndSortedTransactions.length > 0 ? (
          filteredAndSortedTransactions.map((t) => (
            <div 
              key={t._id} 
              className="transaction-item"
              style={{ borderLeft: `4px solid ${t.type === 'income' ? 'var(--success)' : 'var(--danger)'}` }}
            >
              <div className="transaction-left">
                <div 
                  className="category-badge"
                  style={{ 
                    backgroundColor: t.type === 'income' ? 'var(--success-glow)' : 'var(--danger-glow)',
                    border: `1px solid ${t.type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`
                  }}
                >
                  {CATEGORY_EMOJIS[t.category] || '🏷️'}
                </div>
                <div className="transaction-info">
                  <div className="transaction-title">{t.title}</div>
                  <div className="transaction-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Tag size={12} />
                      {t.category}
                    </span>
                    <span className="bullet">•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Calendar size={12} />
                      {formatDate(t.date)}
                    </span>
                  </div>
                  {t.notes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.1rem' }}>
                      {t.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="transaction-right">
                <div className={`transaction-amount ${t.type}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </div>
                
                <div className="action-buttons">
                  <button 
                    className="btn-icon-only" 
                    onClick={() => onEdit(t)}
                    title="Edit transaction"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    className="btn-icon-only danger" 
                    onClick={() => onDelete(t._id)}
                    title="Delete transaction"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No Transactions Found</h3>
            <p>Try adjusting your search query, filter criteria, or add a new transaction.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
export { CATEGORY_EMOJIS, formatCurrency };
