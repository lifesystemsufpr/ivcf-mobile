# processo-IA — ivcf-mobile

> Como aplicar **testes com IA, code review com IA e automação** neste repositório.
> Documento de orientação (o "como"). **Não contém código.** Task: [86e1tmk1q](https://app.clickup.com/t/86e1tmk1q).

## 1. Contexto do repo

- **Stack:** Expo ~54 / React Native 0.81 (TypeScript, strict) · **Package manager:** npm.
- **Teste hoje:** **nenhum framework configurado** e **nenhum teste**. `package.json` só tem
  `start`/`android`/`ios`/`web` — **sem `lint`, `typecheck`, `test`**.
- **CI:** **não há** `.github/workflows/`.
- **Estado:** menos maduro que os demais — exige uma etapa de **fundação de testes** antes de gerar testes.
- **Flags observadas (para review, não corrigir aqui):** IP de dev hardcoded em `shared/api/httpClient.ts`;
  token JWT guardado em store Zustand (memória); parse cru de JWT em `auth/mappers/authMapper.ts`.

## 2. Pré-requisito: estabelecer a fundação de testes (documentar, não codar)

Antes de gerar testes, este repo precisa de tooling. **Documentar como passos** (a serem feitos em PR
próprio, com OK), espelhando o que o reutilizável **`ci-node-mobile.yml`** espera:

1. Adicionar **`jest-expo`** (preset oficial Expo/RN) como devDependency.
2. Adicionar scripts: `lint` (ESLint), `typecheck` (`tsc --noEmit`), `test` / `test:cov` (`jest --coverage`).
3. Definir threshold inicial **baixo** (baseline real) em [`repos.config.ts`](https://github.com/lifesystemsufpr/devops-hub/blob/main/scripts/repos.config.ts)
   (alvo mobile = **30%**) e subir em rampa.

## 3. Testes unitários com IA

Depois da fundação, gerar via [`generate-tests`](https://github.com/lifesystemsufpr/ai-toolkit/blob/main/source/skills/generate-tests.md)
(AAA + adversarial, regra [`60-testing`](https://github.com/lifesystemsufpr/ai-toolkit/blob/main/source/rules/60-testing.md)).

**Alvos prioritários:**

| Prioridade | Alvo | Como testar |
|---|---|---|
| 1 | `features/auth/mappers/authMapper.ts` | Parse de payload JWT — token válido/ malformado/ expirado; sem rede. |
| 2 | `features/*/services/*` (ex.: `QuestionnaireService`) | Mock do client Axios; sucesso, erro HTTP, payload inválido. |
| 3 | `features/*/dto/*` | Validação/forma dos DTOs (participante, resposta de questionário). |
| 4 | stores Zustand (`useAuthStore`, etc.) | Transições de estado; login/logout; limpeza de token. |

## 4. Code review com IA

- [`review-pr`](https://github.com/lifesystemsufpr/ai-toolkit/blob/main/source/skills/review-pr.md) + regra
  [`75-code-review`](https://github.com/lifesystemsufpr/ai-toolkit/blob/main/source/rules/75-code-review.md). Aqui a IA deve sinalizar explicitamente:
  **segredos/URLs hardcoded, armazenamento inseguro de token, e exposição de dados de saúde**.
- **Revisão humana obrigatória:** auth e qualquer coleta/transmissão de dado de saúde →
  [`review-clinical-change`](https://github.com/lifesystemsufpr/ai-toolkit/blob/main/source/skills/review-clinical-change.md).

## 5. Automação / CI

- Aplicar **`ci-node-mobile.yml`** via bootstrap (documentar; executar só com OK) — depende da fundação (§2).
- **Gate pré-PR local:** [`pre-pr-gate`](https://github.com/lifesystemsufpr/ai-toolkit/blob/main/source/skills/pre-pr-gate.md) — só funciona depois
  de existirem os scripts `lint`/`typecheck`/`test:cov`.

## 5b. Validação de runtime (mobile)

nav-check de **navegador não se aplica** (app nativo RN). O análogo é **Maestro** ou **Detox** para varrer
fluxos de tela e capturar erros em runtime — mesma filosofia das [validações automáticas](https://github.com/lifesystemsufpr/devops-hub/blob/main/docs/processo-ia/validacoes-automaticas.md)
(gate determinístico no CI + varredura exploratória por IA). Fica como evolução futura, **depois** da
fundação de testes do §2.

## 6. Guard-rails específicos (saúde / PII / segurança)

- App coleta **PII e dados de saúde** (participante, questionário) → nunca em fixture/log; criptografia em trânsito.
- IP de backend hardcoded e token em memória são **itens de review** (não corrigir nesta task de docs).
- Nada de dado real de paciente em teste.

## 7. Passo a passo "como fazer"

1. Documentar/abrir PR de **fundação** (jest-expo + scripts + threshold baixo) — com OK.
2. Gerar testes nos alvos 1→4 com `generate-tests`; validar local.
3. Documentar/abrir bootstrap do `ci-node-mobile` (com OK).
4. `pre-pr-gate` → PR → `review-pr`, com atenção às flags de segurança.
5. Subir threshold em rampa conforme a cobertura cresce.
6. **Merge só com OK humano.**
