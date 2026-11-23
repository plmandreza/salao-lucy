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

// Protege contra texto malicioso: transforma < > & " ' em texto comum
function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const plural = (n, palavra) => `${n} ${palavra}${n === 1 ? '' : 's'}`;

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
  aba: 'tinturas',          // por enquanto só a aba Tinturas está pronta
  tinturas: [],
  carregando: false,
  erroCarregar: '',
  janela: null              // janela aberta: { tipo, ... } ou null
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
    <button data-acao="aba" data-id="${id}" ${estado.aba === id ? 'aria-current="page"' : ''}>
      <span aria-hidden="true" style="font-size:20px">${icone}</span>${nome}
      ${contagem ? `<span class="contagem" aria-label="${contagem} avisos">${contagem}</span>` : ''}
    </button>`;
  return `<nav class="abas" aria-label="Menu principal">
    ${botao('agenda', '📅', 'Agenda', 0)}${botao('clientes', '👩', 'Clientes', 0)}${botao('tinturas', '🎨', 'Tinturas', baixas)}
  </nav>`;
}

// ---------- Telas ----------
function telaEmConstrucao(nome) {
  return `<p class="vazio">A tela <strong>${nome}</strong> será construída nas próximas partes da Etapa 05.</p>`;
}

function telaTinturas() {
  if (estado.carregando) return `<p class="carregando">Carregando estoque…</p>`;
  if (estado.erroCarregar) {
    return `<p class="erro">${esc(estado.erroCarregar)}</p>
      <button class="btn bloco" style="margin-top:12px" data-acao="recarregar">Tentar de novo</button>`;
  }

  const baixas = estado.tinturas.filter(t => t.estoque_baixo);   // RF-15
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
          <button class="btn" data-acao="abrirEditar" data-id="${t.id}">Editar</button>
        </div>
      </article>`).join('')
    : `<p class="vazio">Nenhuma tintura cadastrada ainda.</p>`;

  return `${alerta}
    <button class="btn primario bloco" style="margin-top:12px" data-acao="abrirNova">+ Nova tintura</button>
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

function conteudoJanela() {
  const j = estado.janela;
  const erro = `<p class="erro" id="erroJanela" style="margin-top:12px">${esc(j.erro || '')}</p>`;

  if (j.tipo === 'nova') {
    return `<h2>Nova tintura</h2>${formularioTintura()}${erro}
      <div class="acoes"><button class="btn primario" data-acao="salvarNova">Salvar</button>
      <button class="btn" data-acao="fecharJanela">Voltar</button></div>`;
  }
  if (j.tipo === 'editar') {
    const t = estado.tinturas.find(x => x.id === j.id);
    return `<h2>Editar ${esc(t.codigo)}</h2>${formularioTintura(t)}${erro}
      <div class="acoes"><button class="btn primario" data-acao="salvarEdicao">Salvar alterações</button>
      <button class="btn" data-acao="fecharJanela">Voltar</button></div>`;
  }
  if (j.tipo === 'entrada') {
    const t = estado.tinturas.find(x => x.id === j.id);
    return `<h2>Entrada de tubos · ${esc(t.codigo)}</h2>
      <p class="secundario">Estoque atual: ${plural(t.quantidade_tubos, 'tubo')}</p>
      <div class="contador">
        <button class="btn" aria-label="Menos um tubo" data-acao="mudarEntrada" data-passo="-1">−</button>
        <output aria-live="polite">${j.quantidade}</output>
        <button class="btn" aria-label="Mais um tubo" data-acao="mudarEntrada" data-passo="1">+</button>
      </div>
      <p>Novo estoque: <strong>${t.quantidade_tubos + j.quantidade}</strong></p>${erro}
      <div class="acoes"><button class="btn primario" data-acao="salvarEntrada">Salvar entrada</button>
      <button class="btn" data-acao="fecharJanela">Voltar</button></div>`;
  }
  return '';
}

// ---------- Desenhar ----------
function desenhar() {
  const telas = {
    agenda: () => telaEmConstrucao('Agenda'),
    clientes: () => telaEmConstrucao('Clientes'),
    tinturas: telaTinturas
  };
  document.getElementById('app').innerHTML =
    topo() + `<main class="conteudo">${telas[estado.aba]()}</main>` + abas();
  desenharJanela();
}

function desenharJanela(manterFoco = false) {
  const area = document.getElementById('janela');
  if (!estado.janela) { area.innerHTML = ''; return; }
  // Clicar FORA da janela não fecha: assim a Lucy não perde o que digitou
  // por um toque sem querer. Fecha só pelo botão "Voltar" ou pela tecla Esc.
  area.innerHTML = `<div class="fundo-janela">
    <div class="janela" role="dialog" aria-modal="true">${conteudoJanela()}</div></div>`;
  if (!manterFoco) area.querySelector('.janela input, .janela button')?.focus();
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
  try { await tarefa(); } finally { botao.disabled = false; }
}

// Lê o formulário de tintura da janela
function dadosDoFormulario() {
  const valor = id => document.getElementById(id).value;
  return {
    codigo: valor('tCodigo'), nome: valor('tNome'), marca: valor('tMarca'),
    quantidade_tubos: valor('tQtd'), estoque_minimo: valor('tMin')
  };
}

// Troca a tintura alterada na lista (sem recarregar tudo)
function atualizarNaLista(tintura) {
  const i = estado.tinturas.findIndex(t => t.id === tintura.id);
  if (i >= 0) estado.tinturas[i] = tintura; else estado.tinturas.push(tintura);
  estado.tinturas.sort((a, b) => a.codigo.localeCompare(b.codigo) || a.marca.localeCompare(b.marca));
}

// ---------- Carregar dados ----------
async function carregarTinturas() {
  estado.carregando = true; estado.erroCarregar = ''; desenhar();
  try {
    estado.tinturas = await api('/tinturas');
  } catch (e) {
    estado.erroCarregar = e.message;
  }
  estado.carregando = false; desenhar();
}

// ---------- Ações (o que cada botão faz) ----------
const acoes = {
  nada() {},
  aba(id) { estado.aba = id; desenhar(); window.scrollTo(0, 0); },
  recarregar() { carregarTinturas(); },
  fecharJanela() { estado.janela = null; desenharJanela(); },

  abrirNova() { estado.janela = { tipo: 'nova' }; desenharJanela(); },
  abrirEditar(id) { estado.janela = { tipo: 'editar', id: Number(id) }; desenharJanela(); },
  abrirEntrada(id) { estado.janela = { tipo: 'entrada', id: Number(id), quantidade: 1 }; desenharJanela(); },

  mudarEntrada(_, botao) {
    estado.janela.quantidade = Math.max(1, estado.janela.quantidade + Number(botao.dataset.passo));
    estado.janela.erro = '';
    desenharJanela(true);
  },

  // Cada "salvar" usa salvando(...) para bloquear o clique duplo
  salvarNova(_, botao) {
    return salvando(botao, async () => {
      try {
        const nova = await api('/tinturas', { metodo: 'POST', corpo: dadosDoFormulario() });
        atualizarNaLista(nova);
        estado.janela = null; desenhar();
        avisar(`Tintura ${nova.codigo} cadastrada.`);
      } catch (e) { mostrarErroJanela(e.message); }
    });
  },

  salvarEdicao(_, botao) {
    return salvando(botao, async () => {
      try {
        const editada = await api(`/tinturas/${estado.janela.id}`, { metodo: 'PUT', corpo: dadosDoFormulario() });
        atualizarNaLista(editada);
        estado.janela = null; desenhar();
        avisar(`Tintura ${editada.codigo} atualizada.`);
      } catch (e) { mostrarErroJanela(e.message); }
    });
  },

  salvarEntrada(_, botao) {
    return salvando(botao, async () => {
      try {
        const t = await api(`/tinturas/${estado.janela.id}/entrada`, {
          metodo: 'POST', corpo: { quantidade: estado.janela.quantidade }
        });
        atualizarNaLista(t);
        estado.janela = null; desenhar();
        avisar(`Entrada registrada: ${t.codigo} agora tem ${plural(t.quantidade_tubos, 'tubo')}.`);
      } catch (e) { mostrarErroJanela(e.message); }
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

// ---------- Começar ----------
carregarTinturas();
