import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FolderPlus, PackagePlus, ChevronRight, X, ArrowLeft } from 'lucide-react';

const AdminPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState(null); // 'category' or 'product' or null
  const navigate = useNavigate();

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    order: 7
  });
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categorySuccess, setCategorySuccess] = useState(false);

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
              // Fetch highest order number
              fetchHighestOrder();
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

  const fetchHighestOrder = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      let maxOrder = 0;
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.order && data.order > maxOrder) {
          maxOrder = data.order;
        }
      });
      setCategoryForm(prev => ({ ...prev, order: maxOrder + 1 }));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryForm.id.trim() || !categoryForm.name.trim()) {
      alert("Please fill in Category ID and Name");
      return;
    }

    setCategorySubmitting(true);
    
    try {
      // Use the ID as the document ID
      const categoryDocRef = doc(db, "categories", categoryForm.id.toLowerCase().trim());
      
      await setDoc(categoryDocRef, {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        order: Number(categoryForm.order)
      });

      setCategorySuccess(true);
      setCategoryForm({
        id: '',
        name: '',
        description: '',
        order: categoryForm.order + 1
      });

      setTimeout(() => {
        setCategorySuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category. Please try again.");
    } finally {
      setCategorySubmitting(false);
    }
  };

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

  // Add Category Form View
  if (activeForm === 'category') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        
        <main className="flex-grow max-w-2xl mx-auto px-6 py-12 w-full">
          <button 
            onClick={() => setActiveForm(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="uppercase text-sm tracking-widest">Back to Admin</span>
          </button>

          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-2" style={{ fontFamily: 'Impact, sans-serif' }}>
              Add New Category
            </h1>
            <p className="text-gray-500 text-sm">Create a new product category for your store</p>
          </div>

          {categorySuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              ✓ Category added successfully!
            </div>
          )}

          <form onSubmit={handleCategorySubmit} className="space-y-6">
            {/* Category ID */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Category ID *
              </label>
              <input
                type="text"
                value={categoryForm.id}
                onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value })}
                placeholder="e.g., electronics"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                required
              />
              <p className="text-xs text-gray-400 mt-1">This will be the document ID (lowercase, no spaces recommended)</p>
            </div>

            {/* Category Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Electronics"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Description
              </label>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="e.g., All electronic products"
                rows={3}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Order
              </label>
              <input
                type="number"
                value={categoryForm.order}
                onChange={(e) => setCategoryForm({ ...categoryForm, order: e.target.value })}
                min="1"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">Display order in the sidebar (lower numbers appear first)</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={categorySubmitting}
              className={`w-full py-5 font-bold uppercase tracking-[0.2em] rounded-full transition-all active:scale-95 text-xs ${
                categorySubmitting 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-blue-600 shadow-xl shadow-black/5'
              }`}
            >
              {categorySubmitting ? 'Adding Category...' : 'Add Category'}
            </button>
          </form>
        </main>

        <Footer />
      </div>
    );
  }

  // Main Admin View
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
            onClick={() => setActiveForm('category')}
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
