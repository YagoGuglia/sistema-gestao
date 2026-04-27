"use client";

import { useState } from "react";
import { createTenantAction } from "@/app/actions/onboarding-actions";

export function OnboardingForm({ email, name }: { email: string, name: string }) {
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStoreName(val);
    // Auto-gerar slug a partir do nome
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createTenantAction({ storeName, slug, phone, email, name });
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // Redirecionar para o painel de administração (usando window.location para forçar refresh completo)
        window.location.href = "/admin";
      }
    } catch (err) {
      setError("Erro ao criar a loja. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
          Nome da sua Loja
        </label>
        <div className="mt-1">
          <input
            id="storeName"
            type="text"
            required
            value={storeName}
            onChange={handleNameChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ex: Doces da Carol"
          />
        </div>
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          Link Exclusivo
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
            sispqemp.com/
          </span>
          <input
            type="text"
            id="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 border"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Este será o link público da sua vitrine.</p>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          WhatsApp do Negócio
        </label>
        <div className="mt-1">
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading || !slug || !storeName || !phone}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Criando loja..." : "Criar Minha Loja"}
        </button>
      </div>
    </form>
  );
}
