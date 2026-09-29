"use client";

import { useState, useTransition } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  User,
  Phone,
  DollarSign,
  Package,
  Scissors,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import {
  updateAppointmentStatus,
  cancelAppointment,
  acceptAppointment,
  rejectAppointment,
} from "@/app/actions/appointment-actions";
import { Drawer } from "@/components/Drawer";

interface Appointment {
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  status: string; // SCHEDULED, CONFIRMED, COMPLETED, CANCELED
  notes: string | null;
  user: { name: string; phone: string };
  staff: { id: string; name: string } | null;
  order: {
    id: string;
    totalAmount: number;
    depositAmount: number;
    status: string;
    pixPaymentId: string | null;
    orderType: string;
    items?: {
      quantity: number;
      product: { name: string; isService: boolean };
    }[];
  } | null;
}

interface Props {
  appointments: Appointment[];
  cancellationHoursLimit: number;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function AgendaClient({ appointments, cancellationHoursLimit }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");

  // Visualização: "month" | "week" | "day"
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  // Data de referência da navegação
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // Filtra agendamentos aguardando aprovação
  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "SCHEDULED" && new Date(apt.startTime) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  // Navegação
  const goToToday = () => setCurrentDate(new Date());

  const goToPrev = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") {
      next.setMonth(next.getMonth() - 1);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const goToNext = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  // Aceitar Agendamento
  const handleAccept = (aptId: string) => {
    startTransition(async () => {
      const res = await acceptAppointment(aptId);
      if (res?.error) {
        alert(res.error);
      } else {
        if (selectedApt?.id === aptId) {
          setIsDrawerOpen(false);
        }
      }
    });
  };

  // Abrir Modal de Recusa
  const openRejectModal = (aptId: string) => {
    setRejectTargetId(aptId);
    setRejectReasonInput("");
    setRejectModalOpen(true);
  };

  // Confirmar Recusa (libera o horário imediatamente)
  const handleConfirmReject = () => {
    if (!rejectTargetId) return;
    startTransition(async () => {
      const res = await rejectAppointment(rejectTargetId, rejectReasonInput);
      setRejectModalOpen(false);
      setRejectTargetId(null);
      if (res?.error) {
        alert(res.error);
      } else {
        if (selectedApt?.id === rejectTargetId) {
          setIsDrawerOpen(false);
        }
        alert("Agendamento recusado com sucesso. O horário foi liberado para novos clientes.");
      }
    });
  };

  const openDetails = (apt: Appointment) => {
    setSelectedApt(apt);
    setIsDrawerOpen(true);
  };

  const handleUpdateStatus = (status: string) => {
    if (!selectedApt) return;
    startTransition(async () => {
      await updateAppointmentStatus(selectedApt.id, status);
      setIsDrawerOpen(false);
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
        alert(
          result?.refunded
            ? "Agendamento cancelado com ESTORNO AUTOMÁTICO aprovado."
            : "Agendamento cancelado. Horário liberado."
        );
        setIsDrawerOpen(false);
      }
    });
  };

  // Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Aguardando Aceite
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
            <Check size={10} /> Confirmado
          </span>
        );
      case "COMPLETED":
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
            <CheckCircle2 size={10} /> Concluído
          </span>
        );
      case "CANCELED":
        return (
          <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
            <XCircle size={10} /> Recusado / Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  // Helper para agrupar agendamentos por dia (YYYY-MM-DD)
  const getAppointmentsForDay = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;

    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      const ay = aptDate.getFullYear();
      const am = String(aptDate.getMonth() + 1).padStart(2, "0");
      const ad = String(aptDate.getDate()).padStart(2, "0");
      return `${ay}-${am}-${ad}` === key;
    });
  };

  // Título da barra de data
  const getHeaderTitle = () => {
    if (viewMode === "month") {
      return `${MONTH_NAMES[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
    }
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
    // Week
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return `${startOfWeek.getDate()} de ${MONTH_NAMES[startOfWeek.getMonth()].slice(0, 3)} - ${endOfWeek.getDate()} de ${MONTH_NAMES[endOfWeek.getMonth()].slice(0, 3)} de ${endOfWeek.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      {/* ── BANNER DE ALERTAS: AGENDAMENTOS AGUARDANDO ACEITE ── */}
      {pendingAppointments.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl p-5 shadow-lg shadow-amber-500/20 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-white" size={22} />
              </div>
              <div>
                <h3 className="font-black text-lg">
                  {pendingAppointments.length}{" "}
                  {pendingAppointments.length === 1
                    ? "Agendamento aguardando sua resposta!"
                    : "Agendamentos aguardando sua resposta!"}
                </h3>
                <p className="text-xs text-amber-100">
                  O horário está bloqueado para outros clientes. Aceite para confirmar ou recuse para liberar a grade.
                </p>
              </div>
            </div>
          </div>

          {/* Cards Rápidos de Pendências */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {pendingAppointments.map((apt) => {
              const aptTime = new Date(apt.startTime);
              const isDelivery = apt.order?.orderType === "DELIVERY";
              return (
                <div
                  key={apt.id}
                  className="bg-white text-gray-900 rounded-2xl p-4 shadow-sm border border-amber-200/50 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        {aptTime.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} às{" "}
                        {aptTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {isDelivery ? (
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Package size={12} /> Entrega
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Scissors size={12} /> Serviço
                        </span>
                      )}
                    </div>

                    <p className="font-black text-sm text-gray-900 mt-2 truncate">{apt.user.name}</p>
                    <p className="text-xs text-gray-500">{apt.user.phone}</p>

                    {apt.order?.items && apt.order.items.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {apt.order.items.map((i) => `${i.quantity}x ${i.product.name}`).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleAccept(apt.id)}
                      disabled={isPending}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                    >
                      <Check size={14} /> Aceitar
                    </button>
                    <button
                      onClick={() => openRejectModal(apt.id)}
                      disabled={isPending}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1 border border-red-200 disabled:opacity-50"
                    >
                      <X size={14} /> Recusar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── BARRA DE FERRAMENTAS ESTILO GOOGLE CALENDAR ── */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Lado Esquerdo: Navegação de Data */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={goToToday}
            className="px-4 py-2 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            Hoje
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={goToPrev}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition"
              title="Anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition"
              title="Próximo"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-gray-900 capitalize tracking-tight">
            {getHeaderTitle()}
          </h2>
        </div>

        {/* Lado Direito: Alternador de Visualização (Mês, Semana, Dia) */}
        <div className="flex items-center bg-gray-100/80 p-1 rounded-2xl self-start md:self-auto">
          {(["month", "week", "day"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                viewMode === mode
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {mode === "month" ? "Mês" : mode === "week" ? "Semana" : "Dia"}
            </button>
          ))}
        </div>
      </div>

      {/* ── CORPO DO CALENDÁRIO ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-4 sm:p-6">
        {/* ======================= VISÃO MÊS ======================= */}
        {viewMode === "month" && (
          <div>
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 border-b border-gray-100 pb-3 mb-2 text-center">
              {WEEK_DAYS.map((d) => (
                <span key={d} className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {d}
                </span>
              ))}
            </div>

            {/* Grade dos dias do mês */}
            {(() => {
              const year = currentDate.getFullYear();
              const month = currentDate.getMonth();
              const firstDayIndex = new Date(year, month, 1).getDay();
              const totalDays = new Date(year, month + 1, 0).getDate();
              const todayObj = new Date();

              const cells = [];
              // Dias em branco antes do 1º dia
              for (let i = 0; i < firstDayIndex; i++) {
                cells.push(
                  <div key={`empty-${i}`} className="min-h-[100px] border border-gray-50 bg-gray-50/40 rounded-xl" />
                );
              }

              // Dias do mês
              for (let day = 1; day <= totalDays; day++) {
                const cellDate = new Date(year, month, day);
                const dayApts = getAppointmentsForDay(cellDate);
                const isToday =
                  cellDate.getDate() === todayObj.getDate() &&
                  cellDate.getMonth() === todayObj.getMonth() &&
                  cellDate.getFullYear() === todayObj.getFullYear();

                cells.push(
                  <div
                    key={day}
                    className={`min-h-[110px] border border-gray-100 p-2 rounded-2xl flex flex-col justify-between transition hover:border-gray-300 hover:shadow-xs ${
                      isToday ? "bg-blue-50/20 border-blue-200" : "bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          isToday ? "bg-blue-600 text-white" : "text-gray-700"
                        }`}
                      >
                        {day}
                      </span>
                      {dayApts.length > 0 && (
                        <span className="text-[10px] font-bold text-gray-400">
                          {dayApts.length} {dayApts.length === 1 ? "horário" : "horários"}
                        </span>
                      )}
                    </div>

                    {/* Lista de chips de agendamentos no dia */}
                    <div className="space-y-1 overflow-y-auto max-h-[85px]">
                      {dayApts.map((apt) => {
                        const timeStr = new Date(apt.startTime).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const isScheduled = apt.status === "SCHEDULED";
                        const isConfirmed = apt.status === "CONFIRMED";
                        const isCanceled = apt.status === "CANCELED";

                        return (
                          <div
                            key={apt.id}
                            onClick={() => openDetails(apt)}
                            className={`p-1.5 rounded-lg text-[11px] font-bold cursor-pointer truncate transition flex items-center gap-1 ${
                              isScheduled
                                ? "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
                                : isConfirmed
                                ? "bg-blue-100 text-blue-900 hover:bg-blue-200 border border-blue-200"
                                : isCanceled
                                ? "bg-gray-100 text-gray-400 line-through"
                                : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                            }`}
                            title={`${timeStr} - ${apt.user.name}`}
                          >
                            <span className="font-black text-[10px] shrink-0">{timeStr}</span>
                            <span className="truncate">{apt.user.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return <div className="grid grid-cols-7 gap-2">{cells}</div>;
            })()}
          </div>
        )}

        {/* ======================= VISÃO SEMANA ======================= */}
        {viewMode === "week" && (
          <div>
            {(() => {
              const startOfWeek = new Date(currentDate);
              startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
              const weekDays = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(startOfWeek);
                d.setDate(startOfWeek.getDate() + i);
                return d;
              });

              return (
                <div className="grid grid-cols-7 gap-3">
                  {weekDays.map((d, index) => {
                    const dayApts = getAppointmentsForDay(d);
                    const isToday = d.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={index}
                        className={`border rounded-2xl p-3 flex flex-col min-h-[400px] ${
                          isToday ? "border-blue-300 bg-blue-50/20" : "border-gray-100 bg-gray-50/40"
                        }`}
                      >
                        <div className="text-center pb-2 border-b border-gray-200/60 mb-2">
                          <p className="text-xs font-bold text-gray-400 uppercase">{WEEK_DAYS[d.getDay()]}</p>
                          <p
                            className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-black text-sm mt-1 ${
                              isToday ? "bg-blue-600 text-white" : "text-gray-800"
                            }`}
                          >
                            {d.getDate()}
                          </p>
                        </div>

                        <div className="space-y-2 flex-1 overflow-y-auto">
                          {dayApts.length === 0 ? (
                            <p className="text-[11px] text-gray-400 text-center py-6">Livre</p>
                          ) : (
                            dayApts.map((apt) => {
                              const isScheduled = apt.status === "SCHEDULED";
                              const isConfirmed = apt.status === "CONFIRMED";
                              const isCanceled = apt.status === "CANCELED";

                              return (
                                <div
                                  key={apt.id}
                                  onClick={() => openDetails(apt)}
                                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition shadow-xs space-y-1 ${
                                    isScheduled
                                      ? "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100"
                                      : isConfirmed
                                      ? "bg-white border-blue-200 text-blue-900 hover:border-blue-400"
                                      : isCanceled
                                      ? "bg-gray-100 text-gray-400 border-gray-200 line-through"
                                      : "bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100"
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-black text-[11px]">
                                      {new Date(apt.startTime).toLocaleTimeString("pt-BR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    {isScheduled && (
                                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                    )}
                                  </div>
                                  <p className="font-bold truncate">{apt.user.name}</p>
                                  {apt.staff && (
                                    <p className="text-[10px] text-gray-500 truncate">Com: {apt.staff.name}</p>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ======================= VISÃO DIA ======================= */}
        {viewMode === "day" && (
          <div>
            {(() => {
              const dayApts = getAppointmentsForDay(currentDate);

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-600">
                      Total de compromissos: <strong>{dayApts.length}</strong>
                    </span>
                  </div>

                  {dayApts.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium text-sm">Nenhum agendamento marcado para este dia.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayApts.map((apt) => {
                        const isScheduled = apt.status === "SCHEDULED";
                        return (
                          <div
                            key={apt.id}
                            onClick={() => openDetails(apt)}
                            className="bg-white p-5 rounded-3xl border border-gray-200 hover:border-vitrinia-purple hover:shadow-md transition cursor-pointer space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 font-black text-lg text-gray-900">
                                <Clock size={18} className="text-vitrinia-purple" />
                                {new Date(apt.startTime).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                <span className="text-xs text-gray-400 font-normal">
                                  até{" "}
                                  {new Date(apt.endTime).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              {getStatusBadge(apt.status)}
                            </div>

                            <div className="space-y-1">
                              <p className="text-base font-black text-gray-900">{apt.user.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone size={12} /> {apt.user.phone}
                              </p>
                            </div>

                            {apt.staff && (
                              <div className="text-[11px] font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-xl inline-block">
                                Profissional: {apt.staff.name}
                              </div>
                            )}

                            {isScheduled && (
                              <div className="flex gap-2 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleAccept(apt.id)}
                                  disabled={isPending}
                                  className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-emerald-700 transition"
                                >
                                  Aceitar
                                </button>
                                <button
                                  onClick={() => openRejectModal(apt.id)}
                                  disabled={isPending}
                                  className="flex-1 bg-red-50 text-red-600 font-bold py-2 rounded-xl text-xs hover:bg-red-100 transition border border-red-200"
                                >
                                  Recusar
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── MODAL DE RECUSA (COM JUSTIFICATIVA) ── */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                <XCircle className="text-red-500" size={20} />
                Recusar Agendamento
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Ao recusar este agendamento, o horário será <strong>liberado imediatamente</strong> para que outros clientes possam agendar pela vitrine.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Motivo da Recusa (opcional):
              </label>
              <input
                type="text"
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                placeholder="Ex: Imprevisto técnico, horário indisponível..."
                className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 py-3 font-bold text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isPending}
                className="flex-1 py-3 font-bold text-xs text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md shadow-red-500/20 disabled:opacity-50"
              >
                {isPending ? "Recusando..." : "Confirmar e Liberar Horário"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DRAWER DE DETALHES DO AGENDAMENTO ── */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Detalhes do Agendamento"
      >
        {selectedApt && (
          <div className="p-6 flex flex-col h-full space-y-6">
            <div className="flex-1 space-y-6">
              {/* Info Cabeçalho */}
              <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Data e Hora</p>
                  <p className="text-lg font-black text-gray-900">
                    {new Date(selectedApt.startTime).toLocaleDateString("pt-BR")} às{" "}
                    {new Date(selectedApt.startTime).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    Até{" "}
                    {new Date(selectedApt.endTime).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {getStatusBadge(selectedApt.status)}
              </div>

              {/* Botões rápidos de Aceitar / Recusar no Drawer se for SCHEDULED */}
              {selectedApt.status === "SCHEDULED" && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-amber-800">
                    Este agendamento precisa de sua aprovação:
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(selectedApt.id)}
                      disabled={isPending}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                    >
                      <Check size={16} /> Aceitar Agendamento
                    </button>
                    <button
                      onClick={() => openRejectModal(selectedApt.id)}
                      disabled={isPending}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1 border border-red-200 disabled:opacity-50"
                    >
                      <X size={16} /> Recusar e Liberar
                    </button>
                  </div>
                </div>
              )}

              {/* Cliente */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <User size={16} /> Dados do Cliente
                </h3>
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-bold text-gray-900">{selectedApt.user.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Phone size={14} /> {selectedApt.user.phone}
                    </p>
                    <a
                      href={`https://wa.me/55${selectedApt.user.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition"
                    >
                      <MessageCircle size={12} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Itens do Pedido (Serviços ou Produtos) */}
              {selectedApt.order?.items && selectedApt.order.items.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Package size={16} /> Itens Solicitados
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                    {selectedApt.order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-800">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {item.product.isService ? "Serviço" : "Produto"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profissional Vinculado */}
              {selectedApt.staff && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <User size={16} /> Profissional Atendente
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-bold text-vitrinia-purple">{selectedApt.staff.name}</p>
                  </div>
                </div>
              )}

              {/* Financeiro */}
              {selectedApt.order && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign size={16} /> Pagamento
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Valor Total:</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(selectedApt.order.totalAmount)}
                      </span>
                    </div>
                    {selectedApt.order.depositAmount > 0 && (
                      <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-2">
                        <span className="text-emerald-600 font-bold">Sinal Pago (Pix):</span>
                        <span className="font-black text-emerald-600">
                          {formatCurrency(selectedApt.order.depositAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedApt.notes && (
                <div className="bg-red-50 text-red-800 p-3 rounded-xl text-xs border border-red-100">
                  <strong>Observações:</strong> {selectedApt.notes}
                </div>
              )}
            </div>

            {/* Ações Inferiores */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {selectedApt.status === "CONFIRMED" && (
                <button
                  onClick={() => handleUpdateStatus("COMPLETED")}
                  disabled={isPending}
                  className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-sm"
                >
                  <Check size={18} /> Concluir Atendimento
                </button>
              )}

              {selectedApt.status !== "CANCELED" && selectedApt.status !== "COMPLETED" && (
                <div className="border border-red-200 rounded-2xl p-4 bg-red-50/70 mt-2">
                  <h4 className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                    <XCircle size={14} /> Cancelar Agendamento
                  </h4>
                  <p className="text-[10px] text-red-600 mb-2 leading-relaxed">
                    Cancelamentos feitos com até <strong>{cancellationHoursLimit}h</strong> de antecedência estornam o sinal e liberam o horário para novos agendamentos.
                  </p>
                  <input
                    type="text"
                    placeholder="Motivo do cancelamento..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full p-2 mb-2 rounded-xl border border-red-200 text-xs outline-none focus:ring-1 focus:ring-red-400 bg-white"
                  />
                  <button
                    onClick={handleCancel}
                    disabled={isPending}
                    className="w-full bg-red-600 text-white font-bold py-2 rounded-xl hover:bg-red-700 transition disabled:opacity-50 text-xs"
                  >
                    Confirmar Cancelamento e Liberar Horário
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
