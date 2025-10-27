# 📤 FileShare - SaaS de Compartilhamento de Arquivos

Sistema completo de compartilhamento de arquivos com upload temporário, desenvolvido com Next.js 15, TypeScript, Prisma ORM, MongoDB Atlas e Cloudflare R2.

## 🚀 Funcionalidades

- ✅ **Autenticação completa** (login/cadastro com NextAuth.js)
- ✅ Upload de arquivos até 4GB (plano gratuito)
- ✅ Geração automática de links públicos para compartilhamento
- ✅ Download sem necessidade de login
- ✅ Expiração automática de arquivos (5h no plano gratuito)
- ✅ Cron job para limpeza automática de arquivos expirados
- ✅ Painel administrativo com estatísticas e gerenciamento
- ✅ Gerenciamento de usuários (admin)
- ✅ Gerenciamento de planos (admin)
- ✅ Página de gerenciamento de arquivos do usuário
- ✅ Interface 100% responsiva
- ✅ Contador de downloads
- ✅ Proteção de rotas (admin e files apenas para usuários logados)
- ✅ CTA "Começar Gratuitamente" na home

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Autenticação**: NextAuth.js v5 (Auth.js)
- **Estilização**: Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API Routes
- **Banco de Dados**: MongoDB Atlas (via Prisma ORM)
- **Armazenamento**: Cloudflare R2 (S3-compatible)
- **Validação**: Zod
- **Notificações**: React Toastify
- **Requisições**: Axios, SWR
- **Segurança**: bcryptjs para hash de senhas

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no MongoDB Atlas
- Conta no Cloudflare R2
- npm ou yarn

## ⚙️ Configuração

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd file-share
```

### 2. Instale as dependências

```bash
npm install

# Instalar dependências adicionais de autenticação
npm install next-auth@beta bcryptjs
npm install -D @types/bcryptjs
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/file-share?retryWrites=true&w=majority"

# Cloudflare R2
R2_ACCOUNT_ID="seu_account_id"
R2_ACCESS_KEY_ID="sua_access_key"
R2_SECRET_ACCESS_KEY="sua_secret_key"
R2_BUCKET="seu-bucket-name"
R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
FREE_PLAN_ID="" # Será gerado após o seed

# NextAuth
AUTH_SECRET="gere-um-secret-aleatorio-aqui" # Execute: openssl rand -base64 32

# Cron Job Security
CRON_SECRET="seu-secret-aleatorio-aqui"
```

**Gerar AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Configure o Prisma e o banco de dados

```bash
# Gerar o Prisma Client
npx prisma generate

# Sincronizar o schema com o MongoDB
npx prisma db push

# Popular o banco com dados iniciais (planos)
npm run db:seed
```

**Importante**: Após executar o seed, copie o `FREE_PLAN_ID` exibido no console e adicione ao seu arquivo `.env`.

### 5. Execute o projeto

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 👤 Primeiro Acesso

1. Acesse `/register` para criar sua primeira conta
2. Selecione o plano gratuito
3. Após criar a conta, faça login em `/login`
4. Para tornar um usuário admin, edite diretamente no MongoDB:
   ```javascript
   db.User.updateOne(
     { email: "seu@email.com" },
     { $set: { role: "admin" } }
   )
   ```

## 📁 Estrutura do Projeto

```
file-share/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── plans/route.ts      # Gerenciamento de planos
│   │   │   ├── stats/route.ts      # Estatísticas do sistema
│   │   │   └── users/route.ts      # Listagem de usuários
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth handlers
│   │   │   └── register/route.ts   # Registro de usuários
│   │   ├── cron/
│   │   │   └── cleanup/route.ts    # Limpeza automática
│   │   ├── f/
│   │   │   └── [id]/route.ts       # Download público
│   │   ├── files/
│   │   │   ├── route.ts            # Listar arquivos
│   │   │   └── [id]/route.ts       # Deletar arquivo
│   │   └── upload/
│   │       ├── route.ts            # Iniciar upload
│   │       └── complete/route.ts   # Finalizar upload
│   ├── admin/
│   │   ├── page.tsx                # Painel admin
│   │   └── users/page.tsx          # Gestão de usuários
│   ├── files/page.tsx              # Meus arquivos
│   ├── login/page.tsx              # Login
│   ├── register/page.tsx           # Cadastro
│   ├── page.tsx                    # Home/Upload
│   ├── layout.tsx                  # Layout principal
│   ├── providers.tsx               # SessionProvider
│   └── globals.css                 # Estilos globais
├── components/ui/                  # Componentes shadcn/ui
├── lib/
│   ├── prisma.ts                   # Cliente Prisma
│   ├── r2.ts                       # Cliente Cloudflare R2
│   └── utils.ts                    # Utilitários
├── prisma/
│   ├── schema.prisma               # Schema do banco
│   └── seed.ts                     # Dados iniciais
├── types/
│   └── next-auth.d.ts              # Types do NextAuth
├── auth.ts                         # Configuração NextAuth
├── auth.config.ts                  # Config de rotas protegidas
├── middleware.ts                   # Middleware de autenticação
└── package.json
```

## 🔄 Fluxo de Upload

1. **Usuário seleciona arquivo** na interface
2. **Frontend chama** `POST /api/upload` com metadados
3. **Backend cria registro** no banco e gera URL pré-assinada do R2
4. **Frontend faz upload direto** para o R2 usando a URL
5. **Frontend chama** `POST /api/upload/complete` para confirmar
6. **Backend retorna** link público de compartilhamento

## 🔗 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/[...nextauth]` - Login/Logout (NextAuth)

### Upload
- `POST /api/upload` - Iniciar upload
- `POST /api/upload/complete` - Finalizar upload

### Arquivos
- `GET /api/files` - Listar arquivos
- `DELETE /api/files/[id]` - Deletar arquivo
- `GET /api/f/[token]` - Download público (redirect)

### Admin (requer autenticação admin)
- `GET /api/admin/stats` - Estatísticas do sistema
- `GET /api/admin/plans` - Listar planos
- `POST /api/admin/plans` - Criar plano
- `GET /api/admin/users` - Listar usuários

### Cron
- `GET /api/cron/cleanup` - Limpar arquivos expirados (requer `Authorization: Bearer ${CRON_SECRET}`)

## 🔐 Rotas Protegidas

- `/admin/*` - Apenas usuários com role "admin"
- `/files` - Apenas usuários autenticados
- `/login` e `/register` - Públicas
- `/` - Pública (mostra CTA para não autenticados, upload para autenticados)

## ⏰ Configurar Cron Job

Para limpeza automática de arquivos expirados, configure um cron job (ex: Vercel Cron, GitHub Actions, ou crontab):

```bash
# Executar a cada hora
curl -X GET https://seu-dominio.com/api/cron/cleanup \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

### Exemplo com Vercel Cron

Adicione ao `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/cleanup",
    "schedule": "0 * * * *"
  }]
}
```

## 🎨 Personalização

### Adicionar novo plano

Acesse `/admin` (como admin) e use o formulário "Criar Novo Plano" ou via API:

```bash
curl -X POST http://localhost:3000/api/admin/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Business",
    "maxFileSize": 107374182400,
    "retentionHrs": 2160,
    "priceCents": 2999
  }'
```

## 🔒 Segurança

- ✅ Autenticação com NextAuth.js e JWT
- ✅ Senhas com hash bcrypt
- ✅ Proteção de rotas via middleware
- ✅ Validação de dados com Zod
- ✅ Cron job protegido por secret
- ✅ URLs pré-assinadas com expiração
- ✅ Validação de tamanho de arquivo
- [ ] **TODO**: Adicionar rate limiting
- [ ] **TODO**: Implementar CORS adequado
- [ ] **TODO**: Adicionar 2FA (opcional)

## 📦 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Adicionar variáveis de ambiente no dashboard da Vercel
```

**Importante**: No Vercel, adicione todas as variáveis de ambiente listadas acima.

### Outras plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js 15+.

## 🐛 Troubleshooting

### Erro: "Missing required environment variable: DATABASE_URL"

Certifique-se de que o arquivo `.env` existe e contém todas as variáveis necessárias.

### Erro: "Can't resolve 'tw-animate-css'"

Já corrigido. Se persistir, remova a linha `@import "tw-animate-css";` do `globals.css`.

### Upload falha

1. Verifique as credenciais do R2
2. Confirme que o bucket existe
3. Verifique o `FREE_PLAN_ID` no `.env`

### Erro de autenticação

1. Verifique se o `AUTH_SECRET` está configurado
2. Confirme que o NextAuth está instalado: `npm install next-auth@beta`
3. Limpe os cookies do navegador

## 📝 Licença

MIT

## 👨‍💻 Desenvolvido por

Desenvolvido com Next.js, TypeScript e ❤️

---

**Dúvidas?** Abra uma issue no repositório!
