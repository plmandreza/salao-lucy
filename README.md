# Lucy Cabeleireira

Sistema web para o salão da Lucy: **agenda** com confirmação pelo WhatsApp, **fichas de clientes** com alergias em destaque e **estoque de tinturas** com baixa automática ao finalizar o atendimento.

Projeto acadêmico de Vibe Coding — Graduação em ADS · Prof. Me. Bruno Rodrigues · Andreza Pinho Lobo Martins · 2026

**Repositório:** https://github.com/plmandreza/salao-lucy · **Demonstração:** local, com Docker (ver abaixo e `08 - Deploy/deploy.md`)

| Camada             | Tecnologia                                                   |
| ------------------ | ------------------------------------------------------------ |
| Telas (frontend)   | HTML, CSS e JavaScript puros (`05 - Desenvolvimento/public`) |
| Servidor (backend) | Node.js 22 + Express 5 (`05 - Desenvolvimento/server.js`)    |
| Banco de dados     | PostgreSQL 16 (`05 - Desenvolvimento/db/schema.sql`)         |
| Ambiente           | Docker + Docker Compose (`06 - Docker/compose.yaml`)         |

---

## Como rodar (com Docker) — jeito recomendado

Só é preciso ter o **Docker Desktop** instalado e ligado (_Engine running_). Não precisa instalar Node.js nem PostgreSQL.

**1. Crie o arquivo de configuração** (só na primeira vez):

```bash
cd "05 - Desenvolvimento"
cp .env.example .env
```

Abra o `.env` e troque as **duas** ocorrências de `troque-esta-senha` pela **mesma** senha (só letras e números).

**2. Ligue o sistema:**

```bash
cd "../06 - Docker"
docker compose up -d --build
```

Na primeira vez demora alguns minutos (baixa o Node.js e o PostgreSQL).

**3. Confira se está tudo de pé:**

```bash
docker compose ps
```

Os dois serviços (`db` e `app`) devem aparecer como **(healthy)**.

**4. Crie o acesso da Lucy** (só na primeira vez):

```bash
docker compose exec app node scripts/criar-usuario.js email@exemplo.com SenhaComOitoOuMais
```

O mesmo comando, com o mesmo e-mail, serve para **trocar a senha**.

**5. Abra no navegador:** http://localhost:8080

---

## Comandos do dia a dia (dentro de `06 - Docker`)

| Para…                                          | Comando                                                        |
| ---------------------------------------------- | -------------------------------------------------------------- |
| Ligar (e reconstruir depois de mudar o código) | `docker compose up -d --build`                                 |
| Ver se está funcionando                        | `docker compose ps`                                            |
| Ver o que o servidor está escrevendo           | `docker compose logs -f app` (Ctrl+C sai)                      |
| Ver o diário do banco                          | `docker compose logs db`                                       |
| Testar a saúde do sistema                      | abrir http://localhost:8080/api/saude                          |
| Desligar (os dados **ficam** guardados)        | `docker compose down`                                          |
| ⚠️ Desligar **e apagar todos os dados**        | `docker compose down -v`                                       |
| Fazer cópia de segurança do banco              | `docker compose exec -T db pg_dump -U lucy salao > backup.sql` |

---

## Modo desenvolvimento (para mexer no código)

Usa o banco do Docker e o servidor no seu terminal, que reinicia sozinho a cada alteração.

```bash
cd "06 - Docker"
docker compose up -d db              # liga só o banco
cd "../05 - Desenvolvimento"
npm install                          # só na primeira vez
npm run dev                          # http://localhost:3000
```

Criar ou trocar o acesso nesse modo: `npm run criar-usuario -- email@exemplo.com SenhaComOitoOuMais`

---

## Atualizar um banco que já existia

O `schema.sql` só roda quando o banco é criado **do zero**. Para bancos criados antes de uma mudança, rode as migrações de `05 - Desenvolvimento/db/migracoes`, na ordem (elas podem rodar mais de uma vez sem erro):

```bash
cd "06 - Docker"
docker compose exec -T db psql -U lucy -d salao < "../05 - Desenvolvimento/db/migracoes/001-remover-consentimento.sql"
docker compose exec -T db psql -U lucy -d salao < "../05 - Desenvolvimento/db/migracoes/002-duracao-opcional.sql"
docker compose exec -T db psql -U lucy -d salao < "../05 - Desenvolvimento/db/migracoes/003-sessoes-login.sql"
```

---

## Problemas comuns

| Sintoma                                            | Causa provável                                          | O que fazer                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `port is already allocated`                        | Outro programa usa a porta 8080 ou 5433                 | Feche o outro programa ou troque o primeiro número em `ports` no `compose.yaml`                               |
| "autenticação do tipo senha falhou" (em português) | O servidor conectou num PostgreSQL instalado no Windows | Por isso o banco do Docker usa a porta **5433** no PC; confira `PGPORT=5433` no `.env` (modo desenvolvimento) |
| `app` fica _(unhealthy)_                           | O servidor não conecta no banco                         | `docker compose logs app` e confira as senhas iguais no `.env`                                                |
| Mudei a senha do `.env` e parou de conectar        | O banco grava a senha só na criação                     | Volte a senha antiga ou recrie o banco (`down -v`, **apaga os dados**)                                        |
| Página em branco ou "Faça login" toda hora         | Sessão vencida ou cookie bloqueado                      | Saia e entre de novo; em último caso limpe os cookies de `localhost`                                          |

---

## Organização das pastas

```
salao-lucy/
├── 01 - Requisitos/         visão, requisitos (RF/RNF/RN), histórico de mudanças
├── 02 - mockup/             mockup navegável, fluxos e roteiro de validação
├── 03 - Designer System/    tokens.css, guia visual e regras de interface
├── 04 - Prompt/             registro de uso de IA (prompts, revisões, decisões)
├── 05 - Desenvolvimento/    código: server.js, seguranca.js, public/, db/, Dockerfile
├── 06 - Docker/             compose.yaml (banco + servidor)
├── 07 - Testes/             casos de teste e evidências (prints)
├── 08 - Deploy/             publicação
├── 09 - Melhorias/          próximas versões
├── 10 - Apresentacao/       slides
└── README.md                este arquivo
```

## Segurança

- Senhas e chaves só no `.env`, que **não vai para o Git** (`.gitignore`). O repositório tem apenas o `.env.example`.
- Senhas guardadas com **hash scrypt**; sessões com cookie `HttpOnly` e `SameSite=Lax` (no servidor publicado, `COOKIE_SEGURO=true` para exigir HTTPS).
- Todas as rotas de dados exigem login; 5 senhas erradas bloqueiam por 15 minutos.
