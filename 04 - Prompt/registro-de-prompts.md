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

## Etapa 05 — Parte 4: agenda (RF-02 a RF-06, RN-01, RN-02, RN-06)

- **Data:** 23/11/2026
- **Prompt usado (modelo do roteiro):**
  > Atue como desenvolvedor full-stack sênior. Implemente APENAS a agenda: RF-02 (marcar), RF-03 (hoje e amanhã), RF-04 (confirmar/cancelar), RF-05 (WhatsApp com mensagem pronta), RF-06 (remarcar), com as regras RN-01, RN-02 e RN-06 e os critérios HU-01, HU-02 e HU-03. Primeiro liste arquivos e alterações; depois gere código com validação e tratamento de erro. Explique como comprovar cada critério.
- **O que a IA entregou:** rotas `/api/servicos` e `/api/agenda` no `server.js` (listar, marcar, confirmar/cancelar, remarcar) e a aba Agenda em `public/js/app.js`.
- **Verificação feita pela IA:**
  - As consultas foram testadas num PostgreSQL 16: detecção de choque com o nome da cliente, remarcação sem "colidir" com o próprio horário, nomes das regras do banco para as mensagens de erro.
  - As telas foram testadas num navegador automático com servidor simulado: link do WhatsApp com a mensagem RN-06, bloqueio de horário sobreposto, confirmar, remarcar, cancelar e ver outro dia.
- **Decisões:**
  - O **WhatsApp abre por link** (`wa.me`), sem integração paga: funciona no WhatsApp comum da Lucy (RF-05).
  - Marcar um horário grava em duas tabelas dentro de uma **transação**: ou grava tudo, ou nada.
  - **Remarcar volta o horário para "pendente"**, porque a cliente precisa confirmar a nova data.
  - Além de "hoje e amanhã" (RF-03), foi incluído **"ver outro dia"**, para a Lucy conferir horários marcados para a semana seguinte.
  - O choque de horário (RN-01) é conferido pelo servidor, com o nome da cliente, **e** pelo banco, como segurança extra.
- **Inconsistência encontrada por mim (23/11/2026):** a tela exigia a duração estimada, mas o RF-02 da especificação diz "duração estimada (opcional)". A IA admitiu o erro de implementação, explicou a consequência (sem duração, a regra "uma cliente por vez" só consegue bloquear o mesmo horário de início) e corrigiu banco (migração `002-duracao-opcional.sql`, testada num banco antigo e num novo), servidor e tela. A especificação passou para a v0.3.
- **Defeito D-04 encontrado por mim no teste T-18:** o emoji 💇‍♀️ chegou como "�" no WhatsApp. A IA explicou que esse emoji é formado por vários símbolos e que o redirecionamento do WhatsApp o corrompeu; como não temos controle sobre isso, o emoji foi retirado da mensagem.
- **Cuidado com dados reais:** no mesmo teste, percebi que a ficha de teste ainda tinha um número com DDD 11, que pode existir. Não enviei a mensagem e troquei o número para DDD 00.
- **Defeito D-05 encontrado por mim ao refazer o T-18:** a mensagem saiu certa (D-04 resolvido), mas o número continuava o antigo. Causa: ao salvar a ficha, a agenda não era recarregada. Corrigido em `salvarEdicaoCliente`.
- **Duas perguntas minhas que viraram melhorias:**
  1. *"Por que a janela de cancelar está no final da página?"* A IA explicou que foi de propósito (janela inferior, perto do polegar no celular), mas concordou que no computador fica estranho. Agora ela fica **embaixo no celular e centralizada a partir de 600 px**. O Design System foi atualizado.
  2. *"Por que tem esse ⚠️ no nome da Ana?"* Era o aviso de alergia, mas sem texto ninguém entende, e isso quebrava a regra do próprio Design System ("ícone nunca sozinho"). Agora aparece "Ana — ⚠️ tem alergia" (defeito D-06).
- **Melhoria pedida por mim:** máscara automática no telefone. A Lucy digita só os números e o sistema forma `(00) 90000-0001`, com limite de 11 números. O servidor também padroniza o formato antes de gravar. A IA testou digitação, colar, apagar, número fixo e fichas antigas; o cuidado principal foi **não reformatar ao apagar**, senão não daria para apagar o traço.
- **Minha execução:** [resultado dos testes T-16 a T-24]
- **Minha revisão:** [o que entendi ou mudei]

## Etapa 05 — Parte 5: finalizar atendimento e hora de voltar (RF-10, RF-11, RF-12)

- **Data:** 23/11/2026
- **Prompt usado (modelo do roteiro):**
  > Atue como desenvolvedor full-stack sênior. Implemente APENAS o RF-10 (finalizar atendimento: histórico + baixa de tinturas), o RF-11 (hora de voltar com lembrete pelo WhatsApp) e o RF-12 (intervalo de retorno editável), com as regras RN-03, RN-04 e RN-05 e os critérios HU-05 e HU-06. Primeiro liste arquivos e alterações; depois gere código com validação e tratamento de erro. Explique como comprovar cada critério.
- **O que a IA entregou:** rotas `/api/agenda/:id/finalizar`, `/api/hora-de-voltar` e `PUT /api/servicos/:id` no `server.js`; botão Finalizar, janela de tubos, lista "Hora de voltar" e janela de intervalos no `app.js`.
- **Verificação feita pela IA:**
  - No PostgreSQL 16: finalizar com baixa de estoque; estoque insuficiente **desfaz tudo** (sem histórico, horário continua ativo); cálculo da data prevista; quem já tem horário futuro sai da lista.
  - No navegador automático: alergia no topo da janela de finalizar, recusa por estoque insuficiente, aviso de estoque baixo, mensagem de lembrete sem emoji, salvar intervalos.
- **Decisões:**
  - Finalizar é **uma única transação** com 4 passos (histórico, serviços, baixa de cada tintura, status). Se faltar tubo de qualquer tintura, nada é gravado.
  - A baixa só acontece se houver tubo suficiente (`quantidade_tubos >= X`), conferido pelo banco no momento da baixa.
  - **RN-03 (pendência):** a Lucy disse que "sempre executa o serviço". Por enquanto o sistema **bloqueia** quando falta tubo e pede para atualizar o estoque. Confirmar com ela se prefere ser só avisada.
  - A janela de finalizar repete o **aviso de alergia**, porque é o momento em que a tintura é aplicada.
  - A "Hora de voltar" usa a data **do aparelho** (fuso da Lucy), não a do servidor.
  - Quem já tem horário marcado **não aparece** na "Hora de voltar", porque já vai voltar.
- **Mudança de rumo vinda da Lucy (23/11/2026):** eu disse que a Lucy não mexe no celular enquanto trabalha. A IA apontou que isso derrubava a hipótese H1 e sugeriu 3 perguntas para ela. Respostas: usa o **celular de manhã e no almoço para ver o dia** (quem vem e quem tem alergia) e **no fechamento passa os tubos que anotou no papel**. (A IA entendeu errado no primeiro momento, achando que ela finalizaria no almoço; eu corrigi.) A IA criou o **resumo do dia** (RF-17, mostrando só as **próximas** clientes e as alergias delas, para servir de manhã e no almoço) e a lista **"Para finalizar"** (RF-16, de qualquer dia, com o botão "Não veio"). A especificação foi para a v0.4.
- **Ajuste de texto pedido por mim:** o resumo dizia "Hoje: 1 horário" e eu entendi "primeiro horário". Sugeri dividir por período. Agora mostra **"Manhã: N clientes · Tarde: N clientes"** (Noite só aparece se houver alguém depois das 18h). Testado pela IA com o relógio simulado às 08:00, 12:30 e 15:11.
- **Minha execução:** [resultado dos testes T-25 a T-35]
- **Minha revisão:** [o que entendi ou mudei]

## Etapa 05 — Parte 6: login (RF-01, RNF-04)

- **Data:** 23/11/2026
- **Prompt usado (modelo do roteiro):**
  > Atue como desenvolvedor full-stack sênior. Implemente APENAS o RF-01 (login e logout da Lucy) atendendo ao RNF-04 (todas as rotas exigem login; senha com hash) e aos critérios CA-08.1 e CA-08.2. Sem bibliotecas novas. Primeiro liste arquivos e alterações; depois gere o código com tratamento de erro e explique como comprovar.
- **O que a IA entregou:** `seguranca.js` (hash de senha com scrypt, tokens, leitura de cookie, limite de tentativas), `scripts/criar-usuario.js` (`npm run criar-usuario`), rotas `/api/login`, `/api/sair`, `/api/eu` e o "porteiro" que protege todas as outras rotas, a migração `003-sessoes-login.sql` e a tela de login no `app.js`.
- **Verificação feita pela IA:** funções de segurança testadas no Node (senha certa/errada, dois hashes diferentes para a mesma senha, bloqueio após 5 erros); consultas de usuário e sessão testadas no PostgreSQL (criar, trocar senha encerra sessões, sessão vencida recusada); telas testadas no navegador automático (login, senha errada, sessão vencida no meio do uso volta ao login, sair, bloqueio).
- **Decisões:**
  - **Nenhuma biblioteca nova:** tudo com o módulo `crypto`, que já vem no Node.js.
  - A senha é guardada como **hash scrypt com sal**; o "crachá" da sessão é guardado só como **hash SHA-256**. Se o banco vazar, nem senhas nem crachás servem.
  - Cookie **HttpOnly** (o JavaScript da página não lê) e **SameSite=Lax**; **Secure** só no servidor publicado (`COOKIE_SEGURO=true`).
  - A mesma mensagem para e-mail OU senha errados, para não revelar qual dos dois existe.
  - Não existe tela de cadastro de usuária: o acesso é criado pelo terminal (`npm run criar-usuario`), porque o sistema tem uma única usuária.
  - `/api/saude` continua aberta, porque o Docker vai usá-la para saber se o sistema está de pé (Etapa 06).
- **Minha execução:** [resultado dos testes T-36 a T-41]
- **Minha revisão:** [o que entendi ou mudei]

## Etapa 06 — Ambiente Docker e execução reproduzível

- **Data:** 23/11/2026
- **Prompt usado (do roteiro do Prof. Bruno):**
  > Atue como engenheiro DevOps. Avalie a stack e a árvore de arquivos do sistema. Crie Dockerfile, compose.yaml, .env.example, healthchecks e volumes necessários. Explique os serviços, riscos e comandos para build, subida, verificação, logs e parada. Não inclua credenciais reais e não afirme que o ambiente funciona sem execução comprovada.
- **O que a IA entregou:** `05 - Desenvolvimento/Dockerfile` (Node 22 Alpine, `npm ci`, usuário sem privilégio, healthcheck em `/api/saude`), `.dockerignore` (sem `node_modules` e sem `.env`), `06 - Docker/compose.yaml` com os serviços `db` e `app` (o `app` só liga depois do banco *healthy*; dados num volume) e o `README.md` com instalação, comandos, migrações e problemas comuns.
- **Verificação feita pela IA:** `docker compose config` validou o arquivo e mostrou que, dentro do Docker, o servidor usa `PGHOST=db` e porta 5432. **A IA não conseguiu construir nem ligar os contêineres** (sem Docker no ambiente dela): a comprovação é a minha execução (T-42 a T-47).
- **Decisões:**
  - Versão Docker em **http://localhost:8080** e versão de desenvolvimento em **http://localhost:3000**, para as duas poderem rodar juntas.
  - O `Dockerfile` fica **junto do código** (`05 - Desenvolvimento`), porque é o código que ele empacota; o `compose.yaml` fica em `06 - Docker`.
  - Senhas entram pelo `env_file` na hora de ligar, **nunca dentro da imagem**.
  - Risco documentado: `docker compose down -v` **apaga os dados**; o README traz o comando de backup (`pg_dump`).
- **Minha execução (23/11/2026):** `docker compose up -d --build` construiu a imagem `salao-lucy-app` em ~16 s; `docker compose ps` mostrou **db e app (healthy)**; o sistema abriu em http://localhost:8080 com os mesmos dados; `/api/saude` respondeu `{"servidor":"ok","banco":"ok",…,"servicos":5}`. **Teste de persistência:** `docker compose down` (o site saiu do ar) → `docker compose up -d` → os dados continuavam lá (RNF-07). Único tropeço: colei `docker compose ps` duas vezes na mesma linha e o Docker não entendeu — erro de digitação, não do sistema.
- **Ainda não executados:** T-46 (instalação limpa) e T-47 (conferir `.env` fora do Git).
- **Minha revisão:** [o que entendi ou mudei]

## Etapa 07 — Decisão de deploy

- **Data:** 23/11/2026
- **O que pedi:** opções para colocar o sistema no ar.
- **O que a IA fez:** pesquisou os planos gratuitos **atuais** do Render e do Neon (em vez de responder de memória) e apresentou 3 opções, com custo e limites: A) Render + Neon; B) só Render (banco expira em 30 dias); C) só local + GitHub.
- **Minha decisão:** **C, implantação local**, porque nesta versão o objetivo é a apresentação para o professor e a turma, sem custo e sem expor dados de saúde. A opção A ficou documentada como próxima versão, com um checklist de segurança (`08 - Deploy/deploy.md`).
- **Repositório:** público para a apresentação (o `.env` nunca entrou no Git — T-47).

## Etapa 04 — Design System

- **Data:** 23/11/2026
- **Prompt usado (baseado no roteiro do Prof. Bruno):**
  > Atue como especialista em Design Systems. A partir do mockup aprovado, documente cores, tipografia, espaçamentos, componentes, estados, acessibilidade, responsividade e exemplos de CSS. Produza tokens reutilizáveis e um guia de implementação em Markdown. Preserve a identidade aprovada.
- **O que a IA entregou:** `03 - Designer System/tokens.css`, `design-system.md` e `guia-visual.html`.
- **Verificação:** a IA **calculou** o contraste de cada par de cores e encontrou 2 falhas no mockup (contorno de foco 2,3:1 e borda dos campos 1,9:1, abaixo do mínimo de 3:1). As duas foram corrigidas no mockup v0.2.
- **Minha revisão:** [o que você conferiu ou mudou]
