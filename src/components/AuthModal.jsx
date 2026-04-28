import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from "../firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const AuthModal = ({ isOpen, onClose }) => {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err) { console.error(err); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center"
          >
            <h2 className="text-3xl font-black uppercase italic mb-2 tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>
              Member Access
            </h2>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-8">Sign in to sync your blueprints</p>
            <button 
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-4 bg-black text-white rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all"
            >
              Continue with Google
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;