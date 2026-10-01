import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  Settings,
  Plus,
  ArrowLeftRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getGlobalSettings } from "@/app/actions/settings-actions";
import { StoreStatusWidget } from "@/components/admin/StoreStatusWidget";
import { StoreShareModal } from "@/components/admin/StoreShareModal";
import { requireTenant } from "@/lib/supabase/server";

interface Product {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  isRawMaterial: boolean;
}

interface Order {
  id: string;
  createdAt: Date;
}

export default async function Dashboard() {
  const tenantId = await requireTenant();
  const [products, orders, settings, tenant] = await Promise.all([
    prisma.product.findMany({ where: { tenantId } }) as Promise<Product[]>,
    prisma.order.findMany({ where: { tenantId } }) as Promise<Order[]>,
    getGlobalSettings(),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
  ]);
  
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p: Product) => p.stock < p.minStock);
  const totalOrders = orders.length;

  const today = new Date();
  const ordersToday = orders.filter((o: Order) => 
    o.createdAt.toDateString() === today.toDateString()
  ).length;

  return (
    <div className="space-y-6 lg:space-y-8 pb-20">
      <header className="space-y-3">
        <div>
           <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Dashboard de Gestão</h1>
           <p className="text-sm text-gray-500 font-medium">Resumo do seu negócio em tempo real.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          {tenant && (
            <StoreShareModal
              asModal
              slug={tenant.slug}
              storeName={settings.companyName || tenant.name}
              logoUrl={settings.companyLogoUrl}
            />
          )}

          <div className="flex items-center bg-white p-1 lg:p-1.5 rounded-2xl border border-gray-100 shadow-sm">
             <button className="px-3 lg:px-4 py-1.5 lg:py-2 bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-md">Hoje</button>
             <button className="px-3 lg:px-4 py-1.5 lg:py-2 text-gray-400 hover:text-gray-600 text-xs font-bold transition">7 Dias</button>
             <button className="px-3 lg:px-4 py-1.5 lg:py-2 text-gray-400 hover:text-gray-600 text-xs font-bold transition">Mês</button>
          </div>
        </div>
      </header>

      {/* CONTROLE OPERACIONAL DA LOJA E DO CAIXA */}
      <StoreStatusWidget 
        initialStoreOpen={(settings as any).isStoreOpen ?? true}
        initialRegisterOpen={(settings as any).isRegisterOpen ?? false}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatsCard 
          title="Total de Produtos" 
          val={totalProducts} 
          icon={<Package className="text-blue-600" />} 
          subtitle="Itens no catálogo"
        />
        
        <div className={cn(
          "p-6 rounded-3xl border transition-all shadow-sm flex flex-col justify-between",
          lowStockProducts.length > 0 
            ? "bg-red-50 border-red-100 shadow-red-50" 
            : "bg-white border-gray-100"
        )}>
           <div>
              <div className={cn(
                "p-2 rounded-xl w-fit mb-4",
                lowStockProducts.length > 0 ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400"
              )}>
                 <AlertTriangle size={20} />
              </div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Abaixo do Mínimo</h3>
              <p className={cn("text-3xl font-black mt-1", lowStockProducts.length > 0 ? "text-red-600" : "text-gray-900")}>
                 {lowStockProducts.length}
              </p>
           </div>
           {lowStockProducts.length > 0 && (
              <Link 
                href="/admin/produtos" 
                className="mt-4 flex items-center gap-1 text-[11px] font-bold text-red-700 hover:underline"
              >
                 Ver alertas <ArrowUpRight size={12} />
              </Link>
           )}
        </div>

        <StatsCard 
          title="Vendas Realizadas" 
          val={totalOrders} 
          icon={<ArrowUpRight className="text-emerald-600" />} 
          subtitle="Total acumulado"
        />

        <StatsCard 
          title="Pedidos de Hoje" 
          val={ordersToday} 
          icon={<Plus size={14} className="text-blue-400" />} 
          subtitle="Aguardando atendimento"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
           <div>
              <div className="flex items-center justify-between mb-3 lg:mb-4 px-1">
                 <h2 className="text-base lg:text-lg font-bold text-gray-800 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-500" />
                    Reposição Urgente
                 </h2>
                 <Link href="/admin/produtos" className="text-xs font-bold text-blue-600 hover:underline tracking-tight">Estoque completo</Link>
              </div>

              <div className="bg-white rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Desktop: Tabela */}
                <table className="hidden md:table w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4 text-center">Atual</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {lowStockProducts.length === 0 ? (
                      <tr><td colSpan={3} className="p-12 text-center text-gray-400 text-xs italic font-medium">Nenhum alerta crítico no momento. ✅</td></tr>
                    ) : lowStockProducts.map((p: Product) => (
                      <tr key={p.id} className="hover:bg-red-50/20 transition group">
                        <td className="px-6 py-4">
                           <div className="font-bold text-gray-800 text-sm group-hover:text-red-700 transition">{p.name}</div>
                           <div className="text-[10px] text-gray-400">{p.isRawMaterial ? 'Insumo' : 'Produto de Venda'}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-sm font-black text-red-600">{p.stock}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <Link 
                             href={`/admin/produtos/ajuste/${p.id}`}
                             className="inline-flex items-center gap-2 bg-gray-900 shadow-md text-white text-[10px] font-bold px-4 py-2 rounded-xl hover:bg-black transition active:scale-95"
                           >
                              Mover
                           </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile: Cards */}
                <div className="md:hidden divide-y divide-gray-50">
                  {lowStockProducts.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-xs italic font-medium">Nenhum alerta crítico no momento. ✅</div>
                  ) : lowStockProducts.map((p: Product) => (
                    <div key={p.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-800 text-sm truncate">{p.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400">{p.isRawMaterial ? 'Insumo' : 'Produto'}</span>
                          <span className="text-xs font-black text-red-600">Estoque: {p.stock}</span>
                        </div>
                      </div>
                      <Link 
                        href={`/admin/produtos/ajuste/${p.id}`}
                        className="shrink-0 inline-flex items-center gap-1 bg-gray-900 shadow-md text-white text-[10px] font-bold px-3 py-2 rounded-xl hover:bg-black transition active:scale-95"
                      >
                        Mover
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
           </div>

           <div>
              <div className="flex items-center justify-between mb-4 px-2">
                 <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <ArrowUpRight size={20} className="text-emerald-500" />
                    Últimos Pedidos
                 </h2>
                 <Link href="/admin/pedidos" className="text-xs font-bold text-emerald-600 hover:underline tracking-tight">Ver todos</Link>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-16 text-center">
                 <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package size={24} className="text-emerald-500" />
                 </div>
                 <p className="text-sm font-bold text-gray-400">Nenhum pedido realizado ainda.</p>
                 <p className="text-[10px] mt-1 font-medium text-gray-300">As vendas aparecerão aqui após o próximo passo da modelagem.</p>
                 <Link 
                    href="/admin/pedidos"
                    className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white px-6 py-3 rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
                 >
                    Lançar Primeira Venda
                 </Link>
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 px-1">
                 <Settings size={18} className="text-gray-400" />
                 Atalhos Profissionais
              </h3>
              <div className="space-y-3">
                 <QuickLink 
                    href="/admin/produtos/novo" 
                    label="Novo Cadastro" 
                    desc="Produto ou insumo" 
                    icon={<Plus size={14} className="text-blue-600" />}
                    bgColor="bg-blue-50"
                 />
                 <QuickLink 
                    href="/admin/produtos" 
                    label="Ajuste Manual" 
                    desc="Entradas e perdas" 
                    icon={<ArrowLeftRight size={14} className="text-amber-600" />}
                    bgColor="bg-amber-50"
                 />
                 <QuickLink 
                    href="/admin/pedidos" 
                    label="Lançar Pedido" 
                    desc="Venda direta/PDV" 
                    icon={<ArrowUpRight size={14} className="text-emerald-600" />}
                    bgColor="bg-emerald-50"
                 />
              </div>
           </div>

           <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-60">Dica SIS de Hoje</p>
                 <p className="text-sm font-medium leading-relaxed">
                    &quot;O controle dos pedidos ajuda você a entender quais produtos têm mais saída e prever compras de insumos.&quot;
                 </p>
              </div>
              <ArrowUpRight size={140} className="absolute -right-12 -bottom-12 opacity-10 rotate-12 transition-transform group-hover:scale-110 duration-500" />
           </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, val, icon, subtitle }: any) {
  return (
    <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="p-1.5 lg:p-2 bg-gray-50 rounded-lg lg:rounded-xl w-fit mb-2 lg:mb-4">{icon}</div>
      <h3 className="text-[10px] lg:text-sm font-bold text-gray-500 uppercase tracking-wider leading-tight">{title}</h3>
      <p className="text-2xl lg:text-3xl font-black text-gray-900 my-0.5 lg:my-1">{val}</p>
      <p className="text-[10px] lg:text-xs text-gray-400 font-medium hidden sm:block">{subtitle}</p>
    </div>
  );
}

function QuickLink({ href, label, desc, icon, bgColor }: any) {
  return (
    <Link href={href} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition group border border-transparent hover:border-gray-100">
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bgColor)}>
          {icon}
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
             <p className="text-xs font-bold text-gray-800">{label}</p>
             <ArrowUpRight size={12} className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all outline-none" />
          </div>
          <p className="text-[10px] text-gray-400 truncate font-medium">{desc}</p>
       </div>
    </Link>
  );
}
