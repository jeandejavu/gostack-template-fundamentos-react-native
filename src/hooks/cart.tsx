import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem(
        '@GoMarketplace:cart:products',
      );
      if (productsStorage) setProducts(JSON.parse(productsStorage));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      setProducts(data => [...data, { ...product, quantity: 1 }]);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const product = products.find(p => p.id === id);
      if (!product) return;
      product.quantity += 1;
      setProducts(data => [...data.filter(d => d.id !== id), product]);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(p => p.id === id);
      if (!product) return;
      product.quantity -= 1;
      setProducts(data => [...data.filter(d => d.id !== id), product]);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
