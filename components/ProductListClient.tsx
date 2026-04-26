"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Package, 
  Layers,
  AlertTriangle,
  ArrowLeftRight
} from "lucide-react";
import { Drawer } from "./Drawer";
import { ProductForm } from "./ProductForm";
import { ConfirmationModal } from "./ConfirmationModal";
import { deleteProduct, getProduct } from "@/app/actions/product-actions";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ProductListItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  minStock: number;
  isRawMaterial: boolean;
}

interface ProductListClientProps {
  initialProducts: ProductListItem[];
  availableInsumos: any[];
  defaultMinStock?: number;
  decimalSeparator?: string;
}

export function ProductListClient({ 
  initialProducts, 
  availableInsumos,
  defaultMinStock = 10,
  decimalSeparator = "."
}: ProductListClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para Modal de Confirmação
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const [filterType, setFilterType] = useState<"ALL" | "PRODUCT" | "RAW_MATERIAL">("ALL");

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(p => {
    if (filterType === "PRODUCT") return !p.isRawMaterial;
    if (filterType === "RAW_MATERIAL") return p.isRawMaterial;
    return true;
  });

  const finalProducts = filtered.filter(p => !p.isRawMaterial);
  const rawMaterials = filtered.filter(p => p.isRawMaterial);

  const handleEdit = async (id: string) => {
    setLoading(true);
    const product = await getProduct(id);
    setEditingProduct(product);
    setIsDrawerOpen(true);
    setLoading(false);
  };

  const handleCloseDrawer = () => {
    if (isFormDirty) {
      setShowConfirmModal(true);
    } else {
      forceCloseDrawer();
    }
  };

  const forceCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProduct(null);
    setIsFormDirty(false);
    setShowConfirmModal(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;
    const res = await deleteProduct(id);
    if (res.error) alert(res.error);
    else setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Modal Customizado de Confirmação */}
      <ConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={forceCloseDrawer}
        title="Alterações não salvas!"
        message="Você fez mudanças que serão perdidas se fechar agora. Tem certeza?"
        confirmLabel="Sim, Fechar"
        cancelLabel="Voltar ao formulário"
      />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Estoque e Produtos</h1>
          <p className="text-sm text-gray-500">Gerencie seu catálogo de vendas e matérias-primas.</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsDrawerOpen(true); setIsFormDirty(false); }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
        >
          <Plus size={20} />
          Novo Item
        </button>
      </header>

      {/* Busca e Filtros */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou descrição..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as "ALL" | "PRODUCT" | "RAW_MATERIAL")}
          className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-600 outline-none transition font-bold text-sm cursor-pointer hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Todos os Tipos</option>
          <option value="PRODUCT">Produtos de Revenda</option>
          <option value="RAW_MATERIAL">Insumos/Matérias-primas</option>
        </select>
      </div>

      <div className="space-y-8">
        {(filterType === "ALL" || filterType === "PRODUCT") && (
          <ProductSection 
            title="Produtos de Revenda" 
            items={finalProducts} 
            icon={<Package className="text-blue-600" size={20} />} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            badgeColor="bg-blue-100 text-blue-700"
          />
        )}
        
        {(filterType === "ALL" || filterType === "RAW_MATERIAL") && (
          <ProductSection 
            title="Matérias-primas e Insumos" 
            items={rawMaterials} 
            icon={<Layers className="text-amber-600" size={20} />} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            badgeColor="bg-amber-100 text-amber-700"
          />
        )}
      </div>

      {/* Drawer Lateral */}
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={handleCloseDrawer}
        title={editingProduct ? "Editar Item" : "Novo Item"}
      >
        <div key={editingProduct?.id || "new"}>
          <ProductForm 
            initialData={editingProduct} 
            availableInsumos={availableInsumos} 
            defaultMinStock={defaultMinStock}
            onDirtyChange={setIsFormDirty}
            onSuccess={() => {
                setIsFormDirty(false); // Limpar estado dirty ao salvar
                forceCloseDrawer();
                window.location.reload(); 
            }}
          />
        </div>
      </Drawer>

      {loading && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-[1px] z-[100] flex items-center justify-center cursor-wait" />
      )}
    </div>
  );
}

function ProductSection({ title, items, icon, onEdit, onDelete, badgeColor }: any) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", badgeColor)}>
          {items.length} itens
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] tracking-wider uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Item</th>
              <th className="px-6 py-4 text-center">Tipo</th>
              <th className="px-6 py-4">Estoque</th>
              <th className="px-6 py-4">Preço</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 italic">
            {items.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-xs">Sem resultados para esta categoria.</td></tr>
            ) : items.map((p: any) => {
              const isLowStock = p.stock < p.minStock;
              return (
                <tr key={p.id} className="hover:bg-gray-50/50 transition border-b border-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border shadow-sm shrink-0">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={18} className="text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 text-sm truncate">{p.name}</div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded",
                      p.isRawMaterial ? "text-amber-600 bg-amber-50" : "text-blue-600 bg-blue-50"
                    )}>
                      {p.isRawMaterial ? "Insumo" : "Produto"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          isLowStock ? "bg-red-500 animate-pulse" : "bg-green-500"
                        )} title={isLowStock ? "Estoque Baixo" : "Estoque OK"} />
                        <span className={cn("text-sm font-bold", isLowStock ? "text-red-600" : "text-gray-700")}>
                          {p.stock}
                        </span>
                      </div>
                      {isLowStock && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle size={10} className="text-red-500" />
                          <span className="text-[10px] text-red-500 font-medium">Alert: Min {p.minStock}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">R$ {p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/produtos/ajuste/${p.id}`}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Ajustar Estoque"
                      >
                        <Plus size={18} />
                      </Link>
                      <button 
                        onClick={() => onEdit(p.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(p.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
