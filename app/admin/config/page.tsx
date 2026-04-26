import { getGlobalSettings, updateGlobalSettings } from "@/app/actions/settings-actions";
import { Settings, Save, AlertCircle } from "lucide-react";

export default async function ConfigPage() {
  const settings = await getGlobalSettings();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="text-gray-400" />
          Configurações do Sistema
        </h1>
        <p className="text-sm text-gray-500 font-medium">Configure padrões globais para automação do seu negócio.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de Configurações de Estoque */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Gestão de Inventário</h2>
          </div>
          
          <form action={updateGlobalSettings} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Estoque Mínimo Padrão (Alerta)
              </label>
              <div className="relative max-w-xs">
                <input 
                  type="number" 
                  name="defaultMinStock" 
                  defaultValue={settings.defaultMinStock}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-lg text-blue-600"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 uppercase">un / kg</div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed italic">
                Este valor será sugerido automaticamente ao cadastrar novos produtos. 
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <label className="block text-sm font-bold text-gray-700">
                Taxa de Entrega Padrão (Delivery)
              </label>
              <div className="relative max-w-xs">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">R$</div>
                <input 
                  type="text" 
                  name="defaultDeliveryFee" 
                  defaultValue={settings.defaultDeliveryFee ? settings.defaultDeliveryFee.toString().replace(".", settings.decimalSeparator) : "0"}
                  className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-lg text-blue-600"
                />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed italic">
                Sugerido no momento do Lançamento do Pedido de Delivery.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-700">
                Separador Decimal Preferido
              </label>
              <div className="flex gap-4">
                 <label className={`flex-1 flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${settings.decimalSeparator === ',' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                       <span className="text-xl font-black text-blue-600">,</span>
                       <span className="text-xs font-bold text-gray-700 uppercase">Vírgula (Brasil)</span>
                    </div>
                    <input 
                       type="radio" 
                       name="decimalSeparator" 
                       value="," 
                       defaultChecked={settings.decimalSeparator === ','}
                       className="w-4 h-4 text-blue-600"
                    />
                 </label>

                 <label className={`flex-1 flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${settings.decimalSeparator === '.' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                       <span className="text-xl font-black text-blue-600">.</span>
                       <span className="text-xs font-bold text-gray-700 uppercase">Ponto (EUA)</span>
                    </div>
                    <input 
                       type="radio" 
                       name="decimalSeparator" 
                       value="." 
                       defaultChecked={settings.decimalSeparator === '.'}
                       className="w-4 h-4 text-blue-600"
                    />
                 </label>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed italic">
                O Dashboard e os formulários usarão sua preferência para exibir e interpretar preços e quantidades.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-bold text-gray-700">Agendamento Ativo por Padrão</label>
                  <p className="text-xs text-gray-400 mt-1 italic">Se ativado, o campo de data/hora de agendamento já aparece aberto ao criar um novo pedido.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="defaultSchedulingEnabled" 
                    defaultChecked={settings.defaultSchedulingEnabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button 
                type="submit"
                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition active:scale-95 shadow-lg"
              >
                <Save size={18} />
                Salvar Configurações
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <AlertCircle size={32} className="mb-4 opacity-50" />
            <h3 className="text-lg font-bold mb-2">Por que configurar?</h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Definir um padrão ajuda você a manter o controle do seu estoque sem precisar configurar cada item manualmente. 
              <br/><br/>
              O padrão de 10 unidades é ideal para quem trabalha com produtos de giro médio.
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-blue-500/50 text-[10px] uppercase font-bold tracking-widest opacity-70">
            SIS PqEmp v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
