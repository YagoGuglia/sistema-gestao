# 🚀 Vitrinia - Sistema de Gestão Inteligente para Pequenos Empreendedores

Vitrinia é um Micro-SaaS **Multi-tenant** desenvolvido para simplificar a gestão de pequenos negócios (como confeitarias, barbearias, estéticas e prestadores de serviços em geral). O sistema combina um painel administrativo robusto com PDV manual, controle de estoque inteligente por ficha técnica, vitrine digital pública para clientes finais e um sistema automatizado de agendamentos.

---

## 🛠️ Stack Tecnológica

- **Framework:** Next.js (App Router, Server Actions)
- **Estilização:** Tailwind CSS (Interface responsiva e moderna)
- **Banco de Dados:** Supabase (PostgreSQL) com suporte a *Connection Pooling* via Supavisor/PgBouncer
- **ORM:** Prisma ORM
- **Hospedagem & CI/CD:** Vercel integrada ao GitHub

---

## 🏗️ Arquitetura do Sistema & Multi-Tenancy

O sistema adota uma arquitetura **Multi-tenant com isolamento lógico**. Todas as entidades críticas do banco de dados são vinculadas a uma loja específica através de um identificador único (`storeId` ou `tenantId`), garantindo privacidade estrita e segurança dos dados (LGPD):

- **Plataforma Admin (Dono SaaS):** Painel macro para gerenciamento de planos, vigências, valores, cupons de desconto e controle de empresas cadastradas.
- **Lojista (Tenant):** Painel restrito para cadastro de produtos, insumos, controle de pedidos manuais e configurações de agenda.
- **Cliente Final:** Interface pública acessível por link exclusivo (`vitrinia.com.br/nome-da-loja`) para navegação, pedidos e agendamentos.

---

## ⚙️ Principais Funcionalidades (Core Features)

### 1. Gestão de Estoque por Ficha Técnica (BOM - Bill of Materials)
- Distinção clara entre **Insumo/Matéria-Prima** (`isRawMaterial: true`) e **Produto Final**.
- Capacidade de compor produtos de venda associando múltiplos insumos e suas respectivas quantidades.
- **Abatimento Inteligente:** Ao realizar a venda de um produto final, o sistema percorre a árvore de ingredientes e subtrai automaticamente a quantidade proporcional de cada matéria-prima do estoque.

### 2. PDV / Pedidos Manuais (Balcão)
- Interface simplificada para o lojista registrar vendas presenciais.
- Seleção dinâmica de produtos e clientes.
- Fluxo universal de status do pedido com três estados bem definidos:
  - 🟡 **Pendente:** Pedido registrado na fila de espera.
  - 🔵 **Em Andamento / Em Execução:** Serviço sendo realizado ou produto em preparação.
  - 🟢 **Concluído / Finalizado:** Venda encerrada e entregue.

### 3. Agendamento Automatizado sem Conflito
- Configuração prévia de horários disponíveis, dias de funcionamento e duração média dos serviços pelo lojista.
- Validação estrita no servidor antes de consolidar o agendamento para impedir overbooking (sobreposição de horários pelo mesmo profissional).
- Opção de **Aprovação Automática** (confirma instantaneamente se o horário estiver vago) ou **Manual** pelo lojista.

### 4. Integração e Automação com WhatsApp
- Geração automática de link de compartilhamento rápido (`wa.me`) contendo o resumo em texto do pedido.
- Geração dinâmica de um comprovante estilizado em formato de imagem (.png/.jpg) contendo os detalhes do pedido e identidade da loja, enviado de forma automatizada ou manual para o WhatsApp do cliente final.

---

## 🗺️ Mapa de Desenvolvimento (Workflow)

- [x] **Fase 1: Fundação & Infraestrutura Nuvem** -> Configuração Next.js + Prisma, migração do banco SQLite local para o PostgreSQL no Supabase e deploy contínuo na Vercel.
- [ ] **Fase 2: Ficha Técnica & Estoque Automatizado** -> Implementação do campo de insumos e lógica de subtração automática de ingredientes no banco de dados.
- [ ] **Fase 3: Módulo de Pedidos Manuais & Imagem Automatizada** -> Criação do fluxo de vendas de balcão e engine de renderização do comprovante em imagem.
- [ ] **Fase 4: Agendamento Inteligente** -> Lógica de validação de datas/horários e controle de concorrência na agenda.
- [ ] **Fase 5: Vitrine Pública do Cliente & Onboarding Automatizado** -> Checkout transparente para o lojista assinar os planos (Stripe/Pagar.me), criação automatizada do subdomínio/slug da loja e vitrine self-service.

---

## 🔒 Conformidade LGPD

- Coleta de dados mínimos para cadastro do cliente final (Nome, Telefone, E-mail opcional).
- Checkbox de consentimento explícito aos Termos de Uso e Políticas de Privacidade na interface do cliente.
- Mecanismo de exclusão permanente de dados pessoais sob requisição (*Direito ao Esquecimento*), preservando apenas registros financeiros agregados para contabilidade.
