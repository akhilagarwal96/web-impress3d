import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { globalCategories } from '../data';
// 1. Import Firebase Firestore tools
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Trash2, ArrowRight } from 'lucide-react';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistData = async () => {
      setLoading(true);
      // Get the IDs from local storage
      const savedIds = JSON.parse(localStorage.getItem('wishlist')) || [];
      
      if (savedIds.length === 0) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      try {
        // 2. Fetch each product document from Firebase by its ID
        const productPromises = savedIds.map(id => getDoc(doc(db, "products", id)));
        const docSnaps = await Promise.all(productPromises);
        
        const items = docSnaps
          .filter(snap => snap.exists()) // Only keep items that actually exist in DB
          .map(snap => ({ id: snap.id, ...snap.data() }));

        setWishlistItems(items);
      } catch (error) {
        console.error("Error fetching wishlist items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistData();
  }, []);

  const removeFromWishlist = (id) => {
    const updatedItems = wishlistItems.filter(item => item.id !== id);
    setWishlistItems(updatedItems);
    
    // Update local storage to match
    const updatedIds = updatedItems.map(item => item.id);
    localStorage.setItem('wishlist', JSON.stringify(updatedIds));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header categories={globalCategories} />
      
      <div className="px-6 py-12 max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black uppercase italic mb-12 tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>
          My Wishlist
        </h1>

        {loading ? (
          <div className="py-20 text-center animate-pulse font-mono text-gray-400 uppercase tracking-widest">
            Retrieving Saved Blueprints...
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-gray-400 uppercase tracking-widest mb-6">Your vault is currently empty</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-blue-600 transition-all">
              Explore Catalog <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistItems.map(product => (
              <div key={product.id} className="group border border-gray-100 rounded-2xl p-5 flex flex-col hover:shadow-xl hover:shadow-gray-100 transition-all duration-500">
                <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4 relative">
                  <img 
                    src={product.images?.[0] || 'https://via.placeholder.com/400'} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                    alt={product.name} 
                  />
                  <button 
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex flex-col flex-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase mb-1">SKU: {product.id.slice(0, 8)}</span>
                  <h3 className="font-bold uppercase text-xl leading-tight mb-2 italic" style={{ fontFamily: 'Impact, sans-serif' }}>
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold mb-4">₹{product.price}</p>
                  
                  <Link 
                    to={`/product/${product.id}`} 
                    className="mt-auto w-full py-3 border border-black text-center text-xs font-bold uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;