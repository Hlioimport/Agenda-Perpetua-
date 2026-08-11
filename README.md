# Agenda Perpétua — Calendário & Agenda Protegida 📅🔒

Aplicação web progressiva (PWA) e mobile para gestão de compromissos com sincronização Firebase em tempo real, suporte offline e exportação de dados.

---

## 🌟 Funcionalidades e Aparência

- **Interface Moderna & Responsiva**: Design em Tailwind CSS com suporte completo a Modo Escuro / Claro.
- **Autenticação Segura**: Login por E-mail/Senha, Conta Google ou Modo Convidado via Firebase Auth.
- **Sincronização em Tempo Real**: Dados salvos no Cloud Firestore.
- **Modo PWA & Android**: Suporte a instalação direta na tela inicial de dispositivos móveis com manifest e service worker.
- **Google Calendar Integration**: Sincronização direta com eventos do Google Agenda.
- **Exportação/Importação CSV**: Backup e restauração rápida de compromissos.
- **Agenda Compartilhada**: Compartilhamento seguro de agendas entre usuários.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js**: `v18+` ou `v20+`
- **npm** ou **bun**

### Passos
1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   O app estará disponível em `http://localhost:3000`.

3. Compilar para produção:
   ```bash
   npm run build
   ```

---

## 📂 Estrutura do Projeto

```
.
├── .github/
│   └── workflows/
│       └── build-apk.yml     # Workflow de compilação automática do APK no GitHub Actions
├── public/
│   ├── manifest.json         # Configuração PWA (Ícones, Nome, Cores)
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/           # Componentes Modulares React (Navbar, Modais, Calendário, etc.)
│   ├── lib/                  # Inicialização do Firebase e utilitários de Auth/Database
│   ├── types.ts              # Interfaces e Tipos do TypeScript
│   ├── App.tsx               # Componente Principal da aplicação
│   ├── main.tsx              # Ponto de entrada do React
│   └── index.css             # Configurações globais de Tailwind CSS
├── firebase-applet-config.json # Credenciais da aplicação no Firebase
├── firestore.rules           # Regras de segurança do banco de dados Firestore
├── index.html                # Documento HTML principal com Meta Tags PWA
├── package.json              # Dependências e scripts do projeto
├── tsconfig.json             # Configuração do TypeScript
└── vite.config.ts            # Configuração do bundler Vite
```

---

## 🔧 Configuração do Firebase

O arquivo `firebase-applet-config.json` e as regras em `firestore.rules` definem a segurança e a comunicação com o banco de dados.

### `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null;
    }
    match /shares/{shareId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📱 Compilação Automática no GitHub (APK Android)

Quando você envia o código para a branch `main` ou `master` no GitHub, a ação em `.github/workflows/build-apk.yml` é disparada automaticamente para testar o build do PWA e compilar o pacote Android.
Site da Agenda
