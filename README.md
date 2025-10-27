# 📤 FileShare - Compartilhamento de Arquivos SaaS

Sistema completo de compartilhamento de arquivos com planos Free e Premium, desenvolvido com Next.js 15, TypeScript, Prisma ORM, MongoDB Atlas e Cloudflare R2.

## ✨ Funcionalidades

### 🌐 Upload e Compartilhamento
- ✅ Upload de arquivos até **4GB** (plano Free) ou **50GB** (plano Premium)
- ✅ Upload público sem necessidade de login
- ✅ Upload autenticado com associação ao usuário
- ✅ Geração automática de links públicos para compartilhamento
- ✅ Progress bar em tempo real durante upload
- ✅ Upload direto para Cloudflare R2 (sem passar pelo servidor)

### 📥 Download e Acesso
- ✅ Download público sem necessidade de login
- ✅ Página de download com informações do arquivo
- ✅ Contador de downloads por arquivo
- ✅ Links de download com expiração automática

### 👤 Autenticação e Usuários
- ✅ Sistema completo de autenticação com NextAuth.js v4
- ✅ Registro de novos usuários
- ✅ Login/Logout funcional
- ✅ Proteção de rotas com middleware
- ✅ Roles de usuário (user/admin)

### 📊 Sistema Multi-Plano

#### Plano Free
- 📦 Arquivos de até **4GB**
- ⏱️ Retenção de **5 horas**
- 🆓 Totalmente gratuito
- 📤 Upload ilimitado
- 🚫 Sem anúncios

#### Plano Premium
- 📦 Arquivos de até **50GB**
- ⏱️ Retenção de **30 dias** (permanente)
- 💰 R$ 9,99/mês
- 📁 Histórico completo de arquivos
- ⚡ Prioridade no processamento

### 📁 Gerenciamento de Arquivos
- ✅ Página "Meus Arquivos" para usuários autenticados
- ✅ Listagem de todos os arquivos enviados
- ✅ Informações detalhadas (tamanho, downloads, expiração)
- ✅ Copiar link de compartilhamento
- ✅ Deletar arquivos com modal de confirmação
- ✅ Indicadores visuais de status (Permanente/Temporário/Expirado)

### 🔧 Painel Administrativo
- ✅ Dashboard com estatísticas do sistema
- ✅ Gerenciamento de usuários
- ✅ Criação de novos usuários via interface
- ✅ Gerenciamento de planos
- ✅ Visualização de métricas (total de arquivos, usuários, armazenamento)

### 🤖 Automação
- ✅ Cron job para limpeza automática de arquivos expirados
- ✅ Soft delete de arquivos
- ✅ Remoção automática do Cloudflare R2

## 🛠️ Stack Tecnológica

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** MongoDB Atlas
- **ORM:** Prisma
- **Armazenamento:** Cloudflare R2 (S3-compatible)
- **Autenticação:** NextAuth.js v4
- **UI:** shadcn/ui + Tailwind CSS v4
- **Ícones:** Lucide React
- **Notificações:** React Toastify
- **HTTP Client:** Axios
- **Data Fetching:** SWR
- **Validação:** Zod
- **Senha:** bcryptjs

## 📋 Pré-requisitos

- Node.js 18+ 
- MongoDB Atlas (conta gratuita)
- Cloudflare R2 (conta gratuita)
- Git

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/AssFerj/file-share.git
cd file-share
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/file-share"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Cloudflare R2
R2_ACCOUNT_ID="seu-account-id"
R2_ACCESS_KEY_ID="sua-access-key"
R2_SECRET_ACCESS_KEY="sua-secret-key"
R2_BUCKET="file-share"
R2_ENDPOINT="https://seu-account-id.r2.cloudflarestorage.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
FREE_PLAN_ID="id-do-plano-free"

# Cron (para limpeza automática)
CRON_SECRET="sua-chave-secreta-cron"
```

### 4. Configure o banco de dados

```bash
# Sincronizar schema com MongoDB
npx prisma db push

# Popular banco com planos e usuário admin
npm run db:seed
```

O seed criará:
- ✅ Plano Free (4GB, 5h)
- ✅ Plano Premium (50GB, 30 dias)
- ✅ Usuário admin com plano Premium

**Credenciais do Admin:**
- Email: `assisjuniorcam@gmail.com`
- Senha: `123456`

### 5. Configure o CORS no Cloudflare R2

No dashboard do Cloudflare R2, adicione a seguinte configuração CORS no seu bucket:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://seu-dominio.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
file-share/
├── app/
│   ├── admin/              # Painel administrativo
│   │   ├── page.tsx        # Dashboard
│   │   └── users/          # Gerenciamento de usuários
│   ├── api/                # API Routes
│   │   ├── admin/          # Rotas admin (stats, plans, users)
│   │   ├── auth/           # Autenticação (NextAuth, register)
│   │   ├── cron/           # Cron jobs (cleanup)
│   │   ├── files/          # Gerenciamento de arquivos
│   │   ├── f/              # Download público
│   │   └── upload/         # Upload de arquivos
│   ├── download/           # Página pública de download
│   ├── files/              # Meus arquivos (autenticado)
│   ├── login/              # Página de login
│   ├── register/           # Página de registro
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Home (upload público)
├── components/
│   ├── ui/                 # Componentes shadcn/ui
│   └── SignOutButton.tsx   # Botão de logout
├── lib/
│   ├── prisma.ts           # Cliente Prisma
│   ├── r2.ts               # Cliente Cloudflare R2
│   └── utils.ts            # Utilitários
├── prisma/
│   ├── schema.prisma       # Schema do banco
│   └── seed.ts             # Seed de dados
├── scripts/                # Scripts utilitários
├── auth.ts                 # Configuração NextAuth
├── middleware.ts           # Proteção de rotas
└── types/                  # Tipos TypeScript
```

## 🔌 API Routes

### Públicas
- `POST /api/upload` - Iniciar upload
- `POST /api/upload/complete` - Finalizar upload
- `GET /api/f/[token]` - Download público (redirect para R2)
- `GET /api/files/public/[token]` - Metadados do arquivo público
- `POST /api/auth/register` - Registrar novo usuário
- `GET /api/cron/cleanup` - Limpar arquivos expirados (protegido por CRON_SECRET)

### Autenticadas
- `GET /api/files` - Listar arquivos do usuário
- `DELETE /api/files/[id]` - Deletar arquivo

### Admin
- `GET /api/admin/stats` - Estatísticas do sistema
- `GET /api/admin/plans` - Listar planos
- `POST /api/admin/plans` - Criar/atualizar plano
- `GET /api/admin/users` - Listar usuários

## 🔐 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Proteção de rotas com middleware
- ✅ Validação de ownership de arquivos
- ✅ Soft delete de arquivos
- ✅ Tokens únicos para compartilhamento
- ✅ CORS configurado no R2
- ✅ Variáveis de ambiente para secrets

## 🤖 Cron Jobs

Configure um cron job para limpar arquivos expirados:

```bash
# Executar a cada hora
0 * * * * curl -X GET "https://seu-dominio.com/api/cron/cleanup" -H "Authorization: Bearer SEU_CRON_SECRET"
```

Ou use serviços como:
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para GitHub
2. Importe o projeto no Vercel
3. Configure as variáveis de ambiente
4. Deploy!

```bash
npm run build
```

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 📊 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Prisma
npx prisma studio          # Interface visual do banco
npx prisma db push         # Sincronizar schema
npx prisma generate        # Gerar cliente Prisma
npm run db:seed            # Popular banco de dados

# Scripts utilitários
npx tsx scripts/check-files.ts          # Verificar arquivos no banco
npx tsx scripts/check-deleted.ts        # Verificar arquivos deletados
npx tsx scripts/restore-files.ts        # Restaurar arquivos deletados
npx tsx scripts/cleanup-orphan-files.ts # Limpar arquivos órfãos
npx tsx scripts/debug-query.ts          # Debug de queries
```

## 🐛 Troubleshooting

### Arquivos não aparecem em "Meus Arquivos"

Execute o script de debug:
```bash
npx tsx scripts/debug-query.ts
```

### Erro de CORS no upload

Verifique se o CORS está configurado corretamente no Cloudflare R2.

### Erro "Unknown field 'plan'"

Regenere o Prisma Client:
```bash
npx prisma generate
```

## 📝 TODO / Melhorias Futuras

- [ ] Sistema de pagamento (Stripe/Mercado Pago)
- [ ] Rate limiting para uploads
- [ ] Compressão de imagens
- [ ] Preview de arquivos (imagens, PDFs)
- [ ] Compartilhamento com senha
- [ ] Estatísticas de downloads por arquivo
- [ ] Notificações por email
- [ ] Dark mode
- [ ] Internacionalização (i18n)
- [ ] Testes automatizados

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

**Assis Junior**
- GitHub: [@AssFerj](https://github.com/AssFerj)
- Email: assisjuniorcam@gmail.com

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Cloudflare R2](https://www.cloudflare.com/products/r2/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!
