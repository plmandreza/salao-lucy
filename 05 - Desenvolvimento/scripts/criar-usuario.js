// =========================================================
// Cria (ou troca a senha de) um usuário do sistema.
// Uso, dentro da pasta "05 - Desenvolvimento":
//   npm run criar-usuario -- email@exemplo.com MinhaSenhaForte
// =========================================================
const { Pool } = require('pg');
const { gerarHashSenha } = require('../seguranca');

async function principal() {
  const [email, senha] = process.argv.slice(2);
  if (!email || !senha) {
    console.log('Uso: npm run criar-usuario -- email@exemplo.com MinhaSenhaForte');
    process.exit(1);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.log('E-mail inválido.');
    process.exit(1);
  }
  if (senha.length < 8) {
    console.log('A senha precisa ter pelo menos 8 caracteres.');
    process.exit(1);
  }

  const banco = new Pool();
  const { rows } = await banco.query(
    `INSERT INTO usuarios (email, senha_hash) VALUES (lower($1), $2)
     ON CONFLICT (email) DO UPDATE SET senha_hash = EXCLUDED.senha_hash
     RETURNING (xmax = 0) AS novo`,
    [email, gerarHashSenha(senha)]
  );
  // Trocar a senha encerra as sessões antigas (quem estava logado precisa entrar de novo)
  if (!rows[0].novo) {
    await banco.query(
      `DELETE FROM sessoes WHERE usuario_id = (SELECT id FROM usuarios WHERE email = lower($1))`, [email]
    );
  }
  console.log(rows[0].novo ? `Usuário ${email} criado.` : `Senha de ${email} trocada.`);
  await banco.end();
}

principal().catch(erro => {
  console.error('Erro:', erro.message);
  process.exit(1);
});
