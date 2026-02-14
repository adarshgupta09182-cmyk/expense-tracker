import { useCallback } from 'react';
import './FilterBar.css';

const FilterBar = ({ filters, onFilterChange, onClearFilters }) => {
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
        
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
          className="filter-input"
          placeholder="Start Date"
        />
        
        <button onClick={onClearFilters} className="btn-clear">
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
