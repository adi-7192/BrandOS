import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const BrandContext = createContext(null);

export function BrandProvider({ children }) {
  const [brands, setBrands] = useState([]);
  const [activeBrand, setActiveBrand] = useState(null);

  const fetchBrands = useCallback(async () => {
    const res = await api.get('/brands');
    setBrands(res.data.brands);
    return res.data.brands;
  }, []);

  const selectBrand = (brand) => setActiveBrand(brand);

  return (
    <BrandContext.Provider value={{ brands, activeBrand, fetchBrands, selectBrand }}>
      {children}
    </BrandContext.Provider>
  );
}

export const useBrand = () => useContext(BrandContext);
