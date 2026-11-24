# Casos de teste — Lucy Cabeleireira

**Etapa 07 — Testes e qualidade** (preenchido conforme cada função fica pronta)
**Responsável:** [Seu nome]

**Situação:** ✅ aprovado · ❌ reprovado · ⏳ ainda não executado

> Regra do roteiro: separar com rigor o que foi **proposto**, **executado**, **aprovado** e **reprovado**. Só marque ✅ o que você executou de verdade.
>
> **Dados de teste:** usar sempre telefones com **DDD 00**, que não existe no Brasil, para nunca usar o número de uma pessoa real.

---

## Estoque de tinturas (RF-13, RF-14, RF-15)

| ID | Requisito / critério | Pré-condição | Passos | Resultado esperado | Data | Situação | Evidência |
|---|---|---|---|---|---|---|---|
| T-01 | RF-13, RF-15, RN-04 | Nenhuma tintura cadastrada | Nova tintura: 7.0, Louro médio, Marca A, 1 tubo, mínimo 1 → Salvar | Aparece na lista com **1** em vermelho, aviso "Estoque baixo: 7.0 (1 tubo)" e contagem 1 na aba | 23/11/2026 | ✅ | evidencias/T-01-*.png |
| T-02 | RF-14, CA-07.1 | 7.0 com 1 tubo | Entrada de tubos → + até 4 → Salvar entrada | Estoque vai para **5**, aviso verde "Todas acima do mínimo", contagem some | 23/11/2026 | ✅ | evidencias/T-02-*.png |
| T-03 | RN-03 (negativo) | Janela de nova tintura aberta | Tubos = -2 → Salvar | Mensagem "Tubos e estoque mínimo precisam ser números inteiros a partir de 0." e nada é salvo | 23/11/2026 | ✅ | evidencias/T-03-*.png |
| T-04 | RF-13 (duplicidade) | 7.0 Marca A já existe | Nova tintura 7.0, Marca A, 1 tubo → Salvar | Mensagem "Já existe uma tintura com esse código e essa marca." | 23/11/2026 | ✅ | evidencias/T-04-*.png |
| T-05 | RNF-07 (persistência) | 7.0 com 5 tubos | Recarregar a página (F5) | 7.0 continua com 5 tubos | 23/11/2026 | ✅ | evidencias/T-05-*.png |
| T-06 | Usabilidade | Janela de nova tintura com texto digitado | Clicar fora da janela | Janela continua aberta e o texto é mantido | 23/11/2026 | ✅ após correção | registro de prompts |
| T-07 | RF-13 (editar) | 7.0 com mínimo 1 | Editar → mínimo 5 → Salvar | Mínimo vira 5 e a 7.0 entra no alerta (5 ≤ 5) | — | ⏳ | |
| T-08 | RNF-07 (reinício) | 7.0 cadastrada | `docker compose down` e `docker compose up -d` → F5 | 7.0 continua lá | — | ⏳ | |

### Defeitos encontrados

| ID | Onde | Descrição | Encontrado por | Situação |
|---|---|---|---|---|
| D-01 | Janelas | Fechar a janela enquanto o servidor respondia travava a tela | Teste automático (IA) | Corrigido antes da entrega |
| D-02 | Janelas | Clicar fora da janela a fechava e o texto digitado se perdia | Teste manual (eu) | Corrigido e testado de novo (T-06) |
| D-03 | Agenda | A duração era obrigatória no código, mas o RF-02 diz "opcional" (inconsistência requisito × código) | Revisão manual (eu) | Corrigido (migração 002); teste T-23 |
| D-05 | Agenda × Ficha | Depois de editar a ficha (telefone, alergia), a agenda continuava com os dados antigos até apertar F5; o botão WhatsApp usava o telefone velho | Teste manual T-18 (eu) | Corrigido: a agenda é recarregada ao salvar a ficha |
| D-06 | Design System | Um ⚠️ sozinho ao lado do nome da cliente (sem texto) não era entendido — quebrava a regra "ícone nunca sozinho" | Teste manual (eu) | Corrigido: "— ⚠️ tem alergia" |
| D-07 | RF-10 / RN-09 | Era possível descontar tubos num atendimento sem o serviço Tintura (ex.: "Corte + Escova · Tintura: 7.0 (2 tubos)") | Teste manual (eu) | Corrigido: o Finalizar mostra os serviços feitos e só mostra os tubos com Tintura marcada; o servidor recusa tubos sem Tintura |
| D-08 | RF-10 / RN-10 | Era possível finalizar um agendamento futuro (histórico mostrava 28/11 no dia 23/11) | Teste manual (eu) | Corrigido: "Finalizar" só aparece a partir do horário marcado e o servidor recusa antes disso |
| D-04 | Agenda / WhatsApp | O emoji 💇‍♀️ da mensagem chegou como "�" no WhatsApp: o redirecionamento wa.me → api.whatsapp.com estragou o símbolo | Teste manual T-18 (eu) | Corrigido: mensagem sem emoji; refazer T-18 |

---

## Clientes e fichas (RF-07, RF-08, RF-09, RNF-06)

| ID | Requisito / critério | Pré-condição | Passos | Resultado esperado | Data | Situação | Evidência |
|---|---|---|---|---|---|---|---|
| T-09 | RF-07, RN-07 | — | Nova cliente: nome "Ana Souza", WhatsApp "(00) 90000-0001", alergia "PPD" → Salvar | Abre a ficha da Ana com a alergia em destaque | 23/11/2026 | ✅ | evidencias/T-09-*.png |
| T-10 | CA-04.1 | Ana com alergia "PPD" | Clientes → tocar na Ana | O aviso vermelho "⚠️ Alergia: PPD" aparece **acima** de todas as informações | — | ⏳ | |
| T-11 | CA-04.2 | Ficha da Ana com alergia "PPD" | Editar ficha → apagar o texto da alergia → Salvar | O aviso vermelho some da ficha e da lista | 23/11/2026 | ✅ | evidencias/T-11-*.png |
| T-12 | RN-07, RNF-10 | Janela de nova cliente | WhatsApp "90000-0001" (sem DDD) → Salvar | Mensagem "Informe o WhatsApp com DDD, no formato (XX) 9XXXX-XXXX." | 23/11/2026 | ✅ | evidencias/T-12-*.png |
| T-24 | RNF-10 (máscara de telefone) | Janela de nova cliente | Digitar só os números `00900000001` → depois tentar digitar mais números → apagar com Backspace | Aparece `(00) 90000-0001` sozinho; números a mais são ignorados; o Backspace apaga normalmente | 23/11/2026 | ✅ | print |
| T-13 | RF-08 | Ana e Andréa cadastradas | Buscar "andrea" (sem acento) | Aparece só a Andréa | — | ⏳ | |
| T-14 | RF-07 (editar) | Ficha da Ana aberta | Editar ficha → mudar anotação → Salvar | A ficha mostra a anotação nova, mesmo depois de F5 | — | ⏳ | |
| T-15 | RF-07, RNF-06 (excluir) | Cliente de teste cadastrada | Ficha → Excluir cliente → Sim, excluir | Some da lista e aparece "…todos os dados dela foram excluídos" | — | ⏳ | |

## Agenda (RF-02 a RF-06, RN-01, RN-02, RN-06)

| ID | Requisito / critério | Pré-condição | Passos | Resultado esperado | Data | Situação | Evidência |
|---|---|---|---|---|---|---|---|
| T-16 | RF-02, RF-03 | Ana cadastrada | + Novo agendamento → Ana, hoje, 14:00, 1h, Tintura → Salvar | Aparece em "Hoje" às 14:00–15:00, **Pendente**, com a alergia visível | 23/11/2026 | ✅ | evidencias/T-16-*.png |
| T-17 | RN-01, CA-03.1 | Ana hoje 14:00–15:00 | Novo agendamento para outra cliente hoje às 14:30 | Mensagem "Já existe cliente nesse horário: Ana Souza, 14:00–15:00." | — | ⏳ | |
| T-18 | RF-05, RN-06, CA-01.1 | Horário da Ana pendente (WhatsApp com DDD 00) | Tocar em **WhatsApp** | Abre o WhatsApp com o número da cliente e a mensagem "Olá, Ana! Aqui é a Lucy. Estou confirmando seu horário hoje às 14:00 para tintura. Posso confirmar?" | 23/11/2026 | ✅ (após D-04 e D-05) | evidencias/T-18-*.png |
| T-19 | RF-04, RNF-02, CA-01.2 | Horário da Ana pendente | Tocar em **Confirmar** → F5 | Selo **Confirmado**, que continua depois do F5 (1 toque) | 23/11/2026 | ✅ (confirmar; a permanência após F5 não foi registrada em print) | evidencias/T-19-*.png |
| T-20 | RF-04, RN-02, CA-02.1, CA-03.2 | Horário da Ana ativo | Cancelar → Sim, cancelar → marcar outra cliente às 14:30 | O horário da Ana some e o horário das 14:30 é aceito | 23/11/2026 | ✅ (cancelado e a Ana remarcada no mesmo horário foi aceita) | evidencias/T-20-*.png |
| T-21 | RF-06 | Horário ativo | Remarcar para amanhã 10:00 | Aparece em "Amanhã" às 10:00 como **Pendente** | — | ⏳ | |
| T-23 | RF-02 (duração opcional), RN-01 | Ana hoje 14:00 com 1h | Novo agendamento para outra cliente hoje às 16:00 com duração "Não informar" → depois outro às 16:00 também sem duração | O primeiro é aceito e o cartão mostra só "16:00"; o segundo recebe "Já existe cliente nesse horário: … às 16:00." | — | ⏳ | |
| T-22 | RF-03 (outro dia) | Horário marcado para daqui a 5 dias | Ver outro dia → escolher a data | O horário aparece na lista daquele dia | — | ⏳ | |

## Finalizar atendimento (RF-10, RN-03, RN-04)

| ID | Requisito / critério | Pré-condição | Passos | Resultado esperado | Data | Situação | Evidência |
|---|---|---|---|---|---|---|---|
| T-25 | RF-10, CA-05.1 | Ana hoje (Tintura); 7.0 com 3 tubos, mínimo 1 | Agenda → Finalizar → 7.0 = 1 tubo → Concluir | 7.0 vai para **2**; o horário fica **Concluído**; a ficha da Ana mostra o atendimento com "7.0 (1 tubo)" | 23/11/2026 | ✅ | evidencias/T-25-*.png |
| T-26 | RN-04, CA-05.2 | 7.0 com 2 tubos, mínimo 1 | Finalizar outro atendimento com 1 tubo de 7.0 | 7.0 vai para **1** e aparece o aviso "⚠️ Estoque baixo: 7.0" | — | ⏳ | |
| T-27 | RN-03, CA-05.3 | Uma tintura com 0 tubos | Finalizar com 1 tubo dela | Mensagem "Estoque insuficiente de … — atualize o estoque." e **nada** é gravado (o horário continua ativo, sem histórico novo) | — | ⏳ | |
| T-28 | Segurança (alergia) | Cliente com alergia | Abrir "Finalizar" | O aviso vermelho da alergia aparece no topo da janela | — | ⏳ | |

## Uso fora do horário de atendimento (RF-16, RF-17)

| ID | Requisito / critério | Pré-condição | Passos | Resultado esperado | Data | Situação | Evidência |
|---|---|---|---|---|---|---|---|
| T-33 | RF-17 | Clientes marcadas hoje de manhã e à tarde, uma da tarde com alergia | Abrir a Agenda antes do primeiro horário e depois de novo no meio do dia | No topo: "Hoje · Manhã: N clientes · Tarde: N clientes". De manhã: próxima cliente e todas as alergias do dia. No meio do dia: só as próximas clientes e as alergias delas | — | ⏳ | |
| T-34 | RF-16 | Um horário de hoje que já passou e outro de um dia anterior, não finalizados | Abrir a Agenda | Aparecem em "Para finalizar" (com a contagem na aba Agenda) e é possível finalizar os dois | — | ⏳ | |
| T-35 | RF-16 ("Não veio") | Um horário em "Para finalizar" | Tocar em "Não veio" → Sim, cancelar | O horário sai da lista "Para finalizar" | — | ⏳ | |

## Hora de voltar (RF-11, RF-12, RN-05)

| ID | Requisito / critério | Pré-condição | Passos | Resultado esperado | Data | Situação | Evidência |
|---|---|---|---|---|---|---|---|
| T-29 | RF-11, RN-05, CA-06.1 | Intervalo da Tintura = 1 dia (ajustado para o teste) | Finalizar uma tintura hoje → aba Clientes | A cliente aparece em "Hora de voltar" com "em 1 dia" e a contagem na aba Clientes | — | ⏳ | |
| T-30 | RF-11 (lembrete) | Cliente na lista | Tocar em "Lembrar pelo WhatsApp" | Abre o WhatsApp com "Olá, …! Aqui é a Lucy. Já está chegando a hora de renovar: tintura. Quer marcar um horário?" | — | ⏳ | |
| T-31 | RN-05 (quem já marcou) | Cliente na lista | Marcar um horário futuro para ela | Ela sai da lista "Hora de voltar" | — | ⏳ | |
| T-32 | RF-12 | — | Ajustar intervalos de retorno → mudar Tintura → Salvar → reabrir | O novo valor fica salvo | — | ⏳ | |

## Acesso (RF-01, RNF-04)

| ID | Requisito / critério | Pré-condição | Passos | Resultado esperado | Data | Situação | Evidência |
|---|---|---|---|---|---|---|---|
| T-36 | RF-01, CA-08.1 | Sem login | Abrir http://localhost:3000 | Aparece a tela de login; agenda, fichas e abas não aparecem | 23/11/2026 | ✅ | evidencias/T-36-*.png |
| T-37 | CA-08.2 | Usuária criada | E-mail certo e senha errada → Entrar | "E-mail ou senha incorretos." e não entra | 23/11/2026 | ✅ | evidencias/T-37-*.png |
| T-38 | RF-01 | Usuária criada | E-mail e senha certos → Entrar → fechar e reabrir o navegador | Entra na agenda; ao reabrir, continua logada (sessão de 30 dias) | 23/11/2026 | ✅ (entrou; continuar logada ao reabrir o navegador ainda não foi testado) | evidencias/T-38-*.png |
| T-39 | RF-01 (sair) | Logada | Tocar em "Sair" → tentar abrir http://localhost:3000/api/clientes | Volta ao login; o endereço da API responde "Faça login para continuar." | — | ⏳ | |
| T-40 | RNF-04 (tentativas) | — | Errar a senha 5 vezes → tentar a 6ª | "Muitas tentativas erradas. Espere 15 minutos…" | — | ⏳ | |
| T-41 | RNF-04 (hash) | Usuária criada | No terminal: `docker compose exec db psql -U lucy -d salao -c "SELECT email, senha_hash FROM usuarios"` | A senha aparece embaralhada (`scrypt$…`), nunca como foi digitada | — | ⏳ | |

## Ambiente Docker (Etapa 06 — RNF-07, RNF-08)

| ID | Requisito / critério | Pré-condição | Passos | Resultado esperado | Data | Situação | Evidência |
|---|---|---|---|---|---|---|---|
| T-42 | RNF-08 | Docker Desktop ligado | Em `06 - Docker`: `docker compose up -d --build` → `docker compose ps` | `db` e `app` aparecem **(healthy)** | 23/11/2026 | ✅ | evidencias/T-42-*.png |
| T-43 | RNF-08 | T-42 ok | Abrir http://localhost:8080 e entrar com a usuária | O sistema completo funciona pela versão Docker, com os mesmos dados | 23/11/2026 | ✅ | evidencias/T-43-*.png |
| T-44 | Saúde | T-42 ok | Abrir http://localhost:8080/api/saude | `{"servidor":"ok","banco":"ok",…}` | 23/11/2026 | ✅ | evidencias/T-44-*.png |
| T-45 | RNF-07 (reinício) | Dados cadastrados | `docker compose down` → `docker compose up -d` → abrir de novo | Clientes, agenda e tinturas continuam lá | 23/11/2026 | ✅ | evidencias/T-45-*.png |
| T-46 | RNF-08 (instalação limpa) | Seguir o README numa cópia nova do projeto | `git clone` em outra pasta → criar `.env` → `docker compose -p salao-limpo up -d --build` (com o original desligado) → criar usuária → abrir | Sobe do zero, com banco vazio e tabelas criadas, só seguindo o README | — | ⏳ | |
| T-47 | RNF-05 | — | Conferir que o `.env` não está no Git (`git ls-files | grep .env`) e não entra na imagem (`.dockerignore`) | 23/11/2026 | ✅ (`git ls-files` lista só o `.env.example`) | evidencias/T-47-*.png | |
| T-48 | RF-01 (mostrar senha) | E-mail e senha qualquer | Digitar a senha → tocar em **Mostrar** → tocar em **Ocultar** | A senha aparece e some de novo, **sem apagar** o que foi digitado | — | ⏳ | |
| T-49 | RF-01 (esqueci a senha) | — | Tocar em **Esqueci minha senha** → abrir "Para quem cuida do sistema" → **Voltar para o login** | Mostra a explicação e o comando; volta para o login | — | ⏳ | |
| T-50 | RNF-03 (fechar janela) | Uma tintura cadastrada | Abrir **Nova tintura** → tocar no **×** · repetir com **Finalizar** e **Cancelar horário** | A janela fecha sem salvar nada; o cursor vai para o primeiro campo, não para o × | — | ⏳ | |
| T-51 | RF-03 (próximos) | Agendamentos daqui a 3 dias e daqui a 20 dias | Abrir a Agenda e rolar até **Próximos agendamentos** | Os dois aparecem, separados por dia, sem escolher data; cancelados não aparecem | — | ⏳ | |
| T-52 | RF-18 (mês) | Pelo menos 1 atendimento finalizado este mês, com 1 tubo de 7.0 | Aba **Relatório** → **Mês** | Os números batem com o que foi finalizado (atendimentos, serviços, tubos) | — | ⏳ | |
| T-53 | RF-18 (períodos) | — | Trocar entre **Dia / Semana / Mês / Ano** e usar ← → | O título muda certo (ex.: semana de segunda a domingo) e os números acompanham | — | ⏳ | |
| T-54 | RF-18 (imprimir) | — | **Imprimir ou salvar em PDF** → destino "Salvar como PDF" | O PDF sai só com o relatório, sem menu e sem botões | — | ⏳ | |
| T-55 | RN-09 | Horário de Corte + Escova; tintura 7.0 com estoque | **Finalizar** | Aparecem os serviços marcados (Corte e Escova) e a frase "Sem o serviço Tintura, nenhum tubo é descontado"; ao concluir, o estoque **não** muda | — | ⏳ | |
| T-56 | RN-09 (mudou na hora) | Horário só de Corte | **Finalizar** → marcar **Tintura** → 1 tubo de 7.0 → Concluir | O estoque de 7.0 baixa 1 e o histórico mostra "Corte + Tintura · 7.0 (1 tubo)" | — | ⏳ | |
| T-57 | RN-10 | Um agendamento daqui a 2 dias e outro hoje, já passado | Olhar os cartões na Agenda | O de daqui a 2 dias **não** tem "Finalizar"; o que já passou tem | — | ⏳ | |
| T-58 | RF-11 (topo da Agenda) | Pelo menos 1 cliente na "Hora de voltar" | Abrir a Agenda | Aparece "Hora de voltar" abaixo do resumo do dia, com até 3 clientes; com mais de 3, o botão "Ver todas" leva para a aba Clientes | — | ⏳ | |
| T-59 | RNF-03 (leitura) | Cliente com 3 ou mais atendimentos | Abrir a ficha | O histórico mostra uma linha por atendimento, com cores alternadas (branco / rosa claro) e letra maior | — | ⏳ | |
| T-60 | RF-19 | Atendimento finalizado com 2 tubos de 7.0 | Ficha → **Desfazer** na linha → **Sim, desfazer** | A linha sai do histórico; o 7.0 ganha 2 tubos; o horário volta para a agenda como **Confirmado**; a cliente continua cadastrada | — | ⏳ | |

---

## Resumo (para o slide 15)

| | Quantidade |
|---|---|
| Testes propostos | 47 |
| Executados | 23 |
| Aprovados | 23 |
| Reprovados | 0 (T-18 reprovou 2x e passou após correções) |
| Não executados | 24 |
| Defeitos encontrados / corrigidos | 6 / 6 |
