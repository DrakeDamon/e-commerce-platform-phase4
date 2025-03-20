import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const navigate = useNavigate();

  // Fetch categories and subcategories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5555/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Update the URL when the selected category or subcategory changes
  useEffect(() => {
    let url = '/';
    if (selectedCategory !== 'All' || selectedSubcategory) {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') {
        params.set('category', selectedCategory);
      }
      if (selectedSubcategory) {
        params.set('subcategory', selectedSubcategory);
      }
      url = `/?${params.toString()}`;
    }
    navigate(url, { replace: true });
  }, [selectedCategory, selectedSubcategory, navigate]);

  return (
    <FilterContext.Provider
      value={{
        categories,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};