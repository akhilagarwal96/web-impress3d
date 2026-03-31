import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Trash2, ArrowRight } from 'lucide-react';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchWishlistData(currentUser);
      } else {
        setWishlistItems([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchWishlistData = async (currentUser) => {
    setLoading(true);
    
    try {
      const userDocRef = doc(db, "users", currentUser.email);
      const userDocSnap = await getDoc(userDocRef);
      
      let savedIds = [];
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        savedIds = userData.wishlist || [];
      }
      
      if (savedIds.length === 0) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      const productPromises = savedIds.map(id => getDoc(doc(db, "products", id)));
      const docSnaps = await Promise.all(productPromises);
      
      const items = docSnaps
        .filter(snap => snap.exists())
        .map(snap => {
          const data = snap.data();
          
          const imagesArray = data.images && typeof data.images === 'string'
            ? data.images.split(',').map(url => url.trim()).filter(Boolean)
            : Array.isArray(data.images) ? data.images : [];

          return { 
            id: snap.id, 
            ...data,
            images: imagesArray 
          };
        });

      setWishlistItems(items);
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id) => {
    if (!user) return;

    const updatedItems = wishlistItems.filter(item => item.id !== id);
    setWishlistItems(updatedItems);
    const updatedIds = updatedItems.map(item => item.id);
    
    try {
      const userDocRef = doc(db, "users", user.email);
      await setDoc(userDocRef, {
        name: user.displayName,
        wishlist: updatedIds
      }, { merge: true });
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
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
            <p className="text-gray-400 uppercase tracking-widest mb-6 text-xs">Your vault is currently empty</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 transition-all">
              Explore Catalog <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistItems.map(product => (
              <div key={product.id} className="group border border-gray-100 rounded-2xl p-5 flex flex-col hover:shadow-xl hover:shadow-gray-100 transition-all duration-500">
                <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4 relative">
                  <img 
                    src={product.images[0] || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400';
                    }}
                  />
                  <button 
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm active:scale-90"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">SKU: {product.id.slice(0, 8)}</span>
                  </div>
                  
                  <h3 className="font-bold uppercase text-2xl leading-none mb-2 italic" style={{ fontFamily: 'Impact, sans-serif' }}>
                    {product.name}
                  </h3>
                  
                  <p className="text-xl font-bold mb-6">₹{Number(product.price || 0).toLocaleString('en-IN')}</p>
                  
                  <Link 
                    to={`/product/${product.id}`} 
                    className="mt-auto w-full py-4 border border-black text-center text-0px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-black hover:text-white transition-all active:scale-95"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default WishlistPage;
