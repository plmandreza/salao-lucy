# Design System — Lucy Cabeleireira v1.0

**Etapa 04 — Design System**
**Responsável:** Andreza Pinho Lobo Martins · **Data:** 23/11/2026
**Arquivos:** `tokens.css` (o código), `guia-visual.html` (a vitrine para ver e tirar prints)
**Base:** o mockup da Etapa 03. A identidade aprovada foi mantida.

---

## 1. Por que ter um Design System

Um Design System é o **manual de regras visuais** do sistema. Ele garante que todas as telas usem as mesmas cores, letras e botões. Sem ele, cada tela acaba com um tom de roxo diferente e com botões de tamanhos diferentes.

**Regra de ouro:** no código da Etapa 05, **nenhuma cor ou tamanho é escrito solto**. Tudo usa as variáveis do `tokens.css` (ex.: `var(--cor-marca)`). Assim, para mudar o roxo do sistema inteiro, basta trocar uma linha.

## 2. Princípios

1. **Celular primeiro, e responsivo:** no celular, coluna única de até 480 px, com botões fáceis de tocar com o polegar. Em telas maiores, o layout se adapta (ver "Responsividade").
2. **Cor tem significado:** cada cor indica um estado, e nenhuma é usada só para enfeite.
3. **Segurança acima de tudo:** a alergia é o elemento mais visível de qualquer tela em que aparece.
4. **Linguagem simples:** botões dizem a ação ("Confirmar", "Finalizar"), nunca "OK" ou "Enviar".

## 3. Cores

| Token | Cor | Uso | Contraste medido |
|---|---|---|---|
| `--cor-marca` | #7a2e5c | Botão principal, cabeçalho, aba ativa | 8,9:1 com branco |
| `--cor-marca-escura` | #5c1f44 | Horários, títulos | 12,1:1 no branco |
| `--cor-texto` | #2a1f26 | Texto principal | 15,9:1 no branco |
| `--cor-texto-suave` | #66575f | Texto secundário | 6,8:1 no branco |
| `--cor-sucesso` | #1f7a4d | Confirmado, WhatsApp, "tudo certo" | 5,3:1 com branco |
| `--cor-atencao` | #8a4b00 | Pendente, estoque baixo | 6,2:1 no fundo suave |
| `--cor-perigo` | #b42318 | **Alergia**, erro, cancelar, excluir | 5,8:1 no fundo suave |
| `--cor-neutro-status` | #4a4458 | Concluído | 7,8:1 no fundo suave |
| `--cor-borda-controle` | #8f7a86 | Borda de campos e botões | 4,0:1 (mínimo 3:1) |
| `--cor-foco` | #9a6b00 | Contorno de foco do teclado | 4,4:1 (mínimo 3:1) |

> **Regra:** texto precisa de contraste de pelo menos **4,5:1**, e bordas e contornos de pelo menos **3:1** (WCAG 2.1, nível AA). Os valores acima foram **calculados**, não estimados.

### Correção feita nesta etapa (evidência para o slide 9)

A medição encontrou **2 falhas** no mockup v0.1, que foram corrigidas no mockup v0.2:

| Elemento | Antes | Contraste | Depois | Contraste |
|---|---|---|---|---|
| Contorno de foco | #c9a227 | 2,3:1 ❌ | #9a6b00 | 4,4:1 ✅ |
| Borda de campos e botões | #c9b8c1 | 1,9:1 ❌ | #8f7a86 | 4,0:1 ✅ |

## 4. Tipografia

Usamos a **fonte do próprio aparelho** (`system-ui`): ela não precisa ser baixada, abre na hora e é a mesma que a Lucy já vê no celular.

| Token | Tamanho | Uso |
|---|---|---|
| `--texto-2xl` | 24 px, extra-negrito | Número de tubos no estoque |
| `--texto-xl` | 20 px, extra-negrito | Horário, título de janela |
| `--texto-lg` | 17 px, negrito | Nome da cliente |
| `--texto-md` | 16 px | Corpo do texto e **todos os campos** (menos que isso faz o iPhone dar zoom sozinho) |
| `--texto-sm` | 14 px | Informação secundária, rótulos |
| `--texto-xs` | 12 px, negrito | Selos de status |

## 5. Espaçamento, cantos e tamanhos

- **Espaçamento de 4 em 4 px:** 4, 8, 12, 16, 20, 24, 32. O padrão interno dos cards é 16 px e o espaço entre cards é 12 px.
- **Cantos:** 10 px nos controles, 14 px nos cards, 18 px na janela inferior e totalmente redondo nos selos.
- **Área de toque mínima:** 44 × 44 px (RNF-03).
- **Barra de abas:** 64 px de altura, fixa embaixo.

## 6. Componentes

| Componente | Classe | Variantes e estados | Onde aparece |
|---|---|---|---|
| Botão | `.btn` | `.primario`, `.whatsapp`, `.perigo`, `.bloco`; normal, foco, desabilitado | Todas as telas |
| Card | `.card` | — | Agenda, clientes, estoque |
| Selo de status | `.selo` | `.pendente`, `.confirmado`, `.concluido`, `.alergia` | Agenda, lista de clientes |
| **Alerta de alergia** | `.alerta-alergia` | — | Ficha e janela de finalizar (sempre no topo) |
| Aviso | `.aviso` | — | Estoque baixo |
| Sucesso / Erro | `.sucesso`, `.erro` | `.erro` some sozinho quando está vazio | Formulários, estoque |
| Estado vazio | `.vazio` | — | Listas sem itens |
| Campo | `.rotulo` + `.campo` | normal, foco, inválido (`aria-invalid="true"`) | Formulários |
| Opção | `.opcao` | marcada, desmarcada | Serviços, consentimento LGPD |
| Contador | `.contador` | — | Tubos usados, entrada de tubos |
| Número de estoque | `.estoque-num` | `.baixo` | Tinturas |
| Barra de abas | `.abas` + `.contagem` | aba ativa com `aria-current="page"` | Rodapé |
| Janela (modal) | `.fundo-janela` + `.janela` | **Embaixo no celular** (perto do polegar) e **centralizada a partir de 600 px** (computador e tablet) | Finalizar, cancelar, formulários |
| Aviso rápido | `.toast` | — | Depois de salvar |

### Regras de uso

- **Um único botão primário por tela.** Ele é a ação principal.
- **Ações perigosas** (cancelar, excluir) usam `.perigo` e **sempre pedem confirmação** numa janela.
- **Vermelho é reservado** para alergia, erro e perigo. Se tudo for vermelho, a alergia deixa de chamar atenção.
- **Ícone nunca aparece sozinho:** sempre acompanha um texto (📅 Agenda, ⚠️ tem alergia). *Esta regra foi quebrada na primeira versão da agenda (um ⚠️ sozinho ao lado do nome) e corrigida depois do teste.*
- **Mensagens de erro dizem o que fazer:** "Estoque insuficiente de 7.0 — atualize o estoque".

## 7. Acessibilidade

- [x] Contraste AA em todos os textos e bordas (medido, seção 3)
- [x] Área de toque de pelo menos 44 px
- [x] Contorno de foco visível para quem usa teclado
- [x] Alergia anunciada como alerta (`role="alert"`) para leitores de tela
- [x] Campos com rótulo ligado ao campo (`<label for>`)
- [x] Informação nunca só pela cor: os selos também têm texto
- [ ] Testar com o leitor de tela do celular (TalkBack/VoiceOver) — *Etapa 07*

## 8. Responsividade

- **Celular (até 480 px):** layout completo, como no mockup.
- **Tablet (600 a 959 px):** coluna de até 760 px, menu embaixo e cartões em **2 colunas**.
- **Computador (960 px ou mais):**
    - o menu vira uma **barra lateral** à esquerda;
    - cada tela usa **2 colunas**: na Agenda, os avisos do dia (resumo, hora de voltar, para finalizar) à esquerda e os horários à direita; nas Clientes, ações e hora de voltar à esquerda e a lista à direita; na Ficha, os dados à esquerda e o histórico à direita;
    - os cartões ficam em **grade**;
    - o login aparece num cartão centralizado.
- As janelas aparecem **centralizadas** a partir de 600 px (no celular ficam embaixo).
- *Mudança de 25/11/2026:* antes, o computador mostrava a mesma coluna do celular, centralizada. A Andreza Pinho Lobo Martins não gostou desse "formato de celular no PC" e pediu que o sistema fosse responsivo, mesmo a Lucy usando só o celular.

## 9. Como validar (roteiro do Prof. Bruno)

- Na Etapa 05, comparar cada tela implementada com o `guia-visual.html`.
- Abrir o sistema no celular e no computador e conferir que nada fica cortado e que não há rolagem para os lados.
- Navegar só com a tecla Tab e conferir que o contorno de foco aparece em tudo.
