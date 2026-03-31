import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';


const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [user, setUser] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.email);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const wishlist = userData.wishlist || [];
          setIsAdded(wishlist.includes(productId));
        }
      }
    });

    return () => unsubscribe();
  }, [productId]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Convert "images" string to Array
          const imagesArray = data.images && typeof data.images === 'string'
            ? data.images.split(',').map(url => url.trim()).filter(Boolean)
            : Array.isArray(data.images) ? data.images : [];

          // Convert "tags" string to Array
          const tagsArray = data.tags && typeof data.tags === 'string'
            ? data.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean)
            : Array.isArray(data.tags) ? data.tags : [];

          setProduct({ 
            id: docSnap.id, 
            ...data, 
            images: imagesArray, 
            tags: tagsArray 
          });
        } else {
          console.log("No such product!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [productId]);

  const addToWishlist = async () => {
    if (!product || !user) {
      alert("Please sign in to add items to your wishlist");
      return;
    }

    console.log("User:", user.email);
    console.log("Product ID:", product.id);

    try {
      const userDocRef = doc(db, "users", user.email);
      console.log("Fetching user document...");
      const userDocSnap = await getDoc(userDocRef);
      
      let currentWishlist = [];
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        currentWishlist = userData.wishlist || [];
        console.log("Current wishlist:", currentWishlist);
      } else {
        console.log("User document doesn't exist yet, creating new one");
      }
      
      let updatedWishlist;
      if (currentWishlist.includes(product.id)) {
        updatedWishlist = currentWishlist.filter(id => id !== product.id);
        setIsAdded(false);
        console.log("Removing from wishlist:", product.id);
      } else {
        updatedWishlist = [...currentWishlist, product.id];
        setIsAdded(true);
        console.log("Adding to wishlist:", product.id);
      }
      
      console.log("Updated wishlist:", updatedWishlist);
      console.log("Saving to Firestore...");
      
      await setDoc(userDocRef, {
        name: user.displayName,
        wishlist: updatedWishlist
      }, { merge: true });
      
      console.log("Successfully saved to Firestore!");
      
    } catch (error) {
      console.error("Error updating wishlist:", error);
      console.error("Error details:", error.message);
      alert("Failed to update wishlist. Please try again. Check console for details.");
    }
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleKeyDown = (e) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentImageIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-xl font-mono uppercase tracking-widest text-gray-400">
            Analyzing Component...
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <h1 className="text-2xl font-black uppercase italic" style={{ fontFamily: 'Impact' }}>
            Product Not Found
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT: IMAGE GRID */}
        <div className="grid grid-cols-2 gap-4 auto-rows-min">
          {product.images.length > 0 ? (
            product.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => openLightbox(idx)}
                className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <img 
                  src={img} 
                  alt={`${product.name} view ${idx}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400';
                  }}
                />
              </button>
            ))
          ) : (
            [1, 2, 3, 4].map((_, idx) => (
              <div key={idx} className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
                <span className="text-[10px] uppercase font-mono text-gray-400">No Image {idx + 1}</span>
              </div>
            ))
          )}
        </div>

        {/* RIGHT: TECHNICAL DETAILS */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              SKU: {product.id}
            </span>
            {product.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold uppercase tracking-tighter rounded text-gray-500">
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black uppercase italic leading-none mb-6" style={{ fontFamily: 'Impact, sans-serif' }}>
            {product.name}
          </h1>

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-4xl font-bold">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="border-y border-gray-100 py-8 mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Description</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
              {product.description}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="font-bold upperce text-[10px] text-gray-400 tracking-widest">Minimum Order</span>
              <span className="font-mono font-bold text-lg">{product.minQuantity || 1} Units</span>
            </div>

            <button 
              onClick={addToWishlist}
              className={`w-full py-5 font-bold uppercase tracking-[0.2em] rounded-full transition-all active:scale-95 shadow-xl shadow-black/5 text-xs ${
                isAdded 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-black text-white hover:bg-blue-600'
              }`}
            >
              {isAdded ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
            
            <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest">
              Secure Checkout âD Printed on Demand
            </p>
          </div>
        </div>
      </main>

      {/* LIGHTBOX MODAL */}
      {lightboxOpen && product.images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X size={28} className="text-white" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-6 left-6 text-white text-sm font-mono z-10">
            {currentImageIndex + 1} / {product.images.length}
          </div>

          {/* Previous Button */}
          {product.images.length > 1 && (
            <button 
              onClick={prevImage}
              className="absolute left-6 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <ChevronLeft size={32} className="text-white" />
            </button>
          )}

          {/* Main Image */}
          <div className="relative max-w-7xl max-h-[90vh] mx-auto px-24">
            <img 
              src={product.images[currentImageIndex]} 
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain mx-auto rounded-lg"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400';
              }}
            />
          </div>

          {/* Next Button */}
          {product.images.length > 1 && (
            <button 
              onClick={nextImage}
              className="absolute right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <ChevronRight size={32} className="text-white" />
            </button>
          )}

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-3 rounded-full backdrop-blur-sm">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentImageIndex 
                      ? 'border-white scale-110' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductPage;
