import { prisma } from "@/lib/prisma";
import { Plus, Users, Building2, User as UserIcon } from "lucide-react";
import Link from "next/link";

export default async function ClientesPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" />
            Central de Clientes
          </h1>
          <p className="text-sm text-gray-500 font-medium">Gerencie o cadastro de pessoas físicas e jurídicas.</p>
        </div>
        
        <Link 
          href="/admin/clientes/novo"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Novo Cliente
        </Link>
      </header>

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
             <Users size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhum cliente cadastrado</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Comece a montar sua base criando seu primeiro cadastro de cliente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map(user => (
            <div key={user.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-blue-300 transition group flex flex-col gap-4">
               
               <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner 
                    ${user.personType === "PJ" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                     {user.personType === "PJ" ? <Building2 size={24} /> : <UserIcon size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-1" title={user.tradeName || user.name}>
                       {user.tradeName || user.name}
                    </h3>
                    <div className="flex gap-2 items-center">
                       <span className={`text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-md 
                         ${user.personType === "PJ" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
                         {user.personType}
                       </span>
                       <span className="text-xs text-gray-500">{user.document || "S/ Doc"}</span>
                    </div>
                  </div>
               </div>

               <div className="pt-3 border-t border-gray-100 space-y-1">
                 <p className="text-sm font-medium text-gray-700">📞 {user.phone}</p>
                 <p className="text-xs text-gray-500 line-clamp-2">
                   📍 {user.address ? `${user.address} - ${user.neighborhood || ''} ${user.city ? `(${user.city})` : ''}` : 'Sem endereço'}
                 </p>
               </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
