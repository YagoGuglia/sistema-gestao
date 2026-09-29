// Helper de formatação e geração de links de WhatsApp

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function formatPhoneWithCountryCode(phone: string): string {
  const digits = cleanPhone(phone);
  if (!digits) return "";
  // Se tem 10 ou 11 dígitos, é um telefone brasileiro sem DDI 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = cleanPhone(phone);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function createWhatsAppLink(phone: string, message: string): string {
  const fullNumber = formatPhoneWithCountryCode(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${fullNumber}?text=${encodedText}`;
}

export function getOrderStatusLabel(status: string): { label: string; color: string } {
  switch (status?.toUpperCase()) {
    case "PENDING":
    case "RECEIVED":
      return { label: "Recebido", color: "bg-amber-100 text-amber-800 border-amber-200" };
    case "PREPARING":
    case "IN_PROGRESS":
      return { label: "Em Preparo", color: "bg-blue-100 text-blue-800 border-blue-200" };
    case "READY":
      return { label: "Pronto para Retirada", color: "bg-purple-100 text-purple-800 border-purple-200" };
    case "OUT_FOR_DELIVERY":
      return { label: "Saiu para Entrega", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
    case "COMPLETED":
    case "DELIVERED":
    case "PAID":
      return { label: "Concluído", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    case "CANCELLED":
    case "REFUNDED":
      return { label: "Cancelado", color: "bg-rose-100 text-rose-800 border-rose-200" };
    default:
      return { label: status || "Pendente", color: "bg-gray-100 text-gray-800 border-gray-200" };
  }
}
