import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FolderPlus, PackagePlus, ChevronRight, X, ArrowLeft, Upload, Trash2, GitBranch } from 'lucide-react';

// GitHub configuration
const GITHUB_OWNER = 'akhilagarwal96';
const GITHUB_REPO = 'web-impress3d';

const AdminPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState(null); // 'category' or 'product' or null
  const navigate = useNavigate();
  const [githubToken, setGithubToken] = useState(null); // Store GitHub token from Firebase

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    order: 7
  });
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categorySuccess, setCategorySuccess] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    minQuantity: '50',
    size: '',
    tags: '',
    featured: '0',
    materialCare: 'Eco-friendly PLA plastic. Wipe clean with a damp cloth.'
  });
  const [productImages, setProductImages] = useState([]);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [productSuccess, setProductSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [githubStatus, setGithubStatus] = useState(''); // For showing GitHub upload progress
  const [prUrl, setPrUrl] = useState(''); // Store the PR URL after creation

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
              // Fetch GitHub token from admin/github_pat document
              try {
                const githubPatRef = doc(db, "admin", "github_pat");
                const githubPatSnap = await getDoc(githubPatRef);
                if (githubPatSnap.exists()) {
                  const patData = githubPatSnap.data();
                  if (patData.token) {
                    setGithubToken(patData.token);
                  }
                }
              } catch (error) {
                console.error("Error fetching GitHub token:", error);
              }
              // Fetch highest order number
              fetchHighestOrder();
              // Fetch categories for product form
              fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const cats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(cats);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchHighestOrder = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      let maxOrder = 0;
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const orderValue = Number(data.order) || 0;
        if (orderValue > maxOrder) {
          maxOrder = orderValue;
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
      
      // Re-fetch highest order for next category
      await fetchHighestOrder();
      
      setCategoryForm(prev => ({
        id: '',
        name: '',
        description: '',
        order: prev.order
      }));

      // Redirect to admin home after short delay
      setTimeout(() => {
        setActiveForm(null);
        setCategorySuccess(false);
      }, 1500);

    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category. Please try again.");
    } finally {
      setCategorySubmitting(false);
    }
  };

  // Generate image URLs based on product ID and number of images
  const generateImageUrls = (productId, imageCount) => {
    const baseUrl = "https://github.com/akhilagarwal96/web-impress3d/blob/main/images/";
    const urls = [];
    for (let i = 1; i <= imageCount; i++) {
      urls.push(`${baseUrl}${productId}-${i}.jpeg?raw=true`);
    }
    return urls.join(", ");
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setProductImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setProductImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:image/xxx;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // GitHub API: Get the SHA of the main branch
  const getMainBranchSha = async () => {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/ref/heads/main`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    const data = await response.json();
    return data.object.sha;
  };

  // GitHub API: Create a new branch
  const createBranch = async (branchName, sha) => {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: sha
        })
      }
    );
    return response.json();
  };

  // GitHub API: Upload a file to a branch
  const uploadFile = async (branchName, filePath, content, message) => {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          content: content,
          branch: branchName
        })
      }
    );
    return response.json();
  };

  // GitHub API: Create a Pull Request
  const createPullRequest = async (branchName, title, body) => {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          head: branchName,
          base: 'main',
          body: body
        })
      }
    );
    return response.json();
  };

  // Upload images to GitHub and create PR
  const uploadImagesToGitHub = async (productId, images) => {
    if (!githubToken) {
      console.warn('GitHub token not configured. Skipping GitHub upload.');
      return null;
    }

    try {
      // 1. Get main branch SHA
      setGithubStatus('Getting repository info...');
      const mainSha = await getMainBranchSha();

      // 2. Create a new branch
      const branchName = `add-images-${productId}-${Date.now()}`;
      setGithubStatus(`Creating branch: ${branchName}...`);
      await createBranch(branchName, mainSha);

      // 3. Upload each image
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const fileName = `${productId}-${i + 1}.jpeg`;
        const filePath = `images/${fileName}`;
        
        setGithubStatus(`Uploading image ${i + 1} of ${images.length}...`);
        
        const base64Content = await fileToBase64(img.file);
        await uploadFile(
          branchName,
          filePath,
          base64Content,
          `Add image: ${fileName}`
        );
      }

      // 4. Create Pull Request
      setGithubStatus('Creating Pull Request...');
      const prResponse = await createPullRequest(
        branchName,
        `Add images for product: ${productId}`,
        `This PR adds ${images.length} image(s) for the product **${productId}**.\n\nImages:\n${images.map((_, i) => `- ${productId}-${i + 1}.jpeg`).join('\n')}`
      );

      setGithubStatus('PR created successfully!');
      return prResponse.html_url;

    } catch (error) {
      console.error('GitHub upload error:', error);
      setGithubStatus(`Error: ${error.message}`);
      return null;
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    if (!productForm.id.trim() || !productForm.name.trim() || !productForm.price.trim()) {
      alert("Please fill in Product ID, Name, and Price");
      return;
    }

    if (productImages.length === 0) {
      alert("Please add at least one image");
      return;
    }

    setProductSubmitting(true);
    setGithubStatus('');
    setPrUrl('');
    
    try {
      const productId = productForm.id.toLowerCase().trim();
      const imageUrls = generateImageUrls(productId, productImages.length);
      
      // 1. Create product document in Firebase
      setGithubStatus('Saving product to Firebase...');
      const productDocRef = doc(db, "products", productId);
      
      await setDoc(productDocRef, {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: productForm.price.trim(),
        minQuantity: productForm.minQuantity.trim(),
        size: productForm.size.trim(),
        tags: productForm.tags.trim(),
        featured: productForm.featured,
        materialCare: productForm.materialCare.trim(),
        images: imageUrls
      });

      // 2. Upload images to GitHub and create PR
      const pullRequestUrl = await uploadImagesToGitHub(productId, productImages);
      
      if (pullRequestUrl) {
        setPrUrl(pullRequestUrl);
      }

      setProductSuccess(true);
      
      // Reset form
      setProductForm({
        id: '',
        name: '',
        description: '',
        price: '',
        minQuantity: '50',
        size: '',
        tags: '',
        featured: '0',
        materialCare: 'Eco-friendly PLA plastic. Wipe clean with a damp cloth.'
      });
      setProductImages([]);

      // Redirect to admin home after short delay
      setTimeout(() => {
        setActiveForm(null);
        setProductSuccess(false);
        setGithubStatus('');
        setPrUrl('');
      }, 2000);

    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    } finally {
      setProductSubmitting(false);
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

  // Add Product Form View
  if (activeForm === 'product') {
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
              Add New Product
            </h1>
            <p className="text-gray-500 text-sm">Add a new product to your catalog</p>
          </div>

          {productSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              <p className="font-semibold">✓ Product added successfully!</p>
              {prUrl && (
                <p className="mt-2">
                  <a 
                    href={prUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-800 underline hover:text-green-900"
                  >
                    <GitBranch size={16} />
                    View Pull Request on GitHub
                  </a>
                </p>
              )}
              {!prUrl && !githubToken && (
                <p className="mt-1 text-xs">Note: GitHub token not configured. Please manually upload images.</p>
              )}
            </div>
          )}

          {/* GitHub Status */}
          {githubStatus && !productSuccess && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm flex items-center gap-3">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              {githubStatus}
            </div>
          )}

          <form onSubmit={handleProductSubmit} className="space-y-6">
            {/* Product ID */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Product ID *
              </label>
              <input
                type="text"
                value={productForm.id}
                onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                placeholder="e.g., business-card-holder-001"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                required
              />
              <p className="text-xs text-gray-400 mt-1">This will be the document ID and used in image URLs</p>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="e.g., Business Card and Pen Holder"
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
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Elevate your workspace with this sleek, architectural desk companion..."
                rows={4}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
              />
            </div>

            {/* Price and Min Quantity Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="text"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="e.g., 149"
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Min Quantity
                </label>
                <input
                  type="text"
                  value={productForm.minQuantity}
                  onChange={(e) => setProductForm({ ...productForm, minQuantity: e.target.value })}
                  placeholder="e.g., 50"
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Size
              </label>
              <input
                type="text"
                value={productForm.size}
                onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                placeholder="e.g., 127 x 22 x 30"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={productForm.tags}
                onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                placeholder="e.g., office, desk"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">These should match category IDs for filtering</p>
            </div>

            {/* Featured */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Featured
              </label>
              <select
                value={productForm.featured}
                onChange={(e) => setProductForm({ ...productForm, featured: e.target.value })}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors bg-white"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

            {/* Material Care */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Material & Care
              </label>
              <textarea
                value={productForm.materialCare}
                onChange={(e) => setProductForm({ ...productForm, materialCare: e.target.value })}
                rows={2}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Product Images *
              </label>
              
              {/* Image Preview Grid */}
              {productImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {productImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                      <img 
                        src={img.preview} 
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Image {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload images</span>
                <span className="text-xs text-gray-400 mt-1">JPEG, PNG (will be renamed to product-id-1.jpeg, etc.)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>

              {/* Generated URLs Preview */}
              {productForm.id && productImages.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Generated Image URLs:</p>
                  <p className="text-xs text-gray-600 font-mono break-all">
                    {generateImageUrls(productForm.id.toLowerCase().trim(), productImages.length)}
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={productSubmitting}
              className={`w-full py-5 font-bold uppercase tracking-[0.2em] rounded-full transition-all active:scale-95 text-xs ${
                productSubmitting 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-green-600 shadow-xl shadow-black/5'
              }`}
            >
              {productSubmitting ? 'Adding Product...' : 'Add Product'}
            </button>

            {/* GitHub Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-800">
                <strong>GitHub Integration:</strong> When you submit, images will be automatically uploaded to GitHub and a Pull Request will be created.
                {!githubToken && (
                  <span className="block mt-2 text-yellow-700 bg-yellow-50 p-2 rounded">
                    ⚠️ GitHub token not configured. Add <code className="bg-yellow-100 px-1 rounded">github_token</code> field to your Firebase admin/user document.
                  </span>
                )}
              </p>
            </div>
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
            onClick={() => setActiveForm('product')}
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
