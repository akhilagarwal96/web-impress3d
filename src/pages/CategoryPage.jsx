import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        // Query: Look in "products" collection where "tags" array contains categoryName
        const q = query(
          collection(db, "products"), 
          where("tags", "array-contains", categoryName)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categoryName]); // Re-run when user clicks a different category in sidebar

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar still uses globalCategories for navigation */}
      <Header />

      {/* CATEGORY TITLE BANNER */}
      <div className="px-6 py-12 bg-gray-50 border-b border-gray-100">
        <h1 className="text-6xl md:text-7xl font-black uppercase italic tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>
          {categoryName}
        </h1>
        <p className="text-sm font-mono text-gray-400 mt-2 tracking-widest uppercase">Catalog / {categoryName}</p>
      </div>

      {/* VERTICAL PRODUCT LIST */}
      <section className="px-6 py-10 max-w-5xl">
        {loading ? (
          <div className="py-20 text-center animate-pulse uppercase tracking-widest text-gray-400">
            Loading {categoryName} items...
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="flex flex-col md:flex-row gap-8 items-start group">
                  {/* Left: Product Image (Using first image from array) */}
                  <div className="w-full md:w-64 aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                    <img 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400'}
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>

                  {/* Right: Details */}
                  <div className="flex flex-col py-2">
                    <span className="text-xs font-mono text-gray-400 mb-1 tracking-tighter uppercase">SKU: {product.id}</span>
                    <h2 className="text-3xl font-bold uppercase tracking-tight italic mb-3" style={{ fontFamily: 'Impact, sans-serif' }}>
                      {product.name}
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base mb-6 leading-relaxed max-w-2xl">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-8 mt-auto">
                      <span className="text-2xl font-bold">₹{product.price}</span>
                      
                      <Link 
                        to={`/product/${product.id}`} 
                        className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-blue-600 transition-all active:scale-95 text-center"
                      >
                        View Specs
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-gray-400 uppercase tracking-widest border-2 border-dashed border-gray-100 rounded-2xl">
                No products found in this category.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;