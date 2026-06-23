import React, { useState, useMemo } from 'react';
import { TrendingUp, Award, Calendar } from 'lucide-react';
import { formatCurrency } from './TransactionList';

const TrendsChart = ({ transactions }) => {
  const [timeframe, setTimeframe] = useState('7days'); // '7days', '30days', 'all'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Process data chronologically
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Filter transactions based on timeframe
    const now = new Date();
    const cutoffDate = new Date();
    if (timeframe === '7days') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeframe === '30days') {
      cutoffDate.setDate(now.getDate() - 30);
    } else {
      cutoffDate.setFullYear(now.getFullYear() - 10); // basically all
    }

    const filtered = transactions.filter(t => new Date(t.date) >= cutoffDate);

    // Group transactions by date
    const dateMap = {};
    filtered.forEach((t) => {
      const dateKey = new Date(t.date).toISOString().split('T')[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        dateMap[dateKey].income += t.amount;
      } else {
        dateMap[dateKey].expense += t.amount;
      }
    });

    // Convert map to sorted array
    const sortedDates = Object.keys(dateMap).sort();
    
    // If no data, return empty
    if (sortedDates.length === 0) return [];

    return sortedDates.map((date) => ({
      dateLabel: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateRaw: date,
      income: dateMap[date].income,
      expense: dateMap[date].expense
    }));
  }, [transactions, timeframe]);

  // Dimensions of SVG viewport
  const width = 600;
  const height = 250;
  const padding = { top: 20, right: 30, bottom: 40, left: 55 };

  // Calculate coordinates and path strings
  const svgData = useMemo(() => {
    if (chartData.length === 0) return null;

    // Find max value to scale the Y axis
    const maxVal = Math.max(
      ...chartData.map(d => Math.max(d.income, d.expense)),
      100 // minimum scale cap
    );

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Map each data point to X, Y coordinates
    const points = chartData.map((d, index) => {
      const x = padding.left + (chartData.length > 1 ? (index / (chartData.length - 1)) * chartWidth : chartWidth / 2);
      
      const incomeY = height - padding.bottom - (d.income / maxVal) * chartHeight;
      const expenseY = height - padding.bottom - (d.expense / maxVal) * chartHeight;

      return {
        x,
        incomeY,
        expenseY,
        ...d
      };
    });

    // Helper to generate SVG Path commands
    const generatePath = (pts, keyY) => {
      if (pts.length === 0) return '';
      if (pts.length === 1) return `M ${pts[0].x} ${pts[0][keyY]} L ${pts[0].x} ${pts[0][keyY]}`;
      
      let path = `M ${pts[0].x} ${pts[0][keyY]}`;
      for (let i = 1; i < pts.length; i++) {
        // Line connection
        path += ` L ${pts[i].x} ${pts[i][keyY]}`;
      }
      return path;
    };

    // Helper to generate filled Area Path commands
    const generateAreaPath = (pts, keyY) => {
      if (pts.length === 0) return '';
      const baselineY = height - padding.bottom;
      const linePath = generatePath(pts, keyY);
      return `${linePath} L ${pts[pts.length - 1].x} ${baselineY} L ${pts[0].x} ${baselineY} Z`;
    };

    const incomeLine = generatePath(points, 'incomeY');
    const expenseLine = generatePath(points, 'expenseY');
    const incomeArea = generateAreaPath(points, 'incomeY');
    const expenseArea = generateAreaPath(points, 'expenseY');

    // Y Axis ticks
    const yTicksCount = 4;
    const yTicks = Array.from({ length: yTicksCount + 1 }).map((_, i) => {
      const val = (maxVal / yTicksCount) * i;
      const y = height - padding.bottom - (val / maxVal) * chartHeight;
      return { val, y };
    });

    return {
      points,
      incomeLine,
      expenseLine,
      incomeArea,
      expenseArea,
      yTicks,
      maxVal
    };
  }, [chartData, width, height]);

  const handleMouseMove = (point, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredPoint({
      ...point,
      tooltipX: e.clientX - rect.left + 15,
      tooltipY: e.clientY - rect.top - 60
    });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="glass-card" style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} className="primary" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Financial Trends</h2>
        </div>
        
        {/* Timeframe selector */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '2px' }}>
          {[['7days', '7 Days'], ['30days', '30 Days'], ['all', 'All Time']].map(([key, val]) => (
            <button
              key={key}
              onClick={() => setTimeframe(key)}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: timeframe === key ? 'var(--primary)' : 'transparent',
                color: timeframe === key ? 'white' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)'
              }}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {chartData.length > 0 && svgData ? (
        <div className="chart-container" style={{ position: 'relative' }}>
          <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`}>
            {/* Definitions for Gradients */}
            <defs>
              <linearGradient id="income-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--success)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--success)" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="expense-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--danger)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--danger)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y Axis Labels */}
            {svgData.yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={tick.y}
                  x2={width - padding.right}
                  y2={tick.y}
                  className="chart-grid-line"
                />
                <text
                  x={padding.left - 10}
                  y={tick.y + 4}
                  className="chart-text y-axis"
                >
                  {formatCurrency(tick.val)}
                </text>
              </g>
            ))}

            {/* X Axis Line */}
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              className="chart-axis"
            />

            {/* Areas */}
            <path d={svgData.incomeArea} className="chart-area-income" />
            <path d={svgData.expenseArea} className="chart-area-expense" />

            {/* Lines */}
            <path d={svgData.incomeLine} className="chart-line-income" />
            <path d={svgData.expenseLine} className="chart-line-expense" />

            {/* Interactive Data Dots & Hover zones */}
            {svgData.points.map((pt, i) => (
              <g key={i}>
                {/* Income point */}
                {pt.income > 0 && (
                  <circle
                    cx={pt.x}
                    cy={pt.incomeY}
                    r="4"
                    className="chart-dot-income"
                    onMouseMove={(e) => handleMouseMove({ ...pt, val: pt.income, type: 'Income' }, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                )}
                {/* Expense point */}
                {pt.expense > 0 && (
                  <circle
                    cx={pt.x}
                    cy={pt.expenseY}
                    r="4"
                    className="chart-dot-expense"
                    onMouseMove={(e) => handleMouseMove({ ...pt, val: pt.expense, type: 'Expense' }, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                )}
              </g>
            ))}

            {/* X Axis Labels */}
            {svgData.points.map((pt, i) => {
              // Only render some labels if there are too many data points
              const interval = Math.ceil(svgData.points.length / 7);
              if (i % interval !== 0 && i !== svgData.points.length - 1) return null;
              
              return (
                <text
                  key={i}
                  x={pt.x}
                  y={height - padding.bottom + 18}
                  className="chart-text"
                >
                  {pt.dateLabel}
                </text>
              );
            })}
          </svg>

          {/* HTML Overlay Tooltip */}
          {hoveredPoint && (
            <div
              className="chart-tooltip"
              style={{
                left: `${hoveredPoint.tooltipX}px`,
                top: `${hoveredPoint.tooltipY}px`
              }}
            >
              <div className="chart-tooltip-date">{hoveredPoint.dateLabel}</div>
              <div className="chart-tooltip-row">
                <span style={{ 
                  color: hoveredPoint.type === 'Income' ? 'var(--success)' : 'var(--danger)',
                  fontWeight: 700 
                }}>
                  {hoveredPoint.type}:
                </span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(hoveredPoint.val)}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state" style={{ height: '250px' }}>
          <div style={{ fontSize: '2rem', opacity: 0.4, marginBottom: '0.5rem' }}>📈</div>
          <h3>No Trends Available</h3>
          <p>Add transactions over multiple days to construct charts.</p>
        </div>
      )}
    </div>
  );
};

export default TrendsChart;
