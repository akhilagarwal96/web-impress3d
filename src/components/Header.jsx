import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, User, X, Heart } from 'lucide-react';
// 1. Firebase Imports
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const Header = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch categories directly within the Header
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "categories"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        
        const cats = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setDbCategories(cats);
      } catch (error) {
        console.error("Error fetching categories for header:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-6">
          {/* Hamburger Menu */}
          <button onClick={() => setSidebarOpen(true)} className="hover:scale-110 transition-transform cursor-pointer focus:outline-none">
            <Menu size={28} />
          </button>
          
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-3 group transition-transform active:scale-95">
            <img src="/IMPRESS3D.png" alt="Logo" className="h-8 w-auto object-contain" />
            <span 
              className="text-2xl uppercase tracking-tighter" 
              style={{ fontFamily: 'Impact, sans-serif' }}
            >
              Impress3D
            </span>
          </Link>
        </div>
        
        {/* RIGHT SIDE ICONS */}
        <div className="flex items-center gap-4">
          <Link 
            to="/wishlist" 
            className="w-10 h-10 flex items-center justify-center hover:text-red-500 transition-colors cursor-pointer group"
          >
            <Heart size={24} className="group-hover:fill-current" />
          </Link>

          <button className="w-10 h-10 rounded-full border border-gray-900 flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer">
            <User size={20} />
          </button>
        </div>
      </header>

      {/* --- SIDEBAR --- */}
      <div className={`fixed inset-0 z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative w-80 h-full bg-white p-8 shadow-2xl overflow-y-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>Categories</h2>
            <button onClick={() => setSidebarOpen(false)} className="hover:rotate-90 transition-transform"><X size={28} /></button>
          </div>
          
          <ul className="space-y-6">
            {loading ? (
              <li className="text-gray-400 uppercase text-xs font-mono animate-pulse tracking-widest">
                Syncing Database...
              </li>
            ) : dbCategories.length > 0 ? (
              dbCategories.map(category => (
                <li key={category.id}>
                  <Link 
                    to={`/category/${category.id}`} 
                    onClick={() => setSidebarOpen(false)} 
                    className="text-xl hover:pl-4 transition-all duration-300 cursor-pointer uppercase tracking-widest block border-l-4 border-transparent hover:border-black pl-2"
                    style={{ fontFamily: 'Impact, sans-serif' }}
                  >
                    {category.name || category.id}
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-gray-300 uppercase text-xs italic">No categories found</li>
            )}
          </ul>

          {/* Optional Sidebar Footer */}
          <div className="mt-20 pt-8 border-t border-gray-100">
             <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
               Impress3D v1.0 <br/> Powered by Firebase Cloud
             </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;