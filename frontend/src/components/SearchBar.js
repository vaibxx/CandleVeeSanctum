import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import './SearchBar.css';

export const SearchBar = ({ compact = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search for suggestions
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await productsAPI.search(query, 5);
        setSuggestions(response.data.data.products);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search failed:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery) => {
    const finalQuery = searchQuery || query.trim();
    if (finalQuery) {
      setShowSuggestions(false);
      navigate(`/products?q=${encodeURIComponent(finalQuery)}`);
      if (!compact) {
        setQuery('');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    handleSearch(suggestion.name);
  };

  const handleFocus = () => {
    if (query.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`search-bar ${compact ? 'compact' : ''}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder="Search for candles..."
            className="search-input"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="search-button"
            aria-label="Search"
          >
            {isSearching ? (
              <div className="spinner search-spinner"></div>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            )}
          </button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions">
            <div className="suggestions-header">
              <span className="suggestions-title">Suggestions</span>
            </div>
            <ul className="suggestions-list">
              {suggestions.map((product) => (
                <li
                  key={product.id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(product)}
                >
                  <div className="suggestion-image">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="suggestion-placeholder"></div>
                    )}
                  </div>
                  <div className="suggestion-content">
                    <div className="suggestion-name">{product.name}</div>
                    <div className="suggestion-meta">
                      <span className="suggestion-price">${product.price}</span>
                      <span className={`suggestion-mood ${product.mood_category}`}>
                        {product.mood_category}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="suggestions-footer">
              <button
                className="see-all-results"
                onClick={() => handleSearch()}
              >
                See all results for "{query}"
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {showSuggestions && query.trim().length >= 2 && suggestions.length === 0 && !isSearching && (
          <div className="search-suggestions">
            <div className="no-results">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="no-results-icon"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
              <p>No candles found for "{query}"</p>
              <small>Try different keywords or browse by mood</small>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};