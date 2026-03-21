import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        
        const allProducts = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // 1. STRING-TO-ARRAY CONVERSION (Images)
          let imagesArray = [];
          if (data.images && typeof data.images === 'string') {
            imagesArray = data.images.split(',').map(url => url.trim()).filter(Boolean);
          } else if (Array.isArray(data.images)) {
            imagesArray = data.images;
          }

          // 2. GITHUB URL AUTO-FIXER (IMPLEMENTED)
          // This converts the 'blob' webpage URL to a direct 'raw' image URL
          imagesArray = imagesArray.map(url => {
            if (url.includes('github.com') && url.includes('/blob/')) {
              return url
                .replace('github.com', 'raw.githubusercontent.com')
                .replace('/blob/', '/')
                .split('?')[0]; // Removes ?raw=true which is unneeded for raw domain
            }
            return url;
          });

          // 3. STRING-TO-ARRAY CONVERSION (Tags)
          let tagsArray = [];
          if (data.tags && typeof data.tags === 'string') {
            tagsArray = data.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
          } else if (Array.isArray(data.tags)) {
            tagsArray = data.tags.map(t => t.toLowerCase());
          }

          return {
            id: doc.id,
            ...data,
            images: imagesArray,
            tags: tagsArray
          };
        });

        // 4. FILTERING LOGIC
        const filtered = allProducts.filter(product => 
          product.tags.includes(categoryName?.toLowerCase())
        );
        
        setProducts(filtered);

      } catch (error) {
        console.error("FIREBASE FETCH ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) fetchCategoryProducts();
  }, [categoryName]);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />

      {/* CATEGORY TITLE BANNER */}
      <div className="px-6 py-12 bg-gray-50 border-b border-gray-100">
        <h1 className="text-6xl md:text-7xl font-black uppercase italic tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>
          {categoryName}
        </h1>
        <p className="text-sm font-mono text-gray-400 mt-2 tracking-widest uppercase">Catalog / {categoryName}</p>
      </div>

      {/* PRODUCT LIST */}
      <section className="px-6 py-10 max-w-5xl mx-auto">
        {loading ? (
          <div className="py-20 text-center animate-pulse uppercase tracking-widest text-gray-400">
            Syncing {categoryName} Assets...
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="flex flex-col md:flex-row gap-8 items-start group">
                  
                  {/* IMAGE CONTAINER */}
                  <div className="w-full md:w-64 aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 relative">
                    <img 
                      src={product.images[0] || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400'}
                      alt={product.name} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 block" 
                      onError={(e) => {
                        console.error(`Image failed to load: ${product.images[0]}`);
                        e.target.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400';
                        e.target.onerror = null; 
                      }}
                    />
                  </div>

                  {/* CONTENT DETAILS */}
                  <div className="flex flex-col py-2 flex-grow">
                    <span className="text-xs font-mono text-gray-400 mb-1 tracking-tighter uppercase">SKU: {product.id}</span>
                    <h2 className="text-3xl font-bold uppercase tracking-tight italic mb-3" style={{ fontFamily: 'Impact, sans-serif' }}>
                      {product.name}
                    </h2>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
                      </div>
                      
                      <Link 
                        to={`/product/${product.id}`} 
                        className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                      >
                        View Specs
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center text-gray-400 uppercase tracking-widest border-2 border-dashed border-gray-100 rounded-3xl">
                No blueprints matched the "{categoryName}" filter.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;