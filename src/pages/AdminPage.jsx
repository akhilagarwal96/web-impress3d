import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FolderPlus, PackagePlus, ChevronRight } from 'lucide-react';

const AdminPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const adminDocRef = doc(db, "admin", "user");
          const adminDocSnap = await getDoc(adminDocRef);
          if (adminDocSnap.exists()) {
            const adminData = adminDocSnap.data();
            if (adminData.email === currentUser.email) {
              setIsAdmin(true);
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          navigate('/');
        }
      } else {
        navigate('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-xl font-mono uppercase tracking-widest text-gray-400">
            Verifying Access...
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter mb-4" style={{ fontFamily: 'Impact, sans-serif' }}>
            Admin Panel
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">
            Manage your store content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add New Category */}
          <button 
            onClick={() => {
              // TODO: Implement add category functionality
              console.log("Add new category clicked");
            }}
            className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <FolderPlus size={32} />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-2" style={{ fontFamily: 'Impact, sans-serif' }}>
              Add New Category
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Create a new product category for your store
            </p>
            <div className="flex items-center text-blue-500 font-semibold text-sm uppercase tracking-widest group-hover:gap-2 transition-all">
              <span>Get Started</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Add New Product */}
          <button 
            onClick={() => {
              // TODO: Implement add product functionality
              console.log("Add new product clicked");
            }}
            className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-colors">
              <PackagePlus size={32} />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-2" style={{ fontFamily: 'Impact, sans-serif' }}>
              Add New Product
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Add a new product to your catalog
            </p>
            <div className="flex items-center text-green-500 font-semibold text-sm uppercase tracking-widest group-hover:gap-2 transition-all">
              <span>Get Started</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Admin Info */}
        <div className="mt-12 p-6 bg-gray-900 text-white rounded-2xl">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Logged in as Admin</p>
          <p className="font-mono text-sm">{auth.currentUser?.email}</p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPage;
