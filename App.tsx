import React, { useState, Suspense } from 'react';
import { TreeState } from './types';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE
    );
  };

  return (
    <div className="relative w-full h-screen bg-[#010b08]">
      <Suspense fallback={
        <div className="flex items-center justify-center w-full h-full text-[#D4AF37] font-serif animate-pulse">
          Loading Arix Signature Experience...
        </div>
      }>
        <Scene treeState={treeState} />
      </Suspense>
      
      <UIOverlay 
        currentState={treeState} 
        onToggle={toggleState} 
      />
    </div>
  );
};

export default App;