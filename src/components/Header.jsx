import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, User, X, Heart, LogOut } from 'lucide-react';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { db, auth, googleProvider } from '../firebase';


const Header = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

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

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setShowProfileMenu(false);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setShowProfileMenu(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
              className="text-2xl uppercase tracking-normal" 
              style={{ fontFamily: 'Impact, sans-serif', fontWeight: "400", letterSpacing: "0.02em" }}
            >
              Impress3D
            </span>
          </Link>
        </div>
        
        {/* RIGHT SIDE ICONS */}
        <div className="flex items-center gap-4">
          {/* Wishlist Icon - Only show if user is signed in */}
          {user && (
            <Link 
              to="/wishlist" 
              className="w-10 h-10 flex items-center justify-center hover:text-red-500 transition-colors cursor-pointer group"
            >
              <Heart size={24} className="group-hover:fill-current" />
            </Link>
          )}

          {/* Profile Icon with Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full border border-gray-900 flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              <User size={20} />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                      >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleGoogleSignIn}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- SIDEBAR --- */}
      <div className={`fixed inset-0 z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative w-80 h-full bg-white p-8 shadow-2xl overflow-y-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold tracking-normal uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>Categories</h2>
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
