# Registro de uso de IA

Este arquivo comprova como a IA foi usada no projeto (slide 12). Para cada uso importante, anote: o que foi pedido, o que a IA entregou e **o que você revisou ou corrigiu**.

**Ferramenta principal:** Claude (assistente de IA)

---

## Etapa 01 — Documento de visão

- **Data:** 23/11/2026
- **O que pedi:** organizar as respostas da entrevista com a Lucy em problema, público, objetivo, escopo e critérios de sucesso.
- **O que a IA entregou:** `01 - Requisitos/01-documento-de-visao.md`
- **Decisão importante:** a entrevista mostrou que a prioridade da Lucy era **confirmar/cancelar horários**, e não o estoque. O escopo foi reordenado.
- **Minha revisão:** [o que você conferiu ou corrigiu]

## Etapa 02 — Requisitos

- **Data:** 23/11/2026
- **Prompt usado (baseado no roteiro do Prof. Bruno):**
  > Atue como engenheiro de requisitos com conhecimento da ISO/IEC/IEEE 29148 e ISO/IEC 25010. Baseie-se apenas no documento de visão e na entrevista com a Lucy. Produza RFs, RNFs, histórias de usuário, regras de negócio, critérios de aceitação e matriz de rastreabilidade. Marque requisitos não confirmados e identifique ambiguidades; organize o resultado em Markdown.
- **O que a IA entregou:** `01 - Requisitos/02-especificacao-de-requisitos.md`
- **Ambiguidades apontadas pela IA:** 6 pendências (seção 6 do documento).
- **Minha revisão:** [o que você conferiu, removeu ou corrigiu]

## Etapa 03 — Mockup e validação

- **Data:** 23/11/2026
- **Prompt usado (baseado no roteiro do Prof. Bruno):**
  > Atue como UX/UI Designer sênior. Utilize exclusivamente os RFs, RNFs e fluxos aprovados. Proponha navegação, wireframes e um mockup em HTML/CSS/JavaScript com dados fictícios. Detalhe ações, estados, erros e acessibilidade. Não adicione funcionalidades novas; indique onde falta definição de requisito.
- **O que a IA entregou:** `02 - mockup/mockup.html` e `02 - mockup/03-fluxos-e-validacao.md` (mapa de navegação, fluxo principal, roteiro de teste com a Lucy).
- **Verificação feita pela IA:** abriu o mockup em um navegador automático e conferiu a baixa de estoque, o bloqueio de horário duplicado e o destaque da alergia.
- **Minha revisão:** [o que você conferiu ou mudou]
- **Resultado do teste com a Lucy:** [resumo: quantas tarefas ela fez sozinha e o que mudou]

## Etapa 05 — Parte 1: arquitetura, banco de dados e servidor inicial

- **Data:** 23/11/2026
- **Prompt usado (baseado no roteiro do Prof. Bruno):**
  > Atue como desenvolvedor full-stack sênior. Analise os requisitos, o mockup e o Design System. Antes de implementar qualquer RF, prepare a base: estrutura do banco com as regras de negócio, servidor Express com rota de saúde e banco PostgreSQL no Docker. Primeiro liste arquivos e alterações propostas; explique como executar e comprovar.
- **O que a IA entregou:** `db/schema.sql`, `server.js`, `package.json`, `.env.example`, `public/index.html`, `06 - Docker/compose.yaml`, `.gitignore`.
- **Verificação feita pela IA:** carregou o `schema.sql` num PostgreSQL 16 e testou as regras: horário sobreposto recusado (RN-01), cancelado libera o horário (RN-02), alergia sem consentimento recusada (RNF-06), telefone vazio recusado (RN-07) e estoque negativo recusado (RN-03). O `server.js` **não** foi executado pela IA (sem acesso às bibliotecas); a execução foi feita por mim.
- **Minha execução (23/11/2026):** página http://localhost:3000 mostrou "Servidor ✓ funcionando", "Banco ✓ conectado" e "5 serviços cadastrados".
- **Problemas encontrados e resolvidos (evidência para o slide 13):**
  1. **Conflito de porta.** O servidor conectava em outro PostgreSQL já instalado no Windows, também na porta 5432. A pista foi a mensagem de erro em **português** (*"autenticação do tipo senha falhou"*), enquanto o PostgreSQL do Docker responde em inglês. **Solução:** o banco do Docker passou a usar a porta **5433** no PC (`"5433:5432"` no compose e `PGPORT=5433` no `.env`).
  2. **Erro gerado pela IA.** O `compose.yaml` enviava o `.env` inteiro para o banco, inclusive o `PGPORT=5433`, que era só para o Node. O PostgreSQL também obedece essa variável e passou a escutar na 5433 **dentro** do contêiner. Descoberto lendo `docker compose logs db`. **Solução:** `environment: PGPORT: "5432"` no compose.
  - **Lição:** o código gerado pela IA precisou ser executado, investigado nos logs e corrigido. É a "validação humana" do slide 12.
- **Minha revisão:** [o que entendi ou mudei]

## Etapa 05 — Parte 2: estoque de tinturas (RF-13, RF-14, RF-15)

- **Data:** 23/11/2026
- **Prompt usado (modelo do roteiro do Prof. Bruno):**
  > Atue como desenvolvedor full-stack sênior. Analise os RF-13, RF-14 e RF-15, os critérios de aceitação HU-07 e CA-05.2, o mockup e o Design System. Implemente APENAS esses requisitos em Node.js/Express + PostgreSQL + HTML/CSS/JS. Primeiro liste arquivos e alterações propostas; depois gere código com validação, tratamento de erro e testes pertinentes. Explique como executar e comprovar cada critério. Não altere outros módulos sem justificar.
- **O que a IA entregou:** rotas `/api/tinturas` no `server.js` (listar, cadastrar, editar, entrada de tubos); telas em `public/index.html`, `public/css/app.css` e `public/js/app.js`, usando as classes do Design System.
- **Verificação feita pela IA:**
  - As consultas SQL foram executadas num PostgreSQL 16 (cadastro, duplicidade recusada, entrada somada pelo banco, alerta calculado).
  - As telas foram testadas num navegador automático com um servidor simulado. Os testes **encontraram um defeito**: fechar a janela enquanto o servidor respondia travava a tela. Ele foi corrigido, e também foi acrescentado o bloqueio de clique duplo em "Salvar".
  - O `server.js` real foi executado por mim (a IA não tinha as bibliotecas).
- **Decisões:** a soma da entrada de tubos é feita pelo banco (`quantidade + X`), para não errar com o sistema aberto em dois aparelhos; mensagens técnicas do banco são traduzidas para mensagens que a Lucy entende.
- **Minha execução (23/11/2026):** teste 1 (cadastro com alerta de estoque baixo) ✅ · teste 2 (entrada de 4 tubos, alerta some) ✅
- **Defeito encontrado por mim no teste manual:** a janela de cadastro fechava ao clicar fora dela, e o que já tinha sido digitado se perdia. **Correção:** as janelas fecham só pelo botão "Voltar" ou pela tecla Esc (`desenharJanela` em `app.js`). Testado de novo: clicar fora mantém a janela aberta e o texto digitado.
- **Minha revisão:** [o que entendi ou mudei]

## Etapa 05 — Parte 3: clientes e fichas (RF-07, RF-08, RF-09, RNF-06)

- **Data:** 23/11/2026
- **Prompt usado (modelo do roteiro):**
  > Atue como desenvolvedor full-stack sênior. Implemente APENAS os RF-07, RF-08 e RF-09, com os critérios CA-04.1 (alergia em destaque) e CA-04.2 (consentimento LGPD), seguindo o mockup e o Design System. Primeiro liste arquivos e alterações; depois gere código com validação e tratamento de erro. Explique como comprovar cada critério.
- **O que a IA entregou:** rotas `/api/clientes` no `server.js` (listar, ficha com histórico, cadastrar, editar, excluir) e as telas Clientes e Ficha em `public/js/app.js`.
- **Verificação feita pela IA:**
  - A consulta do histórico foi testada num PostgreSQL 16 com atendimentos simulados, e a exclusão em cascata foi conferida (o histórico some e o estoque não muda).
  - As telas foram testadas num navegador automático com servidor simulado: busca sem acento, alergia como primeiro elemento da ficha, bloqueio da LGPD, telefone sem DDD, cadastro, edição e exclusão.
- **Decisões:** o consentimento é conferido em **três lugares** (tela, servidor e banco); a busca ignora acentos ("andrea" acha "Andréa"); o histórico já está pronto para receber os atendimentos do RF-10.
- **Mudança de requisito decidida por mim (23/11/2026):** questionei a caixinha de consentimento da LGPD, porque ela não provava a autorização e só criava trabalho para a Lucy. Pedi à IA as alternativas. Ela apresentou 3 opções e citou a base legal do art. 11, II, "e" da LGPD (proteção da incolumidade física), avisando que era interpretação e não parecer jurídico. **Escolhi remover a exigência.** A IA alterou o banco (com a migração `db/migracoes/001-remover-consentimento.sql`, testada num PostgreSQL com a estrutura antiga), o servidor, a tela e os documentos (especificação v0.2, seção 7).
- **Minha execução:** [resultado dos testes T-09 a T-15]
- **Minha revisão:** [o que entendi ou mudei]

## Etapa 04 — Design System

- **Data:** 23/11/2026
- **Prompt usado (baseado no roteiro do Prof. Bruno):**
  > Atue como especialista em Design Systems. A partir do mockup aprovado, documente cores, tipografia, espaçamentos, componentes, estados, acessibilidade, responsividade e exemplos de CSS. Produza tokens reutilizáveis e um guia de implementação em Markdown. Preserve a identidade aprovada.
- **O que a IA entregou:** `03 - Designer System/tokens.css`, `design-system.md` e `guia-visual.html`.
- **Verificação:** a IA **calculou** o contraste de cada par de cores e encontrou 2 falhas no mockup (contorno de foco 2,3:1 e borda dos campos 1,9:1, abaixo do mínimo de 3:1). As duas foram corrigidas no mockup v0.2.
- **Minha revisão:** [o que você conferiu ou mudou]
