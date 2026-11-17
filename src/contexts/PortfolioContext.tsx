import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { PortfolioData } from '../types';
import { loadData, saveData } from '../lib/storage';
import { loadPublishedPortfolio, saveAdminPortfolio } from '../lib/portfolio-api';

interface PortfolioContextType {
  data: PortfolioData;
  updateData: (newData: PortfolioData) => Promise<void>;
  replaceDataFromServer: (newData: PortfolioData) => void;
  resetToSeed: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<PortfolioData>(loadData());

  useEffect(() => {
    let active = true;
    loadPublishedPortfolio().then((publishedData) => {
      if (!active || !publishedData) return;
      setData(publishedData);
      saveData(publishedData);
    }).catch((error: unknown) => {
      console.error('Unable to load the published portfolio from the server.', error);
    });
    return () => {
      active = false;
    };
  }, []);

  const updateData = useCallback(async (newData: PortfolioData) => {
    await saveAdminPortfolio(newData);
    setData(newData);
    saveData(newData);
  }, []);

  const replaceDataFromServer = useCallback((newData: PortfolioData) => {
    setData(newData);
    saveData(newData);
  }, []);

  const resetToSeed = useCallback(async () => {
    const { seedData } = await import('../data/seed');
    await updateData(seedData);
  }, [updateData]);

  return (
    <PortfolioContext.Provider value={{ data, updateData, replaceDataFromServer, resetToSeed }}>
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
