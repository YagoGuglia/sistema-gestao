"use client";

import { useState, useTransition } from "react";
import { UsersRound, Plus, MoreVertical, Edit2, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { createStaff, updateStaff, deleteStaff, toggleStaffActive } from "@/app/actions/staff-actions";
import { Drawer } from "@/components/Drawer";

interface Staff {
  id: string;
  name: string;
  phone: string | null;
  roleTitle: string;
  commissionRate: number;
  isActive: boolean;
}

interface Props {
  staffList: Staff[];
  enableCommissions: boolean;
}

export function StaffClient({ staffList: initialStaff, enableCommissions }: Props) {
  const [staffList, setStaffList] = useState(initialStaff);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const filteredStaff = staffList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.roleTitle.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditingStaff(null);
    setError("");
    setIsDrawerOpen(true);
  };

  const openEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setError("");
    setIsDrawerOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = editingStaff 
        ? await updateStaff(editingStaff.id, formData)
        : await createStaff(formData);
        
      if (result?.error) {
        setError(result.error);
      } else {
        setIsDrawerOpen(false);
        window.location.reload(); // Quick refresh to get updated list
      }
    });
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(() => toggleStaffActive(id, current));
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, isActive: !current } : s));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este profissional? Recomenda-se apenas desativar caso ele tenha histórico de agendamentos.")) return;
    
    startTransition(async () => {
      const result = await deleteStaff(id);
      if (result?.error) {
        alert(result.error);
      } else {
        setStaffList(prev => prev.filter(s => s.id !== id));
      }
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UsersRound className="text-vitrinia-purple" />
            Equipe & Profissionais
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie prestadores de serviço e funcionários.</p>
        </div>
        <button 
          onClick={openNew}
          className="flex items-center justify-center gap-2 bg-vitrinia-purple text-white px-5 py-2.5 rounded-xl font-bold hover:bg-vitrinia-purple/90 transition shadow-md"
        >
          <Plus size={18} />
          Novo Profissional
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou cargo..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vitrinia-purple/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Profissional</th>
                <th className="px-6 py-4">Cargo</th>
                <th className="px-6 py-4">Status</th>
                {enableCommissions && <th className="px-6 py-4">Comissão</th>}
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    Nenhum profissional encontrado.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className={`hover:bg-gray-50/50 transition ${!staff.isActive && 'opacity-60 grayscale'}`}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{staff.name}</div>
                      {staff.phone && <div className="text-xs text-gray-500 mt-0.5">{staff.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                        {staff.roleTitle}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggle(staff.id, staff.isActive)}
                        className="flex items-center gap-1.5 text-xs font-bold transition"
                      >
                        {staff.isActive ? (
                          <><ToggleRight className="text-vitrinia-green w-5 h-5" /> Ativo</>
                        ) : (
                          <><ToggleLeft className="text-gray-400 w-5 h-5" /> Inativo</>
                        )}
                      </button>
                    </td>
                    {enableCommissions && (
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-700">{staff.commissionRate}%</span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(staff)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(staff.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Excluir">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editingStaff ? "Editar Profissional" : "Novo Profissional"}>
        <form onSubmit={handleSave} className="p-6 space-y-5 flex flex-col h-full">
          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Nome Completo *</label>
              <input 
                name="name" 
                defaultValue={editingStaff?.name || ""} 
                required 
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vitrinia-purple/30 text-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Cargo / Função *</label>
              <select 
                name="roleTitle" 
                defaultValue={editingStaff?.roleTitle || "Prestador de Serviço"} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vitrinia-purple/30 text-sm bg-white"
              >
                <option value="Prestador de Serviço">Prestador de Serviço</option>
                <option value="Atendente">Atendente</option>
                <option value="Vendedor">Vendedor</option>
                <option value="Entregador">Entregador</option>
                <option value="Gerente">Gerente</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Telefone / WhatsApp</label>
              <input 
                name="phone" 
                defaultValue={editingStaff?.phone || ""} 
                placeholder="(00) 00000-0000"
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vitrinia-purple/30 text-sm"
              />
            </div>

            {enableCommissions && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Taxa de Comissão (%)</label>
                <div className="relative">
                  <input 
                    name="commissionRate" 
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    defaultValue={editingStaff?.commissionRate || 0} 
                    className="w-full p-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vitrinia-purple/30 text-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</div>
                </div>
                <p className="text-xs text-gray-400 mt-1">Porcentagem repassada por serviço prestado.</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="isActive" defaultChecked={editingStaff ? editingStaff.isActive : true} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-vitrinia-green rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vitrinia-green" />
              </label>
              <span className="text-sm font-bold text-gray-700">Ativo no sistema</span>
            </div>

            {error && <p className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-xl">{error}</p>}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={() => setIsDrawerOpen(false)} className="px-5 py-2.5 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="bg-vitrinia-purple text-white px-5 py-2.5 rounded-xl font-bold hover:bg-vitrinia-purple/90 transition disabled:opacity-50">
              {isPending ? "Salvando..." : "Salvar Profissional"}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
