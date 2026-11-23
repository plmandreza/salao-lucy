# Deploy — Lucy Cabeleireira

**Etapa 07 — Testes, qualidade e deploy**
**Responsável:** [Seu nome] · **Data:** 23/11/2026

---

## 1. Decisão: implantação **local** com Docker

O sistema é implantado e demonstrado **no computador da desenvolvedora**, com Docker, e o código fica disponível no **GitHub**. O roteiro do Prof. Bruno permite: *"Implantar em ambiente local ou remoto e testar a jornada fim a fim"*.

| | |
|---|---|
| **Endereço da demonstração** | http://localhost:8080 |
| **Repositório** | https://github.com/plmandreza/salao-lucy |
| **Como rodar** | `README.md` → "Como rodar (com Docker)" |
| **Comprovação** | Testes T-42 a T-45 (`07 - Testes/evidencias`) |

### Por que local (e não na internet) nesta versão

1. **O objetivo agora é a apresentação** para o professor e a turma.
2. **Sem custo e sem risco:** as fichas guardam **alergias** (dado de saúde, sensível pela LGPD). Colocar na internet exige cuidados extras (seção 4) antes de receber dados reais.
3. **As opções gratuitas têm limites** que precisariam ser explicados à Lucy (seção 3).

**Consequência aceita:** nesta versão a Lucy **não usa no celular dela**. Isso é o primeiro item das próximas versões (slide 16).

---

## 2. Roteiro da demonstração (45 a 60 segundos)

Deixar **tudo aberto antes** de começar a apresentação:

1. Docker Desktop ligado → `docker compose up -d` em `06 - Docker` → `docker compose ps` (healthy).
2. Navegador em http://localhost:8080, **já logada**, na aba Agenda.
3. Ter pelo menos: uma cliente **com alergia** marcada para **hoje**, e uma tintura perto do mínimo.

**Jornada:** *entrar → executar a operação principal → conferir o resultado*

| Tempo | Ação | O que mostrar |
|---|---|---|
| 0–10 s | Agenda | Resumo do dia com **"⚠️ Atenção às alergias"** |
| 10–25 s | **Finalizar** o atendimento | Alergia no topo da janela; marcar 1 tubo de tintura |
| 25–40 s | Aba **Tinturas** | O estoque **baixou sozinho** e apareceu o **alerta** |
| 40–55 s | **Ficha** da cliente | O atendimento entrou no **histórico** |

### Plano B (contingência)

- **Gravação de tela** da jornada acima (Win + Alt + R grava a tela no Windows; ou a Ferramenta de Captura → Gravar), salva em `10 - Apresentacao`.
- Os **prints de evidência** em `07 - Testes/evidencias`.
- Se o Docker não subir no dia: rodar `npm run dev` (http://localhost:3000) com `docker compose up -d db`.

> A gravação é só contingência: **não substitui** a entrega executável.

---

## 3. Opções de publicação analisadas (para a próxima versão)

Pesquisa feita em 23/11/2026. **Planos gratuitos mudam: conferir de novo antes de publicar.**

| Opção | Como funciona | Ponto forte | Limitação |
|---|---|---|---|
| **A. Render (servidor) + Neon (banco)** — *recomendada* | Render roda o mesmo Dockerfile; Neon guarda o PostgreSQL | Gratuito, com HTTPS; o banco gratuito do Neon não expira (1 GB por projeto) | O serviço gratuito do Render "dorme" após 15 min sem acesso e leva cerca de 1 min para acordar |
| **B. Render (servidor + banco)** | Tudo no Render | Mais simples de montar | O banco gratuito do Render **expira em 30 dias** — não serve para uso real |
| **C. Local + GitHub** — *escolhida agora* | Docker no computador | Sem custo, sem risco | Não funciona no celular da Lucy |

Fontes: documentação do Render (render.com/docs/free) e do Neon (neon.com, plano Free).

---

## 4. Checklist antes de publicar na internet (próxima versão)

- [ ] `COOKIE_SEGURO=true` no ambiente publicado (cookie só por HTTPS).
- [ ] `app.set('trust proxy', 1)` no `server.js`, para o limite de tentativas de login enxergar o IP real atrás do servidor do Render.
- [ ] Conexão com o banco por SSL (`PGSSLMODE=require`, exigido pelo Neon).
- [ ] Senhas **fortes e novas** (banco e login da Lucy) — nunca as de teste.
- [ ] Rodar o `schema.sql` no banco novo e criar a usuária da Lucy.
- [ ] **Backup** periódico (`pg_dump`) guardado fora do servidor.
- [ ] Conversar com a Lucy sobre o aviso às clientes de que as alergias ficam registradas (LGPD, RNF-06).
- [ ] Testar a jornada completa **no celular da Lucy**.
