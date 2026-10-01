"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  observation?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, obs: string, quantity: number) => void;
  updateObservation: (id: string, oldObs: string, newObs: string) => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("vitrinia_cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("vitrinia_cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = (product: any) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image || product.imageUrl, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => {
      return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0);
    });
  };

  const clearCart = () => setItems([]);

  const updateQuantity = (id: string, obs: string, quantity: number) => {
    setItems((prev) => 
      prev.map(i => (i.id === id && (i.observation || "") === obs) ? { ...i, quantity } : i)
    );
  };

  const updateObservation = (id: string, oldObs: string, newObs: string) => {
    setItems((prev) => {
      // Check if another item with same id and newObs already exists to merge them
      const existingIdx = prev.findIndex(i => i.id === id && (i.observation || "") === newObs);
      if (existingIdx > -1) {
        // We have to merge
        let sourceQty = 0;
        const mapped = prev.filter(i => {
          if (i.id === id && (i.observation || "") === oldObs) {
            sourceQty = i.quantity;
            return false; // remove old
          }
          return true;
        }).map((i, idx) => {
          // not perfect if existingIdx changed but good enough for filter+map
          if (i.id === id && (i.observation || "") === newObs) {
             return { ...i, quantity: i.quantity + sourceQty };
          }
          return i;
        });
        return mapped;
      } else {
        return prev.map(i => (i.id === id && (i.observation || "") === oldObs) ? { ...i, observation: newObs } : i);
      }
    });
  };

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, updateQuantity, updateObservation, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
