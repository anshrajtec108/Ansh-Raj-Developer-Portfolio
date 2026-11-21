import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PortfolioData } from '../types';
import { loadData, saveData } from '../lib/storage';

interface PortfolioContextType {
  data: PortfolioData;
  updateData: (newData: PortfolioData) => void;
  resetToSeed: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<PortfolioData>(loadData());

  const updateData = (newData: PortfolioData) => {
    setData(newData);
    saveData(newData);
  };

  const resetToSeed = () => {
    import('../data/seed').then(({ seedData }) => {
      updateData(seedData);
    });
  };

  return (
    <PortfolioContext.Provider value={{ data, updateData, resetToSeed }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
