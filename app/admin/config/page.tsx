import { getGlobalSettings, updateGlobalSettings } from "@/app/actions/settings-actions";
import {
  Settings,
  Save,
  Palette,
  Clock,
  CreditCard,
  Users,
  MessageCircle,
  Store,
  Calendar,
  Shield,
} from "lucide-react";

export default async function ConfigPage() {
  const settings = await getGlobalSettings();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="text-vitrinia-purple" />
          Configurações do Sistema
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Configure todos os aspectos do seu negócio.
        </p>
      </header>

      <form action={updateGlobalSettings} className="space-y-8">
        {/* ── MARCA & IDENTIDADE ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-vitrinia-purple/5 to-transparent">
            <h2 className="text-sm font-bold text-vitrinia-purple uppercase tracking-wider flex items-center gap-2">
              <Palette size={16} />
              Marca & Identidade Visual
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Nome da Empresa</label>
                <input
                  type="text"
                  name="companyName"
                  defaultValue={settings.companyName}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vitrinia-purple/30 focus:border-vitrinia-purple outline-none transition font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Cor Primária da Vitrine</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="primaryColor"
                    defaultValue={settings.primaryColor}
                    className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue={settings.primaryColor}
                    className="flex-1 p-3 border border-gray-200 rounded-xl font-mono text-sm text-gray-600"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">URL do Logo</label>
                <input
                  type="url"
                  name="companyLogoUrl"
                  defaultValue={settings.companyLogoUrl || ""}
                  placeholder="https://..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vitrinia-purple/30 focus:border-vitrinia-purple outline-none transition text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">URL do Banner</label>
                <input
                  type="url"
                  name="bannerUrl"
                  defaultValue={settings.bannerUrl || ""}
                  placeholder="https://..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-vitrinia-purple/30 focus:border-vitrinia-purple outline-none transition text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Modo de Negócio</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: "PRODUCTS", label: "Apenas Produtos", icon: "📦" },
                  { value: "SERVICES", label: "Apenas Serviços", icon: "✂️" },
                  { value: "BOTH", label: "Produtos & Serviços", icon: "🏪" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex-1 min-w-[140px] flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                      settings.businessType === opt.value
                        ? "border-vitrinia-purple bg-vitrinia-purple/5"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-gray-700">{opt.label}</span>
                    </div>
                    <input
                      type="radio"
                      name="businessType"
                      value={opt.value}
                      defaultChecked={settings.businessType === opt.value}
                      className="w-4 h-4 text-vitrinia-purple"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── HORÁRIOS ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-transparent">
            <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} />
              Horários de Funcionamento
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Abertura</label>
                <input
                  type="time"
                  name="openingTime"
                  defaultValue={settings.openingTime || "08:00"}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition font-bold text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Fechamento</label>
                <input
                  type="time"
                  name="closingTime"
                  defaultValue={settings.closingTime || "18:00"}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition font-bold text-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Dias de Funcionamento</label>
              <input
                type="text"
                name="workDays"
                defaultValue={settings.workDays || "MON,TUE,WED,THU,FRI,SAT"}
                placeholder="MON,TUE,WED,THU,FRI,SAT"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition text-sm font-mono"
              />
              <p className="text-xs text-gray-400 italic">Use: MON, TUE, WED, THU, FRI, SAT, SUN separados por vírgula.</p>
            </div>
          </div>
        </section>

        {/* ── AGENDAMENTO & CANCELAMENTO ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-transparent">
            <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={16} />
              Agendamento & Cancelamento
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-gray-700">Agendamento Ativo</label>
                <p className="text-xs text-gray-400 mt-1 italic">Permite que clientes agendem horários na vitrine.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="defaultSchedulingEnabled"
                  defaultChecked={settings.defaultSchedulingEnabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>

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
                    className={`flex-1 min-w-[130px] p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                      settings.depositType === opt.value
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
                        defaultChecked={settings.depositType === opt.value}
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
                  defaultValue={settings.depositPercentage}
                  min="0"
                  max="100"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-300 outline-none transition font-bold text-lg"
                />
                <p className="text-xs text-gray-400 italic">Aplicável apenas quando o tipo for &quot;Sinal Parcial&quot;.</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Prazo para Cancelamento (horas)</label>
                <input
                  type="number"
                  name="cancellationHoursLimit"
                  defaultValue={settings.cancellationHoursLimit}
                  min="0"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-300 outline-none transition font-bold text-lg"
                />
                <p className="text-xs text-gray-400 italic">Cancelamentos dentro deste prazo antes do horário terão estorno. Fora do prazo, o sinal é retido.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMISSÕES ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-transparent">
            <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-2">
              <Users size={16} />
              Multi-Profissionais & Comissões
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-gray-700">Ativar Módulo de Comissões</label>
                <p className="text-xs text-gray-400 mt-1 italic">
                  Permite calcular comissões por atendimento para cada profissional da equipe.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enableCommissions"
                  defaultChecked={settings.enableCommissions}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
              </label>
            </div>
          </div>
        </section>

        {/* ── GATEWAY DE PAGAMENTO ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-transparent">
            <h2 className="text-sm font-bold text-green-700 uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={16} />
              Gateway de Pagamento (Pix Direto)
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
              <div className="flex items-start gap-2">
                <Shield size={16} className="mt-0.5 shrink-0" />
                <p>
                  <strong>SaaS Não-Intermediário:</strong> O pagamento Pix vai diretamente da conta do cliente para a sua conta bancária/gateway. O Vitrinia não retém nenhum valor.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Provedor do Gateway</label>
              <select
                name="gatewayProvider"
                defaultValue={settings.gatewayProvider || ""}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 outline-none transition text-sm font-medium"
              >
                <option value="">Nenhum (pagamento presencial)</option>
                <option value="MERCADOPAGO">Mercado Pago</option>
                <option value="ASAAS">Asaas</option>
                <option value="EFI">Efí (Gerencianet)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Access Token / API Key</label>
                <input
                  type="password"
                  name="gatewayAccessToken"
                  defaultValue={settings.gatewayAccessToken || ""}
                  placeholder="Cole sua chave de API aqui..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 outline-none transition text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Chave Pix</label>
                <input
                  type="text"
                  name="pixKey"
                  defaultValue={settings.pixKey || ""}
                  placeholder="CPF, E-mail, Telefone ou chave aleatória"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 outline-none transition text-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── WHATSAPP ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-transparent">
            <h2 className="text-sm font-bold text-green-700 uppercase tracking-wider flex items-center gap-2">
              <MessageCircle size={16} />
              WhatsApp & Notificações
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Número do WhatsApp</label>
              <input
                type="text"
                name="whatsappNumber"
                defaultValue={settings.whatsappNumber || ""}
                placeholder="5511999999999"
                className="w-full max-w-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 outline-none transition text-sm"
              />
              <p className="text-xs text-gray-400 italic">Formato: DDI + DDD + Número (sem espaços ou traços).</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-gray-700">Envio Automático de Mensagens</label>
                <p className="text-xs text-gray-400 mt-1 italic">Recibos e notificações automáticas via WhatsApp.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="autoWhatsappEnabled"
                  defaultChecked={settings.autoWhatsappEnabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" />
              </label>
            </div>
          </div>
        </section>

        {/* ── ESTOQUE LEGACY ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-transparent">
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
              <Store size={16} />
              Gestão de Inventário
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Estoque Mínimo Padrão</label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    name="defaultMinStock"
                    defaultValue={settings.defaultMinStock}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition font-bold text-lg text-blue-600"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 uppercase">un / kg</div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Taxa de Entrega Padrão</label>
                <div className="relative max-w-xs">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">R$</div>
                  <input
                    type="text"
                    name="defaultDeliveryFee"
                    defaultValue={settings.defaultDeliveryFee ? settings.defaultDeliveryFee.toString().replace(".", settings.decimalSeparator) : "0"}
                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition font-bold text-lg text-blue-600"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Separador Decimal</label>
              <div className="flex gap-4 max-w-sm">
                <label className={`flex-1 flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${settings.decimalSeparator === ',' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-blue-600">,</span>
                    <span className="text-xs font-bold text-gray-700">Vírgula</span>
                  </div>
                  <input type="radio" name="decimalSeparator" value="," defaultChecked={settings.decimalSeparator === ','} className="w-4 h-4 text-blue-600" />
                </label>
                <label className={`flex-1 flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${settings.decimalSeparator === '.' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-blue-600">.</span>
                    <span className="text-xs font-bold text-gray-700">Ponto</span>
                  </div>
                  <input type="radio" name="decimalSeparator" value="." defaultChecked={settings.decimalSeparator === '.'} className="w-4 h-4 text-blue-600" />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* ── SUBMIT ── */}
        <div className="flex justify-end sticky bottom-4 z-10">
          <button
            type="submit"
            className="flex items-center gap-2 bg-vitrinia-purple text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-vitrinia-purple/90 transition active:scale-95 shadow-xl shadow-vitrinia-purple/20 text-sm"
          >
            <Save size={18} />
            Salvar Todas as Configurações
          </button>
        </div>
      </form>
    </div>
  );
}
