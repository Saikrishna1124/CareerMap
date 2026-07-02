import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const DemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-warm-bg dark:bg-stone-950 flex flex-col items-center justify-center p-6 relative">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-warm-secondary hover:text-brand-purple transition-colors font-bold z-10"
      >
        <ArrowLeft size={20} />
        Back to Home
      </Link>
      
      <div className="w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-warm-border/50 dark:border-white/10 aspect-video relative group flex items-center justify-center">
        <video 
          className="w-full h-full object-contain"
          controls 
          autoPlay 
          playsInline
        >
          <source src="/demo.mp4" type="video/mp4" />
          <p className="text-white p-4">Your browser does not support the video tag.</p>
        </video>
      </div>
    </div>
  );
};

export default DemoPage;
