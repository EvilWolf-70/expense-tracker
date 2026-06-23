import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  RefreshCw, 
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  fetchTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction 
} from './services/api';
import TransactionForm from './components/TransactionForm';
import TransactionList, { formatCurrency } from './components/TransactionList';
import CategoryBreakdown from './components/CategoryBreakdown';
import TrendsChart from './components/TrendsChart';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Load transactions from API on load
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (err) {
      addToast(err.message || 'Error loading transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Toast notifications helper
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  };

  // Create transaction handler
  const handleCreate = async (transactionData) => {
    try {
      const newTx = await createTransaction(transactionData);
      setTransactions((prev) => [newTx, ...prev]);
      addToast('Transaction recorded successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Could not add transaction', 'error');
    }
  };

  // Edit/Update transaction handler
  const handleUpdate = async (transactionData) => {
    if (!editingTransaction) return;
    try {
      const updatedTx = await updateTransaction(editingTransaction._id, transactionData);
      setTransactions((prev) => 
        prev.map((t) => (t._id === editingTransaction._id ? updatedTx : t))
      );
      setEditingTransaction(null);
      addToast('Transaction updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Could not update transaction', 'error');
    }
  };

  // Delete transaction handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      addToast('Transaction deleted successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Could not delete transaction', 'error');
    }
  };

  // Calculate totals
  const stats = React.useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });

    const totalBalance = totalIncome - totalExpense;

    return {
      totalBalance,
      totalIncome,
      totalExpense
    };
  }, [transactions]);

  return (
    <div className="app-container">
      {/* Header Area */}
      <header>
        <div className="brand-section">
          <div className="brand-logo-glow">
            <Wallet size={22} />
          </div>
          <div className="brand-title">
            <h1>FinFlow</h1>
            <div className="brand-subtitle">Smart Personal Expense Tracker</div>
          </div>
        </div>
        <div>
          <button 
            className="btn btn-outline" 
            onClick={loadTransactions} 
            disabled={loading}
            style={{ width: 'auto', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
            Refresh
          </button>
        </div>
      </header>

      {/* Stats Summary Cards (Top Row) */}
      <div className="stats-grid">
        {/* Balance Card */}
        <div className="glass-card primary-accent stat-card">
          <div className="stat-header">
            <span className="stat-title">Current Balance</span>
            <div className="stat-icon primary">
              <Wallet size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">{formatCurrency(stats.totalBalance)}</div>
            <div className="stat-meta">Net cash flow position</div>
          </div>
        </div>

        {/* Income Card */}
        <div className="glass-card success-accent stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Income</span>
            <div className="stat-icon success">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              {formatCurrency(stats.totalIncome)}
            </div>
            <div className="stat-meta">Cumulative earnings received</div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="glass-card danger-accent stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Expenses</span>
            <div className="stat-icon danger">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>
              {formatCurrency(stats.totalExpense)}
            </div>
            <div className="stat-meta">Cumulative funds spent</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar (Forms & Breakdown) & Content (Charts & Lists) */}
      <div className="dashboard-grid">
        
        {/* Sidebar Panel */}
        <div className="sidebar-panel">
          {/* Add Transaction Form (Only displays if NOT editing, or inline edits) */}
          {!editingTransaction && (
            <TransactionForm onSave={handleCreate} />
          )}

          {/* Category breakdown visual representation */}
          <CategoryBreakdown transactions={transactions} />
        </div>

        {/* Main Content Panel */}
        <div className="main-content-panel">
          {/* Custom SVG Trends Chart */}
          <TrendsChart transactions={transactions} />

          {/* Interactive list of transactions */}
          {loading ? (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
              <div style={{ textAlign: 'center' }}>
                <RefreshCw size={36} className="spin-anim primary" style={{ marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Synchronizing ledger...</p>
              </div>
            </div>
          ) : (
            <TransactionList 
              transactions={transactions} 
              onEdit={setEditingTransaction} 
              onDelete={handleDelete} 
            />
          )}
        </div>
      </div>

      {/* Editing Transaction Modal Overlay */}
      {editingTransaction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <TransactionForm 
              transaction={editingTransaction} 
              onSave={handleUpdate} 
              onCancel={() => setEditingTransaction(null)} 
            />
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Keyframe animations styles injector */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spin 1.5s linear infinite;
        }
        .text-success {
          color: var(--success);
        }
        .text-danger {
          color: var(--danger);
        }
      `}</style>
    </div>
  );
}

export default App;
