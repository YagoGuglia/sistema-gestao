"use client";

import { useState } from "react";
import { Calendar, Clock, ShieldCheck, CheckCircle2, CalendarDays } from "lucide-react";

interface SchedulingConfigProps {
  initialSchedulingEnabled: boolean;
  initialDepositType: string;
  initialDepositPercentage: number;
  initialCancellationHoursLimit: number;
  initialSchedulingDays?: string | null;
  initialSchedulingStartTime?: string | null;
  initialSchedulingEndTime?: string | null;
  initialSchedulingPeriod?: string | null;
  initialSlotIntervalMin?: number;
  initialDeliverySchedulingEnabled?: boolean;
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

const PERIOD_OPTIONS = [
  {
    id: "1_WEEK",
    title: "1 Semana",
    desc: "Abre agenda para os próximos 7 dias",
  },
  {
    id: "2_WEEKS",
    title: "2 Semanas",
    desc: "Abre agenda para os próximos 14 dias",
  },
  {
    id: "3_WEEKS",
    title: "3 Semanas",
    desc: "Abre agenda para os próximos 21 dias",
  },
  {
    id: "MONTH",
    title: "No Mês Inteiro",
    desc: "Abre horários até o final do mês corrente",
  },
  {
    id: "ALWAYS",
    title: "Sempre",
    desc: "Válido para todos os meses (sem limite)",
  },
];

const INTERVAL_OPTIONS = [
  { value: 15, label: "15 min", desc: "Slots de 15 em 15 min" },
  { value: 30, label: "30 min", desc: "Padrão recomendado" },
  { value: 45, label: "45 min", desc: "Slots de 45 em 45 min" },
  { value: 60, label: "1 hora", desc: "De hora em hora" },
];

export function SchedulingConfig({
  initialSchedulingEnabled,
  initialDepositType,
  initialDepositPercentage,
  initialCancellationHoursLimit,
  initialSchedulingDays,
  initialSchedulingStartTime,
  initialSchedulingEndTime,
  initialSchedulingPeriod,
  initialSlotIntervalMin = 30,
  initialDeliverySchedulingEnabled = true,
}: SchedulingConfigProps) {
  const [schedulingEnabled, setSchedulingEnabled] = useState(initialSchedulingEnabled);
  const [depositType, setDepositType] = useState(initialDepositType || "OFF");
  const [slotInterval, setSlotInterval] = useState(initialSlotIntervalMin || 30);
  const [deliveryScheduling, setDeliveryScheduling] = useState(initialDeliverySchedulingEnabled ?? true);

  // Parse days
  const parseDays = (): string[] => {
    if (!initialSchedulingDays) {
      return ["SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
    }
    const mapOldToNew: Record<string, string> = {
      MON: "SEG",
      TUE: "TER",
      WED: "QUA",
      THU: "QUI",
      FRI: "SEX",
      SAT: "SAB",
      SUN: "DOM",
    };
    return initialSchedulingDays
      .split(",")
      .map((d) => d.trim().toUpperCase())
      .map((d) => mapOldToNew[d] || d);
  };

  const [selectedDays, setSelectedDays] = useState<string[]>(parseDays());
  const [startTime, setStartTime] = useState(initialSchedulingStartTime || "08:00");
  const [endTime, setEndTime] = useState(initialSchedulingEndTime || "18:00");
  const [period, setPeriod] = useState(initialSchedulingPeriod || "ALWAYS");

  const toggleDay = (key: string) => {
    if (selectedDays.includes(key)) {
      if (selectedDays.length === 1) return;
      setSelectedDays(selectedDays.filter((d) => d !== key));
    } else {
      setSelectedDays([...selectedDays, key]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden inputs para sincronizar com form */}
      <input type="hidden" name="schedulingDays" value={selectedDays.join(",")} />
      <input type="hidden" name="schedulingStartTime" value={startTime} />
      <input type="hidden" name="schedulingEndTime" value={endTime} />
      <input type="hidden" name="schedulingPeriod" value={period} />

      {/* ATIVAR/DESATIVAR AGENDAMENTO */}
      <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
        <div>
          <label className="block text-sm font-bold text-gray-800">
            Recepção de Agendamentos Ativa
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            Permite que os clientes agendem horários de serviços diretamente pela vitrine.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="defaultSchedulingEnabled"
            checked={schedulingEnabled}
            onChange={(e) => setSchedulingEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
        </label>
      </div>

      {schedulingEnabled && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* DIAS PARA RECEBER AGENDAMENTO (ALARME DE CELULAR) */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CalendarDays size={16} className="text-emerald-600" />
                Dias da Semana Disponíveis para Agendamento
              </span>
              <span className="text-xs font-semibold text-gray-400">
                {selectedDays.length} {selectedDays.length === 1 ? "dia ativo" : "dias ativos"}
              </span>
            </label>
            <p className="text-xs text-gray-500">
              Selecione em quais dias os clientes podem agendar atendimentos:
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
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105 ring-2 ring-emerald-500/40"
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

          {/* PERÍODO DE HORÁRIO QUE RECEBE AGENDAMENTOS */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
              <Clock size={16} className="text-emerald-600" />
              Horário do Período de Atendimento para Agendamentos
            </label>
            <p className="text-xs text-gray-500">
              Defina o horário limite inicial e final em que sua equipe atende agendamentos:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <span className="block text-xs font-bold text-gray-700 mb-1">Início dos Agendamentos</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none font-bold text-lg text-gray-800"
                />
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-700 mb-1">Término dos Agendamentos</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none font-bold text-lg text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* PERÍODO DE ABERTURA DA AGENDA (ANTECEDÊNCIA / VALIDADE) */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
              <Calendar size={16} className="text-emerald-600" />
              Janela de Liberação da Agenda (Período de Recebimento)
            </label>
            <p className="text-xs text-gray-500">
              Escolha com quanta antecedência a agenda fica aberta para reservas:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PERIOD_OPTIONS.map((opt) => {
                const isSelected = period === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPeriod(opt.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/70 shadow-sm"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-800">{opt.title}</span>
                      {isSelected ? (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* INTERVALO ENTRE HORÁRIOS NA GRADE */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <input type="hidden" name="slotIntervalMin" value={slotInterval} />
            <label className="block text-sm font-bold text-gray-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-600" />
                Intervalo entre Horários na Agenda
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                De {slotInterval} em {slotInterval} min
              </span>
            </label>
            <p className="text-xs text-gray-500">
              De quanto em quanto tempo novos horários serão abertos para escolha do cliente:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {INTERVAL_OPTIONS.map((opt) => {
                const isSelected = slotInterval === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSlotInterval(opt.value)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all relative ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/70 shadow-sm"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-800">{opt.label}</span>
                      {isSelected && <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-gray-400">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AGENDAMENTO PARA ENTREGA DE PRODUTOS */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div>
              <label className="block text-sm font-bold text-gray-800">
                Agendamento para Entrega de Produtos
              </label>
              <p className="text-xs text-gray-500 mt-0.5">
                Permite que clientes com compras de produtos escolham o dia e horário preferido de entrega ou retirada.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="deliverySchedulingEnabled"
                checked={deliveryScheduling}
                onChange={(e) => setDeliveryScheduling(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          {/* SINAL E CANCELAMENTO */}
          <div className="pt-4 border-t border-gray-100 space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Garantia de Horário (Sinal Antecipado)</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: "OFF", label: "Desativado", desc: "Pagar no local" },
                  { value: "PARTIAL", label: "Sinal Parcial", desc: "Ex: 20%, 30% ou 50%" },
                  { value: "FULL", label: "100% Antecipado", desc: "Pagamento integral" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    onClick={() => setDepositType(opt.value)}
                    className={`flex-1 min-w-[130px] p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                      depositType === opt.value
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-700">{opt.label}</span>
                      <input
                        type="radio"
                        name="depositType"
                        value={opt.value}
                        checked={depositType === opt.value}
                        onChange={() => setDepositType(opt.value)}
                        className="w-4 h-4 text-emerald-500"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">{opt.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Porcentagem do Sinal (%)</label>
                <input
                  type="number"
                  name="depositPercentage"
                  defaultValue={initialDepositPercentage}
                  min="0"
                  max="100"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-300 outline-none transition font-bold text-lg"
                />
                <p className="text-xs text-gray-400 italic">Aplicável apenas quando o tipo for &quot;Sinal Parcial&quot;.</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Prazo Limite para Cancelamento (horas)</label>
                <input
                  type="number"
                  name="cancellationHoursLimit"
                  defaultValue={initialCancellationHoursLimit}
                  min="0"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-300 outline-none transition font-bold text-lg"
                />
                <p className="text-xs text-gray-400 italic">
                  Cancelamentos antes deste prazo têm estorno automático do sinal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
