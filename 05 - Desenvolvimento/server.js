// =========================================================
// server.js — o servidor do sistema Lucy Cabeleireira
// Ele recebe os pedidos da tela, aplica as regras do salão
// e conversa com o banco de dados.
// =========================================================

const path = require('node:path');
const express = require('express');
const { Pool } = require('pg');

// Conexão com o banco. A biblioteca "pg" lê sozinha as variáveis
// PGHOST, PGPORT, PGUSER, PGPASSWORD e PGDATABASE do arquivo .env
const banco = new Pool();

const app = express();
app.use(express.json());                                    // entende dados em JSON
app.use(express.static(path.join(__dirname, 'public')));    // entrega as telas (pasta public)

// ---------------------------------------------------------
// Rota de saúde: responde se o servidor e o banco estão vivos.
// Útil para testar a instalação e, depois, para o Docker.
// ---------------------------------------------------------
app.get('/api/saude', async (req, res) => {
  try {
    const { rows } = await banco.query(
      'SELECT now() AS agora, (SELECT count(*) FROM servicos)::int AS servicos'
    );
    res.json({ servidor: 'ok', banco: 'ok', ...rows[0] });
  } catch (erro) {
    console.error('Erro ao conectar no banco:', erro.message);
    res.status(503).json({
      servidor: 'ok',
      banco: 'erro',
      mensagem: 'Não foi possível conectar ao banco de dados. O Docker está ligado?'
    });
  }
});

// ---------------------------------------------------------
// Liga o servidor
// ---------------------------------------------------------
const PORTA = Number(process.env.PORT) || 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
