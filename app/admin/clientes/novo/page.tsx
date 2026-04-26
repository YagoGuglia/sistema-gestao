"use client";

import { useState } from "react";
import { upsertUser } from "@/app/actions/user-actions";
import { useRouter } from "next/navigation";
import { Users, Check, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [clientData, setClientData] = useState({
    personType: "PF",
    name: "",
    tradeName: "",
    document: "",
    phone: "",
    address: "",
    neighborhood: "",
    city: ""
  });

  const handleDocumentChange = (val: string) => {
     let c = val.replace(/\D/g, "");
     if (clientData.personType === "PJ") {
        if (c.length > 14) c = c.substring(0, 14);
        c = c.replace(/^(\d{2})(\d)/, "$1.$2");
        c = c.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        c = c.replace(/\.(\d{3})(\d)/, ".$1/$2");
        c = c.replace(/(\d{4})(\d)/, "$1-$2");
     } else {
        if (c.length > 11) c = c.substring(0, 11);
        c = c.replace(/(\d{3})(\d)/, "$1.$2");
        c = c.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
        c = c.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
     }
     setClientData({...clientData, document: c});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clientData.phone.length < 10) return alert("Telefone inválido.");
    if (!clientData.name) return alert("Preecha o nome/razão social.");
    
    setLoading(true);
    const result = await upsertUser(clientData);
    setLoading(false);

    if (result.error) {
       alert(result.error);
    } else {
       router.push("/admin/clientes");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="flex items-center gap-4">
        <Link href="/admin/clientes" className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition">
           <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" />
            Cadastrar Cliente
          </h1>
          <p className="text-sm text-gray-500 font-medium">Preencha os dados do novo cliente PF ou PJ.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-gray-50 bg-gray-50/50">
           <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 max-w-sm">
             <button 
               type="button" 
               onClick={() => setClientData({...clientData, personType: "PF", document: "", tradeName: ""})}
               className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${clientData.personType === "PF" ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
             >
               Pessoa Física
             </button>
             <button 
               type="button" 
               onClick={() => setClientData({...clientData, personType: "PJ", document: ""})}
               className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${clientData.personType === "PJ" ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
             >
               Pessoa Jurídica
             </button>
           </div>
         </div>

         <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Principais */}
            <div className={`space-y-4 ${clientData.personType === "PJ" ? "md:col-span-1" : "md:col-span-2"}`}>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  {clientData.personType === "PJ" ? "Razão Social *" : "Nome Completo *"}
                </label>
                <input 
                  type="text" 
                  required
                  value={clientData.name}
                  onChange={(e) => setClientData({...clientData, name: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {clientData.personType === "PJ" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Fantasia</label>
                  <input 
                    type="text" 
                    value={clientData.tradeName}
                    onChange={(e) => setClientData({...clientData, tradeName: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                 {clientData.personType === "PJ" ? "CNPJ" : "CPF"}
               </label>
               <input 
                 type="text" 
                 value={clientData.document}
                 onChange={(e) => handleDocumentChange(e.target.value)}
                 placeholder={clientData.personType === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"}
                 className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium tracking-wide"
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone / WhatsApp *</label>
               <input 
                 type="text" 
                 required
                 value={clientData.phone}
                 onChange={(e) => setClientData({...clientData, phone: e.target.value.replace(/\D/g, '')})}
                 placeholder="11999999999"
                 className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 tracking-widest"
               />
            </div>

            <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase mb-4">Endereço de Entrega</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rua, Número, Comp.</label>
                    <input 
                      type="text" 
                      value={clientData.address}
                      onChange={(e) => setClientData({...clientData, address: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bairro</label>
                    <input 
                      type="text" 
                      value={clientData.neighborhood}
                      onChange={(e) => setClientData({...clientData, neighborhood: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cidade</label>
                    <input 
                      type="text" 
                      value={clientData.city}
                      onChange={(e) => setClientData({...clientData, city: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
            </div>
         </div>

         <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
              Salvar Cliente
            </button>
         </div>
      </form>
    </div>
  );
}
