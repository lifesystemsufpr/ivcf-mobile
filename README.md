# Índice de Vulnerabilidade Clínico Funcional (IVCF-20) - Tecnoaging Mobile

Um aplicativo móvel desenvolvido em React Native para a aplicação do questionário IVCF-20 (Índice de Vulnerabilidade Clínico Funcional) em idosos. Este projeto faz parte das iniciativas do Tecnoaging e permite gerenciar participantes, realizar as avaliações e visualizar painéis de resultados (dashboards).

## 📱 Tecnologias Utilizadas

O projeto foi construído utilizando as principais tecnologias do ecossistema React Native moderno:

*   **[React Native](https://reactnative.dev/)** (v0.81.5)
*   **[Expo](https://expo.dev/)** (v54.0.33) - Framework para desenvolvimento e build (EAS).
*   **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática para JavaScript.
*   **[React Navigation](https://reactnavigation.org/)** (v7) - Roteamento e navegação (Stack e Bottom Tabs).
*   **[Zustand](https://zustand-demo.pmnd.rs/)** - Gerenciamento de estado global de forma simples e rápida.
*   **[React Query (@tanstack/react-query)](https://tanstack.com/query/latest)** - Gerenciamento de server-state, cache e sincronização de dados das requisições.
*   **[Axios](https://axios-http.com/)** - Cliente HTTP para chamadas à API.
*   **[Lottie](https://lottiefiles.com/)** - Animações fluidas no aplicativo.

## 📂 Estrutura do Projeto

A arquitetura do projeto é baseada em *Features* (Módulos de Negócio), visando facilitar a manutenção e escalabilidade:

```text
├── App.tsx                     # Ponto de entrada do aplicativo
├── app.json / eas.json         # Configurações do Expo e builds (EAS)
├── package.json                # Dependências e scripts do projeto
└── src/
    └── app/
        ├── assets/             # Imagens, fontes e animações locais
        ├── features/           # Módulos de negócio da aplicação
        │   ├── auth/               # Fluxo de Autenticação (Login)
        │   ├── createParticipant/  # Cadastro de novos idosos
        │   ├── dashboard/          # Telas de painel de controle e estatísticas
        │   ├── detailParticipant/  # Visualização dos detalhes de um participante
        │   ├── questionnaire/      # Execução do questionário IVCF-20 e resultados
        │   └── searchParticipant/  # Busca de participantes para iniciar avaliações
        ├── navigation/         # Configurações de rotas (MainNavigator, etc.)
        └── shared/             # Bibliotecas compartilhadas, componentes globais, API client
            ├── api/                # Configuração do Axios e interceptors
            ├── components/         # Componentes de UI reaproveitáveis (se houver)
            └── utils/              # Funções utilitárias
```

## 🗺️ Navegação Principal

A navegação principal do aplicativo (após a autenticação) é baseada em uma Bottom Tab Bar personalizada com três opções principais:

1.  **Home (Dashboard):** Visão geral e estatísticas de vulnerabilidade dos participantes.
2.  **Botão Central (Avaliar):** Direciona para a busca de um participante para iniciar um novo questionário IVCF-20.
3.  **Participantes (Cadastrar):** Lista de participantes e formulário de cadastro de novos idosos.

## 🚀 Como Executar o Projeto

### Pré-requisitos

Certifique-se de que você possui o [Node.js](https://nodejs.org/) instalado, preferencialmente na versão LTS. Recomenda-se também o uso da extensão do Expo Go no seu dispositivo físico ou de um emulador (Android Studio/Xcode).

### Passo a Passo

1.  **Instale as dependências:**
    Na raiz do projeto, execute:
    ```bash
    npm install
    # ou
    yarn install
    ```

2.  **Inicie o servidor de desenvolvimento (Metro Bundler):**
    ```bash
    npm start
    # ou 
    expo start
    ```

3.  **Rodando no Dispositivo/Emulador:**
    *   **Expo Go:** Escaneie o QR Code que aparecerá no terminal com o aplicativo Expo Go no seu smartphone.
    *   **Android (Emulador):** Pressione a tecla `a` no terminal.
    *   **iOS (Simulador):** Pressione a tecla `i` no terminal (apenas macOS).

## 🛠️ Scripts Úteis

O `package.json` possui os seguintes atalhos configurados:

*   `npm start`: Inicia o Expo.
*   `npm run android`: Realiza o build local e roda no dispositivo/emulador Android (via Expo Run).
*   `npm run ios`: Realiza o build local e roda no simulador iOS.
*   `npm run web`: Inicia o projeto com suporte web.

## 📄 Licença

Este projeto está sob a licença **0BSD**.
