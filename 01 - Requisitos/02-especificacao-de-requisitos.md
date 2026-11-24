# Especificação de Requisitos — Lucy Cabeleireira

**Etapa 02 — Levantamento e especificação de requisitos**
**Responsável:** Andreza Pinho · **Data:** 23/11/2026 · **Versão:** 0.4 (ver histórico de mudanças na seção 7)
**Base:** Documento de Visão v0.1 e entrevista com a Lucy. Nenhum requisito foi criado sem origem nessa base.

**Legenda de prioridade:** 🔴 **Deve ter** (MVP) · 🟡 **Deveria ter** (fazer se der tempo) · ⚪ **Futuro**
**Legenda de situação:** ✅ confirmado com a Lucy · ⚠️ a confirmar

---

## 1. Requisitos Funcionais (RF) — _o que o sistema faz_

### Acesso

| ID    | Requisito                                                                        | Prioridade | Situação                                  |
| ----- | -------------------------------------------------------------------------------- | ---------- | ----------------------------------------- |
| RF-01 | O sistema deve permitir que a Lucy entre com **e-mail e senha** e saia (logout). | 🔴         | ✅ (necessário porque há dados sensíveis) |

### Agenda

| ID    | Requisito                                                                                                                                        | Prioridade | Situação                   |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | -------------------------- |
| RF-02 | Cadastrar agendamento com **cliente, data, hora de início, serviço(s)**, duração estimada (opcional) e observação. Status inicial: **pendente**. | 🔴         | ✅                         |
| RF-03 | Exibir a agenda de **hoje e amanhã**, em ordem de horário, com o status de cada agendamento.                                                     | 🔴         | ✅                         |
| RF-04 | Alterar o status do agendamento para **confirmado** ou **cancelado**.                                                                            | 🔴         | ✅ prioridade nº 1 da Lucy |
| RF-05 | Gerar um botão que abre o **WhatsApp da cliente** com a mensagem de confirmação já escrita.                                                      | 🔴         | ✅ (WhatsApp comum)        |
| RF-06 | **Remarcar** um agendamento (alterar data e hora).                                                                                               | 🟡         | ✅                         |

### Clientes e fichas

| ID    | Requisito                                                                                                                                                                       | Prioridade | Situação                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------- |
| RF-07 | Cadastrar, editar e excluir cliente: **nome, telefone (WhatsApp), alergias** e **anotações**.                                                                                   | 🔴         | ✅ _(alterado na v0.2 — ver seção 7)_       |
| RF-08 | **Buscar** cliente pelo nome.                                                                                                                                                   | 🔴         | ✅                                          |
| RF-09 | Exibir a ficha da cliente com as **alergias em destaque no topo** e o **histórico** de atendimentos.                                                                            | 🔴         | ✅                                          |
| RF-10 | **Finalizar atendimento**: registrar no histórico a data, o(s) serviço(s) e as tinturas usadas (quantidade de tubos), mudar o status para **concluído** e **baixar o estoque**. | 🔴         | ✅                                          |
| RF-11 | Exibir a lista **"Hora de voltar"**: clientes cuja data prevista de retorno está próxima ou já passou, com botão de WhatsApp para lembrete.                                     | 🔴         | ✅ (_"me lembro, nunca passo pra cliente"_) |

### Serviços e tinturas

| ID    | Requisito                                                                                             | Prioridade | Situação                                   |
| ----- | ----------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------ |
| RF-12 | Cadastrar serviços com **intervalo de retorno em dias** (ex.: tintura = X dias), editável pela Lucy.  | 🔴         | ⚠️ intervalos a confirmar                  |
| RF-13 | Cadastrar e editar tinturas: **nome/código (ex.: 7.0), marca, quantidade de tubos e estoque mínimo**. | 🔴         | ✅ (_"Tubo e também confirmo quantidade"_) |
| RF-14 | Registrar **entrada de tubos** (compra) para repor o estoque.                                         | 🔴         | ✅                                         |
| RF-15 | Exibir **alerta** das tinturas com quantidade igual ou abaixo do mínimo.                              | 🔴         | ✅                                         |

### Uso fora do horário de atendimento _(acrescentados na v0.4)_

| ID    | Requisito                                                                                                                                                                                                          | Prioridade | Situação                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | --------------------------------------------------- |
| RF-16 | Exibir a lista **"Para finalizar"**: atendimentos que já começaram e não foram finalizados nem cancelados, **de qualquer dia**, para a Lucy registrar **no fechamento do salão**, a partir das anotações no papel. | 🔴         | ✅ (_"anotar no papel e passar depois"_)            |
| RF-17 | Exibir um **resumo do dia** no topo da agenda com as **próximas clientes a partir de agora** e **quem delas tem alergia**: de manhã mostra o dia todo; no almoço, só a tarde.                                      | 🔴         | ✅ (_"antes de abrir o salão e na hora do almoço"_) |

---

## 2. Requisitos Não Funcionais (RNF) — _como o sistema deve ser_

Cada RNF tem uma **medida** para poder ser testado. "Rápido" ou "seguro" sem número não vale.

| ID     | Qualidade (ISO 25010) | Requisito                                                                                                                                      | Como medir                                                                                                       |
| ------ | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| RNF-01 | Usabilidade           | Funcionar no **celular e no computador**                                                                                                       | Todas as telas usáveis com 360 px de largura, sem rolagem horizontal                                             |
| RNF-02 | Usabilidade           | Ações principais com poucos toques                                                                                                             | Confirmar um horário em no máximo **2 toques** a partir da agenda                                                |
| RNF-03 | Acessibilidade        | Leitura fácil                                                                                                                                  | Contraste mínimo de **4,5:1** (WCAG AA); botões com no mínimo **44 px** de altura                                |
| RNF-04 | Segurança             | Só a Lucy acessa                                                                                                                               | Todas as páginas e rotas, exceto o login, exigem autenticação; senha guardada com **hash** (nunca em texto puro) |
| RNF-05 | Segurança             | Nenhum segredo no Git                                                                                                                          | Senhas e chaves só no arquivo `.env`, que fica fora do repositório; o repositório tem apenas `.env.example`      |
| RNF-06 | Privacidade (LGPD)    | Alergias são **dado sensível**. Base legal: **art. 11, II, "e"** da LGPD — proteção da incolumidade física da cliente (evitar reação alérgica) | A alergia é usada só no atendimento; só a Lucy acessa (RNF-04); excluir a cliente apaga todos os dados dela      |
| RNF-07 | Confiabilidade        | Dados não se perdem                                                                                                                            | Os dados continuam lá depois de reiniciar o sistema (`docker compose down` e `up`)                               |
| RNF-08 | Portabilidade         | Roda em outro computador                                                                                                                       | Sobe com `docker compose up -d --build` seguindo o README, em uma máquina limpa                                  |
| RNF-09 | Desempenho            | Resposta rápida                                                                                                                                | Agenda e ficha abrem em até **2 segundos** com 500 clientes cadastradas (ambiente local)                         |
| RNF-10 | Localização           | Padrão brasileiro                                                                                                                              | Interface em português; datas em dd/mm/aaaa; telefone com DDD                                                    |

---

## 3. Regras de Negócio (RN) — _as regras do salão que o sistema precisa respeitar_

| ID    | Regra                                                                                                                                                                                                                                                                                                | Origem                                             | Situação                                                                              |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| RN-01 | **Uma cliente por vez**: não pode haver dois agendamentos ativos (pendente ou confirmado) com horários sobrepostos. **Sem duração informada**, o horário ocupa só o minuto de início: o sistema bloqueia outra cliente no mesmo horário de início, mas não consegue saber até quando a cliente fica. | _"Atendo uma cliente por vez"_                     | ✅ _(ajustada na v0.3)_                                                               |
| RN-02 | Agendamento **cancelado** não aparece na agenda do dia.                                                                                                                                                                                                                                              | Visão, critério 2                                  | ✅                                                                                    |
| RN-03 | O estoque de tintura **não pode ficar negativo**. Se faltar, o sistema avisa e pede para atualizar o estoque.                                                                                                                                                                                        | Lógica do estoque                                  | ⚠️ A Lucy _"sempre executa o serviço"_: confirmar se prefere ser avisada ou bloqueada |
| RN-04 | A tintura entra em **alerta** quando a quantidade for **menor ou igual ao mínimo**.                                                                                                                                                                                                                  | Visão, critério 5                                  | ✅                                                                                    |
| RN-05 | **Data prevista de retorno** = data do último atendimento daquele serviço + intervalo do serviço. A cliente aparece em "Hora de voltar" **7 dias antes** dessa data ou depois dela.                                                                                                                  | _"qdo está próximo ou atrasado"_                   | ⚠️ antecedência de 7 dias a confirmar                                                 |
| RN-06 | Mensagem de confirmação padrão: _"Olá, {nome}! Aqui é a Lucy. Estou confirmando seu horário {dia} às {hora} para {serviço}. Posso confirmar?"_ (sem emoji: ver D-04)                                                                                                                                 | RF-05                                              | ⚠️ a Lucy aprova o texto                                                              |
| RN-07 | Telefone com WhatsApp é **obrigatório** no cadastro da cliente.                                                                                                                                                                                                                                      | Marcação é por WhatsApp/telefone                   | ✅                                                                                    |
| RN-08 | Cancelamento: a Lucy pode cancelar a qualquer momento, sem multa nem prazo mínimo.                                                                                                                                                                                                                   | _"Não tem tolerância aceitável pelo cancelamento"_ | ⚠️ significado a confirmar                                                            |

---

## 4. Histórias de usuário e critérios de aceitação

**Formato da história:** _Como [quem], quero [o quê], para [por quê]._
**Formato do critério:** _Dado [situação], quando [ação], então [resultado esperado]._ Cada critério vira um teste na Etapa 07.

### HU-01 — Confirmar horário (RF-04, RF-05)

**Como** Lucy, **quero** confirmar o horário com a cliente pelo WhatsApp em poucos toques, **para** não esquecer e não depender da memória.

- **CA-01.1** Dado um agendamento _pendente_ da Maria amanhã às 14h, quando a Lucy toca em "WhatsApp", então abre o WhatsApp no número da Maria com a mensagem de confirmação preenchida com o dia, a hora e o serviço.
- **CA-01.2** Dado o mesmo agendamento, quando a Lucy toca em "Confirmar", então o status passa a ser _confirmado_ e continua assim depois de recarregar a página.

### HU-02 — Cancelar horário (RF-04, RN-02)

**Como** Lucy, **quero** cancelar um horário, **para** liberar a agenda.

- **CA-02.1** Dado um agendamento ativo hoje, quando a Lucy cancela, então ele sai da agenda de hoje e o horário fica livre.

### HU-03 — Não marcar duas clientes no mesmo horário (RF-02, RN-01)

**Como** Lucy, **quero** que o sistema me avise se eu tentar marcar duas clientes ao mesmo tempo, **para** não me embananar.

- **CA-03.1** Dado um agendamento ativo hoje das 14h às 15h, quando a Lucy tenta marcar outra cliente às 14h30, então o sistema recusa e mostra _"Já existe cliente nesse horário"_.
- **CA-03.2** Dado o mesmo agendamento **cancelado**, quando a Lucy marca outra cliente às 14h30, então o agendamento é aceito.

### HU-04 — Ver alergia antes do atendimento (RF-07, RF-09, RNF-06)

**Como** Lucy, **quero** ver as alergias da cliente assim que abro a ficha, **para** não aplicar um produto que cause reação.

- **CA-04.1** Dado a cliente Ana com a alergia "PPD (tintura)", quando a Lucy abre a ficha, então aparece um aviso em destaque _"⚠️ Alergia: PPD (tintura)"_ **acima** de todas as outras informações.
- **CA-04.2** Dado a ficha da Ana com a alergia "PPD", quando a Lucy edita a ficha e apaga o texto da alergia, então o aviso vermelho deixa de aparecer na ficha e na lista.

### HU-05 — Finalizar atendimento e baixar o estoque (RF-10, RN-03, RN-04)

**Como** Lucy, **quero** que o estoque de tinturas se atualize quando eu termino um atendimento, **para** saber quantos tubos realmente tenho.

- **CA-05.1** Dado a tintura 7.0 com 3 tubos e mínimo 1, quando a Lucy finaliza um atendimento usando 1 tubo de 7.0, então o estoque passa para **2** e o atendimento aparece no histórico da cliente.
- **CA-05.2** Dado a tintura 7.0 com 2 tubos, quando a Lucy finaliza um atendimento usando 1 tubo, então o estoque passa para **1** e a 7.0 aparece no **alerta de estoque baixo**.
- **CA-05.3** Dado a tintura 7.0 com 0 tubos, quando a Lucy tenta usar 1 tubo, então o sistema avisa _"Estoque insuficiente de 7.0 — atualize o estoque"_ e o saldo não fica negativo.

### HU-06 — Lembrar a cliente de voltar (RF-11, RF-12, RN-05)

**Como** Lucy, **quero** ver quais clientes estão na hora de voltar, **para** chamá-las em vez de só lembrar comigo mesma.

- **CA-06.1** Dado o serviço Tintura com intervalo de 30 dias e a cliente Bia com a última tintura há 25 dias, quando a Lucy abre "Hora de voltar", então a Bia aparece na lista com o botão de WhatsApp.
- **CA-06.2** Dado a cliente Carla com a última tintura há 10 dias, quando a Lucy abre "Hora de voltar", então a Carla **não** aparece.

### HU-07 — Repor estoque (RF-13, RF-14)

**Como** Lucy, **quero** registrar os tubos que comprei, **para** o estoque ficar certo.

- **CA-07.1** Dado a tintura 7.0 com 1 tubo, quando a Lucy registra a entrada de 4 tubos, então o estoque passa para **5** e a 7.0 sai do alerta.

### HU-08 — Acesso protegido (RF-01, RNF-04)

**Como** Lucy, **quero** que só eu consiga ver as fichas, **para** proteger os dados das minhas clientes.

- **CA-08.1** Dado alguém sem login, quando tenta abrir a agenda ou a ficha pelo endereço, então é levado para a tela de login.
- **CA-08.2** Dado uma senha errada, quando a Lucy tenta entrar, então aparece _"E-mail ou senha incorretos"_ e o acesso é negado.

---

## 5. Matriz de rastreabilidade

Liga cada problema ao requisito, à tela, ao código e ao teste. As colunas **Código** e **Teste** serão preenchidas nas Etapas 05 e 07.

| Problema (Visão)                           | Requisitos                               | Tela                      | Código     | Teste                       |
| ------------------------------------------ | ---------------------------------------- | ------------------------- | ---------- | --------------------------- |
| P1 — Confirmar/cancelar horários           | RF-02, RF-03, RF-04, RF-05, RN-01, RN-02 | Agenda                    | _Etapa 05_ | CA-01.x, CA-02.1, CA-03.x   |
| P2 — Clientes não são avisadas para voltar | RF-11, RF-12, RN-05                      | Clientes → Hora de voltar | _Etapa 05_ | CA-06.x                     |
| P3 — Atrasos e organização do dia          | RF-03                                    | Agenda (hoje e amanhã)    | _Etapa 05_ | CA-01.2                     |
| P4 — Fichas perdidas/desatualizadas        | RF-07, RF-08, RF-09, RF-10, RNF-07       | Clientes → Ficha          | _Etapa 05_ | CA-05.1 + teste de reinício |
| P5 — Alergias esquecidas                   | RF-07, RF-09, RNF-06                     | Clientes → Ficha          | _Etapa 05_ | CA-04.x                     |
| P6 — Estoque de tinturas                   | RF-10, RF-13, RF-14, RF-15, RN-03, RN-04 | Tinturas                  | _Etapa 05_ | CA-05.x, CA-07.1            |
| Segurança dos dados                        | RF-01, RNF-04, RNF-05                    | Login                     | _Etapa 05_ | CA-08.x                     |

---

## 6. Pendências para confirmar com a Lucy

1. Intervalo de retorno de cada serviço, em dias (RF-12).
2. Se faltar tintura, ela prefere ser **avisada e bloqueada** ou **avisada e liberada**? (RN-03)
3. Ela quer ver a cliente na lista "Hora de voltar" quantos dias antes? (RN-05)
4. Ela aprova o texto da mensagem de confirmação? (RN-06)
5. O que ela quis dizer com "não tem tolerância aceitável pelo cancelamento"? (RN-08)
6. Ela vai usar mais no celular ou no computador? (RNF-01)

---

## 7. Histórico de mudanças

| Versão | Data       | Mudança                                                                                                        | Motivo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Decidido por         |
| ------ | ---------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| 0.1    | 23/11/2026 | Primeira versão                                                                                                | Entrevista com a Lucy                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Andreza Pinho        |
| 0.2    | 23/11/2026 | **Removida a exigência de consentimento** para guardar alergias (RF-07, RNF-06, CA-04.2)                       | Durante os testes da Etapa 05, percebi que a caixinha de consentimento **não provava nada** (só registrava que a Lucy disse que a cliente autorizou) e criava trabalho no dia a dia. A LGPD permite tratar dado sensível sem consentimento para a **proteção da incolumidade física** do titular (art. 11, II, "e"), que é exatamente a finalidade de anotar a alergia: evitar uma reação no atendimento. A proteção continua por outros meios: acesso só com login e exclusão completa dos dados. _Observação: é uma interpretação feita no contexto acadêmico, não um parecer jurídico._ | Andreza Pinho        |
| 0.3    | 23/11/2026 | **Duração do agendamento passa a ser realmente opcional** (RF-02) e a RN-01 explica o que acontece sem duração | No teste, percebi que o sistema **exigia** a duração, mas o RF-02 já dizia "duração estimada (opcional)": uma **inconsistência entre requisito e código**. Corrigido no banco (migração `002-duracao-opcional.sql`), no servidor e na tela. Limitação aceita: sem duração, o sistema só bloqueia outra cliente no **mesmo horário de início**.                                                                                                                                                                                                                                             | Andreza Pinho        |
| 0.4    | 23/11/2026 | **Acrescentados RF-16 (Para finalizar) e RF-17 (resumo do dia)**                                               | A Lucy informou que **não usa o celular durante os atendimentos**: usa **de manhã e no almoço** para ver quem vem e quem tem alergia, e **no fechamento** passa os tubos que anotou no papel. A hipótese H1 da visão caiu. O sistema foi pensado para uso "na hora", então foi preciso permitir finalizar depois (de qualquer dia) e mostrar as alergias das próximas clientes.                                                                                                                                                                                                            | Lucy + Andreza Pinho |
