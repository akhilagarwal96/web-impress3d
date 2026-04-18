import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ChevronLeft, ChevronRight, X, ShieldCheck, ThermometerSnowflake } from 'lucide-react';

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [user, setUser] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Default Material & Care content
  const defaultMaterialCare = "Crafted from eco-friendly, high-strength PLA plastic. To maintain its finish, wipe gently with a damp cloth. Avoid prolonged exposure to direct high heat (above 50°C) to prevent warping.";

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

          setProduct({ 
            id: docSnap.id, 
            ...data, 
            images: imagesArray, 
            tags: tagsArray 
          });
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
          <div className="animate-pulse text-xl font-mono uppercase tracking-widest text-gray-400">Analyzing...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[60vh] font-black uppercase italic text-4xl" style={{ fontFamily: 'Impact' }}>Product Not Found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT: IMAGE GRID */}
        <div className="grid grid-cols-2 gap-4 auto-rows-min">
          {product.images.length > 0 ? (
            product.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => openLightbox(idx)}
                className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group cursor-pointer focus:outline-none"
              >
                <img 
                  src={img} 
                  alt={`${product.name} view ${idx}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              </button>
            ))
          ) : (
            <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200 text-[10px] uppercase font-mono text-gray-400">No Image</div>
          )}
        </div>

        {/* RIGHT: DETAILS */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            {product.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-100 text-[9px] md:text-[10px] font-bold uppercase rounded text-gray-500">
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase italic leading-none mb-6" style={{ fontFamily: 'Impact, sans-serif' }}>
            {product.name}
          </h1>

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-3xl md:text-4xl font-bold">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
          </div>

          {/* DESCRIPTION SECTION */}
          <div className="border-t border-gray-100 pt-6 md:pt-8 mb-6">
            <h3 className="text-sm md:text-lg font-bold uppercase tracking-widest text-gray-400 mb-3 md:mb-4">Description</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {product.description}
            </p>
          </div>

          {/* DYNAMIC MATERIAL & CARE SECTION */}
          <div className="mb-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
              <ShieldCheck size={16} /> Material & Care
            </h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              {product.materialCare || defaultMaterialCare}
            </p>
          </div>

          {/* SIZE SECTION */}
          <div className="mb-6 px-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Size (mm)</h3>
            <p className="text-gray-600 text-sm md:text-base font-mono">
              {product.size || "Standard Dimensions"}
            </p>
          </div>

          {/* PRICING NOTE */}
          <p className="px-5 text-[10px] md:text-xs text-gray-400 italic mb-8">
            * Prices may vary based on colour and customized size orders
          </p>

          <div className="flex flex-col gap-6 border-t border-gray-100 pt-8">
            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="font-bold uppercase text-xs md:text-lg text-gray-400 tracking-widest">Minimum Order</span>
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
      </main>

      {/* LIGHTBOX MODAL */}
      {lightboxOpen && product.images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <button onClick={closeLightbox} className="absolute top-6 right-6 p-3 bg-white/10 rounded-full z-50 hover:bg-white/20 transition-colors">
            <X size={24} className="text-white" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            {product.images.length > 1 && (
              <button onClick={prevImage} className="absolute left-2 md:left-6 p-3 bg-white/10 rounded-full z-50 hover:bg-white/20">
                <ChevronLeft size={24} className="text-white md:w-8 md:h-8" />
              </button>
            )}

            <img 
              src={product.images[currentImageIndex]} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              alt="View"
            />

            {product.images.length > 1 && (
              <button onClick={nextImage} className="absolute right-2 md:right-6 p-3 bg-white/10 rounded-full z-50 hover:bg-white/20">
                <ChevronRight size={24} className="text-white md:w-8 md:h-8" />
              </button>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductPage;
