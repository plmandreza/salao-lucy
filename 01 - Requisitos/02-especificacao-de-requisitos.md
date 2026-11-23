# Especificação de Requisitos — Lucy Cabeleireira

**Etapa 02 — Levantamento e especificação de requisitos**
**Responsável:** [Seu nome] · **Data:** 23/11/2026 · **Versão:** 0.1 (rascunho para revisão)
**Base:** Documento de Visão v0.1 e entrevista com a Lucy. Nenhum requisito foi criado sem origem nessa base.

**Legenda de prioridade:** 🔴 **Deve ter** (MVP) · 🟡 **Deveria ter** (fazer se der tempo) · ⚪ **Futuro**
**Legenda de situação:** ✅ confirmado com a Lucy · ⚠️ a confirmar

---

## 1. Requisitos Funcionais (RF) — *o que o sistema faz*

### Acesso
| ID | Requisito | Prioridade | Situação |
|---|---|---|---|
| RF-01 | O sistema deve permitir que a Lucy entre com **e-mail e senha** e saia (logout). | 🔴 | ✅ (necessário porque há dados sensíveis) |

### Agenda
| ID | Requisito | Prioridade | Situação |
|---|---|---|---|
| RF-02 | Cadastrar agendamento com **cliente, data, hora de início, serviço(s)**, duração estimada (opcional) e observação. Status inicial: **pendente**. | 🔴 | ✅ |
| RF-03 | Exibir a agenda de **hoje e amanhã**, em ordem de horário, com o status de cada agendamento. | 🔴 | ✅ |
| RF-04 | Alterar o status do agendamento para **confirmado** ou **cancelado**. | 🔴 | ✅ prioridade nº 1 da Lucy |
| RF-05 | Gerar um botão que abre o **WhatsApp da cliente** com a mensagem de confirmação já escrita. | 🔴 | ✅ (WhatsApp comum) |
| RF-06 | **Remarcar** um agendamento (alterar data e hora). | 🟡 | ✅ |

### Clientes e fichas
| ID | Requisito | Prioridade | Situação |
|---|---|---|---|
| RF-07 | Cadastrar, editar e excluir cliente: **nome, telefone (WhatsApp), alergias, anotações** e **consentimento** para guardar dados de saúde. | 🔴 | ✅ |
| RF-08 | **Buscar** cliente pelo nome. | 🔴 | ✅ |
| RF-09 | Exibir a ficha da cliente com as **alergias em destaque no topo** e o **histórico** de atendimentos. | 🔴 | ✅ |
| RF-10 | **Finalizar atendimento**: registrar no histórico a data, o(s) serviço(s) e as tinturas usadas (quantidade de tubos), mudar o status para **concluído** e **baixar o estoque**. | 🔴 | ✅ |
| RF-11 | Exibir a lista **"Hora de voltar"**: clientes cuja data prevista de retorno está próxima ou já passou, com botão de WhatsApp para lembrete. | 🔴 | ✅ (*"me lembro, nunca passo pra cliente"*) |

### Serviços e tinturas
| ID | Requisito | Prioridade | Situação |
|---|---|---|---|
| RF-12 | Cadastrar serviços com **intervalo de retorno em dias** (ex.: tintura = X dias), editável pela Lucy. | 🔴 | ⚠️ intervalos a confirmar |
| RF-13 | Cadastrar e editar tinturas: **nome/código (ex.: 7.0), marca, quantidade de tubos e estoque mínimo**. | 🔴 | ✅ (*"Tubo e também confirmo quantidade"*) |
| RF-14 | Registrar **entrada de tubos** (compra) para repor o estoque. | 🔴 | ✅ |
| RF-15 | Exibir **alerta** das tinturas com quantidade igual ou abaixo do mínimo. | 🔴 | ✅ |

---

## 2. Requisitos Não Funcionais (RNF) — *como o sistema deve ser*

Cada RNF tem uma **medida** para poder ser testado. "Rápido" ou "seguro" sem número não vale.

| ID | Qualidade (ISO 25010) | Requisito | Como medir |
|---|---|---|---|
| RNF-01 | Usabilidade | Funcionar no **celular e no computador** | Todas as telas usáveis com 360 px de largura, sem rolagem horizontal |
| RNF-02 | Usabilidade | Ações principais com poucos toques | Confirmar um horário em no máximo **2 toques** a partir da agenda |
| RNF-03 | Acessibilidade | Leitura fácil | Contraste mínimo de **4,5:1** (WCAG AA); botões com no mínimo **44 px** de altura |
| RNF-04 | Segurança | Só a Lucy acessa | Todas as páginas e rotas, exceto o login, exigem autenticação; senha guardada com **hash** (nunca em texto puro) |
| RNF-05 | Segurança | Nenhum segredo no Git | Senhas e chaves só no arquivo `.env`, que fica fora do repositório; o repositório tem apenas `.env.example` |
| RNF-06 | Privacidade (LGPD) | Alergias são **dado sensível** | A ficha só guarda alergias com o **consentimento marcado**; excluir a cliente apaga todos os dados dela |
| RNF-07 | Confiabilidade | Dados não se perdem | Os dados continuam lá depois de reiniciar o sistema (`docker compose down` e `up`) |
| RNF-08 | Portabilidade | Roda em outro computador | Sobe com `docker compose up -d --build` seguindo o README, em uma máquina limpa |
| RNF-09 | Desempenho | Resposta rápida | Agenda e ficha abrem em até **2 segundos** com 500 clientes cadastradas (ambiente local) |
| RNF-10 | Localização | Padrão brasileiro | Interface em português; datas em dd/mm/aaaa; telefone com DDD |

---

## 3. Regras de Negócio (RN) — *as regras do salão que o sistema precisa respeitar*

| ID | Regra | Origem | Situação |
|---|---|---|---|
| RN-01 | **Uma cliente por vez**: não pode haver dois agendamentos ativos (pendente ou confirmado) com horários sobrepostos. | *"Atendo uma cliente por vez"* | ✅ |
| RN-02 | Agendamento **cancelado** não aparece na agenda do dia. | Visão, critério 2 | ✅ |
| RN-03 | O estoque de tintura **não pode ficar negativo**. Se faltar, o sistema avisa e pede para atualizar o estoque. | Lógica do estoque | ⚠️ A Lucy *"sempre executa o serviço"*: confirmar se prefere ser avisada ou bloqueada |
| RN-04 | A tintura entra em **alerta** quando a quantidade for **menor ou igual ao mínimo**. | Visão, critério 5 | ✅ |
| RN-05 | **Data prevista de retorno** = data do último atendimento daquele serviço + intervalo do serviço. A cliente aparece em "Hora de voltar" **7 dias antes** dessa data ou depois dela. | *"qdo está próximo ou atrasado"* | ⚠️ antecedência de 7 dias a confirmar |
| RN-06 | Mensagem de confirmação padrão: *"Olá, {nome}! Aqui é a Lucy 💇‍♀️ Estou confirmando seu horário {dia} às {hora} para {serviço}. Posso confirmar?"* | RF-05 | ⚠️ a Lucy aprova o texto |
| RN-07 | Telefone com WhatsApp é **obrigatório** no cadastro da cliente. | Marcação é por WhatsApp/telefone | ✅ |
| RN-08 | Cancelamento: a Lucy pode cancelar a qualquer momento, sem multa nem prazo mínimo. | *"Não tem tolerância aceitável pelo cancelamento"* | ⚠️ significado a confirmar |

---

## 4. Histórias de usuário e critérios de aceitação

**Formato da história:** *Como [quem], quero [o quê], para [por quê].*
**Formato do critério:** *Dado [situação], quando [ação], então [resultado esperado].* Cada critério vira um teste na Etapa 07.

### HU-01 — Confirmar horário (RF-04, RF-05)
**Como** Lucy, **quero** confirmar o horário com a cliente pelo WhatsApp em poucos toques, **para** não esquecer e não depender da memória.
- **CA-01.1** Dado um agendamento *pendente* da Maria amanhã às 14h, quando a Lucy toca em "WhatsApp", então abre o WhatsApp no número da Maria com a mensagem de confirmação preenchida com o dia, a hora e o serviço.
- **CA-01.2** Dado o mesmo agendamento, quando a Lucy toca em "Confirmar", então o status passa a ser *confirmado* e continua assim depois de recarregar a página.

### HU-02 — Cancelar horário (RF-04, RN-02)
**Como** Lucy, **quero** cancelar um horário, **para** liberar a agenda.
- **CA-02.1** Dado um agendamento ativo hoje, quando a Lucy cancela, então ele sai da agenda de hoje e o horário fica livre.

### HU-03 — Não marcar duas clientes no mesmo horário (RF-02, RN-01)
**Como** Lucy, **quero** que o sistema me avise se eu tentar marcar duas clientes ao mesmo tempo, **para** não me embananar.
- **CA-03.1** Dado um agendamento ativo hoje das 14h às 15h, quando a Lucy tenta marcar outra cliente às 14h30, então o sistema recusa e mostra *"Já existe cliente nesse horário"*.
- **CA-03.2** Dado o mesmo agendamento **cancelado**, quando a Lucy marca outra cliente às 14h30, então o agendamento é aceito.

### HU-04 — Ver alergia antes do atendimento (RF-07, RF-09, RNF-06)
**Como** Lucy, **quero** ver as alergias da cliente assim que abro a ficha, **para** não aplicar um produto que cause reação.
- **CA-04.1** Dado a cliente Ana com a alergia "PPD (tintura)", quando a Lucy abre a ficha, então aparece um aviso em destaque *"⚠️ Alergia: PPD (tintura)"* **acima** de todas as outras informações.
- **CA-04.2** Dado uma cliente sem consentimento marcado, quando a Lucy tenta salvar uma alergia, então o sistema pede para marcar o consentimento primeiro.

### HU-05 — Finalizar atendimento e baixar o estoque (RF-10, RN-03, RN-04)
**Como** Lucy, **quero** que o estoque de tinturas se atualize quando eu termino um atendimento, **para** saber quantos tubos realmente tenho.
- **CA-05.1** Dado a tintura 7.0 com 3 tubos e mínimo 1, quando a Lucy finaliza um atendimento usando 1 tubo de 7.0, então o estoque passa para **2** e o atendimento aparece no histórico da cliente.
- **CA-05.2** Dado a tintura 7.0 com 2 tubos, quando a Lucy finaliza um atendimento usando 1 tubo, então o estoque passa para **1** e a 7.0 aparece no **alerta de estoque baixo**.
- **CA-05.3** Dado a tintura 7.0 com 0 tubos, quando a Lucy tenta usar 1 tubo, então o sistema avisa *"Estoque insuficiente de 7.0 — atualize o estoque"* e o saldo não fica negativo.

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
- **CA-08.2** Dado uma senha errada, quando a Lucy tenta entrar, então aparece *"E-mail ou senha incorretos"* e o acesso é negado.

---

## 5. Matriz de rastreabilidade

Liga cada problema ao requisito, à tela, ao código e ao teste. As colunas **Código** e **Teste** serão preenchidas nas Etapas 05 e 07.

| Problema (Visão) | Requisitos | Tela | Código | Teste |
|---|---|---|---|---|
| P1 — Confirmar/cancelar horários | RF-02, RF-03, RF-04, RF-05, RN-01, RN-02 | Agenda | *Etapa 05* | CA-01.x, CA-02.1, CA-03.x |
| P2 — Clientes não são avisadas para voltar | RF-11, RF-12, RN-05 | Clientes → Hora de voltar | *Etapa 05* | CA-06.x |
| P3 — Atrasos e organização do dia | RF-03 | Agenda (hoje e amanhã) | *Etapa 05* | CA-01.2 |
| P4 — Fichas perdidas/desatualizadas | RF-07, RF-08, RF-09, RF-10, RNF-07 | Clientes → Ficha | *Etapa 05* | CA-05.1 + teste de reinício |
| P5 — Alergias esquecidas | RF-07, RF-09, RNF-06 | Clientes → Ficha | *Etapa 05* | CA-04.x |
| P6 — Estoque de tinturas | RF-10, RF-13, RF-14, RF-15, RN-03, RN-04 | Tinturas | *Etapa 05* | CA-05.x, CA-07.1 |
| Segurança dos dados | RF-01, RNF-04, RNF-05 | Login | *Etapa 05* | CA-08.x |

---

## 6. Pendências para confirmar com a Lucy

1. Intervalo de retorno de cada serviço, em dias (RF-12).
2. Se faltar tintura, ela prefere ser **avisada e bloqueada** ou **avisada e liberada**? (RN-03)
3. Ela quer ver a cliente na lista "Hora de voltar" quantos dias antes? (RN-05)
4. Ela aprova o texto da mensagem de confirmação? (RN-06)
5. O que ela quis dizer com "não tem tolerância aceitável pelo cancelamento"? (RN-08)
6. Ela vai usar mais no celular ou no computador? (RNF-01)
