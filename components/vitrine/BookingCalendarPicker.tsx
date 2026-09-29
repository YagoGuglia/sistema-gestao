"use client";

import { useState, useEffect, useTransition } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Check, AlertCircle, Loader2 } from "lucide-react";
import { getStoreAvailableSlots } from "@/app/actions/appointment-actions";

interface BookingCalendarPickerProps {
  slug: string;
  durationMin?: number;
  isDelivery?: boolean;
  value: string; // ISO ou "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const WEEK_DAYS_HEADER = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function BookingCalendarPicker({
  slug,
  durationMin = 30,
  isDelivery = false,
  value,
  onChange,
}: BookingCalendarPickerProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // Data selecionada (YYYY-MM-DD)
  const initialDateStr = value ? value.split("T")[0] : "";
  const initialTimeStr = value && value.includes("T") ? value.split("T")[1].slice(0, 5) : "";

  const [selectedDate, setSelectedDate] = useState<string>(initialDateStr);
  const [selectedTime, setSelectedTime] = useState<string>(initialTimeStr);

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isDayAllowed, setIsDayAllowed] = useState<boolean>(true);
  const [unavailableReason, setUnavailableReason] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Ao mudar de dia selecionado, busca os horários disponíveis em tempo real
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    startTransition(async () => {
      const res = await getStoreAvailableSlots(slug, selectedDate, durationMin);
      if (res && "availableSlots" in res) {
        setIsDayAllowed(res.isDayAllowed ?? true);
        setAvailableSlots(res.availableSlots || []);
        setUnavailableReason(res.reason || "");
      } else {
        setAvailableSlots([]);
        setUnavailableReason("Não foi possível carregar os horários.");
      }
    });
  }, [slug, selectedDate, durationMin]);

  // Navegação de Mês
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Cálculo dos dias do mês
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    // Não permite datas passadas
    const checkDate = new Date(currentYear, currentMonth, day, 23, 59, 59);
    if (checkDate < today) return;

    setSelectedDate(dateStr);
    setSelectedTime("");
    onChange(""); // Reseta o agendamento até escolher o horário
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    const combined = `${selectedDate}T${time}`;
    onChange(combined);
  };

  const handleClear = () => {
    setSelectedDate("");
    setSelectedTime("");
    onChange("");
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-vitrinia-purple/10 text-vitrinia-purple flex items-center justify-center font-bold">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              {isDelivery ? "Agendar Entrega / Retirada" : "Agendar Horário de Atendimento"}
            </h3>
            <p className="text-xs text-gray-400">
              {isDelivery ? "Escolha quando deseja receber ou retirar" : `Duração estimada: ${durationMin} min`}
            </p>
          </div>
        </div>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-500 hover:text-red-700 font-bold transition px-2.5 py-1 rounded-lg bg-red-50"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Calendário Google-Style */}
      <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
        {/* Navegação de Mês */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-black text-gray-800 text-sm tracking-wide">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-xl hover:bg-white text-gray-600 transition shadow-sm border border-transparent hover:border-gray-200"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-xl hover:bg-white text-gray-600 transition shadow-sm border border-transparent hover:border-gray-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {WEEK_DAYS_HEADER.map((d) => (
            <span key={d} className="text-[11px] font-bold text-gray-400 uppercase py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Grade de dias do mês */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Espaços vazios antes do 1º dia */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9" />
          ))}

          {/* Dias do mês */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const formattedMonth = String(currentMonth + 1).padStart(2, "0");
            const formattedDay = String(dayNum).padStart(2, "0");
            const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

            const checkDate = new Date(currentYear, currentMonth, dayNum, 23, 59, 59);
            const isPast = checkDate < today;
            const isSelected = selectedDate === dateStr;
            const isToday =
              dayNum === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();

            return (
              <button
                key={dayNum}
                type="button"
                disabled={isPast}
                onClick={() => handleSelectDay(dayNum)}
                className={`h-9 w-full rounded-xl text-xs font-bold transition flex items-center justify-center relative ${
                  isSelected
                    ? "bg-vitrinia-purple text-white shadow-md shadow-vitrinia-purple/30 scale-105"
                    : isPast
                    ? "text-gray-300 cursor-not-allowed"
                    : isToday
                    ? "border border-vitrinia-purple text-vitrinia-purple bg-white hover:bg-vitrinia-purple/10"
                    : "text-gray-700 hover:bg-white hover:shadow-xs"
                }`}
              >
                {dayNum}
                {isToday && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-vitrinia-purple absolute bottom-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Seção de Horários Disponíveis */}
      {selectedDate ? (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Clock size={14} className="text-vitrinia-purple" />
              Horários Livres para {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}:
            </span>
            {isPending && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Verificando vagas...
              </span>
            )}
          </div>

          {isPending ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !isDayAllowed ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-800 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>{unavailableReason || "Não realizamos atendimentos neste dia da semana."}</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>Nenhum horário disponível para esta data. Todos os horários foram preenchidos ou estão fora de atendimento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((time) => {
                const isTimeSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleSelectTime(time)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border ${
                      isTimeSelected
                        ? "bg-vitrinia-green text-white border-vitrinia-green shadow-md shadow-vitrinia-green/30 scale-105"
                        : "bg-white text-gray-800 border-gray-200 hover:border-vitrinia-purple hover:bg-vitrinia-purple/5"
                    }`}
                  >
                    {isTimeSelected && <Check size={12} />}
                    {time}
                  </button>
                );
              })}
            </div>
          )}

          {value && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs mt-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 font-bold" />
                <span>
                  Horário reservado: <strong>{new Date(value).toLocaleDateString("pt-BR")} às {selectedTime}</strong>
                </span>
              </div>
              <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                Bloqueado para você
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic text-center py-2">
          Toque em uma data no calendário acima para visualizar os horários vagos.
        </p>
      )}
    </div>
  );
}
