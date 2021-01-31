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
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storageProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (storageProducts) setProducts(JSON.parse(storageProducts));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const existingProduct = products.findIndex(
        prod => prod.id === product.id,
      );

      const copy = [...products];
      if (existingProduct > -1) {
        copy[existingProduct].quantity += 1;
      } else {
        product.quantity = 1;
        copy.push(product);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(copy),
      );
      setProducts(copy);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productFoundIndex = products.findIndex(prod => prod.id === id);

      if (productFoundIndex > -1) {
        const copy = [...products];
        copy[productFoundIndex].quantity += 1;

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(copy),
        );

        setProducts(copy);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productFoundIndex = products.findIndex(prod => prod.id === id);

      if (productFoundIndex > -1) {
        let copy = [...products];
        const productFound = copy[productFoundIndex];
        copy[productFoundIndex].quantity -= 1;
        if (copy[productFoundIndex].quantity === 0) {
          copy = copy.filter(prod => prod !== productFound);
        }

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(copy),
        );

        setProducts(copy);
      }
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
