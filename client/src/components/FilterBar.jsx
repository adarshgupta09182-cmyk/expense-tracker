import { useCallback, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import './FilterBar.css';

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
  </svg>
);

const FilterBar = ({ filters, onFilterChange, onClearFilters }) => {
  const { isDark } = useTheme();
  const startDateRef = useRef(null);

  const handleChange = useCallback((e) => {
    onFilterChange({
      ...filters,
      [e.target.name]: e.target.value
    });
  }, [filters, onFilterChange]);

  return (
    <div className="filter-bar">
      <h3>Filter Expenses</h3>
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

        <div className="filter-date-wrapper">
          <input
            ref={startDateRef}
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            className="filter-input filter-date"
          />
          {isDark && (
            <span className="filter-date-icon" onClick={() => startDateRef.current?.showPicker()}>
              <CalendarIcon />
            </span>
          )}
        </div>

        <button onClick={onClearFilters} className="btn-clear">
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
