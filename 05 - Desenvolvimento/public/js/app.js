// =========================================================
// app.js — as telas do sistema Lucy Cabeleireira
// A tela NUNCA fala direto com o banco: ela pede ao servidor
// (função "api") e mostra a resposta.
// =========================================================

// ---------- Ajudantes ----------
const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
function hojeTexto() {
  const d = new Date();
  return `${DIAS[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// "2026-11-23" → "23/11/2026"
const dataBR = iso => iso.split('-').reverse().join('/');

// Data de hoje (ou daqui a N dias) no formato "2026-11-23", no horário do aparelho
function diaISO(diasAMais = 0) {
  const d = new Date();
  d.setDate(d.getDate() + diasAMais);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// Data e hora de agora no aparelho: "2026-11-23 12:30"
function agoraLocal() {
  const d = new Date();
  return `${diaISO(0)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// "2026-11-24" → "terça, 24/11"
const rotuloDia = iso => `${DIAS[new Date(iso + 'T12:00').getDay()]}, ${dataBR(iso).slice(0, 5)}`;
// "hoje", "amanhã" ou "no dia 30/11" — usado na mensagem do WhatsApp
const quando = iso => iso === diaISO(0) ? 'hoje' : iso === diaISO(1) ? 'amanhã' : `no dia ${dataBR(iso).slice(0, 5)}`;

// Máscara de telefone: "00900000001" → "(00) 90000-0001"
// Aceita fixo (10 números) e celular (11 números), sempre com DDD.
function formatarTelefone(valor) {
  const d = String(valor ?? '').replace(/\D/g, '').slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2), resto = d.slice(2);
  if (resto.length <= 4) return `(${ddd}) ${resto}`;
  if (d.length <= 10) return `(${ddd}) ${resto.slice(0, 4)}-${resto.slice(4)}`;
  return `(${ddd}) ${resto.slice(0, 5)}-${resto.slice(5)}`;
}

// RF-05: link que abre o WhatsApp da cliente com a mensagem já escrita.
// "(21) 98888-7777" → "5521988887777" (55 = código do Brasil)
function linkWhatsApp(telefone, mensagem) {
  let numero = telefone.replace(/\D/g, '');
  if (numero.length <= 11) numero = '55' + numero;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

// RF-11: mensagem de lembrete para a cliente voltar (sem emoji, ver D-04)
function mensagemRetorno(v) {
  return `Olá, ${v.nome.split(' ')[0]}! Aqui é a Lucy. Já está chegando a hora de renovar: ${v.servico.toLowerCase()}. Quer marcar um horário?`;
}

// RN-06: mensagem padrão de confirmação.
// SEM emoji: no teste, o 💇‍♀️ chegou como "�" porque o redirecionamento
// do WhatsApp (wa.me → api.whatsapp.com) estragou o símbolo (defeito D-04).
function mensagemConfirmacao(a) {
  const servicos = a.servicos.map(s => s.nome.toLowerCase()).join(' + ');
  return `Olá, ${a.nome.split(' ')[0]}! Aqui é a Lucy. Estou confirmando seu horário ${quando(a.data)} às ${a.hora} para ${servicos}. Posso confirmar?`;
}

// Protege contra texto malicioso: transforma < > & " ' em texto comum
function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const plural = (n, palavra) => `${n} ${palavra}${n === 1 ? '' : 's'}`;

// Compara textos sem ligar para maiúsculas e acentos ("Andréa" acha "andrea")
const semAcento = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// ---------- Conversa com o servidor ----------
async function api(caminho, { metodo = 'GET', corpo } = {}) {
  let resposta;
  try {
    resposta = await fetch('/api' + caminho, {
      method: metodo,
      headers: corpo ? { 'Content-Type': 'application/json' } : {},
      body: corpo ? JSON.stringify(corpo) : undefined
    });
  } catch {
    throw new Error('Sem conexão com o servidor. Ele está ligado?');
  }
  const dados = await resposta.json().catch(() => ({}));
  // 401 = não está logada (ou a sessão venceu): volta para a tela de login (CA-08.1)
  if (resposta.status === 401 && caminho !== '/login') {
    estado.logado = false; estado.janela = null; desenhar();
    throw new Error('Faça login para continuar.');
  }
  if (!resposta.ok) throw new Error(dados.erro || 'Algo deu errado. Tente de novo.');
  return dados;
}

// ---------- Estado da tela ----------
const estado = {
  logado: null,         // null = verificando · false = mostra o login · true = mostra o sistema
  aba: 'agenda',        // aba escolhida no menu de baixo (agenda = prioridade nº 1)
  tela: null,           // tela "por cima" da aba: 'ficha' ou null
  carregando: true,
  erroCarregar: '',
  tinturas: [],
  clientes: [],
  servicos: [],
  agenda: [],           // horários de hoje e amanhã (RF-03)
  diaExtra: '',         // outro dia escolhido pela Lucy
  agendaExtra: [],
  horaDeVoltar: [],     // RF-11
  paraFinalizar: [],    // RF-16: já passaram e não foram finalizados
  busca: '',
  ficha: null,          // ficha aberta (com histórico)
  janela: null          // janela aberta: { tipo, ... } ou null
};

function avisar(mensagem) {
  const t = document.getElementById('toast');
  t.textContent = mensagem;
  t.hidden = false;
  clearTimeout(avisar.timer);
  avisar.timer = setTimeout(() => { t.hidden = true; }, 2800);
}

// ---------- Partes fixas ----------
function topo() {
  return `<header class="topo"><div><h1>Lucy Cabeleireira</h1><small>${hojeTexto()}</small></div>
    <button class="btn" style="background:none;color:#fff;border-color:#ffffffa0" data-acao="sair">Sair</button></header>`;
}

// ---------- Tela: Login (RF-01) ----------
function telaLogin() {
  return `<main class="conteudo" style="padding-top:48px">
    <div style="text-align:center;font-size:44px" aria-hidden="true">💇‍♀️</div>
    <h1 style="text-align:center;color:var(--cor-marca-escura);margin:8px 0 4px">Lucy Cabeleireira</h1>
    <p class="secundario" style="text-align:center;margin:0 0 24px">Entre para ver a agenda e as fichas</p>
    <form id="formLogin" novalidate>
      <label class="rotulo" for="email">E-mail</label>
      <input class="campo" type="email" id="email" autocomplete="username" required>
      <label class="rotulo" for="senha">Senha</label>
      <input class="campo" type="password" id="senha" autocomplete="current-password" required>
      <p class="erro" id="erroLogin" style="margin-top:12px"></p>
      <button class="btn primario bloco" style="margin-top:16px" type="submit" id="botaoEntrar">Entrar</button>
    </form>
  </main>`;
}

function abas() {
  const baixas = estado.tinturas.filter(t => t.estoque_baixo).length;
  const botao = (id, icone, nome, contagem) => `
    <button data-acao="aba" data-id="${id}" ${estado.aba === id && !estado.tela ? 'aria-current="page"' : ''}>
      <span aria-hidden="true" style="font-size:20px">${icone}</span>${nome}
      ${contagem ? `<span class="contagem" aria-label="${contagem} avisos">${contagem}</span>` : ''}
    </button>`;
  return `<nav class="abas" aria-label="Menu principal">
    ${botao('agenda', '📅', 'Agenda', estado.paraFinalizar.length)}${botao('clientes', '👩', 'Clientes', estado.horaDeVoltar.length)}${botao('tinturas', '🎨', 'Tinturas', baixas)}
  </nav>`;
}

const seloAlergia = alergias => alergias
  ? `<span class="selo alergia" style="margin-top:8px">⚠️ Alergia: ${esc(alergias)}</span>` : '';

// ---------- Tela: Agenda (RF-02 a RF-06) ----------
const ROTULO_STATUS = { pendente: 'Pendente', confirmado: 'Confirmado', concluido: 'Concluído' };

function cardHorario(a) {
  const ativo = a.status === 'pendente' || a.status === 'confirmado';
  return `<article class="card">
    <div class="linha">
      <div>
        <div style="font-size:var(--texto-xl);font-weight:var(--peso-extra);color:var(--cor-marca-escura)">
          ${a.hora}${a.fim ? ` <span class="secundario">– ${a.fim}</span>` : ''}</div>
        <div class="nome">${esc(a.nome)}</div>
        <div class="secundario">${esc(a.servicos.map(s => s.nome).join(' + '))}</div>
        ${a.observacao ? `<div class="secundario">📝 ${esc(a.observacao)}</div>` : ''}
      </div>
      <span class="selo ${a.status}">${ROTULO_STATUS[a.status]}</span>
    </div>
    ${seloAlergia(a.alergias)}
    <div class="acoes">
      ${ativo ? `<a class="btn whatsapp" href="${linkWhatsApp(a.telefone, mensagemConfirmacao(a))}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
      ${a.status === 'pendente' ? `<button class="btn primario" data-acao="confirmarHorario" data-id="${a.id}">Confirmar</button>` : ''}
      ${ativo ? `<button class="btn" data-acao="abrirFinalizar" data-id="${a.id}">Finalizar</button>` : ''}
      <button class="btn" data-acao="abrirFicha" data-id="${a.cliente_id}">Ficha</button>
      ${ativo ? `<button class="btn" data-acao="abrirRemarcar" data-id="${a.id}">Remarcar</button>
                 <button class="btn perigo" data-acao="abrirCancelarHorario" data-id="${a.id}">Cancelar</button>` : ''}
    </div>
  </article>`;
}

function listaDoDia(iso, lista) {
  const doDia = lista.filter(a => a.data === iso);
  const confirmados = doDia.filter(a => a.status === 'confirmado').length;
  const pendentes = doDia.filter(a => a.status === 'pendente').length;
  return `<p class="secundario" style="margin:-4px 0 12px">${plural(doDia.length, 'horário')} · ${confirmados} confirmado(s) · ${pendentes} pendente(s)</p>
    ${doDia.length ? doDia.map(cardHorario).join('') : '<p class="vazio">Nenhum horário.</p>'}`;
}

// RF-17: resumo do dia. A Lucy olha DE MANHÃ (antes de abrir) e NO ALMOÇO.
// Por isso o resumo mostra quem AINDA VAI CHEGAR a partir de agora:
// de manhã aparece o dia todo; no almoço, só a tarde.
function resumoDoDia(hoje) {
  const doDia = estado.agenda.filter(a => a.data === hoje);
  if (!doDia.length) return '';
  const agora = agoraLocal().slice(11);                         // "12:30"
  const proximas = doDia.filter(a => a.hora >= agora && (a.status === 'pendente' || a.status === 'confirmado'));
  const comAlergia = [];
  proximas.forEach(a => { if (a.alergias && !comAlergia.some(c => c.cliente_id === a.cliente_id)) comAlergia.push(a); });

  let alergias;
  if (!proximas.length) alergias = `<div class="sucesso" style="margin-top:10px">✓ Não há mais clientes marcadas para hoje.</div>`;
  else if (comAlergia.length) {
    alergias = `<div class="alerta-alergia" role="alert" style="margin-top:10px;font-size:var(--texto-md)">⚠️ Atenção às alergias:<br>
      ${comAlergia.map(a => `${esc(a.nome)} (${a.hora}): ${esc(a.alergias)}`).join('<br>')}</div>`;
  } else alergias = `<div class="sucesso" style="margin-top:10px">✓ Nenhuma das próximas clientes tem alergia registrada.</div>`;

  // Contagem por período (Manhã até 12h, Tarde até 18h, Noite depois)
  const periodo = hora => hora < '12:00' ? 'Manhã' : hora < '18:00' ? 'Tarde' : 'Noite';
  const porPeriodo = ['Manhã', 'Tarde', 'Noite']
    .map(p => [p, doDia.filter(a => periodo(a.hora) === p).length])
    .filter(([p, n]) => n > 0 || p !== 'Noite')
    .map(([p, n]) => `${p}: ${n ? plural(n, 'cliente') : 'ninguém'}`)
    .join(' · ');

  return `<article class="card" style="border-color:var(--cor-marca)">
    <div class="nome">Hoje</div>
    <div>${porPeriodo}</div>
    <div class="secundario">${proximas.length
      ? `Próxima às ${proximas[0].hora}${proximas.length > 1 ? ` · última às ${proximas[proximas.length - 1].hora}` : ''}`
      : 'Todos os horários de hoje já passaram.'}</div>
    ${alergias}
  </article>`;
}

// RF-16: atendimentos que já passaram e ainda não foram finalizados
function secaoParaFinalizar() {
  if (!estado.paraFinalizar.length) return '';
  return `<h2 class="titulo-secao" style="color:var(--cor-atencao)">Para finalizar (${estado.paraFinalizar.length})</h2>
    <p class="secundario" style="margin:-4px 0 12px">Atendimentos que já passaram. No fechamento do salão, use as anotações do papel para registrar os tubos usados.</p>
    ${estado.paraFinalizar.map(a => `<article class="card" style="border-left:4px solid var(--cor-atencao)">
      <div class="linha"><div>
        <div class="nome">${esc(a.nome)}</div>
        <div class="secundario">${rotuloDia(a.data)} às ${a.hora} · ${esc(a.servicos.map(s => s.nome).join(' + '))}</div>
      </div></div>
      ${seloAlergia(a.alergias)}
      <div class="acoes">
        <button class="btn primario" data-acao="abrirFinalizar" data-id="${a.id}">Finalizar</button>
        <button class="btn" data-acao="abrirFicha" data-id="${a.cliente_id}">Ficha</button>
        <button class="btn perigo" data-acao="abrirCancelarHorario" data-id="${a.id}">Não veio</button>
      </div></article>`).join('')}`;
}

function telaAgenda() {
  const hoje = diaISO(0), amanha = diaISO(1);
  return `${resumoDoDia(hoje)}
    ${secaoParaFinalizar()}
    <button class="btn primario bloco" style="margin-top:12px" data-acao="abrirNovoHorario">+ Novo horário</button>
    <h2 class="titulo-secao">Hoje · ${rotuloDia(hoje)}</h2>${listaDoDia(hoje, estado.agenda)}
    <h2 class="titulo-secao">Amanhã · ${rotuloDia(amanha)}</h2>${listaDoDia(amanha, estado.agenda)}
    <h2 class="titulo-secao">Ver outro dia</h2>
    <label class="rotulo" for="diaExtra" style="margin-top:0">Escolha a data</label>
    <input class="campo" type="date" id="diaExtra" value="${estado.diaExtra}">
    <div style="margin-top:12px">${estado.diaExtra ? listaDoDia(estado.diaExtra, estado.agendaExtra) : ''}</div>`;
}

// ---------- Tela: Clientes (RF-08) ----------
function telaClientes() {
  return `<button class="btn primario bloco" data-acao="abrirNovaCliente">+ Nova cliente</button>
    <h2 class="titulo-secao">Hora de voltar (${estado.horaDeVoltar.length})</h2>
    ${listaHoraDeVoltar()}
    <button class="btn bloco" style="margin-top:4px" data-acao="abrirIntervalos">Ajustar intervalos de retorno</button>
    <h2 class="titulo-secao">Todas as clientes (${estado.clientes.length})</h2>
    <label class="rotulo" for="busca" style="margin-top:0">Buscar pelo nome</label>
    <input class="campo" type="search" id="busca" placeholder="Ex.: Ana" value="${esc(estado.busca)}" autocomplete="off">
    <div id="listaClientes" style="margin-top:12px">${listaClientes()}</div>`;
}

// RF-11 / RN-05: quem está perto ou passou da data de voltar
function listaHoraDeVoltar() {
  if (!estado.horaDeVoltar.length) return `<p class="vazio">Ninguém para chamar agora.</p>`;
  return estado.horaDeVoltar.map(v => {
    const prazo = v.faltam_dias < 0
      ? `<strong style="color:var(--cor-perigo)">atrasada há ${plural(-v.faltam_dias, 'dia')}</strong>`
      : v.faltam_dias === 0 ? '<strong>é hoje</strong>' : `em ${plural(v.faltam_dias, 'dia')}`;
    return `<article class="card">
      <div class="nome">${esc(v.nome)}</div>
      <div class="secundario">${esc(v.servico)} · ${prazo} · último em ${dataBR(v.ultima)}</div>
      <div class="acoes">
        <a class="btn whatsapp" href="${linkWhatsApp(v.telefone, mensagemRetorno(v))}" target="_blank" rel="noopener">Lembrar pelo WhatsApp</a>
        <button class="btn" data-acao="abrirFicha" data-id="${v.cliente_id}">Ficha</button>
      </div>
    </article>`;
  }).join('');
}

function listaClientes() {
  const termo = semAcento(estado.busca.trim());
  const lista = estado.clientes.filter(c => semAcento(c.nome).includes(termo));
  if (!estado.clientes.length) return `<p class="vazio">Nenhuma cliente cadastrada ainda.</p>`;
  if (!lista.length) return `<p class="vazio">Nenhuma cliente encontrada com "${esc(estado.busca)}".</p>`;
  return lista.map(c => `
    <button class="card" style="display:block;width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer"
            data-acao="abrirFicha" data-id="${c.id}">
      <div class="nome">${esc(c.nome)}</div>
      <div class="secundario">${esc(c.telefone)}</div>
      ${seloAlergia(c.alergias)}
    </button>`).join('');
}

// ---------- Tela: Ficha da cliente (RF-09) ----------
function telaFicha() {
  const c = estado.ficha;
  if (!c) return `<p class="carregando">Carregando ficha…</p>`;

  const historico = c.historico.length
    ? c.historico.map(h => `
        <div style="border-left:3px solid var(--cor-marca-suave);padding:4px 0 4px 12px;margin:10px 0">
          <strong>${dataBR(h.data)}</strong> · ${esc(h.servicos.join(' + ') || 'Atendimento')}
          ${h.tinturas.length ? `<div class="secundario">Tintura: ${h.tinturas.map(t => `${esc(t.codigo)} (${plural(t.quantidade, 'tubo')})`).join(', ')}</div>` : ''}
        </div>`).join('')
    : `<span class="secundario">Nenhum atendimento ainda.</span>`;

  return `<button class="btn" style="border:0;background:none;padding-left:0;color:var(--cor-marca)" data-acao="voltar">← Voltar</button>
    ${c.alergias ? `<div class="alerta-alergia" role="alert" style="margin:8px 0 12px">⚠️ Alergia: ${esc(c.alergias)}</div>` : ''}
    <article class="card">
      <div class="nome" style="font-size:var(--texto-xl)">${esc(c.nome)}</div>
      <div class="secundario">📱 ${esc(c.telefone)}</div>
      <div class="acoes"><button class="btn" data-acao="abrirEditarCliente">Editar ficha</button></div>
    </article>
    <h2 class="titulo-secao">Anotações</h2>
    <article class="card">${c.anotacoes ? esc(c.anotacoes).replace(/\n/g, '<br>') : '<span class="secundario">Sem anotações.</span>'}</article>
    <h2 class="titulo-secao">Histórico (${c.historico.length})</h2>
    <article class="card">${historico}</article>
    <button class="btn perigo bloco" data-acao="abrirExcluirCliente">Excluir cliente</button>`;
}

// ---------- Tela: Tinturas (RF-13, RF-14, RF-15) ----------
function telaTinturas() {
  const baixas = estado.tinturas.filter(t => t.estoque_baixo);
  const alerta = baixas.length
    ? `<div class="aviso" role="status">⚠️ Estoque baixo: ${baixas.map(t => `${esc(t.codigo)} (${plural(t.quantidade_tubos, 'tubo')})`).join(', ')}</div>`
    : estado.tinturas.length ? `<div class="sucesso">✓ Todas as tinturas acima do mínimo.</div>` : '';

  const lista = estado.tinturas.length
    ? estado.tinturas.map(t => `
      <article class="card">
        <div class="linha">
          <div>
            <div class="nome">${esc(t.codigo)} <span class="secundario">${esc([t.nome, t.marca].filter(Boolean).join(' · '))}</span></div>
            <div class="secundario">Mínimo: ${plural(t.estoque_minimo, 'tubo')}</div>
          </div>
          <div class="direita">
            <div class="estoque-num ${t.estoque_baixo ? 'baixo' : ''}">${t.quantidade_tubos}</div>
            <div class="secundario">${t.quantidade_tubos === 1 ? 'tubo' : 'tubos'}</div>
          </div>
        </div>
        <div class="acoes">
          <button class="btn" data-acao="abrirEntrada" data-id="${t.id}">+ Entrada de tubos</button>
          <button class="btn" data-acao="abrirEditarTintura" data-id="${t.id}">Editar</button>
        </div>
      </article>`).join('')
    : `<p class="vazio">Nenhuma tintura cadastrada ainda.</p>`;

  return `${alerta}
    <button class="btn primario bloco" style="margin-top:12px" data-acao="abrirNovaTintura">+ Nova tintura</button>
    <h2 class="titulo-secao">Estoque</h2>
    ${lista}`;
}

// ---------- Janelas ----------
function formularioTintura(t = {}) {
  return `
    <label class="rotulo" for="tCodigo">Código (ex.: 7.0) *</label>
    <input class="campo" id="tCodigo" value="${esc(t.codigo)}" autocomplete="off">
    <label class="rotulo" for="tNome">Nome da cor</label>
    <input class="campo" id="tNome" value="${esc(t.nome)}" autocomplete="off">
    <label class="rotulo" for="tMarca">Marca</label>
    <input class="campo" id="tMarca" value="${esc(t.marca)}" autocomplete="off">
    <label class="rotulo" for="tQtd">Tubos em estoque *</label>
    <input class="campo" id="tQtd" type="number" min="0" step="1" inputmode="numeric" value="${t.quantidade_tubos ?? 0}">
    <label class="rotulo" for="tMin">Estoque mínimo (avisar quando chegar a) *</label>
    <input class="campo" id="tMin" type="number" min="0" step="1" inputmode="numeric" value="${t.estoque_minimo ?? 1}">`;
}

function formularioCliente(c = {}) {
  return `
    <label class="rotulo" for="cNome">Nome *</label>
    <input class="campo" id="cNome" value="${esc(c.nome)}" autocomplete="off">
    <label class="rotulo" for="cTel">WhatsApp com DDD *</label>
    <input class="campo" id="cTel" type="tel" inputmode="numeric" maxlength="15" placeholder="(XX) 9XXXX-XXXX" value="${esc(formatarTelefone(c.telefone))}">
    <p class="secundario" style="margin:4px 0 0">Digite só os números, com DDD. A formatação é automática.</p>
    <label class="rotulo" for="cAler">Alergias</label>
    <textarea class="campo" id="cAler" rows="2" placeholder="Ex.: PPD, amônia…" aria-describedby="cAlerDica">${esc(c.alergias)}</textarea>
    <p class="secundario" id="cAlerDica" style="margin:4px 0 0">Usada só para evitar reações no atendimento.</p>
    <label class="rotulo" for="cNotas">Anotações</label>
    <textarea class="campo" id="cNotas" rows="3" placeholder="Preferências, produtos usados…">${esc(c.anotacoes)}</textarea>`;
}

function camposHorario(a = {}) {
  const duracoes = [30, 45, 60, 90, 120, 150, 180, 240];
  const atual = a.duracao_min ?? null;          // duração é opcional (RF-02)
  if (atual && !duracoes.includes(atual)) duracoes.push(atual);
  const nomeDuracao = m => m < 60 ? `${m} min` : `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : ''}`;
  return `
    <label class="rotulo" for="hData">Data *</label>
    <input class="campo" type="date" id="hData" value="${a.data ?? diaISO(0)}">
    <label class="rotulo" for="hHora">Hora de início *</label>
    <input class="campo" type="time" id="hHora" step="300" value="${a.hora ?? ''}">
    <label class="rotulo" for="hDur">Duração estimada</label>
    <select class="campo" id="hDur" aria-describedby="hDurDica">
      <option value="" ${atual ? '' : 'selected'}>Não informar</option>
      ${duracoes.sort((x, y) => x - y).map(m =>
        `<option value="${m}" ${m === atual ? 'selected' : ''}>${nomeDuracao(m)}</option>`).join('')}</select>
    <p class="secundario" id="hDurDica" style="margin:4px 0 0">Sem a duração, o sistema só avisa se outra cliente for marcada no mesmo horário de início.</p>`;
}

function formularioNovoHorario() {
  if (!estado.clientes.length) {
    return `<p class="aviso">Cadastre uma cliente primeiro, na aba Clientes.</p>`;
  }
  return `
    <label class="rotulo" for="hCliente">Cliente *</label>
    <select class="campo" id="hCliente"><option value="">Escolha a cliente</option>
      ${estado.clientes.map(c => `<option value="${c.id}">${esc(c.nome)}${c.alergias ? ' — ⚠️ tem alergia' : ''}</option>`).join('')}</select>
    ${camposHorario()}
    <fieldset style="border:0;padding:0;margin:0">
      <legend class="rotulo">Serviços *</legend>
      ${estado.servicos.map(s => `<label class="opcao"><input type="checkbox" name="hServico" value="${s.id}"> ${esc(s.nome)}</label>`).join('')}
    </fieldset>
    <label class="rotulo" for="hObs">Observação</label>
    <input class="campo" id="hObs" autocomplete="off" placeholder="Opcional">`;
}

function botoesJanela(acaoSalvar, textoSalvar, classe = 'primario') {
  return `<div class="acoes"><button class="btn ${classe}" data-acao="${acaoSalvar}">${textoSalvar}</button>
    <button class="btn" data-acao="fecharJanela">Voltar</button></div>`;
}

function conteudoJanela() {
  const j = estado.janela;
  const erro = `<p class="erro" id="erroJanela" style="margin-top:12px">${esc(j.erro || '')}</p>`;
  const tintura = () => estado.tinturas.find(x => x.id === j.id);

  switch (j.tipo) {
    case 'novaTintura':
      return `<h2>Nova tintura</h2>${formularioTintura()}${erro}${botoesJanela('salvarNovaTintura', 'Salvar')}`;
    case 'editarTintura':
      return `<h2>Editar ${esc(tintura().codigo)}</h2>${formularioTintura(tintura())}${erro}${botoesJanela('salvarEdicaoTintura', 'Salvar alterações')}`;
    case 'entrada': {
      const t = tintura();
      return `<h2>Entrada de tubos · ${esc(t.codigo)}</h2>
        <p class="secundario">Estoque atual: ${plural(t.quantidade_tubos, 'tubo')}</p>
        <div class="contador">
          <button class="btn" aria-label="Menos um tubo" data-acao="mudarEntrada" data-passo="-1">−</button>
          <output aria-live="polite">${j.quantidade}</output>
          <button class="btn" aria-label="Mais um tubo" data-acao="mudarEntrada" data-passo="1">+</button>
        </div>
        <p>Novo estoque: <strong>${t.quantidade_tubos + j.quantidade}</strong></p>${erro}
        ${botoesJanela('salvarEntrada', 'Salvar entrada')}`;
    }
    case 'novoHorario':
      return `<h2>Novo horário</h2>${formularioNovoHorario()}${erro}
        ${estado.clientes.length ? botoesJanela('salvarNovoHorario', 'Salvar horário') : botoesJanela('fecharJanela', 'Ok')}`;
    case 'remarcar': {
      const a = horarioPorId(j.id);
      return `<h2>Remarcar ${esc(a.nome)}</h2>
        <p class="secundario">Agora: ${rotuloDia(a.data)} às ${a.hora}. Depois de remarcar, o horário volta para <strong>pendente</strong>.</p>
        ${camposHorario(a)}${erro}${botoesJanela('salvarRemarcar', 'Salvar novo horário')}`;
    }
    case 'cancelarHorario': {
      const a = horarioPorId(j.id);
      return `<h2>Cancelar horário?</h2>
        <p class="secundario">Use também quando a cliente não veio.</p>
        <p><strong>${esc(a.nome)}</strong> · ${rotuloDia(a.data)} às ${a.hora}</p>
        <p class="secundario">O horário fica livre para outra cliente.</p>${erro}
        <div class="acoes"><button class="btn perigo" data-acao="confirmarCancelarHorario">Sim, cancelar</button>
        <button class="btn" data-acao="fecharJanela">Não</button></div>`;
    }
    case 'finalizar': {
      const a = horarioPorId(j.id);
      const linhas = estado.tinturas.length
        ? estado.tinturas.map(t => `
          <div class="linha" style="align-items:center;padding:8px 0;border-bottom:1px solid var(--cor-linha)">
            <div><strong>${esc(t.codigo)}</strong> <span class="secundario">${esc(t.marca)} · estoque: ${t.quantidade_tubos}</span></div>
            <div class="contador">
              <button class="btn" aria-label="Menos um tubo de ${esc(t.codigo)}" data-acao="mudarTubo" data-id="${t.id}" data-passo="-1">−</button>
              <output aria-live="polite">${j.tubos[t.id] || 0}</output>
              <button class="btn" aria-label="Mais um tubo de ${esc(t.codigo)}" data-acao="mudarTubo" data-id="${t.id}" data-passo="1">+</button>
            </div>
          </div>`).join('')
        : '<p class="secundario">Nenhuma tintura cadastrada.</p>';
      return `<h2>Finalizar atendimento</h2>
        ${a.alergias ? `<div class="alerta-alergia" role="alert" style="margin-bottom:12px">⚠️ Alergia: ${esc(a.alergias)}</div>` : ''}
        <p><strong>${esc(a.nome)}</strong> · ${esc(a.servicos.map(s => s.nome).join(' + '))}</p>
        <p class="secundario">Quantos tubos de cada tintura foram usados? Deixe 0 se não usou.</p>
        ${linhas}${erro}${botoesJanela('concluirAtendimento', 'Concluir atendimento')}`;
    }
    case 'intervalos':
      return `<h2>Intervalos de retorno</h2>
        <p class="secundario">Depois de quantos dias cada serviço costuma ser refeito? A cliente aparece em "Hora de voltar" 7 dias antes.</p>
        ${estado.servicos.map(sv => `
          <label class="rotulo" for="int${sv.id}">${esc(sv.nome)} (dias)</label>
          <input class="campo" type="number" min="1" max="365" step="1" inputmode="numeric" id="int${sv.id}" value="${sv.intervalo_retorno_dias}">`).join('')}
        ${erro}${botoesJanela('salvarIntervalos', 'Salvar intervalos')}`;
    case 'novaCliente':
      return `<h2>Nova cliente</h2>${formularioCliente()}${erro}${botoesJanela('salvarNovaCliente', 'Salvar cliente')}`;
    case 'editarCliente':
      return `<h2>Editar ficha</h2>${formularioCliente(estado.ficha)}${erro}${botoesJanela('salvarEdicaoCliente', 'Salvar alterações')}`;
    case 'excluirCliente':
      return `<h2>Excluir ${esc(estado.ficha.nome)}?</h2>
        <p>A ficha, o histórico e os horários dela serão apagados. <strong>Isso não pode ser desfeito.</strong></p>${erro}
        ${botoesJanela('confirmarExcluirCliente', 'Sim, excluir', 'perigo')}`;
    default:
      return '';
  }
}

// ---------- Desenhar ----------
function desenhar() {
  if (estado.logado === null) { document.getElementById('app').innerHTML = `<p class="carregando">Carregando…</p>`; return; }
  if (estado.logado === false) {
    document.getElementById('app').innerHTML = telaLogin();
    document.getElementById('janela').innerHTML = '';
    document.getElementById('email')?.focus();
    return;
  }
  let corpo;
  if (estado.carregando) corpo = `<p class="carregando">Carregando…</p>`;
  else if (estado.erroCarregar) {
    corpo = `<p class="erro">${esc(estado.erroCarregar)}</p>
      <button class="btn bloco" style="margin-top:12px" data-acao="recarregar">Tentar de novo</button>`;
  } else if (estado.tela === 'ficha') corpo = telaFicha();
  else corpo = { agenda: telaAgenda, clientes: telaClientes, tinturas: telaTinturas }[estado.aba]();

  document.getElementById('app').innerHTML = topo() + `<main class="conteudo">${corpo}</main>` + abas();
  desenharJanela();
}

function desenharJanela(manterFoco = false) {
  const area = document.getElementById('janela');
  if (!estado.janela) { area.innerHTML = ''; return; }
  // Clicar FORA da janela não fecha: assim a Lucy não perde o que digitou
  // por um toque sem querer. Fecha só pelo botão "Voltar" ou pela tecla Esc.
  area.innerHTML = `<div class="fundo-janela">
    <div class="janela" role="dialog" aria-modal="true">${conteudoJanela()}</div></div>`;
  if (!manterFoco) area.querySelector('.janela input, .janela textarea, .janela button')?.focus();
}

function mostrarErroJanela(mensagem) {
  if (!estado.janela) return avisar(mensagem);   // a janela já foi fechada: avisa no topo
  estado.janela.erro = mensagem;
  document.getElementById('erroJanela').textContent = mensagem;
}

// Evita salvar duas vezes com clique duplo: enquanto o servidor
// não responde, o botão fica desativado.
async function salvando(botao, tarefa) {
  if (botao.disabled) return;
  botao.disabled = true;
  try { await tarefa(); } catch (e) { mostrarErroJanela(e.message); } finally { botao.disabled = false; }
}

const valorDe = id => document.getElementById(id).value;

function dadosTintura() {
  return { codigo: valorDe('tCodigo'), nome: valorDe('tNome'), marca: valorDe('tMarca'),
           quantidade_tubos: valorDe('tQtd'), estoque_minimo: valorDe('tMin') };
}

function dadosCliente() {
  return { nome: valorDe('cNome'), telefone: valorDe('cTel'), alergias: valorDe('cAler'),
           anotacoes: valorDe('cNotas') };
}

// Troca (ou acrescenta) um item numa lista e reordena
function atualizarNaLista(lista, item, ordem) {
  const i = lista.findIndex(x => x.id === item.id);
  if (i >= 0) lista[i] = item; else lista.push(item);
  lista.sort(ordem);
}
const ordemTintura = (a, b) => a.codigo.localeCompare(b.codigo) || a.marca.localeCompare(b.marca);
const ordemCliente = (a, b) => a.nome.localeCompare(b.nome, 'pt-BR');

// ---------- Carregar dados ----------
async function carregarTudo() {
  estado.carregando = true; estado.erroCarregar = ''; desenhar();
  try {
    [estado.tinturas, estado.clientes, estado.servicos, estado.agenda, estado.horaDeVoltar, estado.paraFinalizar] = await Promise.all([
      api('/tinturas'), api('/clientes'), api('/servicos'),
      api(`/agenda?de=${diaISO(0)}&ate=${diaISO(1)}`),
      api(`/hora-de-voltar?hoje=${diaISO(0)}`),
      api(`/agenda/para-finalizar?agora=${encodeURIComponent(agoraLocal())}`)
    ]);
  } catch (e) {
    estado.erroCarregar = e.message;
  }
  estado.carregando = false; desenhar();
}

// Recarrega a agenda (hoje, amanhã e o outro dia escolhido) e a "Hora de voltar",
// que depende dos horários marcados e dos atendimentos finalizados
async function recarregarAgenda() {
  estado.agenda = await api(`/agenda?de=${diaISO(0)}&ate=${diaISO(1)}`);
  estado.horaDeVoltar = await api(`/hora-de-voltar?hoje=${diaISO(0)}`);
  estado.paraFinalizar = await api(`/agenda/para-finalizar?agora=${encodeURIComponent(agoraLocal())}`);
  if (estado.diaExtra) estado.agendaExtra = await api(`/agenda?de=${estado.diaExtra}&ate=${estado.diaExtra}`);
}

const horarioPorId = id => [...estado.agenda, ...estado.agendaExtra, ...estado.paraFinalizar].find(a => a.id === Number(id));

function dadosHorario() {
  return { data: valorDe('hData'), hora: valorDe('hHora'), duracao_min: valorDe('hDur') };
}

async function abrirFicha(id) {
  estado.tela = 'ficha'; estado.ficha = null; desenhar(); window.scrollTo(0, 0);
  try {
    estado.ficha = await api(`/clientes/${id}`);
    desenhar();
  } catch (e) {
    estado.tela = null; desenhar(); avisar(e.message);
  }
}

// ---------- Ações (o que cada botão faz) ----------
const acoes = {
  aba(id) { estado.aba = id; estado.tela = null; desenhar(); window.scrollTo(0, 0); },
  voltar() { estado.tela = null; estado.ficha = null; desenhar(); },
  recarregar() { carregarTudo(); },
  fecharJanela() { estado.janela = null; desenharJanela(); },

  // --- Tinturas ---
  abrirNovaTintura() { estado.janela = { tipo: 'novaTintura' }; desenharJanela(); },
  abrirEditarTintura(id) { estado.janela = { tipo: 'editarTintura', id: Number(id) }; desenharJanela(); },
  abrirEntrada(id) { estado.janela = { tipo: 'entrada', id: Number(id), quantidade: 1 }; desenharJanela(); },
  mudarEntrada(_, botao) {
    estado.janela.quantidade = Math.max(1, estado.janela.quantidade + Number(botao.dataset.passo));
    estado.janela.erro = '';
    desenharJanela(true);
  },
  salvarNovaTintura(_, botao) {
    return salvando(botao, async () => {
      const nova = await api('/tinturas', { metodo: 'POST', corpo: dadosTintura() });
      atualizarNaLista(estado.tinturas, nova, ordemTintura);
      estado.janela = null; desenhar();
      avisar(`Tintura ${nova.codigo} cadastrada.`);
    });
  },
  salvarEdicaoTintura(_, botao) {
    return salvando(botao, async () => {
      const editada = await api(`/tinturas/${estado.janela.id}`, { metodo: 'PUT', corpo: dadosTintura() });
      atualizarNaLista(estado.tinturas, editada, ordemTintura);
      estado.janela = null; desenhar();
      avisar(`Tintura ${editada.codigo} atualizada.`);
    });
  },
  salvarEntrada(_, botao) {
    return salvando(botao, async () => {
      const t = await api(`/tinturas/${estado.janela.id}/entrada`, {
        metodo: 'POST', corpo: { quantidade: estado.janela.quantidade }
      });
      atualizarNaLista(estado.tinturas, t, ordemTintura);
      estado.janela = null; desenhar();
      avisar(`Entrada registrada: ${t.codigo} agora tem ${plural(t.quantidade_tubos, 'tubo')}.`);
    });
  },

  // --- Sair ---
  async sair() {
    try { await api('/sair', { metodo: 'POST' }); } catch { /* mesmo sem resposta, sai da tela */ }
    Object.assign(estado, { logado: false, janela: null, tela: null, ficha: null, clientes: [], agenda: [],
                            agendaExtra: [], paraFinalizar: [], horaDeVoltar: [], tinturas: [], busca: '' });
    desenhar();
  },

  // --- Agenda ---
  abrirNovoHorario() { estado.janela = { tipo: 'novoHorario' }; desenharJanela(); },
  abrirRemarcar(id) { estado.janela = { tipo: 'remarcar', id: Number(id) }; desenharJanela(); },
  abrirCancelarHorario(id) { estado.janela = { tipo: 'cancelarHorario', id: Number(id) }; desenharJanela(); },

  salvarNovoHorario(_, botao) {
    return salvando(botao, async () => {
      const servicos = [...document.querySelectorAll('[name=hServico]:checked')].map(c => Number(c.value));
      const novo = await api('/agenda', { metodo: 'POST', corpo: {
        cliente_id: valorDe('hCliente'), ...dadosHorario(), servicos, observacao: valorDe('hObs')
      } });
      await recarregarAgenda();
      estado.janela = null; estado.aba = 'agenda'; estado.tela = null; desenhar();
      avisar(`Horário de ${novo.nome} marcado: ${rotuloDia(novo.data)} às ${novo.hora} (pendente).`);
    });
  },

  // RF-04: um toque confirma (RNF-02)
  confirmarHorario(id, botao) {
    return salvando(botao, async () => {
      await api(`/agenda/${id}/status`, { metodo: 'PATCH', corpo: { status: 'confirmado' } });
      await recarregarAgenda(); desenhar();
      avisar('Horário confirmado.');
    });
  },

  confirmarCancelarHorario(_, botao) {
    return salvando(botao, async () => {
      await api(`/agenda/${estado.janela.id}/status`, { metodo: 'PATCH', corpo: { status: 'cancelado' } });
      await recarregarAgenda();
      estado.janela = null; desenhar();
      avisar('Horário cancelado e liberado.');
    });
  },

  salvarRemarcar(_, botao) {
    return salvando(botao, async () => {
      const a = await api(`/agenda/${estado.janela.id}`, { metodo: 'PUT', corpo: dadosHorario() });
      await recarregarAgenda();
      estado.janela = null; desenhar();
      avisar(`Remarcado para ${rotuloDia(a.data)} às ${a.hora}. Confirme de novo com a cliente.`);
    });
  },

  // --- Finalizar atendimento (RF-10) ---
  abrirFinalizar(id) { estado.janela = { tipo: 'finalizar', id: Number(id), tubos: {} }; desenharJanela(); },
  mudarTubo(id, botao) {
    const tubos = estado.janela.tubos;
    tubos[id] = Math.max(0, (tubos[id] || 0) + Number(botao.dataset.passo));
    estado.janela.erro = '';
    desenharJanela(true);
  },
  concluirAtendimento(_, botao) {
    return salvando(botao, async () => {
      const tinturas = Object.entries(estado.janela.tubos)
        .filter(([, q]) => q > 0)
        .map(([id, q]) => ({ tintura_id: Number(id), quantidade: q }));
      const { agendamento, tinturas: estoque } = await api(`/agenda/${estado.janela.id}/finalizar`, {
        metodo: 'POST', corpo: { tinturas }
      });
      estado.tinturas = estoque;                // estoque já baixado (RF-10)
      await recarregarAgenda();
      estado.janela = null; desenhar();
      const baixas = tinturas.map(u => estoque.find(t => t.id === u.tintura_id))
        .filter(t => t && t.estoque_baixo).map(t => t.codigo);
      avisar(`Atendimento de ${agendamento.nome} finalizado. Histórico e estoque atualizados.` +
        (baixas.length ? ` ⚠️ Estoque baixo: ${baixas.join(', ')}` : ''));
    });
  },

  // --- Intervalos de retorno (RF-12) ---
  abrirIntervalos() { estado.janela = { tipo: 'intervalos' }; desenharJanela(); },
  salvarIntervalos(_, botao) {
    return salvando(botao, async () => {
      for (const sv of estado.servicos) {
        const dias = valorDe(`int${sv.id}`);
        if (Number(dias) !== sv.intervalo_retorno_dias) {
          const novo = await api(`/servicos/${sv.id}`, { metodo: 'PUT', corpo: { intervalo_retorno_dias: dias } });
          sv.intervalo_retorno_dias = novo.intervalo_retorno_dias;
        }
      }
      await recarregarAgenda();
      estado.janela = null; desenhar();
      avisar('Intervalos de retorno salvos.');
    });
  },

  // --- Clientes ---
  abrirFicha(id) { abrirFicha(id); },
  abrirNovaCliente() { estado.janela = { tipo: 'novaCliente' }; desenharJanela(); },
  abrirEditarCliente() { estado.janela = { tipo: 'editarCliente' }; desenharJanela(); },
  abrirExcluirCliente() { estado.janela = { tipo: 'excluirCliente' }; desenharJanela(); },
  salvarNovaCliente(_, botao) {
    return salvando(botao, async () => {
      const nova = await api('/clientes', { metodo: 'POST', corpo: dadosCliente() });
      atualizarNaLista(estado.clientes, nova, ordemCliente);
      estado.janela = null;
      avisar(`${nova.nome} cadastrada.`);
      abrirFicha(nova.id);            // já mostra a ficha da cliente nova
    });
  },
  salvarEdicaoCliente(_, botao) {
    return salvando(botao, async () => {
      const editada = await api(`/clientes/${estado.ficha.id}`, { metodo: 'PUT', corpo: dadosCliente() });
      atualizarNaLista(estado.clientes, editada, ordemCliente);
      await recarregarAgenda();      // a agenda mostra nome, telefone e alergia: atualiza também (D-05)
      estado.janela = null;
      avisar('Ficha atualizada.');
      abrirFicha(editada.id);         // recarrega a ficha com os dados novos
    });
  },
  confirmarExcluirCliente(_, botao) {
    return salvando(botao, async () => {
      const { id, nome } = estado.ficha;
      await api(`/clientes/${id}`, { metodo: 'DELETE' });
      estado.clientes = estado.clientes.filter(c => c.id !== id);
      await recarregarAgenda();        // os horários dela também foram apagados
      estado.janela = null; estado.tela = null; estado.ficha = null; estado.aba = 'clientes';
      desenhar();
      avisar(`${nome} e todos os dados dela foram excluídos.`);
    });
  }
};

// ---------- Ouvir cliques e teclas ----------
document.addEventListener('click', evento => {
  const alvo = evento.target.closest('[data-acao]');
  if (alvo) acoes[alvo.dataset.acao]?.(alvo.dataset.id, alvo);
});
document.addEventListener('keydown', evento => {
  if (evento.key === 'Escape' && estado.janela) acoes.fecharJanela();
});
// Outro dia da agenda: busca os horários da data escolhida
document.addEventListener('change', async evento => {
  if (evento.target.id !== 'diaExtra') return;
  estado.diaExtra = evento.target.value;
  estado.agendaExtra = [];
  try {
    if (estado.diaExtra) estado.agendaExtra = await api(`/agenda?de=${estado.diaExtra}&ate=${estado.diaExtra}`);
  } catch (e) { avisar(e.message); }
  desenhar();
});

// Busca: filtra a lista enquanto a Lucy digita, sem redesenhar a tela toda
document.addEventListener('input', evento => {
  // Máscara do telefone. Ao APAGAR não reformata, senão a Lucy
  // não conseguiria apagar o traço ou o parêntese.
  if (evento.target.id === 'cTel' && !evento.inputType?.startsWith('delete')) {
    evento.target.value = formatarTelefone(evento.target.value);
  }
  if (evento.target.id === 'busca') {
    estado.busca = evento.target.value;
    document.getElementById('listaClientes').innerHTML = listaClientes();
  }
});

// ---------- Login (RF-01) ----------
// O formulário usa "submit": assim a tecla Enter também entra.
document.addEventListener('submit', async evento => {
  if (evento.target.id !== 'formLogin') return;
  evento.preventDefault();
  const botao = document.getElementById('botaoEntrar');
  if (botao.disabled) return;
  botao.disabled = true;
  try {
    await api('/login', { metodo: 'POST', corpo: { email: valorDe('email'), senha: valorDe('senha') } });
    estado.logado = true;
    await carregarTudo();
  } catch (e) {
    document.getElementById('erroLogin').textContent = e.message;
    botao.disabled = false;
  }
});

// ---------- Começar ----------
// Pergunta ao servidor se já existe um login ativo (cookie de sessão).
(async () => {
  try {
    await api('/eu');
    estado.logado = true;
    carregarTudo();
  } catch (e) {
    if (estado.logado !== false) {           // não foi 401: o servidor está fora do ar
      estado.logado = false; desenhar();
      document.getElementById('erroLogin').textContent = e.message;
    }
  }
})();
