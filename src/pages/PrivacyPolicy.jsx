import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-5xl md:text-7xl font-black uppercase italic mb-4" style={{ fontFamily: 'Impact, sans-serif' }}>
          Privacy Policy
        </h1>
        <p className="text-gray-400 font-mono text-sm uppercase tracking-widest mb-12">
          Last Updated: April 2026
        </p>

        <div className="prose prose-gray max-w-none flex flex-col gap-10">
          <section>
            <h2 className="text-xl font-bold uppercase tracking-widest text-black mb-4">01. Data Collection</h2>
            <p className="text-gray-600 leading-relaxed">
              We collect information you provide directly to us when you create an account, specifically your name and email through Google Authentication. This data is used to sync your wishlist across devices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase tracking-widest text-black mb-4">02. Usage of Information</h2>
            <p className="text-gray-600 leading-relaxed">
              Your data allows us to personalize your experience. We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase tracking-widest text-black mb-4">03. Cookies & Tracking</h2>
            <p className="text-gray-600 leading-relaxed">
              IMPRESS3D uses local storage and Firebase cookies to keep you signed in. These are essential for the technical functionality of the "Member Access" features.
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl border border-gray-100">
            <h2 className="text-xl font-bold uppercase tracking-widest text-black mb-4">04. Contact</h2>
            <p className="text-gray-600">
              Questions regarding our privacy protocols? <br />
              <span className="font-bold text-black uppercase mt-2 block">support@impress3d.co.in</span>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
