import React from 'react';
import { Instagram, Mail, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Logo Section */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3 mb-4">
              <img src="/IMPRESS3D.png" alt="Impress3D Logo" className="h-16 w-auto object-contain" />
            </div>
            <span 
              className="text-4xl uppercase tracking-tighter mb-4" 
              style={{ fontFamily: 'Impact, sans-serif' }}
            >
              Impress3D
            </span>
            <p className="text-sm text-gray-400 tracking-wide">
              Design. Create. Impress.
            </p>
          </div>

          {/* Instagram */}
          <div className="flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-400">Follow Us</h3>
            <a 
              href="https://instagram.com/impress3d.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white hover:text-pink-400 transition-colors group"
            >
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-pink-400/20 transition-colors">
                <Instagram size={20} />
              </div>
              <span className="text-lg">@impress3d.in</span>
            </a>
          </div>

          {/* WhatsApp */}
          <div className="flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-400">WhatsApp</h3>
            <a 
              href="https://wa.me/919876543210" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white hover:text-green-400 transition-colors group"
            >
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-green-400/20 transition-colors">
                <MessageCircle size={20} />
              </div>
              <span className="text-lg">+91 98765 43210</span>
            </a>
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-400">Contact</h3>
            <a 
              href="mailto:contact@impress3d.in" 
              className="flex items-center gap-3 text-white hover:text-blue-400 transition-colors group"
            >
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-blue-400/20 transition-colors">
                <Mail size={20} />
              </div>
              <span className="text-lg">contact@impress3d.in</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Impress3D. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Powered by Firebase Cloud
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
