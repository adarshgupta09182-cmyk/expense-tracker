import { useCallback, useState } from 'react';
import './FilterBar.css';

const FilterBar = ({ filters, onFilterChange, onClearFilters }) => {
  const [showDatePresets, setShowDatePresets] = useState(false);

  const handleChange = useCallback((e) => {
    onFilterChange({
      ...filters,
      [e.target.name]: e.target.value
    });
  }, [filters, onFilterChange]);

  const getDateRange = (preset) => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const formatDate = (date) => date.toISOString().split('T')[0];

    switch (preset) {
      case 'last7days':
        return {
          startDate: formatDate(sevenDaysAgo),
          endDate: formatDate(today)
        };
      case 'thisMonth':
        return {
          startDate: formatDate(startOfMonth),
          endDate: formatDate(today)
        };
      case 'lastMonth':
        return {
          startDate: formatDate(lastMonthStart),
          endDate: formatDate(lastMonthEnd)
        };
      case 'thisYear':
        return {
          startDate: formatDate(startOfYear),
          endDate: formatDate(today)
        };
      default:
        return { startDate: '', endDate: '' };
    }
  };

  const handlePresetClick = useCallback((preset) => {
    const { startDate, endDate } = getDateRange(preset);
    onFilterChange({
      ...filters,
      startDate,
      endDate
    });
    setShowDatePresets(false);
  }, [filters, onFilterChange]);

  const handleClearDates = useCallback(() => {
    onFilterChange({
      ...filters,
      startDate: '',
      endDate: ''
    });
  }, [filters, onFilterChange]);

  return (
    <div className="filter-bar">
      <h3>🔍 Filter Expenses</h3>
      <div className="filter-controls">
        <input
          type="text"
          name="search"
          placeholder="Search description..."
          value={filters.search}
          onChange={handleChange}
          className="filter-input"
        />
        
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="Food">Food</option>
          <option value="Travelling">Travelling</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Other">Other</option>
        </select>

        {/* Date Range Section */}
        <div className="date-range-section">
          <div className="date-inputs">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="filter-input"
              placeholder="Start Date"
              title="Start Date"
            />
            <span className="date-separator">→</span>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="filter-input"
              placeholder="End Date"
              title="End Date"
            />
          </div>

          {/* Date Presets Dropdown */}
          <div className="date-presets-container">
            <button
              className="btn-presets"
              onClick={() => setShowDatePresets(!showDatePresets)}
              title="Quick date range presets"
            >
              📅 Presets
            </button>
            {showDatePresets && (
              <div className="presets-dropdown">
                <button
                  className="preset-option"
                  onClick={() => handlePresetClick('last7days')}
                >
                  📆 Last 7 Days
                </button>
                <button
                  className="preset-option"
                  onClick={() => handlePresetClick('thisMonth')}
                >
                  📅 This Month
                </button>
                <button
                  className="preset-option"
                  onClick={() => handlePresetClick('lastMonth')}
                >
                  📅 Last Month
                </button>
                <button
                  className="preset-option"
                  onClick={() => handlePresetClick('thisYear')}
                >
                  📆 This Year
                </button>
                <div className="preset-divider"></div>
                <button
                  className="preset-option clear"
                  onClick={handleClearDates}
                >
                  ✕ Clear Dates
                </button>
              </div>
            )}
          </div>
        </div>
        
        <button onClick={onClearFilters} className="btn-clear">
          🔄 Clear All
        </button>
      </div>

      {/* Active Filters Display */}
      {(filters.search || filters.category || filters.startDate || filters.endDate) && (
        <div className="active-filters">
          {filters.search && (
            <span className="filter-tag">
              🔎 Search: {filters.search}
            </span>
          )}
          {filters.category && (
            <span className="filter-tag">
              📂 {filters.category}
            </span>
          )}
          {filters.startDate && filters.endDate && (
            <span className="filter-tag">
              📅 {new Date(filters.startDate).toLocaleDateString()} - {new Date(filters.endDate).toLocaleDateString()}
            </span>
          )}
          {filters.startDate && !filters.endDate && (
            <span className="filter-tag">
              📅 From {new Date(filters.startDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
