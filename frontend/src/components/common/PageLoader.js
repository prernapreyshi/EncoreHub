import React from 'react';

const PageLoader = () => (
  <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-primary/50 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center font-black text-white text-xs">E</div>
        <span className="text-white font-bold text-lg tracking-tight">Encore<span className="text-primary">Hub</span></span>
      </div>
    </div>
  </div>
);

export default PageLoader;
