import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const Homepage = () => {
  const scrollRef = useRef(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch ALL products (Removing the 'where' filter to bypass strictness)
        const prodSnap = await getDocs(collection(db, "products"));
        
        const allProducts = prodSnap.docs.map(doc => {
          const data = doc.data();
          const imagesArray = data.images && typeof data.images === 'string'
            ? data.images.split(',').map(url => url.trim()).filter(Boolean)
            : Array.isArray(data.images) ? data.images : [];

          return {
            id: doc.id,
            ...data,
            images: imagesArray
          };
        });

        // 2. FORGIVING FILTER: Matches "1", 1, "true", or true
        const featured = allProducts.filter(p => 
          p.featured === "1" || 
          p.featured === 1 || 
          p.featured === "true" || 
          p.featured === true
        );
        
        console.log("Featured items found:", featured.length);
        setFeaturedProducts(featured);

        // 3. Fetch Categories
        const catQuery = query(collection(db, "categories"), orderBy("order", "asc"));
        const catSnap = await getDocs(catQuery);
        setDbCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

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
      <Header />

      <section className="px-6 py-6">
        <div className="relative h-[200px] rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center border border-gray-100">
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

      <section className="px-6 py-4 relative">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-2xl font-bold uppercase tracking-tighter">Featured Products</h3>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="p-2 border border-black rounded-full hover:bg-black hover:text-white transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll('right')} className="p-2 border border-black rounded-full hover:bg-black hover:text-white transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
          {loading ? (
            <div className="w-full py-20 text-center font-mono text-gray-400 uppercase tracking-widest animate-pulse">
              Initializing...
            </div>
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <motion.div 
                key={product.id} 
                className="min-w-[65%] md:min-w-[20%] snap-start group" 
                whileHover={{ y: -5 }}
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2 border border-gray-100 relative w-full">
                    <img 
                      src={product.images[0] || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400'} 
                      alt={product.name} 
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400'; }}
                    />
                  </div>
                  <h4 className="text-lg font-bold uppercase tracking-tight italic" style={{ fontFamily: 'Impact, sans-serif' }}>
                    {product.name}
                  </h4>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="w-full py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 uppercase text-xs tracking-widest">
               No featured blueprints found. Check Firebase "featured" field.
            </div>
          )}
        </div>
      </section>

      <section className="px-6 py-12 border-t border-gray-100">
        <h3 className="text-2xl font-bold uppercase tracking-tighter mb-8">Categories</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6">
          {dbCategories.map(cat => (
            <Link 
              to={`/category/${cat.id}`} 
              key={cat.id} 
              className="flex-shrink-0 px-10 py-8 bg-gray-900 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 min-w-[200px] text-center"
            >
              <span className="text-xl uppercase tracking-[0.1em]" style={{ fontFamily: 'Impact, sans-serif' }}>
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