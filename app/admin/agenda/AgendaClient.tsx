"use client";

import { useState, useTransition } from "react";
import { Calendar as CalendarIcon, Check, X, Clock, User, Phone, DollarSign, Ban } from "lucide-react";
import { updateAppointmentStatus, cancelAppointment } from "@/app/actions/appointment-actions";
import { Drawer } from "@/components/Drawer";

interface Appointment {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string | null;
  user: { name: string; phone: string };
  staff: { name: string } | null;
  order: { totalAmount: number; depositAmount: number; status: string; pixPaymentId: string | null } | null;
}

interface Props {
  appointments: Appointment[];
  cancellationHoursLimit: number;
}

export function AgendaClient({ appointments, cancellationHoursLimit }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const openDetails = (apt: Appointment) => {
    setSelectedApt(apt);
    setIsDrawerOpen(true);
  };

  const handleUpdateStatus = (status: string) => {
    if (!selectedApt) return;
    startTransition(async () => {
      await updateAppointmentStatus(selectedApt.id, status);
      setIsDrawerOpen(false);
      window.location.reload();
    });
  };

  const handleCancel = () => {
    if (!selectedApt) return;
    if (!cancelReason) {
      alert("Informe o motivo do cancelamento.");
      return;
    }

    startTransition(async () => {
      const result = await cancelAppointment(selectedApt.id, cancelReason);
      if (result?.error) {
        alert(result.error);
      } else {
        alert(result?.refunded ? "Agendamento cancelado com ESTORNO AUTOMÁTICO aprovado." : "Agendamento cancelado. Fora do prazo ou sem sinal para estorno.");
        setIsDrawerOpen(false);
        window.location.reload();
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED": return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Agendado</span>;
      case "CONFIRMED": return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Confirmado</span>;
      case "COMPLETED": return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Concluído</span>;
      case "CANCELED": return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Cancelado</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="text-vitrinia-purple" />
          Agenda de Atendimentos
        </h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie os horários dos clientes e profissionais.</p>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-4">
        {appointments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Nenhum agendamento futuro encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map(apt => {
              const isPast = new Date(apt.startTime) < new Date();
              return (
                <div 
                  key={apt.id} 
                  onClick={() => openDetails(apt)}
                  className={`p-4 rounded-2xl border cursor-pointer hover:shadow-md transition ${isPast ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-vitrinia-purple" />
                      <span className="font-black text-gray-900 text-lg">
                        {new Date(apt.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User size={14} className="text-gray-400" />
                      <span className="font-bold truncate">{apt.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarIcon size={14} className="text-gray-400" />
                      <span>{new Date(apt.startTime).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {apt.staff && (
                      <div className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md inline-block mt-2">
                        Com: {apt.staff.name}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Detalhes do Agendamento">
        {selectedApt && (
          <div className="p-6 flex flex-col h-full space-y-6">
            <div className="flex-1 space-y-6">
              {/* Info Cabeçalho */}
              <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Data e Hora</p>
                  <p className="text-lg font-black text-gray-900">
                    {new Date(selectedApt.startTime).toLocaleDateString('pt-BR')} às {new Date(selectedApt.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {getStatusBadge(selectedApt.status)}
              </div>

              {/* Cliente */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <User size={16} /> Dados do Cliente
                </h3>
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-bold">{selectedApt.user.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Phone size={14} /> {selectedApt.user.phone}
                  </p>
                </div>
              </div>

              {/* Profissional */}
              {selectedApt.staff && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <User size={16} /> Profissional
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-bold text-vitrinia-purple">{selectedApt.staff.name}</p>
                  </div>
                </div>
              )}

              {/* Pagamento */}
              {selectedApt.order && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign size={16} /> Pagamento
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Valor Total:</span>
                      <span className="font-bold">{formatCurrency(selectedApt.order.totalAmount)}</span>
                    </div>
                    {selectedApt.order.depositAmount > 0 && (
                      <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-2">
                        <span className="text-emerald-600 font-bold">Sinal Pago (Pix):</span>
                        <span className="font-black text-emerald-600">{formatCurrency(selectedApt.order.depositAmount)}</span>
                      </div>
                    )}
                    {selectedApt.order.pixPaymentId && (
                      <p className="text-[10px] text-gray-400 break-all bg-gray-50 p-2 rounded-lg mt-2">
                        PIX ID: {selectedApt.order.pixPaymentId}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedApt.notes && (
                <div className="bg-red-50 text-red-800 p-3 rounded-xl text-sm border border-red-100">
                  <strong>Notas:</strong> {selectedApt.notes}
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {selectedApt.status === "SCHEDULED" && (
                <button 
                  onClick={() => handleUpdateStatus("CONFIRMED")}
                  disabled={isPending}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check size={18} /> Confirmar Atendimento
                </button>
              )}
              
              {(selectedApt.status === "SCHEDULED" || selectedApt.status === "CONFIRMED") && (
                <button 
                  onClick={() => handleUpdateStatus("COMPLETED")}
                  disabled={isPending}
                  className="w-full bg-vitrinia-green text-white font-bold py-3 rounded-xl hover:bg-vitrinia-green/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check size={18} /> Concluir Atendimento
                </button>
              )}

              {selectedApt.status !== "CANCELED" && selectedApt.status !== "COMPLETED" && (
                <div className="border border-red-200 rounded-xl p-4 bg-red-50 mt-4">
                  <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-1"><Ban size={16}/> Cancelamento</h4>
                  <p className="text-[10px] text-red-600 mb-3 leading-relaxed">
                    Cancelamentos feitos com até <strong>{cancellationHoursLimit} horas</strong> de antecedência terão o PIX do sinal estornado automaticamente para o cliente.
                  </p>
                  <input 
                    type="text" 
                    placeholder="Motivo do cancelamento..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full p-2 mb-3 rounded-lg border border-red-200 text-sm outline-none focus:ring-1 focus:ring-red-400"
                  />
                  <button 
                    onClick={handleCancel}
                    disabled={isPending}
                    className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm"
                  >
                    Cancelar Agendamento
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
