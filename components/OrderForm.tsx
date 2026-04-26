"use client";

import { useState } from "react";
import { searchUserByPhone, upsertUser } from "@/app/actions/user-actions";
import { createManualOrder } from "@/app/actions/order-actions";
import { 
  Search, User as UserIcon, MapPin, 
  ShoppingBag, Plus, Trash2, Calendar, 
  Loader2, Check, AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";

export function OrderForm({ availableProducts, defaultDeliveryFee, decimalSeparator, defaultSchedulingEnabled }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = Cliente, 2 = Carrinho/Logística

  // --- Estado do Cliente (Busca Global) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [clientData, setClientData] = useState<any>(null); // Selecionado ou Novo
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  
  // Função p/ formatar documento no form de NOVO cliente
  const handleDocumentChange = (val: string) => {
     let c = val.replace(/\D/g, "");
     if (clientData?.personType === "PJ") {
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

  // --- Estado do Pedido ---
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [tempQty, setTempQty] = useState(1);
  const [tempObs, setTempObs] = useState("");

  const [cart, setCart] = useState<any[]>([]);
  const [orderType, setOrderType] = useState("RETIRADA");
  const [orderStatus, setOrderStatus] = useState("RECEIVED");
  const [schedulingEnabled, setSchedulingEnabled] = useState(!!defaultSchedulingEnabled);
  const [scheduledAt, setScheduledAt] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(defaultDeliveryFee ? defaultDeliveryFee.toString().replace(".", decimalSeparator) : "0");
  const [observation, setObservation] = useState("");

  const filteredProducts = (availableProducts || []).filter((p: any) => 
     p.name.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  const handleSearchGlobal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... mantem resto inalterado até o catalogo

    const query = e.target.value;
    setSearchQuery(query);
    if (query.length < 2) {
       setSearchResults([]);
       return;
    }
    
    setIsSearchingClient(true);
    // Usando require provisório para evitar erro de hook no import dynamic
    const { searchUsersGlobal } = require("@/app/actions/user-actions");
    const users = await searchUsersGlobal(query);
    setSearchResults(users);
    setIsSearchingClient(false);
  };

  const selectExistingClient = (user: any) => {
     setClientData(user);
     setSearchResults([]);
     setSearchQuery("");
     setShowNewClientForm(false);
  };

  const startNewClient = () => {
      setClientData({ phone: searchQuery.replace(/\D/g,'') || "", name: "", personType: "PF", document: "", tradeName: "", address: "", neighborhood: "", city: "" });
      setSearchResults([]);
      setShowNewClientForm(true);
  };

//... manter funcoes do carrinho até renderização do cliente ...//
  const renderClientForm = () => (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in transition-all">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
             <h2 className="text-xl font-bold flex items-center gap-2"><UserIcon className="text-blue-600"/> Cadastrar Novo Cliente</h2>
             <button onClick={() => setShowNewClientForm(false)} className="text-gray-400 hover:text-red-500 font-bold p-2 bg-gray-100 rounded-lg">Cancelar</button>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-2 flex gap-2 mb-2 bg-gray-100 p-1 rounded-xl">
                <button 
                  type="button" 
                  onClick={() => setClientData({...clientData, personType: "PF", document: ""})}
                  className={`flex-1 py-2 font-bold text-xs rounded-lg transition ${clientData?.personType === "PF" ? "bg-white text-blue-700 shadow-sm" : "text-gray-400"}`}
                >
                  Pessoa Física (PF)
                </button>
                <button 
                  type="button" 
                  onClick={() => setClientData({...clientData, personType: "PJ", document: ""})}
                  className={`flex-1 py-2 font-bold text-xs rounded-lg transition ${clientData?.personType === "PJ" ? "bg-white text-blue-700 shadow-sm" : "text-gray-400"}`}
                >
                  Pessoa Jurídica (PJ)
                </button>
             </div>

             <div className={clientData?.personType === "PJ" ? "col-span-1" : "md:col-span-2"}>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                 {clientData?.personType === "PJ" ? "Razão Social *" : "Nome Completo *"}
               </label>
               <input 
                 type="text" 
                 value={clientData.name || ""}
                 onChange={(e) => setClientData({...clientData, name: e.target.value})}
                 className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
               />
             </div>

             {clientData?.personType === "PJ" && (
               <div className="col-span-1">
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Fantasia</label>
                 <input 
                   type="text" 
                   value={clientData.tradeName || ""}
                   onChange={(e) => setClientData({...clientData, tradeName: e.target.value})}
                   className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                 />
               </div>
             )}

             <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                 {clientData?.personType === "PJ" ? "CNPJ" : "CPF"}
               </label>
               <input 
                 type="text" 
                 value={clientData.document || ""}
                 onChange={(e) => handleDocumentChange(e.target.value)}
                 placeholder={clientData?.personType === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"}
                 className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium tracking-wide"
               />
             </div>
             
             <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone *</label>
               <input 
                 type="text" 
                 value={clientData.phone || ""}
                 onChange={(e) => setClientData({...clientData, phone: e.target.value.replace(/\D/g,'')})}
                 placeholder="11999999999"
                 className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium tracking-wide"
               />
             </div>

             <div className="md:col-span-2 mt-4">
                 <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase border-b pb-1 mb-2">Endereço de Entrega</h3>
             </div>

             <div className="md:col-span-2">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço (Rua, Nº, Complemento)</label>
               <input 
                 type="text" 
                 value={clientData.address || ""}
                 onChange={(e) => setClientData({...clientData, address: e.target.value})}
                 className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bairro</label>
               <input 
                 type="text" 
                 value={clientData.neighborhood || ""}
                 onChange={(e) => setClientData({...clientData, neighborhood: e.target.value})}
                 className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cidade</label>
               <input 
                 type="text" 
                 value={clientData.city || ""}
                 onChange={(e) => setClientData({...clientData, city: e.target.value})}
                 className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
               />
             </div>

             <div className="md:col-span-2 pt-4 flex gap-4">
                <button 
                   type="button"
                   onClick={() => setShowNewClientForm(false)}
                   className="flex-1 bg-gray-100 text-gray-600 p-3 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                   Cancelar
                </button>
                <button 
                   type="button"
                   onClick={() => { if(clientData.name && clientData.phone) { setShowNewClientForm(false); setStep(2); } else alert("Nome e Telefone são obrigatórios!"); }}
                   className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                   Salvar e Usar
                </button>
             </div>
          </div>
       </div>
    </div>
  );


  const commitToCart = (product: any, qty: number, obs: string) => {
    setCart(prev => {
       // Se o produto já existe com a MESMA observação, somamos. Se for diferente, criamos nova linha.
       const existingIndex = prev.findIndex(p => p.productId === product.id && (p.observation || "") === obs);
       if (existingIndex > -1) {
          const newCart = [...prev];
          newCart[existingIndex].quantity += qty;
          return newCart;
       }
       return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: qty, stock: product.stock, observation: obs }];
    });
    setActiveProductId(null);
  };

  const handleProductCardClick = (p: any) => {
     if (activeProductId === p.id) return;
     setActiveProductId(p.id);
     setTempQty(1);
     setTempObs("");
  };

  const handleDoubleClick = (p: any) => {
     commitToCart(p, 1, "");
  };

  const handleUpdateCartQty = (productId: string, obs: string, delta: number) => {
    setCart(prev => prev.map(p => {
      if (p.productId === productId && (p.observation || "") === obs) {
        const newQty = Math.max(1, p.quantity + delta);
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  };

  const handleRemoveFromCart = (productId: string, obs: string) => {
    setCart(prev => prev.filter(p => !(p.productId === productId && (p.observation || "") === obs)));
  };

  const submitOrder = async () => {
    if (!clientData.name) return alert("Preencha o nome/razão da pessoa.");
    if (cart.length === 0) return alert("Selecione ao menos um produto.");
    
    setLoading(true);

    // 1. Salvar ou atualizar cliente
    const userResult = await upsertUser(clientData);
    if (userResult.error || !userResult.user) {
      alert(userResult.error || "Erro ao salvar cliente.");
      setLoading(false);
      return;
    }

    const cleanFee = decimalSeparator === "," ? deliveryFee.replace(",", ".") : deliveryFee;
    const finalFee = parseFloat(cleanFee) || 0;

    // 2. Criar pedido
    const orderResult = await createManualOrder({
      userId: userResult.user.id,
      orderType,
      status: orderStatus,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      deliveryFee: orderType === "DELIVERY" ? finalFee : 0,
      observation,
      items: cart
    });

    setLoading(false);

    if (orderResult.success) {
      router.push("/admin/pedidos");
    } else {
      alert(orderResult.error);
    }
  };

  const totalProducts = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cleanFee = decimalSeparator === "," ? deliveryFee.replace(",", ".") : deliveryFee;
  const finalTotal = totalProducts + (orderType === "DELIVERY" ? (parseFloat(cleanFee) || 0) : 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Lado Esquerdo: Etapas */}
      <div className="md:col-span-2 space-y-6">
        
        {/* Etapa 1: Cliente */}
        <div className={`bg-white p-6 rounded-2xl border ${step === 1 ? 'border-blue-500 shadow-md ring-4 ring-blue-50' : 'border-gray-200'} relative`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
              Selecionar Cliente
            </h2>
            {step === 2 && (
              <button onClick={() => setStep(1)} className="text-blue-600 text-xs font-bold hover:underline">Alterar Cliente</button>
            )}
          </div>

          {step === 1 ? (
             <div className="space-y-4">
               {!clientData ? (
                 <div className="relative">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Buscar por Nome, Documento ou Telefone</label>
                   <div className="flex gap-2">
                     <div className="relative flex-1">
                       <input 
                         type="text" 
                         placeholder="Digite para pesquisar..." 
                         value={searchQuery}
                         onChange={handleSearchGlobal}
                         className="w-full p-3 pl-10 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium text-gray-700"
                       />
                       <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                       
                       {isSearchingClient && (
                          <div className="absolute right-3 top-3.5">
                             <Loader2 size={18} className="animate-spin text-blue-500" />
                          </div>
                       )}
                     </div>
                   </div>

                   {/* Dropdown de Resultados */}
                   {searchResults.length > 0 && (
                     <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-xl max-h-60 overflow-y-auto">
                        {searchResults.map(u => (
                           <div 
                             key={u.id} 
                             onClick={() => selectExistingClient(u)}
                             className="p-3 border-b border-gray-50 hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition"
                           >
                              <div>
                                 <p className="font-bold text-gray-800 group-hover:text-blue-700">{u.tradeName || u.name}</p>
                                 <p className="text-xs text-gray-500">{u.phone} {u.document ? `• ${u.document}` : ''}</p>
                              </div>
                              <span className="text-[9px] uppercase font-bold tracking-widest bg-gray-100 px-2 py-1 rounded text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600">{u.personType}</span>
                           </div>
                        ))}
                     </div>
                   )}
                   
                   {/* Mensagem não encontrado */}
                   {searchQuery.length >= 2 && searchResults.length === 0 && !isSearchingClient && (
                     <div className="mt-2 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm flex flex-col items-center text-center">
                        <p className="font-bold mb-2">Cliente não encontrado</p>
                        <button type="button" onClick={startNewClient} className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold shadow-sm hover:bg-amber-600 active:scale-95 transition">
                           Cadastrar Novo Cliente
                        </button>
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="animate-in fade-in">
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-xl">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border shadow-sm"><UserIcon size={20} className="text-blue-600"/></div>
                         <div>
                            <p className="font-bold text-gray-900">{clientData.tradeName || clientData.name}</p>
                            <p className="text-xs text-gray-500">{clientData.phone} {clientData.document ? `• ${clientData.document}` : ''}</p>
                         </div>
                       </div>
                       <div className="flex gap-2">
                          <button type="button" onClick={() => setClientData(null)} className="text-xs font-bold text-gray-500 hover:text-red-500 p-2 bg-white rounded-lg border shadow-sm">
                            Trocar
                          </button>
                       </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button 
                         type="button"
                         onClick={() => setStep(2)}
                         className="w-full bg-black text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg"
                      >
                         Continuar Pedido com este Cliente
                      </button>
                    </div>
                 </div>
               )}
               
               {showNewClientForm && renderClientForm()}
             </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border shadow-sm"><UserIcon size={20} className="text-blue-600"/></div>
                 <div>
                    <p className="font-bold text-gray-900">{clientData?.tradeName || clientData?.name}</p>
                    <p className="text-xs text-gray-500">{clientData?.phone} {clientData?.document ? `• ${clientData.document}` : ''}</p>
                 </div>
               </div>
               <span className="text-[10px] font-black uppercase tracking-wider bg-gray-200 text-gray-500 px-2 py-0.5 rounded-md">{clientData?.personType}</span>
            </div>
          )}
        </div>


        {/* Etapa 2: Pedido (Produtos e Logística) */}
        {step === 2 && (
          <div className="bg-white p-6 rounded-2xl border border-blue-500 shadow-md ring-4 ring-blue-50 animate-in fade-in">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 mb-6">
              <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
              Montar Pedido
            </h2>

            {/* Catálogo */}
            <div className="mb-8">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Adicionar Produtos</label>
               
               <div className="relative mb-4">
                  <input 
                    type="text" 
                    placeholder="Buscar produto por nome..." 
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="w-full p-2.5 pl-9 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
               </div>

               <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2 pb-2">
                  {filteredProducts.map((p: any) => {
                    const isActive = activeProductId === p.id;
                    
                    return (
                      <div 
                        key={p.id}
                        onDoubleClick={() => handleDoubleClick(p)}
                        onClick={() => handleProductCardClick(p)}
                        className={`text-left border rounded-xl transition flex flex-col justify-between overflow-hidden cursor-pointer ${isActive ? 'ring-2 ring-blue-500 border-blue-500 shadow-md col-span-2 md:col-span-3' : 'p-3 hover:border-blue-400 hover:bg-blue-50/50'}`}
                      >
                        {!isActive ? (
                           <>
                             <div>
                               <p className="text-xs font-bold text-gray-900 line-clamp-2">{p.name}</p>
                               <p className="text-[10px] text-gray-500 mt-1">Estoque: {p.stock}</p>
                             </div>
                             <div className="mt-3 flex items-center justify-between">
                               <span className="text-xs font-black text-blue-600">R$ {p.price.toFixed(2)}</span>
                             </div>
                           </>
                        ) : (
                           <div className="bg-blue-50/30 p-4 border-l-4 border-blue-500">
                             <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="text-sm font-black text-gray-900">{p.name}</p>
                                  <span className="text-sm font-black text-blue-600">R$ {p.price.toFixed(2)} unitário</span>
                                </div>
                                <button type="button" onClick={(e) => { e.stopPropagation(); setActiveProductId(null); }} className="text-gray-400 hover:text-red-500 font-bold p-1 bg-white rounded-md shadow-sm text-xs">
                                   X
                                </button>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end" onDoubleClick={(e) => e.stopPropagation()}>
                                <div className="md:col-span-1">
                                   <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Quantidade</label>
                                   <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 w-fit">
                                      <button type="button" onClick={(e) => { e.stopPropagation(); setTempQty(Math.max(1, tempQty - 1)); }} className="w-8 h-8 flex items-center justify-center text-gray-600 bg-gray-100 rounded-md font-bold hover:bg-gray-200">-</button>
                                      <span className="w-10 text-center font-black text-sm">{tempQty}</span>
                                      <button type="button" onClick={(e) => { e.stopPropagation(); setTempQty(tempQty + 1); }} className="w-8 h-8 flex items-center justify-center text-gray-600 bg-gray-100 rounded-md font-bold hover:bg-gray-200">+</button>
                                   </div>
                                </div>
                                
                                <div className="md:col-span-2">
                                   <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Observação do Produto</label>
                                   <input 
                                     type="text" 
                                     value={tempObs}
                                     onClick={(e) => e.stopPropagation()}
                                     onChange={(e) => setTempObs(e.target.value)}
                                     placeholder="Sem cebola, metade ao leite..."
                                     className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                   />
                                </div>

                                <div className="md:col-span-1">
                                    <button 
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); commitToCart(p, tempQty, tempObs); }}
                                      className="w-full bg-blue-600 text-white p-2.5 rounded-lg font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition"
                                    >
                                       Adicionar
                                    </button>
                                </div>
                             </div>
                           </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                     <div className="col-span-2 md:col-span-3 text-center p-6 border border-dashed rounded-xl border-gray-200">
                        <p className="text-sm font-bold text-gray-500">Nenhum produto encontrado</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Logística movida para a coluna da direita */}

          </div>
        )}
      </div>

      {/* Lado Direito: Resumo */}
      <div className="bg-gray-900 text-white p-6 rounded-2xl md:h-fit sticky top-6 shadow-2xl flex flex-col justify-between min-h-[400px]">
         <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <ShoppingBag className="text-blue-400" />
              Resumo do Pedido
            </h3>
            
            {cart.length === 0 ? (
               <div className="text-center py-10 opacity-50">
                  <p className="text-sm italic">O carrinho está vazio.</p>
               </div>
            ) : (
               <div className="space-y-4 mb-6">
                 {cart.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-start group border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                      <div className="flex-1 pr-4">
                         <p className="font-bold text-sm tracking-wide text-gray-200">{item.name}</p>
                         <p className="text-[10px] text-gray-500">R$ {item.price.toFixed(2)} un</p>
                         {item.observation && (
                            <p className="text-[10px] mt-1 bg-yellow-900/40 text-yellow-500 px-2 py-0.5 rounded border border-yellow-800/50 inline-block font-medium">Obs: {item.observation}</p>
                         )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <div className="flex items-center bg-gray-800 rounded-md p-0.5 shadow-inner">
                           <button onClick={() => handleUpdateCartQty(item.productId, item.observation || "", -1)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white transition bg-gray-700/50 rounded">-</button>
                           <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                           <button onClick={() => handleUpdateCartQty(item.productId, item.observation || "", 1)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white transition bg-gray-700/50 rounded">+</button>
                         </div>
                         <button onClick={() => handleRemoveFromCart(item.productId, item.observation || "")} className="text-xs text-gray-500 hover:text-red-400 transition flex items-center gap-1 font-bold">
                           <Trash2 size={12} /> Remover
                         </button>
                      </div>
                   </div>
                 ))}
               </div>
            )}
         </div>

         {/* Controles de Logística do Pedido (Movidos para o Resumo) */}
         {step === 2 && (
           <div className="py-4 border-t border-gray-800 space-y-4">
              {/* Status do Pedido */}
              <div>
                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Status do Pedido</label>
                 <div className="grid grid-cols-3 gap-1.5">
                    <button type="button" onClick={() => setOrderStatus("RECEIVED")} className={`py-2 text-[10px] font-bold rounded-lg transition border ${orderStatus === "RECEIVED" ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'}`}>
                       Recebido
                    </button>
                    <button type="button" onClick={() => setOrderStatus("PREPARING")} className={`py-2 text-[10px] font-bold rounded-lg transition border ${orderStatus === "PREPARING" ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'}`}>
                       Preparando
                    </button>
                    <button type="button" onClick={() => setOrderStatus("DONE")} className={`py-2 text-[10px] font-bold rounded-lg transition border ${orderStatus === "DONE" ? 'bg-green-500 text-white border-green-500' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'}`}>
                       Finalizado
                    </button>
                 </div>
              </div>

              {/* Tipo de Atendimento */}
              <div className="grid grid-cols-2 gap-2">
                 <button 
                   type="button"
                   onClick={() => setOrderType("RETIRADA")}
                   className={`py-2 text-xs font-bold rounded-lg transition border ${orderType === "RETIRADA" ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'}`}
                 >
                   Retirada
                 </button>
                 <button 
                   type="button"
                   onClick={() => setOrderType("DELIVERY")}
                   className={`py-2 text-xs font-bold rounded-lg transition border ${orderType === "DELIVERY" ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'}`}
                 >
                   Delivery
                 </button>
              </div>

              {orderType === "DELIVERY" && (
                 <div className="p-3 bg-purple-900/30 border border-purple-800/50 rounded-xl animate-in fade-in space-y-2">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-bold text-purple-400 uppercase">Taxa de Frete (R$)</label>
                       <input 
                          type="text" 
                          value={deliveryFee}
                          onChange={(e) => setDeliveryFee(e.target.value)}
                          className="w-20 text-right p-1 rounded bg-black/40 border border-purple-800 outline-none text-purple-100 font-bold text-sm focus:ring-1 focus:ring-purple-500"
                       />
                    </div>
                    {(!clientData?.address && !clientData?.neighborhood) && (
                       <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertTriangle size={10}/> Sem endereço cadastrado</p>
                    )}
                 </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Agendamento</label>
                  <button
                    type="button"
                    onClick={() => { setSchedulingEnabled(!schedulingEnabled); if (schedulingEnabled) setScheduledAt(""); }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      schedulingEnabled ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      schedulingEnabled ? 'translate-x-4' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                {schedulingEnabled && (
                  <div className="relative animate-in fade-in">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                      type="datetime-local" 
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full pl-8 p-1.5 bg-gray-800 border border-gray-700 text-white rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-xs [color-scheme:dark]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Observações Gerais</label>
                <textarea 
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Troco para 50, sem cebola..."
                  className="w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-xs resize-none placeholder-gray-600"
                  rows={2}
                />
              </div>
           </div>
         )}

         <div className="pt-4 border-t border-gray-800 space-y-4">
            <div className="flex justify-between text-sm text-gray-400">
               <span>Subtotal Itens</span>
               <span>R$ {totalProducts.toFixed(2).replace(".", decimalSeparator)}</span>
            </div>
            {orderType === "DELIVERY" && (
               <div className="flex justify-between text-sm text-purple-400 font-medium">
                 <span>Taxa de Entrega</span>
                 <span>+ R$ {cleanFee}</span>
               </div>
            )}
            <div className="flex justify-between text-2xl font-black text-white pt-2">
               <span>Total</span>
               <span>R$ {finalTotal.toFixed(2).replace(".", decimalSeparator)}</span>
            </div>

            <button 
              type="button" 
              onClick={submitOrder}
              disabled={loading || step !== 2 || cart.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm transition mt-4 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Check />}
              Confirmar Pedido
            </button>
         </div>
      </div>

    </div>
  );
}
