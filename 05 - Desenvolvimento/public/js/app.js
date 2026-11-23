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

// Protege contra texto malicioso: transforma < > & " ' em texto comum
function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const plural = (n, palavra) => `${n} ${palavra}${n === 1 ? '' : 's'}`;

// Compara textos sem ligar para maiúsculas e acentos ("Andréa" acha "andrea")
const semAcento = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

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
  if (!resposta.ok) throw new Error(dados.erro || 'Algo deu errado. Tente de novo.');
  return dados;
}

// ---------- Estado da tela ----------
const estado = {
  aba: 'clientes',      // aba escolhida no menu de baixo
  tela: null,           // tela "por cima" da aba: 'ficha' ou null
  carregando: true,
  erroCarregar: '',
  tinturas: [],
  clientes: [],
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
  return `<header class="topo"><div><h1>Lucy Cabeleireira</h1><small>${hojeTexto()}</small></div></header>`;
}

function abas() {
  const baixas = estado.tinturas.filter(t => t.estoque_baixo).length;
  const botao = (id, icone, nome, contagem) => `
    <button data-acao="aba" data-id="${id}" ${estado.aba === id && !estado.tela ? 'aria-current="page"' : ''}>
      <span aria-hidden="true" style="font-size:20px">${icone}</span>${nome}
      ${contagem ? `<span class="contagem" aria-label="${contagem} avisos">${contagem}</span>` : ''}
    </button>`;
  return `<nav class="abas" aria-label="Menu principal">
    ${botao('agenda', '📅', 'Agenda', 0)}${botao('clientes', '👩', 'Clientes', 0)}${botao('tinturas', '🎨', 'Tinturas', baixas)}
  </nav>`;
}

const seloAlergia = alergias => alergias
  ? `<span class="selo alergia" style="margin-top:8px">⚠️ Alergia: ${esc(alergias)}</span>` : '';

// ---------- Tela: Agenda (em construção) ----------
function telaAgenda() {
  return `<p class="vazio">A <strong>Agenda</strong> será construída na próxima parte da Etapa 05.</p>`;
}

// ---------- Tela: Clientes (RF-08) ----------
function telaClientes() {
  return `<button class="btn primario bloco" data-acao="abrirNovaCliente">+ Nova cliente</button>
    <h2 class="titulo-secao">Hora de voltar</h2>
    <p class="vazio">A lista de quem está na hora de voltar aparece depois que a agenda e os atendimentos estiverem prontos.</p>
    <h2 class="titulo-secao">Todas as clientes (${estado.clientes.length})</h2>
    <label class="rotulo" for="busca" style="margin-top:0">Buscar pelo nome</label>
    <input class="campo" type="search" id="busca" placeholder="Ex.: Ana" value="${esc(estado.busca)}" autocomplete="off">
    <div id="listaClientes" style="margin-top:12px">${listaClientes()}</div>`;
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
    <input class="campo" id="cTel" type="tel" inputmode="tel" placeholder="(XX) 9XXXX-XXXX" value="${esc(c.telefone)}">
    <label class="rotulo" for="cAler">Alergias</label>
    <textarea class="campo" id="cAler" rows="2" placeholder="Ex.: PPD, amônia…" aria-describedby="cAlerDica">${esc(c.alergias)}</textarea>
    <p class="secundario" id="cAlerDica" style="margin:4px 0 0">Usada só para evitar reações no atendimento.</p>
    <label class="rotulo" for="cNotas">Anotações</label>
    <textarea class="campo" id="cNotas" rows="3" placeholder="Preferências, produtos usados…">${esc(c.anotacoes)}</textarea>`;
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
    [estado.tinturas, estado.clientes] = await Promise.all([api('/tinturas'), api('/clientes')]);
  } catch (e) {
    estado.erroCarregar = e.message;
  }
  estado.carregando = false; desenhar();
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
// Busca: filtra a lista enquanto a Lucy digita, sem redesenhar a tela toda
document.addEventListener('input', evento => {
  if (evento.target.id === 'busca') {
    estado.busca = evento.target.value;
    document.getElementById('listaClientes').innerHTML = listaClientes();
  }
});

// ---------- Começar ----------
carregarTudo();
