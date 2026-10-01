"use client";

import { useState, useTransition } from "react";
import { Wallet, Plus, TrendingDown, TrendingUp, DollarSign, Calendar as CalendarIcon, Trash2, CheckCircle2, Circle } from "lucide-react";
import { createExpense, deleteExpense, markExpensePaid } from "@/app/actions/expense-actions";
import { Drawer } from "@/components/Drawer";
import { cn } from "@/lib/utils";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  dueDate: Date;
  paidAt: Date | null;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  items: { costPrice: number, quantity: number }[];
}

interface Props {
  expenses: Expense[];
  orders: Order[];
  decimalSeparator: string;
}

export function FinanceiroClient({ expenses: initialExpenses, orders, decimalSeparator }: Props) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Calc revenues
  const completedOrders = orders.filter(o => o.status === "COMPLETED" || o.status === "PAID" || o.status === "RECEIVED");
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  
  // Calc costs (from orders)
  const totalCost = completedOrders.reduce((acc, o) => {
    const orderCost = o.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    return acc + orderCost;
  }, 0);

  // Calc expenses
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalPaidExpenses = expenses.filter(e => e.paidAt).reduce((acc, e) => acc + e.amount, 0);
  const totalPendingExpenses = totalExpenses - totalPaidExpenses;

  const grossProfit = totalRevenue - totalCost;
  const netProfit = grossProfit - totalPaidExpenses;
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await createExpense(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsDrawerOpen(false);
        window.location.reload();
      }
    });
  };

  const handleTogglePaid = (id: string, current: boolean) => {
    startTransition(() => markExpensePaid(id, !current));
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, paidAt: !current ? new Date() : null } : e));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta despesa?")) return;
    startTransition(async () => {
      const result = await deleteExpense(id);
      if (result?.error) {
        alert(result.error);
      } else {
        setExpenses(prev => prev.filter(e => e.id !== id));
      }
    });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="text-vitrinia-purple" />
            Financeiro & DRE
          </h1>
          <p className="text-sm text-gray-500 mt-1">Acompanhe seu faturamento, custos e despesas.</p>
        </div>
        <button 
          onClick={() => { setError(""); setIsDrawerOpen(true); }}
          className="flex items-center justify-center gap-2 bg-vitrinia-purple text-white px-5 py-2.5 rounded-xl font-bold hover:bg-vitrinia-purple/90 transition shadow-md"
        >
          <Plus size={18} />
          Nova Despesa
        </button>
      </header>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 lg:gap-3 text-emerald-600 mb-1 lg:mb-2">
            <div className="p-1.5 lg:p-2 bg-emerald-50 rounded-lg"><TrendingUp size={16} /></div>
            <h3 className="text-[10px] lg:text-xs font-bold uppercase tracking-wider">Faturamento</h3>
          </div>
          <p className="text-xl lg:text-3xl font-black text-gray-900">{formatCurrency(totalRevenue)}</p>
          <p className="text-[10px] lg:text-xs text-gray-400 mt-1 lg:mt-2 hidden sm:block">Vendas concluídas (Pedidos)</p>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 lg:gap-3 text-red-600 mb-1 lg:mb-2">
            <div className="p-1.5 lg:p-2 bg-red-50 rounded-lg"><TrendingDown size={16} /></div>
            <h3 className="text-[10px] lg:text-xs font-bold uppercase tracking-wider">Despesas</h3>
          </div>
          <p className="text-xl lg:text-3xl font-black text-gray-900">{formatCurrency(totalCost + totalPaidExpenses)}</p>
          <p className="text-[10px] lg:text-xs text-gray-400 mt-1 lg:mt-2 hidden sm:block">Custos: {formatCurrency(totalCost)} | Despesas: {formatCurrency(totalPaidExpenses)}</p>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 lg:gap-3 text-blue-600 mb-1 lg:mb-2">
            <div className="p-1.5 lg:p-2 bg-blue-50 rounded-lg"><DollarSign size={16} /></div>
            <h3 className="text-[10px] lg:text-xs font-bold uppercase tracking-wider">Lucro</h3>
          </div>
          <p className={cn("text-xl lg:text-3xl font-black", netProfit >= 0 ? "text-blue-600" : "text-red-600")}>
            {formatCurrency(netProfit)}
          </p>
          <p className="text-[10px] lg:text-xs text-gray-400 mt-1 lg:mt-2 hidden sm:block">Faturamento - (Custos + Despesas)</p>
        </div>

        <div className="bg-vitrinia-purple p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-lg text-white">
          <h3 className="text-[10px] lg:text-xs font-bold uppercase tracking-wider opacity-80 mb-1 lg:mb-2">Margem</h3>
          <p className="text-2xl lg:text-4xl font-black">{margin.toFixed(1)}%</p>
          <p className="text-[10px] lg:text-xs opacity-70 mt-1 lg:mt-2 hidden sm:block">Sobre o faturamento bruto</p>
        </div>
      </div>

      {/* DESPESAS LIST */}
      <div className="bg-white rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/50">
          <h2 className="text-base lg:text-lg font-bold text-gray-900">Despesas e Contas a Pagar</h2>
          <div className="text-sm font-bold">
            <span className="text-gray-500">Pendente: </span>
            <span className="text-red-500">{formatCurrency(totalPendingExpenses)}</span>
          </div>
        </div>

        {/* Desktop: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    Nenhuma despesa lançada.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => {
                  const isPaid = !!expense.paidAt;
                  const isOverdue = !isPaid && new Date(expense.dueDate) < new Date(new Date().setHours(0,0,0,0));
                  
                  return (
                    <tr key={expense.id} className={cn("hover:bg-gray-50/50 transition", isPaid && "opacity-60")}>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleTogglePaid(expense.id, isPaid)}
                          className={cn(
                            "flex items-center gap-2 text-xs font-bold transition px-3 py-1.5 rounded-full border",
                            isPaid ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-gray-200 text-gray-500 hover:bg-gray-100"
                          )}
                        >
                          {isPaid ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} />}
                          {isPaid ? "Pago" : "Aberto"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn("font-bold", isPaid ? "line-through text-gray-500" : "text-gray-900")}>
                          {expense.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "flex items-center gap-1.5 text-xs font-medium",
                          isOverdue ? "text-red-600 font-bold" : "text-gray-500"
                        )}>
                          <CalendarIcon size={14} />
                          {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-gray-900">
                          {formatCurrency(expense.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(expense.id)} 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition inline-flex" 
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile: Cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {expenses.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-400 text-sm">
              Nenhuma despesa lançada.
            </div>
          ) : (
            expenses.map((expense) => {
              const isPaid = !!expense.paidAt;
              const isOverdue = !isPaid && new Date(expense.dueDate) < new Date(new Date().setHours(0,0,0,0));
              
              return (
                <div key={expense.id} className={cn("p-4 space-y-2", isPaid && "opacity-60")}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className={cn("font-bold text-sm", isPaid ? "line-through text-gray-500" : "text-gray-900")}>
                        {expense.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          {expense.category}
                        </span>
                        <span className={cn(
                          "text-[10px] font-medium flex items-center gap-1",
                          isOverdue ? "text-red-600 font-bold" : "text-gray-500"
                        )}>
                          <CalendarIcon size={10} />
                          {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-gray-900 shrink-0">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => handleTogglePaid(expense.id, isPaid)}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-bold transition px-3 py-1.5 rounded-full border",
                        isPaid ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-gray-200 text-gray-500 hover:bg-gray-100"
                      )}
                    >
                      {isPaid ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Circle size={14} />}
                      {isPaid ? "Pago" : "Aberto"}
                    </button>
                    <button 
                      onClick={() => handleDelete(expense.id)} 
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Nova Despesa">
        <form onSubmit={handleSave} className="p-6 space-y-5 flex flex-col h-full">
          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Descrição *</label>
              <input 
                name="description" 
                placeholder="Ex: Aluguel da Loja, Conta de Luz"
                required 
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vitrinia-purple/30 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Valor *</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">R$</div>
                  <input 
                    name="amount" 
                    type="text"
                    required 
                    placeholder="0.00"
                    className="w-full p-3 pl-9 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vitrinia-purple/30 text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Vencimento *</label>
                <input 
                  name="dueDate" 
                  type="date"
                  required 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vitrinia-purple/30 text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Categoria *</label>
              <select 
                name="category" 
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vitrinia-purple/30 text-sm bg-white"
              >
                <option value="ALUGUEL">Aluguel</option>
                <option value="ENERGIA">Água / Energia / Internet</option>
                <option value="INSUMOS">Compras / Insumos / Produtos</option>
                <option value="SALARIO">Salários / Comissões</option>
                <option value="IMPOSTOS">Impostos / Taxas</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="isPaid" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-vitrinia-green rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vitrinia-green" />
              </label>
              <span className="text-sm font-bold text-gray-700">Já está pago</span>
            </div>

            {error && <p className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-xl">{error}</p>}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={() => setIsDrawerOpen(false)} className="px-5 py-2.5 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="bg-vitrinia-purple text-white px-5 py-2.5 rounded-xl font-bold hover:bg-vitrinia-purple/90 transition disabled:opacity-50">
              {isPending ? "Salvando..." : "Salvar Despesa"}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
