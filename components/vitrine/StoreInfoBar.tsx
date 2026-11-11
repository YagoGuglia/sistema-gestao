"use client";

import { Clock, MapPin, Calendar, Coffee, Star } from "lucide-react";

interface StoreInfoBarProps {
  showHours?: boolean;
  hoursText?: string | null;
  showSchedulingHours?: boolean;
  schedulingHoursText?: string | null;
  showAddress?: boolean;
  addressText?: string | null;
  showBreakInterval?: boolean;
  breakIntervalText?: string | null;
  showRating?: boolean;
  ratingAverage?: number | null;
  totalReviews?: number | null;
}

export function StoreInfoBar({
  showHours = true,
  hoursText = "Seg a Sáb: 08:00 - 18:00",
  showSchedulingHours = false,
  schedulingHoursText = "Agendamentos: 08:00 - 18:00",
  showAddress = true,
  addressText,
  showBreakInterval = false,
  breakIntervalText = "Pausa: 12:00 - 13:30",
  showRating = true,
  ratingAverage = 5.0,
  totalReviews = 0,
}: StoreInfoBarProps) {
  // Verifica se há pelo menos um item ativado para exibir
  const hasItems = 
    (showHours && Boolean(hoursText)) ||
    (showSchedulingHours && Boolean(schedulingHoursText)) ||
    (showAddress && Boolean(addressText)) ||
    (showBreakInterval && Boolean(breakIntervalText)) ||
    showRating;

  if (!hasItems) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-3 mb-2 animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-2xs p-3 sm:p-3.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-600">
        {/* 1. Horário de Funcionamento */}
        {showHours && hoursText && (
          <div className="flex items-center gap-1.5" title="Horário de Funcionamento">
            <div className="w-5 h-5 rounded-md bg-purple-50 text-vitrinia-purple flex items-center justify-center shrink-0">
              <Clock size={12} />
            </div>
            <span className="font-medium text-gray-700">{hoursText}</span>
          </div>
        )}

        {/* 2. Horário de Agendamento */}
        {showSchedulingHours && schedulingHoursText && (
          <div className="flex items-center gap-1.5" title="Horário de Agendamento">
            <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar size={12} />
            </div>
            <span className="font-medium text-gray-700">{schedulingHoursText}</span>
          </div>
        )}

        {/* 3. Intervalo de Pausa / Almoço */}
        {showBreakInterval && breakIntervalText && (
          <div className="flex items-center gap-1.5" title="Intervalo de Pausa">
            <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Coffee size={12} />
            </div>
            <span className="font-medium text-gray-700">{breakIntervalText}</span>
          </div>
        )}

        {/* 4. Endereço Físico */}
        {showAddress && addressText && (
          <div className="flex items-center gap-1.5 max-w-xs truncate" title={addressText}>
            <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin size={12} />
            </div>
            <span className="font-medium text-gray-700 truncate">{addressText}</span>
          </div>
        )}

        {/* 5. Avaliação / Nota Média */}
        {showRating && (
          <div className="flex items-center gap-1.5" title="Nota de Avaliação">
            <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Star size={12} className="fill-amber-400 text-amber-400" />
            </div>
            <span className="font-bold text-gray-800">
              {(ratingAverage ?? 5.0).toFixed(1)}
            </span>
            <span className="text-[11px] text-gray-400">
              ({totalReviews && totalReviews > 0 ? `${totalReviews} avaliações` : "Nova"})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

