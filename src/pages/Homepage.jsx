import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
// 1. Firebase Imports
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const Homepage = () => {
  const scrollRef = useRef(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]); // New state for categories
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Fetch Featured Products
        const prodQuery = query(collection(db, "products"), where("featured", "==", true));
        const prodSnap = await getDocs(prodQuery);
        const productsArray = prodSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeaturedProducts(productsArray);

        // Fetch Categories for the bottom section
        const catQuery = query(collection(db, "categories"), orderBy("order", "asc"));
        const catSnap = await getDocs(catQuery);
        const catsArray = catSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDbCategories(catsArray);

      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      
      {/* --- HEADER (Prop removed, now autonomous) --- */}
      <Header />

      {/* --- HERO SECTION --- */}
      <section className="px-6 py-6">
        <div className="relative h-[200px] rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center">
          <img 
            src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            alt="Hero BG"
          />
          <div className="relative text-center text-white px-4 z-10">
            <h1 className="text-5xl md:text-7xl mb-2 tracking-tight uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>
              Impress3D
            </h1>
            <p className="text-sm md:text-base max-w-md mx-auto font-light tracking-[0.2em] uppercase opacity-80">
              DESIGN. CREATE. IMPRESS.
            </p>
          </div>
        </div>
      </section>

      {/* --- FEATURED PRODUCTS SECTION --- */}
      <section className="px-6 py-4 relative">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-2xl font-bold uppercase tracking-tighter">Featured Products</h3>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="p-2 border border-black rounded-full hover:bg-black hover:text-white transition-all cursor-pointer">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll('right')} className="p-2 border border-black rounded-full hover:bg-black hover:text-white transition-all cursor-pointer">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
          {loading ? (
            <div className="w-full py-20 text-center font-mono text-gray-400 uppercase tracking-widest animate-pulse">
              Initializing Cloud Stream...
            </div>
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <motion.div 
                key={product.id} 
                className="min-w-[65%] md:min-w-[20%] snap-start group cursor-pointer" 
                whileHover={{ y: -5 }}
              >
                <Link to={`/product/${product.id}`} className="block">
                  {/* Standardized Aspect Ratio Container */}
                  <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2 border border-gray-100 relative w-full">
                    <img 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400'} 
                      alt={product.name} 
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 block" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <h4 
                      className="text-lg font-bold uppercase tracking-tight italic leading-tight" 
                      style={{ fontFamily: 'Impact, sans-serif' }}
                    >
                      {product.name}
                    </h4>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="w-full py-10 text-center text-gray-400 uppercase text-xs tracking-widest">
              No featured blueprints available.
            </div>
          )}
        </div>
      </section>

      {/* --- CATEGORIES SECTION (Now dynamic from Firebase) --- */}
      <section className="px-6 py-12 border-t border-gray-100">
        <h3 className="text-2xl font-bold uppercase tracking-tighter mb-8">Categories</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6">
          {dbCategories.map(cat => (
            <Link 
              to={`/category/${cat.id}`} 
              key={cat.id} 
              className="flex-shrink-0 px-10 py-8 bg-gray-900 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center min-w-[200px]"
            >
              <span className="text-xl uppercase tracking-[0.1em] group-hover:scale-110 transition-transform" style={{ fontFamily: 'Impact, sans-serif' }}>
                {cat.name || cat.id}
              </span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Homepage;