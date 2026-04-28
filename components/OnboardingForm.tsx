"use client";

import { useState } from "react";
import { createTenantAction } from "@/app/actions/onboarding-actions";
import { Store, Link2, Phone, User, Building2, FileText, MapPin, ChevronRight } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://seusite.com";

export function OnboardingForm({ email, name, plano }: { email: string; name: string; plano: string }) {
  // Step 1: Company Info | Step 2: Address & Contact
  const [step, setStep] = useState(1);

  // Dados principais
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [personType, setPersonType] = useState<"PF" | "PJ">("PF");
  const [document, setDocument] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [ownerName, setOwnerName] = useState(name);

  // Dados de contato / endereço
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStoreName(val);
    setSlug(val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createTenantAction({
        storeName: tradeName || storeName,
        slug,
        phone: whatsapp || phone,
        email,
        name: ownerName,
        plano,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        window.location.href = "/admin";
      }
    } catch {
      setError("Erro ao criar a loja. Tente novamente.");
      setLoading(false);
    }
  };

  const CATEGORIES = [
    "Confeitaria / Doces",
    "Restaurante / Lanchonete",
    "Salão de Beleza",
    "Barbearia",
    "Boutique / Moda",
    "Serviços Gerais",
    "Artesanato",
    "Outro",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 mb-4">
          {error}
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-colors ${step >= 1 ? "bg-vitrinia-purple text-white" : "bg-gray-200 text-gray-500"}`}>1</div>
        <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? "bg-vitrinia-purple" : "bg-gray-200"}`} />
        <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-colors ${step >= 2 ? "bg-vitrinia-purple text-white" : "bg-gray-200 text-gray-500"}`}>2</div>
      </div>

      {/* ── STEP 1: Dados da Empresa ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <User className="w-4 h-4 inline mr-1.5 text-vitrinia-purple" />
              Responsável pela loja
            </label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-vitrinia-purple bg-gray-50"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <Building2 className="w-4 h-4 inline mr-1.5 text-vitrinia-purple" />
              Tipo de Pessoa
            </label>
            <div className="flex gap-3">
              {(["PF", "PJ"] as const).map(t => (
                <label key={t} className={`flex-1 flex items-center justify-center gap-2 py-3 border-2 rounded-xl text-sm font-bold cursor-pointer transition-colors ${personType === t ? "border-vitrinia-purple bg-vitrinia-purple/5 text-vitrinia-purple" : "border-gray-200 text-gray-500"}`}>
                  <input type="radio" name="personType" value={t} className="hidden" checked={personType === t} onChange={() => setPersonType(t)} />
                  {t === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <FileText className="w-4 h-4 inline mr-1.5 text-vitrinia-purple" />
              {personType === "PF" ? "CPF" : "CNPJ"}
            </label>
            <input
              type="text"
              required
              value={document}
              onChange={e => setDocument(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-vitrinia-purple bg-gray-50"
              placeholder={personType === "PF" ? "000.000.000-00" : "00.000.000/0001-00"}
            />
          </div>

          {personType === "PJ" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Razão Social
              </label>
              <input
                type="text"
                value={tradeName}
                onChange={e => setTradeName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-vitrinia-purple bg-gray-50"
                placeholder="Nome registrado da empresa"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <Store className="w-4 h-4 inline mr-1.5 text-vitrinia-purple" />
              Nome Fantasia da Loja
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={handleNameChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-vitrinia-purple bg-gray-50"
              placeholder="Ex: Doces da Carol, Salão da Maria..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Segmento / Categoria
            </label>
            <select
              required
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-vitrinia-purple bg-gray-50"
            >
              <option value="">Selecione o segmento...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <Link2 className="w-4 h-4 inline mr-1.5 text-vitrinia-purple" />
              Link da sua Vitrine
            </label>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:border-vitrinia-purple transition bg-gray-50">
              <span className="flex items-center px-3 text-xs text-gray-400 bg-gray-100 border-r border-gray-200 shrink-0">
                vitrinia.app/loja/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="flex-1 px-3 py-3 text-sm bg-transparent focus:outline-none"
                placeholder="minha-loja"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">Link público da sua vitrine. Gerado automaticamente.</p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!ownerName || !document || !storeName || !slug || !category) {
                setError("Preencha todos os campos obrigatórios.");
                return;
              }
              setError("");
              setStep(2);
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-vitrinia-purple text-white font-bold rounded-xl hover:bg-vitrinia-purple/90 transition active:scale-[0.98]"
          >
            Próxima Etapa
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ── STEP 2: Contato e Endereço ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <Phone className="w-4 h-4 inline mr-1.5 text-vitrinia-purple" />
              WhatsApp do Negócio <span className="text-vitrinia-orange font-black">*</span>
            </label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-vitrinia-purple bg-gray-50"
              placeholder="(11) 99999-9999"
            />
            <p className="mt-1 text-xs text-gray-400">Usado para receber notificações de pedidos.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Telefone Fixo (Opcional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-vitrinia-purple bg-gray-50"
              placeholder="(11) 3333-4444"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <MapPin className="w-4 h-4 inline mr-1.5 text-vitrinia-purple" />
              Endereço da Loja
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-vitrinia-purple bg-gray-50"
              placeholder="Rua das Flores, 123"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bairro</label>
              <input
                type="text"
                value={neighborhood}
                onChange={e => setNeighborhood(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-vitrinia-purple bg-gray-50"
                placeholder="Centro"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cidade</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-vitrinia-purple bg-gray-50"
                placeholder="São Paulo"
              />
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-vitrinia-bg rounded-xl p-4 border border-gray-100 space-y-2">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Resumo</p>
            <p className="text-sm font-semibold text-gray-800">{tradeName || storeName}</p>
            <p className="text-xs text-gray-400">vitrinia.app/loja/<strong>{slug}</strong></p>
            <p className="text-xs text-gray-400">Plano: <strong className="text-vitrinia-purple capitalize">{plano}</strong></p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition"
            >
              ← Voltar
            </button>
            <button
              type="submit"
              disabled={loading || !whatsapp}
              className="flex-[2] py-3.5 bg-vitrinia-green text-white font-bold rounded-xl hover:bg-[#00a382] transition active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-vitrinia-green/20"
            >
              {loading ? "Criando sua loja..." : "🚀 Criar Minha Loja!"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
