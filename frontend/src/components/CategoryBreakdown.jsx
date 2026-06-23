import React, { useState, useMemo } from 'react';
import { CATEGORY_EMOJIS, formatCurrency } from './TransactionList';

// Predefined colors for categories to create a visually cohesive, premium UI
const CATEGORY_COLORS = {
  // Income
  'Salary': '#10b981', // emerald
  'Freelance': '#06b6d4', // cyan
  'Investment': '#6366f1', // indigo
  'Gift': '#eab308', // yellow
  
  // Expense
  'Food & Dining': '#f97316', // orange
  'Rent & Utilities': '#8b5cf6', // purple
  'Shopping': '#ec4899', // pink
  'Entertainment': '#f43f5e', // rose
  'Travel': '#3b82f6', // blue
  'Health & Medical': '#14b8a6', // teal
  'Education': '#a855f7', // purple-light
  
  // General Fallback
  'Other': '#6b7280' // gray
};

const CategoryBreakdown = ({ transactions }) => {
  const [breakdownType, setBreakdownType] = useState('expense');

  // Compute breakdown metrics
  const breakdownData = useMemo(() => {
    // Filter transactions by type
    const items = transactions.filter((t) => t.type === breakdownType);
    
    // Sum by category
    const categoryTotals = {};
    let totalSum = 0;

    items.forEach((item) => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
      totalSum += item.amount;
    });

    // Map to array and calculate percentages
    return Object.keys(categoryTotals)
      .map((cat) => {
        const amount = categoryTotals[cat];
        const percentage = totalSum > 0 ? (amount / totalSum) * 100 : 0;
        return {
          category: cat,
          amount,
          percentage,
          color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other,
          emoji: CATEGORY_EMOJIS[cat] || '🏷️'
        };
      })
      .sort((a, b) => b.amount - a.amount); // Sort by highest spending/income
  }, [transactions, breakdownType]);

  // Total for the current view
  const totalAmount = breakdownData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="glass-card" style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Category Analysis</h2>
        
        {/* Toggle Button for Income vs Expense */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '2px' }}>
          <button
            onClick={() => setBreakdownType('expense')}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: breakdownType === 'expense' ? 'var(--danger-glow)' : 'transparent',
              color: breakdownType === 'expense' ? 'var(--danger)' : 'var(--text-secondary)',
              transition: 'var(--transition-fast)'
            }}
          >
            Expenses
          </button>
          <button
            onClick={() => setBreakdownType('income')}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: breakdownType === 'income' ? 'var(--success-glow)' : 'transparent',
              color: breakdownType === 'income' ? 'var(--success)' : 'var(--text-secondary)',
              transition: 'var(--transition-fast)'
            }}
          >
            Income
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed var(--border-glass)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
          Total {breakdownType === 'income' ? 'Income Analyzed' : 'Expenses Analyzed'}
        </span>
        <span style={{ fontSize: '1.6rem', fontWeight: 800, color: breakdownType === 'income' ? 'var(--success)' : 'var(--danger)' }}>
          {formatCurrency(totalAmount)}
        </span>
      </div>

      {breakdownData.length > 0 ? (
        <div className="category-breakdown-list">
          {breakdownData.map((item) => (
            <div key={item.category} className="category-stat-item">
              <div className="category-stat-info">
                <div className="category-name-wrap">
                  <span style={{ fontSize: '1.1rem' }}>{item.emoji}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{item.category}</span>
                </div>
                <div className="category-stat-vals">
                  <span style={{ fontWeight: 700 }}>{formatCurrency(item.amount)}</span>
                  <span className="category-stat-percent">({item.percentage.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                    boxShadow: `0 0 10px ${item.color}50` // Glowing progress bars!
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: '2rem 1rem' }}>
          <div style={{ fontSize: '2rem', opacity: 0.4, marginBottom: '0.5rem' }}>📊</div>
          <h3>No Data Available</h3>
          <p>Add some {breakdownType === 'income' ? 'income' : 'expense'} transactions to see your category breakdown.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryBreakdown;
export { CATEGORY_COLORS };
