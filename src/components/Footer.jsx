import React from 'react';
import { Instagram, Mail, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="flex flex-col items-start">
            <div className="mb-4">
              <img src="/IMPRESS3D.png" alt="Impress3D Logo" className="w-72 h-auto object-contain" />
            </div>
          
            <span
              className="text-4xl uppercase tracking-normal mb-4 text-center"
              style={{ fontFamily: "Impact, sans-serif", fontWeight: "400", letterSpacing: "0.02em" }}
            >
              IMPRESS3D
            </span>
          
            <p className="text-sm text-gray-400 tracking-wide">
              Design. Create. Impress.
            </p>
          </div>

          {/* Instagram */}
          <div className="flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-400">Follow Us</h3>
            <a 
              href="https://instagram.com/impress3d.co.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white hover:text-pink-400 transition-colors group"
            >
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-pink-400/20 transition-colors flex-shrink-0">
                <Instagram size={20} />
              </div>
              <span className="text-lg">impress3d.co.in</span>
            </a>
          </div>

          {/* WhatsApp */}
          <div className="flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-400">WhatsApp</h3>
            <a 
              href="https://wa.me/918420640484" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white hover:text-green-400 transition-colors group"
            >
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-green-400/20 transition-colors flex-shrink-0">
                <MessageCircle size={20} />
              </div>
              <span className="text-lg">+91 84206 40484</span>
            </a>
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-400">Contact</h3>
            <a 
              href="mailto:impress3d.contact@gmail.com" 
              className="flex items-center gap-3 text-white hover:text-blue-400 transition-colors group"
            >
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-blue-400/20 transition-colors flex-shrink-0">
                <Mail size={20} />
              </div>
              <span className="text-lg">impress3d.contact@gmail.com</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} IMPRESS3D. All rights reserved.
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
