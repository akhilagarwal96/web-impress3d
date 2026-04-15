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

  // ... (Keep your existing useEffects for auth and fetching)
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
          const imagesArray = data.images && typeof data.images === 'string'
            ? data.images.split(',').map(url => url.trim()).filter(Boolean)
            : Array.isArray(data.images) ? data.images : [];
          const tagsArray = data.tags && typeof data.tags === 'string'
            ? data.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean)
            : Array.isArray(data.tags) ? data.tags : [];
          setProduct({ id: docSnap.id, ...data, images: imagesArray, tags: tagsArray });
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
    try {
      const userDocRef = doc(db, "users", user.email);
      const userDocSnap = await getDoc(userDocRef);
      let currentWishlist = userDocSnap.exists() ? (userDocSnap.data().wishlist || []) : [];
      let updatedWishlist = currentWishlist.includes(product.id)
        ? currentWishlist.filter(id => id !== product.id)
        : [...currentWishlist, product.id];
      setIsAdded(!currentWishlist.includes(product.id));
      await setDoc(userDocRef, { name: user.displayName, wishlist: updatedWishlist }, { merge: true });
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);

  if (loading) return <div className="min-h-screen bg-white"><Header /><div className="flex items-center justify-center h-[60vh] animate-pulse uppercase tracking-widest text-gray-400">Analyzing...</div></div>;
  if (!product) return <div className="min-h-screen bg-white"><Header /><div className="flex items-center justify-center h-[60vh] uppercase font-black italic" style={{ fontFamily: 'Impact' }}>Not Found</div></div>;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          
          {/* LEFT: IMAGE GRID (Mobile: Single Column / Desktop: Two Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 auto-rows-min order-1 lg:order-1">
            {product.images.length > 0 ? (
              product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => openLightbox(idx)}
                  className="aspect-square bg-gray-50 rounded-xl md:rounded-2xl overflow-hidden border border-gray-100 group cursor-pointer focus:outline-none"
                >
                  <img 
                    src={img} 
                    alt={`${product.name} view ${idx}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                </button>
              ))
            ) : (
               <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-200 uppercase text-[10px] font-mono text-gray-400">No Image</div>
            )}
          </div>

          {/* RIGHT: TECHNICAL DETAILS (Adjusted font sizes for mobile) */}
          <div className="flex flex-col order-2 lg:order-2">
            <div className="flex items-center gap-2 mb-3">
              {product.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-100 text-[9px] md:text-[10px] font-bold uppercase rounded text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase italic leading-none mb-4 md:mb-6" style={{ fontFamily: 'Impact, sans-serif' }}>
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 mb-6 md:mb-8">
              <span className="text-3xl md:text-4xl font-bold">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
            </div>

            <div className="border-y border-gray-100 py-6 md:py-8 mb-6 md:mb-8">
              <h3 className="text-sm md:text-lg font-bold uppercase tracking-widest text-gray-400 mb-3 md:mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                {product.description}
              </p>
            </div>

            <div className="flex flex-col gap-4 md:gap-6">
              <div className="flex items-center justify-between p-4 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100">
                <span className="font-bold uppercase text-xs md:text-lg text-gray-400 tracking-widest">Min. Order</span>
                <span className="font-mono font-bold text-base md:text-lg">{product.minQuantity || 1} Units</span>
              </div>

              <button 
                onClick={addToWishlist}
                className={`w-full py-4 md:py-5 font-bold uppercase tracking-[0.2em] rounded-full transition-all active:scale-95 shadow-md text-[10px] md:text-xs ${
                  isAdded ? 'bg-red-500 text-white' : 'bg-black text-white'
                }`}
              >
                {isAdded ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* LIGHTBOX MODAL (Optimized for Mobile) */}
      {lightboxOpen && product.images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
          {/* Close Button - Moved slightly for easier thumb reach */}
          <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full z-[110]">
            <X size={24} className="text-white" />
          </button>

          {/* Main Image Container - Full width on mobile */}
          <div className="relative w-full h-full flex items-center justify-center">
            {product.images.length > 1 && (
              <button onClick={prevImage} className="absolute left-0 p-2 bg-white/5 rounded-full z-10 md:left-4">
                <ChevronLeft size={24} className="text-white md:w-8 md:h-8" />
              </button>
            )}

            <img 
              src={product.images[currentImageIndex]} 
              className="max-w-full max-h-[70vh] object-contain rounded-md"
              alt="Lightbox"
            />

            {product.images.length > 1 && (
              <button onClick={nextImage} className="absolute right-0 p-2 bg-white/5 rounded-full z-10 md:right-4">
                <ChevronRight size={24} className="text-white md:w-8 md:h-8" />
              </button>
            )}
          </div>

          {/* Thumbnail Strip - Scaled down for mobile */}
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-2 p-2 bg-white/5 rounded-xl backdrop-blur-sm overflow-x-auto max-w-full">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentImageIndex ? 'border-white' : 'border-transparent opacity-50'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="Thumb" />
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
