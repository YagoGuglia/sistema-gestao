"use client";

import { useState } from "react";
import { addCustomerAddress } from "@/app/actions/customer-auth-actions";
import { Loader2, Search, MapPin, Home, Briefcase, Plus } from "lucide-react";

interface AddressFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddressForm({ userId, onSuccess, onCancel }: AddressFormProps) {
  const [loadingCep, setLoadingCep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    label: "Casa",
    isDefault: false,
  });

  const handleCepBlur = async () => {
    const cep = formData.zipCode.replace(/\D/g, "");
    if (cep.length !== 8) return;

    setLoadingCep(true);
    setError("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setError("CEP não encontrado.");
      } else {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        }));
      }
    } catch (err) {
      setError("Erro ao buscar CEP.");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await addCustomerAddress(userId, formData);
    
    if (res.error) {
      setError(res.error);
      setSaving(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-500 text-sm font-medium rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* Label Seleção */}
      <div className="flex gap-2">
        {["Casa", "Trabalho", "Outro"].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, label }))}
            className={`flex-1 py-2 text-sm font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
              formData.label === label 
                ? 'bg-vitrinia-purple text-white border-vitrinia-purple shadow-sm' 
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {label === "Casa" ? <Home size={16} /> : label === "Trabalho" ? <Briefcase size={16} /> : <MapPin size={16} />}
            {label}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CEP *</label>
        <div className="relative">
          <input
            type="text"
            required
            placeholder="00000-000"
            maxLength={9}
            value={formData.zipCode}
            onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
            onBlur={handleCepBlur}
            className="w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-gray-50 font-medium text-sm transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {loadingCep ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Rua *</label>
          <input
            type="text"
            required
            value={formData.street}
            onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
            className="w-full px-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-gray-50 font-medium text-sm transition-all"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Número *</label>
          <input
            type="text"
            required
            value={formData.number}
            onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
            className="w-full px-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-gray-50 font-medium text-sm transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Complemento</label>
        <input
          type="text"
          placeholder="Apto, Bloco, Casa 2..."
          value={formData.complement}
          onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
          className="w-full px-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-gray-50 font-medium text-sm transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bairro *</label>
          <input
            type="text"
            required
            value={formData.neighborhood}
            onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
            className="w-full px-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-gray-50 font-medium text-sm transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cidade / UF *</label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-gray-50 font-medium text-sm transition-all"
            />
            <input
              type="text"
              required
              maxLength={2}
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
              className="w-16 px-2 py-3 border border-gray-200 rounded-xl outline-none focus:border-vitrinia-purple bg-gray-50 font-bold text-sm text-center transition-all"
            />
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer pt-2">
        <input
          type="checkbox"
          checked={formData.isDefault}
          onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
          className="w-4 h-4 text-vitrinia-purple rounded border-gray-300 focus:ring-vitrinia-purple"
        />
        <span className="text-sm font-medium text-gray-700">Tornar este endereço padrão</span>
      </label>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-3 text-sm font-bold text-white bg-vitrinia-purple hover:bg-vitrinia-purple/90 rounded-xl shadow-lg shadow-vitrinia-purple/20 transition flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Endereço"}
        </button>
      </div>
    </form>
  );
}
