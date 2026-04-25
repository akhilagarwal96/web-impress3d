import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const CategoryPage = ({ onProfileClick }) => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Auth Observer for Header
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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

          // 2. GITHUB URL AUTO-FIXER
          imagesArray = imagesArray.map(url => {
            if (url.includes('github.com') && url.includes('/blob/')) {
              return url
                .replace('github.com', 'raw.githubusercontent.com')
                .replace('/blob/', '/')
                .split('?')[0];
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

        // 4. UPDATED FILTERING LOGIC
        // If category is "all", show everything. Otherwise, filter by tag.
        const isAllCategory = categoryName?.toLowerCase() === 'all';
        
        const filtered = isAllCategory 
          ? allProducts 
          : allProducts.filter(product => 
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
    window.scrollTo(0, 0);
  }, [categoryName]);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header user={user} onProfileClick={onProfileClick} />

      {/* CATEGORY TITLE BANNER */}
      <div className="px-6 py-12 bg-gray-50 border-b border-gray-100">
        <h1 className="text-6xl md:text-7xl font-black uppercase italic tracking-normal" style={{ fontFamily: 'Impact, sans-serif' }}>
          {categoryName?.toLowerCase() === 'all' ? 'All Blueprints' : categoryName}
        </h1>
        <p className="text-sm font-mono text-gray-400 mt-2 tracking-widest uppercase">
          Catalog / {categoryName}
        </p>
      </div>

      {/* PRODUCT LIST */}
      <section className="px-6 py-10 max-w-7xl mx-auto">
        {loading ? (
          <div className="py-20 text-center animate-pulse uppercase tracking-widest text-gray-400">
            Syncing {categoryName} Assets...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/product/${product.id}`}
                  className="flex flex-col group cursor-pointer hover:bg-gray-50 p-3 -m-3 rounded-2xl transition-all duration-300"
                >
                  {/* IMAGE CONTAINER */}
                  <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 mb-3 relative">
                    <img 
                      src={product.images[0] || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400'}
                      alt={product.name} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 block" 
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400';
                      }}
                    />
                  </div>

                  {/* CONTENT DETAILS */}
                  <div className="flex flex-col">
                    <h2 className="text-base md:text-xl font-bold uppercase tracking-normal italic mb-1 line-clamp-2" style={{ fontFamily: 'Impact, sans-serif' }}>
                      {product.name}
                    </h2>
                    <span className="text-lg md:text-xl font-bold">
                      ₹{Number(product.price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-24 text-center text-gray-400 uppercase tracking-widest border-2 border-dashed border-gray-100 rounded-3xl">
                No blueprints matched the "{categoryName}" filter.
              </div>
            )}
          </div>
        )}
      </section>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;
