import React from 'react';
import { TreeState } from '../types';

interface UIOverlayProps {
  currentState: TreeState;
  onToggle: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ currentState, onToggle }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
      {/* Header */}
      <header className="flex flex-col items-start space-y-2">
        <h1 className="text-4xl md:text-6xl font-[Cinzel] font-bold text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] tracking-wider">
          ARIX
        </h1>
        <div className="h-[1px] w-24 bg-gradient-to-r from-[#D4AF37] to-transparent opacity-80" />
        <p className="text-sm md:text-base font-[Playfair Display] text-[#a8b8b0] tracking-widest uppercase">
          Signature Interactive Holiday
        </p>
      </header>

      {/* Controls */}
      <footer className="flex flex-col md:flex-row justify-between items-end md:items-center w-full">
        
        {/* State Indicator */}
        <div className="mb-4 md:mb-0 hidden md:block">
           <p className="font-mono text-xs text-[#025939] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1 rounded backdrop-blur-sm">
             SYSTEM STATUS: {currentState}
           </p>
        </div>

        {/* Interaction Button */}
        <button 
          onClick={onToggle}
          className="pointer-events-auto group relative px-8 py-3 overflow-hidden rounded-sm bg-transparent border border-[#D4AF37] transition-all duration-500 hover:bg-[#D4AF37]/10"
        >
          {/* Button Glow Effect */}
          <div className="absolute inset-0 w-0 bg-[#D4AF37] transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
          
          <span className="relative flex items-center space-x-3">
             <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${currentState === TreeState.TREE_SHAPE ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]' : 'bg-red-400 shadow-[0_0_8px_red]'}`}></span>
             <span className="font-[Cinzel] font-bold text-[#D4AF37] tracking-widest text-sm md:text-lg">
               {currentState === TreeState.TREE_SHAPE ? 'SCATTER ELEMENTS' : 'ASSEMBLE TREE'}
             </span>
          </span>
        </button>

      </footer>

      {/* Decorative Borders */}
      <div className="absolute top-8 right-8 w-32 h-32 border-t border-r border-[#D4AF37]/30 rounded-tr-3xl pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-32 h-32 border-b border-l border-[#D4AF37]/30 rounded-bl-3xl pointer-events-none" />
    </div>
  );
};