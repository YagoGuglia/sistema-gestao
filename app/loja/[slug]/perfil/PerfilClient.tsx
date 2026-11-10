"use client";

import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/components/vitrine/CustomerAuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, MapPin, Plus, Trash2, Camera, LogOut } from "lucide-react";
import Link from "next/link";
import { AddressForm } from "@/components/vitrine/AddressForm";
import { getCustomerAddresses, deleteCustomerAddress } from "@/app/actions/customer-auth-actions";

export function PerfilClient({ slug, tenantId }: { slug: string, tenantId: string }) {
  const { customer, isLoggedIn, logout, isLoading } = useCustomerAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push(`/loja/${slug}`);
    }
  }, [isLoading, isLoggedIn, router, slug]);

  const loadAddresses = async () => {
    if (!customer) return;
    setLoadingAddresses(true);
    const res = await getCustomerAddresses(customer.id);
    if (res.success && res.addresses) {
      setAddresses(res.addresses);
    }
    setLoadingAddresses(false);
  };

  useEffect(() => {
    if (customer) {
      loadAddresses();
    }
  }, [customer]);

  const handleDeleteAddress = async (id: string) => {
    if (!customer || !confirm("Deseja realmente excluir este endereço?")) return;
    await deleteCustomerAddress(customer.id, id);
    loadAddresses();
  };

  if (isLoading || !isLoggedIn || !customer) {
    return <div className="p-8 text-center text-gray-500 font-medium">Carregando perfil...</div>;
  }

  return (
    <div>
      <div className="bg-vitrinia-purple text-white p-4 flex items-center gap-3 shadow-sm">
        <Link href={`/loja/${slug}`} className="p-1 hover:bg-white/20 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">Meu Perfil</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
        {/* Card do Perfil */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border-4 border-emerald-50 text-emerald-500 relative cursor-pointer hover:bg-gray-200 transition">
            <User size={32} />
            <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md text-gray-500 border border-gray-100">
              <Camera size={14} />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">{customer.phone}</p>
            
            <button
              onClick={() => { logout(); router.push(`/loja/${slug}`); }}
              className="mt-3 flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition bg-red-50 px-3 py-1.5 rounded-lg w-fit"
            >
              <LogOut size={14} /> Sair da conta
            </button>
          </div>
        </section>

        {/* Endereços Salvos */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="text-vitrinia-purple" size={20} />
              Meus Endereços
            </h3>
            {!showAddressForm && (
              <button 
                onClick={() => setShowAddressForm(true)}
                className="text-xs font-bold text-vitrinia-purple hover:bg-vitrinia-purple/10 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
              >
                <Plus size={14} /> Adicionar
              </button>
            )}
          </div>

          {showAddressForm ? (
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <AddressForm 
                userId={customer.id} 
                onSuccess={() => {
                  setShowAddressForm(false);
                  loadAddresses();
                }}
                onCancel={() => setShowAddressForm(false)}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {loadingAddresses ? (
                <div className="text-sm text-gray-500 text-center py-4">Carregando endereços...</div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                  <MapPin className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-sm text-gray-500 font-medium">Você ainda não tem endereços salvos.</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="group relative flex items-start justify-between p-4 rounded-2xl border border-gray-100 hover:border-vitrinia-purple hover:shadow-md transition bg-white">
                    <div className="pr-10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black uppercase tracking-wider text-vitrinia-purple bg-vitrinia-purple/10 px-2 py-0.5 rounded-md">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            PADRÃO
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 text-sm">
                        {addr.street}, {addr.number}
                        {addr.complement && ` - ${addr.complement}`}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {addr.neighborhood}, {addr.city} - {addr.state} ({addr.zipCode})
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="absolute right-4 top-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Excluir endereço"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
