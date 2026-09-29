"use client";

import { useState } from "react";
import { Clock, Plus, Trash2, CalendarDays } from "lucide-react";

export interface OperatingInterval {
  start: string;
  end: string;
}

interface OperatingHoursConfigProps {
  initialWorkDays?: string | null;
  initialOperatingHours?: string | null;
  initialOpeningTime?: string | null;
  initialClosingTime?: string | null;
}

const WEEK_DAYS = [
  { key: "DOM", label: "Dom", full: "Domingo" },
  { key: "SEG", label: "Seg", full: "Segunda-feira" },
  { key: "TER", label: "Ter", full: "Terça-feira" },
  { key: "QUA", label: "Qua", full: "Quarta-feira" },
  { key: "QUI", label: "Qui", full: "Quinta-feira" },
  { key: "SEX", label: "Sex", full: "Sexta-feira" },
  { key: "SAB", label: "Sáb", full: "Sábado" },
];

export function OperatingHoursConfig({
  initialWorkDays,
  initialOperatingHours,
  initialOpeningTime,
  initialClosingTime,
}: OperatingHoursConfigProps) {
  // Parse initial days
  const parseDays = (): string[] => {
    if (!initialWorkDays) {
      return ["SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
    }
    // Suporte a formatos antigos (MON, TUE...) e novos (SEG, TER...)
    const mapOldToNew: Record<string, string> = {
      MON: "SEG",
      TUE: "TER",
      WED: "QUA",
      THU: "QUI",
      FRI: "SEX",
      SAT: "SAB",
      SUN: "DOM",
    };
    return initialWorkDays
      .split(",")
      .map((d) => d.trim().toUpperCase())
      .map((d) => mapOldToNew[d] || d);
  };

  const [selectedDays, setSelectedDays] = useState<string[]>(parseDays());

  // Parse initial intervals
  const parseIntervals = (): OperatingInterval[] => {
    if (initialOperatingHours) {
      try {
        const parsed = JSON.parse(initialOperatingHours);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Erro ao ler operatingHours JSON:", e);
      }
    }
    // Fallback para openingTime e closingTime
    return [
      {
        start: initialOpeningTime || "08:00",
        end: initialClosingTime || "18:00",
      },
    ];
  };

  const [intervals, setIntervals] = useState<OperatingInterval[]>(parseIntervals());

  const toggleDay = (key: string) => {
    if (selectedDays.includes(key)) {
      if (selectedDays.length === 1) return; // Mínimo 1 dia selecionado
      setSelectedDays(selectedDays.filter((d) => d !== key));
    } else {
      setSelectedDays([...selectedDays, key]);
    }
  };

  const addInterval = () => {
    if (intervals.length >= 4) return;
    const last = intervals[intervals.length - 1];
    setIntervals([...intervals, { start: last ? last.end : "13:30", end: "18:30" }]);
  };

  const removeInterval = (index: number) => {
    if (intervals.length <= 1) return;
    setIntervals(intervals.filter((_, i) => i !== index));
  };

  const updateInterval = (index: number, field: "start" | "end", value: string) => {
    const updated = [...intervals];
    updated[index][field] = value;
    setIntervals(updated);
  };

  // String serializada para envio no formulário
  const workDaysValue = selectedDays.join(",");
  const operatingHoursValue = JSON.stringify(intervals);
  const primaryOpeningTime = intervals[0]?.start || "08:00";
  const primaryClosingTime = intervals[intervals.length - 1]?.end || "18:00";

  return (
    <div className="space-y-6">
      {/* Hidden inputs para submeter no FormData */}
      <input type="hidden" name="workDays" value={workDaysValue} />
      <input type="hidden" name="operatingHours" value={operatingHoursValue} />
      <input type="hidden" name="openingTime" value={primaryOpeningTime} />
      <input type="hidden" name="closingTime" value={primaryClosingTime} />

      {/* SELEÇÃO DE DIAS DA SEMANA - ESTILO ALARME DE CELULAR */}
      <div className="space-y-3">
        <label className="block text-sm font-bold text-gray-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CalendarDays size={16} className="text-amber-600" />
            Dias de Funcionamento
          </span>
          <span className="text-xs font-semibold text-gray-400">
            {selectedDays.length} {selectedDays.length === 1 ? "dia ativo" : "dias ativos"}
          </span>
        </label>
        <p className="text-xs text-gray-500">
          Toque nos dias da semana em que a sua loja ou estabelecimento funciona:
        </p>

        <div className="flex items-center justify-between gap-2 sm:gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
          {WEEK_DAYS.map((day) => {
            const isSelected = selectedDays.includes(day.key);
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleDay(day.key)}
                title={day.full}
                className={`flex-1 aspect-square max-w-[52px] flex flex-col items-center justify-center rounded-2xl font-bold transition-all text-xs active:scale-95 ${
                  isSelected
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105 ring-2 ring-amber-400/40"
                    : "bg-white text-gray-400 border border-gray-200 hover:border-gray-300 hover:text-gray-600"
                }`}
              >
                <span className="text-sm font-black">{day.label}</span>
                <span className="text-[9px] opacity-75 hidden sm:inline">
                  {day.key === "DOM" || day.key === "SAB" ? "FDS" : "Útil"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* INTERVALOS DE HORÁRIO DE FUNCIONAMENTO */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Clock size={16} className="text-amber-600" />
            Intervalos de Horário
          </label>
          {intervals.length < 4 && (
            <button
              type="button"
              onClick={addInterval}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/80 px-3 py-1.5 rounded-xl transition active:scale-95"
            >
              <Plus size={14} />
              Adicionar Intervalo
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Defina os turnos ou horários com pausas (ex: manhã das 08:00 às 12:00 e tarde das 13:30 às 18:30).
        </p>

        <div className="space-y-3">
          {intervals.map((interval, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-amber-200/60 transition"
            >
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Intervalo {idx + 1}
                </span>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3 items-center">
                <div>
                  <span className="block text-[10px] font-semibold text-gray-400 mb-1">Início</span>
                  <input
                    type="time"
                    value={interval.start}
                    onChange={(e) => updateInterval(idx, "start", e.target.value)}
                    required
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm font-bold text-gray-800"
                  />
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-gray-400 mb-1">Término</span>
                  <input
                    type="time"
                    value={interval.end}
                    onChange={(e) => updateInterval(idx, "end", e.target.value)}
                    required
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm font-bold text-gray-800"
                  />
                </div>
              </div>

              {intervals.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInterval(idx)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition self-end sm:self-center"
                  title="Remover intervalo"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
