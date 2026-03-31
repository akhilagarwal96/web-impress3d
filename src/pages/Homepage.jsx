import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
        
        // 1. Fetch ALL products
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

        // 2. Filter for Featured
        const featured = allProducts.filter(p => 
          p.featured === "1" || 
          p.featured === 1 || 
          p.featured === "true" || 
          p.featured === true
        );
        
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

      {/* --- FEATURED PRODUCTS SECTION --- */}
      <section className="px-6 py-4 relative">
        {/* Header: Improved spacing for mobile */}
        <div className="flex justify-between items-center mb-6"> 
          <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tighter pr-4">
            Featured Products
          </h3>
          
          {/* Navigation Buttons: Smaller on mobile, standard on laptop */}
          <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
            <button 
              onClick={() => scroll('left')} 
              className="p-1.5 md:p-2 border border-black rounded-full hover:bg-black hover:text-white transition-all active:scale-90"
            >
              <ChevronLeft size={16} className="md:w-5 md:h-5" />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="p-1.5 md:p-2 border border-black rounded-full hover:bg-black hover:text-white transition-all active:scale-90"
            >
              <ChevronRight size={16} className="md:w-5 md:h-5" />
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
                      /* REMOVED grayscale AND group-hover:grayscale-0 CLASSES BELOW */
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-500" 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400'; }}
                    />
                  </div>
                  <h4 className="text-xl uppercase tracking-tight" style={{ fontFamily: 'Impact, sans-serif' }}>
                    {product.name}
                  </h4>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="w-full py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 uppercase text-xs tracking-widest">
               No featured blueprints found.
            </div>
          )}
        </div>
      </section>

      {/* --- CATEGORIES SECTION --- */}
      <section className="px-6 py-4 relative border-t border-gray-100 mt-8">
        {/* Header matched to Featured Products */}
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-2xl font-bold uppercase tracking-tighter">
            Shop By Categories
          </h3>
          {/* Optional: Add a 'View All' or similar if you want to match the arrow spacing */}
          <div className="flex gap-2 opacity-0 pointer-events-none">
            <button className="p-2 border border-black rounded-full"><ChevronLeft size={20} /></button>
          </div>
        </div>
        
        {/* Grid Container: 2 columns on mobile, 4-6 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-2">
          {dbCategories.map(cat => (
            <motion.div 
              key={cat.id} 
              whileHover={{ y: -5 }}
              className="w-full"
            >
              <Link 
                to={`/category/${cat.id}`} 
                className="flex items-center justify-center aspect-[1.5/1] bg-gray-900 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 text-center px-4 shadow-sm"
              >
                <span 
                  className="text-xl md:text-2xl uppercase tracking-[0.15em] px-2" 
                  style={{ 
                    fontFamily: 'Impact, sans-serif',
                    lineHeight: '1.2' 
                  }}
                >
                  {cat.name || cat.id}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Homepage;
