# Documento de Visão — Lucy Cabeleireira (nome provisório)

**Etapa 01 — Definição do problema e planejamento**
**Responsável:** [Seu nome] — trabalho individual (assume os 5 papéis do roteiro)
**Usuária entrevistada:** Lucy, cabeleireira, dona do salão
**Data:** 23/11/2026 · **Versão:** 0.1 (rascunho para revisão)

---

## 1. Contexto

A Lucy trabalha sozinha no salão e atende **uma cliente por vez**. Os horários não são fixos: ela marca **conforme a necessidade de cada cliente**. Os agendamentos chegam pelo **WhatsApp (versão comum, não Business)** ou por telefone. As informações das clientes ficam em **fichas de papel**. Ela recebe por **cartão, Pix ou dinheiro**.

## 2. Como é hoje (processo atual)

1. A cliente entra em contato pelo WhatsApp ou por telefone.
2. A Lucy combina o horário e anota.
3. No atendimento, consulta e atualiza a ficha de papel da cliente.
4. Quando a cliente está perto da data de voltar (ou já passou), **a Lucy lembra sozinha, mas não avisa a cliente**.
5. O estoque de tinturas é controlado **por tubo**, conferindo a quantidade.

## 3. Problemas e evidências

| # | Problema | Fonte da evidência | Situação |
|---|---|---|---|
| P1 | Precisa **confirmar ou cancelar** horários com facilidade | Lucy: *"Seria confirmar o horário ou cancelar"* (resposta à pergunta "se o sistema fizesse uma coisa só") | ✅ Confirmado pela usuária — **prioridade nº 1** |
| P2 | Clientes no prazo de voltar **não são avisadas** | Lucy: *"me lembro, nunca passo pra cliente, só lembro comigo mesma"* | ✅ Confirmado pela usuária |
| P3 | **Atrasos** nos atendimentos por causa de outras ocupações | Lucy: *"O atraso é devido meus outras ocupações"* | ✅ Confirmado (o sistema pode ajudar a planejar o dia, mas não resolve sozinho) |
| P4 | Fichas **perdidas ou desatualizadas** | Observação da filha | ⚠️ A Lucy diz que *"anoto sempre nas fichas"* — **a confirmar** |
| P5 | **Alergias esquecidas** | Observação da filha | ⚠️ A Lucy diz que *"raramente acontece"* — risco baixo em frequência, mas **alto em gravidade** |
| P6 | Confusão com o **estoque de tinturas** | Observação da filha | ⚠️ A Lucy controla por tubo e diz que *"raramente"* falta — **a confirmar** |

> **Lição da entrevista:** a percepção de quem observa (filha) e a de quem usa (Lucy) foram diferentes. A prioridade declarada pela usuária, **confirmar e cancelar horários**, não estava na lista inicial. Por isso o roteiro exige validar com a usuária antes de construir.

## 4. Público-alvo

- **Usuária principal:** Lucy, que vai operar o sistema.
- **Beneficiárias indiretas:** as clientes, que recebem confirmação, lembrete de retorno e mais segurança quanto a alergias.

## 5. Objetivo

Ajudar a Lucy a **confirmar e organizar seus horários**, **lembrar as clientes de voltar** e **guardar as fichas em formato digital**, com as alergias sempre visíveis e o controle de tubos de tintura, sem depender da memória.

## 6. Escopo

### Dentro do MVP (versão 1)

| Tela | Funções | Problema atendido |
|---|---|---|
| **Agenda** | Registrar horário (cliente, data, hora, serviço); status **pendente / confirmado / cancelado**; botão que abre o WhatsApp com a mensagem de confirmação pronta; visão de **hoje e amanhã** | P1, P3 |
| **Clientes** | Ficha com nome, telefone, **alergias em destaque**, anotações e histórico de atendimentos; lista de **clientes na hora de voltar**, com botão de WhatsApp | P2, P4, P5 |
| **Tinturas** | Lista de tinturas com **quantidade de tubos** e estoque mínimo; baixa ao registrar atendimento; **alerta** de estoque baixo | P6 |

### Fora do MVP (para o futuro)

- A cliente marcar sozinha por um link.
- Envio **automático** de mensagens pelo WhatsApp (exige a API oficial, que é paga e precisa de aprovação).
- Pagamento online (Pix com confirmação automática, cartão).
- Fotos de antes e depois, avaliações, promoções, catálogos, assistente Remy.
- Outros produtos além de tintura.

## 7. Critérios de sucesso (demonstráveis)

1. A Lucy cadastra um horário e, com **um clique**, abre o WhatsApp da cliente com a mensagem de confirmação pronta.
2. A Lucy marca um horário como **cancelado** e ele sai da agenda do dia.
3. Ao abrir a ficha de uma cliente com alergia, **a alergia aparece em destaque** antes de qualquer outra informação.
4. Uma cliente cuja última tintura foi há mais tempo que o intervalo definido aparece na lista **"hora de voltar"**.
5. A tintura com 3 tubos passa a ter 2 depois do atendimento registrado. Quando chega ao mínimo, aparece o **alerta**.

## 8. Hipóteses a validar

- H1: ~~a Lucy vai usar o sistema pelo celular durante o dia.~~ **Respondida em 23/11/2026 — parcialmente FALSA:** ela usa o **celular**, mas **não durante os atendimentos**. Usa **de manhã, antes de abrir, e no almoço** para ver o dia (quem vem e quem tem alergia), e **no fechamento** passa para o sistema os tubos que anotou no **papel**. Isso gerou os RF-16 e RF-17 (especificação v0.4).
- H2: o botão que abre o WhatsApp com a mensagem pronta é suficiente, sem precisar de envio automático.
- H3: ~~as clientes aceitam ter seus dados de saúde (alergias) guardados digitalmente, com consentimento.~~ **Revisada em 23/11/2026:** a alergia é guardada com base na proteção da incolumidade física da cliente (LGPD, art. 11, II, "e"), sem caixinha de consentimento. Ver a seção 7 da especificação de requisitos.

## 9. Dúvidas em aberto

1. **Cancelamento:** "não tem tolerância aceitável" quer dizer que a cliente pode cancelar a qualquer momento, ou que a Lucy não aceita cancelamento em cima da hora?
2. **Retorno:** a cada quanto tempo, em média, a cliente deve voltar para cada serviço (ex.: tintura a cada X semanas)?
3. **Confirmação:** quando a Lucy prefere confirmar — no dia anterior, no mesmo dia?
4. **Duração dos serviços:** não respondida; pode ser digitada em cada agendamento.
5. **Sinal antecipado e momento de oferecer o retorno:** não respondidas. Ficam fora do MVP.

## 10. Cronograma (preencher com datas reais)

| Marco | Etapas do roteiro | Data prevista | Data real |
|---|---|---|---|
| Ideia e problema validados | 01 | 23/11/2026 | 23/11/2026 |
| Requisitos | 02 | [dd/mm] | |
| Protótipo (mockup) e Design System | 03–04 | [dd/mm] | |
| Código com IA | 05 | [dd/mm] | |
| Docker | 06 | [dd/mm] | |
| Testes e deploy | 07 | [dd/mm] | |
| Resultados, slides e ensaio | 08 | [dd/mm] | |
| **Entrega / apresentação** | — | [dd/mm] | |

## 11. Registro do uso de IA

- **Ferramenta:** Claude (assistente de IA).
- **Uso:** organizar as respostas da entrevista em problemas, escopo e critérios.
- **Revisão humana:** [Seu nome] conferiu que as frases citadas são as respostas reais da Lucy e que nenhum fato foi inventado. *(marcar após revisar)*
