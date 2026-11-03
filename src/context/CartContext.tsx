import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types/product';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (sku: string, delta: number) => void;
  setExactQuantity: (sku: string, quantity: number) => void;
  removeFromCart: (sku: string) => void;
  clearCart: () => void;
  totalCount: number;
  totalSum: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  getItemQuantity: (sku: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'snabgear_tecener_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore JSON parse errors
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage quota errors
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.sku === product.sku);
      if (existing) {
        return prev.map((item) =>
          item.product.sku === product.sku
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateQuantity = (sku: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.sku === sku) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const setExactQuantity = (sku: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.sku !== sku);
      }
      return prev.map((item) =>
        item.product.sku === sku ? { ...item, quantity } : item
      );
    });
  };

  const removeFromCart = (sku: string) => {
    setItems((prev) => prev.filter((item) => item.product.sku !== sku));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (sku: string): number => {
    const item = items.find((i) => i.product.sku === sku);
    return item ? item.quantity : 0;
  };

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalSum = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        setExactQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        totalSum,
        isCartOpen,
        setIsCartOpen,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
