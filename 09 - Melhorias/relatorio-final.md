# Relatório final — Lucy Cabeleireira

**Etapa 08 — Resultados, melhorias e retrospectiva**
**Responsável:** Andreza Pinho Lobo Martins · **Data:** 23/11/2026
**Regra usada:** cada número abaixo foi **contado nos arquivos do projeto**, não estimado. O que não foi feito está dito.

---

## 1. Planejado × realizado

| Item                            | Planejado        | Realizado                                                                                                                                 | Onde conferir                                       |
| ------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Requisitos funcionais (RF)      | 15 (v0.1)        | **17 entregues** (15 + RF-16 e RF-17 criados depois da conversa com a Lucy)                                                               | `01 - Requisitos/02-especificacao-de-requisitos.md` |
| Requisitos não funcionais (RNF) | 10               | **8 comprovados**, 2 sem medição (RNF-09 desempenho com 500 clientes; RNF-08 instalação limpa em outra máquina)                           | `07 - Testes/casos-de-teste.md`                     |
| Regras de negócio (RN)          | 8                | 8 implementadas; **4 ainda sem confirmação da Lucy** (RN-03, RN-05, RN-06, RN-08)                                                         | especificação, seção 6                              |
| Histórias de usuário            | 8                | 8 implementadas                                                                                                                           | especificação, seção 4                              |
| Telas                           | 3 abas do mockup | Login, Agenda (resumo do dia, para finalizar, outro dia), Clientes (hora de voltar, ficha), Tinturas, + janelas de finalizar e intervalos | sistema                                             |
| Docker                          | Banco + servidor | **Comprovado**: os dois _healthy_, dados mantidos após `down`/`up`                                                                        | T-42 a T-45                                         |
| Deploy                          | Local ou remoto  | **Local** (decisão registrada) + código no GitHub                                                                                         | `08 - Deploy/deploy.md`                             |

### Testes

|                                   | Quantidade                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------- |
| Casos de teste propostos          | **47**                                                                           |
| Executados e aprovados            | **23** (com print em `07 - Testes/evidencias`)                                   |
| Reprovados na primeira execução   | **1** (T-18, WhatsApp — reprovou 2 vezes e passou após as correções D-04 e D-05) |
| Ainda não executados              | **24**                                                                           |
| Defeitos encontrados e corrigidos | **6** (D-01 a D-06), **4 deles encontrados nos meus testes manuais**             |

### Outros números do projeto

|                                                           |                                                            |
| --------------------------------------------------------- | ---------------------------------------------------------- |
| Versões da especificação                                  | 4 (v0.1 → v0.4), cada mudança com motivo na seção 7        |
| Migrações do banco                                        | 3                                                          |
| Rotas da API                                              | 22                                                         |
| Linhas de código (servidor, segurança, telas, CSS, banco) | ~1.880                                                     |
| Commits no GitHub                                         | ver o contador em https://github.com/plmandreza/salao-lucy |

### Tempo

- **Não foi feita estimativa formal de tempo** no início, então não há "estimado × real" para comparar. _Isso é uma lição (seção 5)._
- Real: ideia e escolha do problema em **19/11/2026**; entrevista, requisitos, mockup, Design System, código, Docker e GitHub em **23/11/2026**. Pelos horários dos prints, as Etapas 05 a 07 (código, Docker e deploy) ocorreram aproximadamente entre **13h40 e 16h00** desse dia.

---

## 2. Três dificuldades reais (slide 13)

| #   | Dificuldade                                                                                                                                                                                                                                                                                                                                                                                 | Impacto                                                   | Como foi resolvida                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **O servidor não conectava no banco do Docker.** O erro veio em português ("autenticação do tipo senha falhou"), mas o PostgreSQL do Docker fala inglês: havia **outro PostgreSQL instalado no Windows** usando a porta 5432. Depois, a correção revelou um **erro do código gerado pela IA**: o `compose.yaml` passava a porta do Node para o banco, que passou a escutar na porta errada. | Sistema parado no início da Etapa 05                      | Banco do Docker na porta **5433** do PC e `PGPORT: "5432"` fixo dentro do contêiner. Diagnóstico pela pista do idioma e pelos **logs** (`docker compose logs db`). Prints em `evidencias/dificuldades`. |
| 2   | **A realidade da Lucy era diferente do que eu imaginava.** Eu achava que o problema principal era estoque; ela disse que era **confirmar e cancelar horários**. Depois, descobri que ela **não usa o celular durante os atendimentos** (anota no papel e passa no fechamento).                                                                                                              | Requisitos e telas tiveram de mudar no meio da construção | Especificação revisada 3 vezes (v0.2 a v0.4); criados o **resumo do dia** (com as alergias das próximas clientes) e a lista **"Para finalizar"**.                                                       |
| 3   | **Integração com o WhatsApp.** O emoji da mensagem chegou como "�", e a agenda continuava usando o telefone antigo depois de editar a ficha. Quase enviei mensagem para um número que poderia ser de uma pessoa real.                                                                                                                                                                       | Mensagem errada para a cliente; risco de privacidade      | Mensagem sem emoji (D-04), agenda recarregada ao salvar a ficha (D-05) e regra de usar **DDD 00** (inexistente) em todos os dados de teste.                                                             |

---

## 3. Três melhorias priorizadas (slide 16)

Critérios: **valor** para a Lucy, **esforço** de construção, **risco**.

| Prioridade | Melhoria                                                                                                 | Tipo                            | Valor | Esforço | Risco                                                                 | Benefício                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------- | ------------------------------- | ----- | ------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **1**      | **Publicar na internet** (Render + Neon) para a Lucy usar no **celular dela**                            | Funcionalidade (infraestrutura) | Alto  | Médio   | Médio — dados de saúde na internet; seguir o checklist do `deploy.md` | É o que transforma o projeto em ferramenta de uso real: hoje ela só funciona no meu computador                      |
| **2**      | **Folha do dia para imprimir**: clientes, horários, **alergias** e um espaço para anotar os tubos usados | Melhoria de UX                  | Alto  | Baixo   | Baixo                                                                 | Combina com o jeito real da Lucy (papel durante o expediente) e deixa a alergia à vista **sem precisar do celular** |
| **3**      | **Testes automatizados da API** (finalizar, choque de horário, login) e execução dos 24 testes pendentes | Dívida técnica                  | Médio | Médio   | Baixo                                                                 | Garante que as próximas mudanças não quebrem o que já funciona                                                      |

**Também anotado para o futuro** (projeto do outro professor e versões seguintes): a cliente marcar sozinha por um link; lembretes automáticos pelo WhatsApp; pagamento (Pix/cartão); fotos de antes e depois; assistente Remy.

---

## 4. O que ficou pendente (dito com honestidade)

- **Validação com a Lucy:** o teste do mockup com ela (roteiro da Etapa 03) **não foi feito**, e ela ainda **não usou o sistema real**. → _Fazer antes da apresentação, se possível (15 minutos)._
- **Perguntas para a Lucy** ainda sem resposta: intervalo de retorno de cada serviço, bloquear ou só avisar quando falta tintura (RN-03), antecedência da "hora de voltar" (RN-05), texto da mensagem (RN-06), regra de cancelamento (RN-08).
- **24 casos de teste** propostos ainda não executados (lista em `casos-de-teste.md`).
- **RNF-09** (desempenho com 500 clientes) não medido.
- **Instalação limpa** em outro computador (T-46) não testada.

---

## 5. Lições aprendidas (slide 17)

**Técnicas**

- O **banco também é uma camada de proteção**: regras como "uma cliente por vez" e "estoque nunca negativo" ficaram no PostgreSQL e seguram mesmo se o código errar.
- **Transação** ("tudo ou nada") é o que permite finalizar um atendimento sem deixar o estoque pela metade.
- **Logs** e a mensagem de erro exata resolvem problemas que parecem mistério — a pista do idioma mostrou que havia outro banco no Windows.
- Docker torna o sistema **reproduzível**: um comando liga tudo e os dados sobrevivem a desligar.

**Humanas**

- **Ouvir a usuária muda o projeto.** Duas hipóteses minhas caíram (a prioridade e o uso do celular).
- Testar como usuária encontra o que a IA e os testes automáticos não encontram (clicar fora da janela, ícone sem texto, número antigo no WhatsApp).
- Registrar decisões (versões, defeitos, prompts) facilita explicar o projeto depois.

**Uso responsável de IA**

- A IA **errou** (porta no `compose.yaml`, duração obrigatória contra o requisito, ícone sem texto) — **executar, testar e ler os logs** foi o que revelou os erros.
- Pedi à IA que **pesquisasse** informações atuais (planos de hospedagem, LGPD) em vez de responder de memória, e que separasse **fato, interpretação e recomendação**.
- **Dados reais exigem cuidado:** números de teste inexistentes (DDD 00), senha fora do Git, alergia tratada como dado de saúde.
- Quem decidiu foi a desenvolvedora: escopo, mudanças de requisito, LGPD, deploy local.
