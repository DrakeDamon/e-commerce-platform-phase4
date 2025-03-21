import React from 'react';
import { useFilterContext } from '../context/FilterContext';
import ProductCard from '../components/ProductCard';
import '../styles/pages/Home.css';

const Home = () => {
  const { products, selectedCategory, selectedSubcategory, searchTerm, loading, error } = useFilterContext();

  // Log the raw products to check for duplicates
  console.log('Raw Products:', products);

  // Deduplicate products by id
  const uniqueProducts = Array.from(
    new Map(products.map(product => [product.id, product])).values()
  );

  // Log the deduplicated products to confirm
  console.log('Unique Products:', uniqueProducts);

  // Log the current filter state
  console.log('Selected Category:', selectedCategory);
  console.log('Selected Subcategory:', selectedSubcategory);
  console.log('Search Term:', searchTerm);

  const filteredProducts = uniqueProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || (product.category && product.category.includes(selectedCategory));
    const matchesSubcategory = !selectedSubcategory || (product.subcategory && product.subcategory === selectedSubcategory);
    const matchesSearch = searchTerm ? product.name.toLowerCase().startsWith(searchTerm.toLowerCase()) : true;

    // Debugging logs for filtering
    console.log(`Product: ${product.name}, Category: ${product.category}, Selected Category: ${selectedCategory}, Matches Category: ${matchesCategory}`);
    console.log(`Product: ${product.name}, Subcategory: ${product.subcategory}, Selected Subcategory: ${selectedSubcategory}, Matches Subcategory: ${matchesSubcategory}`);
    console.log(`Product: ${product.name}, Search Term: ${searchTerm}, Matches Search: ${matchesSearch}`);

    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  // Log the filtered products
  console.log('Filtered Products:', filteredProducts);

  if (loading) return <div className="loading-spinner">Loading products...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="home">
      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p className="no-products-message">No products found.</p>
        ) : (
          filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;