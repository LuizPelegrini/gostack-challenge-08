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
      // await AsyncStorage.setItem('@GoMarketplace:products', '');

      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storageProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (storageProducts) setProducts([...JSON.parse(storageProducts)]);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productExists = products.find(prod => prod.id === product.id);

      let newProds: Product[] = [];

      if (productExists) {
        newProds = products.map(p =>
          p.id === product.id
            ? { ...product, quantity: p.quantity + 1 } // override
            : p,
        );
      } else {
        newProds = [...products, { ...product, quantity: 1 }];
      }
      setProducts(newProds);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProds),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART

      const prods = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p,
      );

      setProducts(prods);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(prods),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const prods = products
        .map(p => (p.id === id ? { ...p, quantity: p.quantity - 1 } : p))
        .filter(p => p.quantity > 0);

      setProducts(prods);

      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(prods),
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
