import React, { useState, useContext, useEffect } from "react";

const FilterContext = React.createContext();

export const FilterProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWithRetry = async (url, retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Fetching ${url} (Attempt ${i + 1}/${retries})`);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (err) {
        console.error(`Fetch attempt ${i + 1} failed:`, err);
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchWithRetry("http://localhost:5555/products");
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message || "Unable to fetch products. Please try again later.");
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await fetchWithRetry("http://localhost:5555/categories");
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error.message || "Unable to fetch categories.");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <FilterContext.Provider
      value={{
        products,
        categories,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
        searchTerm,
        setSearchTerm,
        fetchProducts,
        loading,
        error,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => {
  return useContext(FilterContext);
};

export { FilterContext };