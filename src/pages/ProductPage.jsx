import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
// 1. Import Firebase Firestore tools
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Direct reference to the document by ID
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
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

    // Check wishlist status from local storage
    const currentWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (currentWishlist.includes(productId)) {
      setIsAdded(true);
    }
  }, [productId]);

  // Wishlist Logic
  const addToWishlist = () => {
    if (!product) return;
    const currentWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    if (!currentWishlist.includes(product.id)) {
      const updatedWishlist = [...currentWishlist, product.id];
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsAdded(true);
    } else {
      const updatedWishlist = currentWishlist.filter(id => id !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsAdded(false);
    }
  };

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
        
        {/* LEFT: 4-IMAGE GRID */}
        <div className="grid grid-cols-2 gap-4">
          {/* Check if images exists, is an array, and has at least one item */}
          {Array.isArray(product.images) && product.images.length > 0 ? (
            product.images.map((img, idx) => (
              <div key={idx} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                <img 
                  src={img} 
                  alt={`View ${idx}`} 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                />
              </div>
            ))
          ) : (
            /* FALLBACK: Show 4 empty placeholder slots if no images exist */
            [1, 2, 3, 4].map((_, idx) => (
              <div key={idx} className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
                <span className="text-[10px] uppercase font-mono text-gray-400">No Image {idx + 1}</span>
              </div>
            ))
          )}
        </div>

        {/* RIGHT: TECHNICAL DETAILS */}
        <div className="flex flex-col">
          <span className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-2">
            SKU: {product.id}
          </span>
          
          <h1 className="text-5xl md:text-6xl font-black uppercase italic leading-none mb-6" style={{ fontFamily: 'Impact, sans-serif' }}>
            {product.name}
          </h1>

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-4xl font-bold">₹{product.price?.toFixed(2)}</span>
          </div>

          <div className="border-y border-gray-100 py-8 mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Description</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="font-bold uppercase text-xs">Minimum Order Quantity</span>
              <span className="font-mono font-bold text-lg">{product.minQuantity || 1} Units</span>
            </div>

            <button 
              onClick={addToWishlist}
              className={`w-full py-5 font-bold uppercase tracking-[0.2em] rounded-full transition-all active:scale-95 shadow-xl shadow-black/10 ${
                isAdded 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-black text-white hover:bg-blue-600'
              }`}
            >
              {isAdded ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;