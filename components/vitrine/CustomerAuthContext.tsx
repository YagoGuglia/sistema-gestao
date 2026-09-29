"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { customerLoginOrRegister, CustomerData } from "@/app/actions/customer-auth-actions";

interface CustomerAuthContextType {
  customer: CustomerData | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (data: {
    phone: string;
    name?: string;
    address?: string;
    neighborhood?: string;
    city?: string;
  }) => Promise<{ success?: boolean; needName?: boolean; error?: string; message?: string }>;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: (onSuccessCallback?: () => void) => void;
  closeLoginModal: () => void;
  isOrdersModalOpen: boolean;
  openOrdersModal: () => void;
  closeOrdersModal: () => void;
  storeSlug: string;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({
  children,
  slug,
}: {
  children: React.ReactNode;
  slug: string;
}) {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const storageKey = `vitrinia_customer_${slug}`;

  // Recupera cliente salvo no localStorage ao carregar a página
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setCustomer(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Erro ao ler sessão do cliente:", e);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  const login = async (data: {
    phone: string;
    name?: string;
    address?: string;
    neighborhood?: string;
    city?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await customerLoginOrRegister({
        slug,
        phone: data.phone,
        name: data.name,
        address: data.address,
        neighborhood: data.neighborhood,
        city: data.city,
      });

      if (res.error) {
        setIsLoading(false);
        return { error: res.error };
      }

      if (res.needName) {
        setIsLoading(false);
        return { needName: true, message: res.message };
      }

      if (res.customer) {
        setCustomer(res.customer);
        localStorage.setItem(storageKey, JSON.stringify(res.customer));
        setIsLoading(false);
        setIsLoginModalOpen(false);

        if (pendingCallback) {
          pendingCallback();
          setPendingCallback(null);
        }

        return { success: true };
      }

      setIsLoading(false);
      return { error: "Não foi possível concluir o login." };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err.message || "Erro inesperado." };
    }
  };

  const logout = () => {
    setCustomer(null);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  };

  const openLoginModal = (onSuccessCallback?: () => void) => {
    if (onSuccessCallback) {
      setPendingCallback(() => onSuccessCallback);
    }
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setPendingCallback(null);
  };

  const openOrdersModal = () => setIsOrdersModalOpen(true);
  const closeOrdersModal = () => setIsOrdersModalOpen(false);

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoggedIn: !!customer,
        isLoading,
        login,
        logout,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        isOrdersModalOpen,
        openOrdersModal,
        closeOrdersModal,
        storeSlug: slug,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth deve ser utilizado dentro de CustomerAuthProvider");
  }
  return ctx;
}
