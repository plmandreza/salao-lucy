// =========================================================
// seguranca.js — senhas e sessões (RF-01, RNF-04)
// Usa só o módulo "crypto", que já vem com o Node.js.
// =========================================================
const crypto = require('node:crypto');

// ---------- Senhas ----------
// A senha NUNCA é guardada como foi digitada. Guardamos um "hash":
// um embaralhamento de mão única (não dá para desfazer).
// O "sal" é um valor aleatório que faz duas senhas iguais virarem hashes diferentes.
// Formato guardado no banco: "scrypt$<sal>$<hash>"
function gerarHashSenha(senha) {
  const sal = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(senha, sal, 64).toString('hex');
  return `scrypt$${sal}$${hash}`;
}

// Confere se a senha digitada bate com o hash guardado.
// timingSafeEqual compara em tempo constante (não "vaza" pistas pelo tempo).
function conferirSenha(senha, guardado) {
  const [tipo, sal, hash] = String(guardado).split('$');
  if (tipo !== 'scrypt' || !sal || !hash) return false;
  const tentativa = crypto.scryptSync(senha, sal, 64);
  const esperado = Buffer.from(hash, 'hex');
  return esperado.length === tentativa.length && crypto.timingSafeEqual(esperado, tentativa);
}

// ---------- Sessões ----------
// Depois do login, o navegador recebe um "crachá" (token) aleatório num cookie.
// No banco guardamos só o hash do token: se o banco vazar, os crachás não servem.
function novoToken() {
  return crypto.randomBytes(32).toString('hex');
}
function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

// Lê um cookie do cabeçalho "Cookie: nome=valor; outro=valor"
function lerCookie(req, nome) {
  const cabecalho = req.headers.cookie || '';
  for (const parte of cabecalho.split(';')) {
    const [chave, ...resto] = parte.trim().split('=');
    if (chave === nome) return decodeURIComponent(resto.join('='));
  }
  return null;
}

// ---------- Limite de tentativas ----------
// Até 5 tentativas erradas a cada 15 minutos, por endereço (IP).
// Fica na memória do servidor: reiniciar o servidor zera a contagem.
const TENTATIVAS_MAX = 5;
const JANELA_MS = 15 * 60 * 1000;
const tentativas = new Map();   // ip → { erros, desde }

function bloqueado(ip) {
  const t = tentativas.get(ip);
  if (!t) return false;
  if (Date.now() - t.desde > JANELA_MS) { tentativas.delete(ip); return false; }
  return t.erros >= TENTATIVAS_MAX;
}
function registrarErro(ip) {
  const t = tentativas.get(ip);
  if (!t || Date.now() - t.desde > JANELA_MS) tentativas.set(ip, { erros: 1, desde: Date.now() });
  else t.erros++;
}
function limparErros(ip) { tentativas.delete(ip); }

module.exports = {
  gerarHashSenha, conferirSenha, novoToken, hashToken, lerCookie,
  bloqueado, registrarErro, limparErros
};
