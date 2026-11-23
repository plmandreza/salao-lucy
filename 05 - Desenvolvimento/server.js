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
// Ajudantes de validação: nunca confie no que chega da tela
// ---------------------------------------------------------

// Devolve o número se for inteiro e maior ou igual ao mínimo; senão, null
function inteiro(valor, minimo = 0) {
  const n = Number(valor);
  return valor !== '' && valor !== null && Number.isInteger(n) && n >= minimo ? n : null;
}

// Devolve o texto sem espaços nas pontas (ou '' se não for texto)
function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

// =========================================================
// TINTURAS — RF-13 (cadastrar/editar), RF-14 (entrada),
//            RF-15 (alerta), RN-03 (nunca negativo), RN-04 (alerta ≤ mínimo)
// =========================================================

// Colunas devolvidas para a tela. "estoque_baixo" é calculado pelo banco (RN-04)
const COLUNAS_TINTURA = `id, codigo, nome, marca, quantidade_tubos, estoque_minimo,
  (quantidade_tubos <= estoque_minimo) AS estoque_baixo`;

// Lê e confere os dados de uma tintura enviados pela tela
function lerTintura(corpo) {
  const dados = {
    codigo: texto(corpo.codigo),
    nome: texto(corpo.nome),
    marca: texto(corpo.marca),
    quantidade_tubos: inteiro(corpo.quantidade_tubos),
    estoque_minimo: inteiro(corpo.estoque_minimo)
  };
  if (!dados.codigo) return { erro: 'Informe o código da tintura (ex.: 7.0).' };
  if (dados.quantidade_tubos === null || dados.estoque_minimo === null) {
    return { erro: 'Tubos e estoque mínimo precisam ser números inteiros a partir de 0.' };
  }
  return { dados };
}

// Listar todas as tinturas
app.get('/api/tinturas', async (req, res) => {
  const { rows } = await banco.query(
    `SELECT ${COLUNAS_TINTURA} FROM tinturas ORDER BY codigo, marca`
  );
  res.json(rows);
});

// Cadastrar uma tintura nova (RF-13)
app.post('/api/tinturas', async (req, res) => {
  const { erro, dados } = lerTintura(req.body ?? {});
  if (erro) return res.status(400).json({ erro });

  const { rows } = await banco.query(
    `INSERT INTO tinturas (codigo, nome, marca, quantidade_tubos, estoque_minimo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUNAS_TINTURA}`,
    [dados.codigo, dados.nome, dados.marca, dados.quantidade_tubos, dados.estoque_minimo]
  );
  res.status(201).json(rows[0]);
});

// Editar uma tintura (RF-13)
app.put('/api/tinturas/:id', async (req, res) => {
  const id = inteiro(req.params.id, 1);
  if (!id) return res.status(404).json({ erro: 'Tintura não encontrada.' });
  const { erro, dados } = lerTintura(req.body ?? {});
  if (erro) return res.status(400).json({ erro });

  const { rows } = await banco.query(
    `UPDATE tinturas
        SET codigo = $1, nome = $2, marca = $3, quantidade_tubos = $4, estoque_minimo = $5
      WHERE id = $6
     RETURNING ${COLUNAS_TINTURA}`,
    [dados.codigo, dados.nome, dados.marca, dados.quantidade_tubos, dados.estoque_minimo, id]
  );
  if (!rows.length) return res.status(404).json({ erro: 'Tintura não encontrada.' });
  res.json(rows[0]);
});

// Entrada de tubos comprados (RF-14).
// A soma é feita PELO BANCO ("quantidade + X"), e não pela tela:
// assim o número fica certo mesmo com o sistema aberto em dois aparelhos.
app.post('/api/tinturas/:id/entrada', async (req, res) => {
  const id = inteiro(req.params.id, 1);
  const quantidade = inteiro(req.body?.quantidade, 1);
  if (!id) return res.status(404).json({ erro: 'Tintura não encontrada.' });
  if (!quantidade) return res.status(400).json({ erro: 'A entrada precisa ser de pelo menos 1 tubo.' });

  const { rows } = await banco.query(
    `UPDATE tinturas SET quantidade_tubos = quantidade_tubos + $1
      WHERE id = $2
     RETURNING ${COLUNAS_TINTURA}`,
    [quantidade, id]
  );
  if (!rows.length) return res.status(404).json({ erro: 'Tintura não encontrada.' });
  res.json(rows[0]);
});

// =========================================================
// CLIENTES — RF-07 (cadastrar/editar/excluir), RF-08 (buscar),
//            RF-09 (ficha + histórico), RN-07 (telefone),
//            RNF-06 (LGPD: alergia protegida por login e apagada ao excluir)
// =========================================================

// Lê e confere os dados de uma cliente enviados pela tela
function lerCliente(corpo) {
  const dados = {
    nome: texto(corpo.nome),
    telefone: texto(corpo.telefone),
    alergias: texto(corpo.alergias),       // RNF-06: base legal art. 11, II, "e" da LGPD
    anotacoes: texto(corpo.anotacoes)
  };
  const digitos = dados.telefone.replace(/\D/g, '');            // só os números
  if (!dados.nome) return { erro: 'Informe o nome da cliente.' };
  if (digitos.length < 10 || digitos.length > 11) {              // RN-07 + RNF-10: com DDD
    return { erro: 'Informe o WhatsApp com DDD, no formato (XX) 9XXXX-XXXX.' };
  }
  return { dados };
}

// Listar clientes (a busca pelo nome é feita na tela — RF-08)
app.get('/api/clientes', async (req, res) => {
  const { rows } = await banco.query(
    `SELECT id, nome, telefone, alergias FROM clientes ORDER BY lower(nome)`
  );
  res.json(rows);
});

// Ficha completa de uma cliente, com histórico de atendimentos (RF-09)
app.get('/api/clientes/:id', async (req, res) => {
  const id = inteiro(req.params.id, 1);
  if (!id) return res.status(404).json({ erro: 'Cliente não encontrada.' });

  const ficha = await banco.query(
    `SELECT id, nome, telefone, alergias, anotacoes
       FROM clientes WHERE id = $1`, [id]
  );
  if (!ficha.rows.length) return res.status(404).json({ erro: 'Cliente não encontrada.' });

  // Cada atendimento com a lista de serviços e de tinturas usadas.
  // (O histórico se enche quando a Lucy finalizar atendimentos — RF-10.)
  const historico = await banco.query(
    `SELECT a.id,
            to_char(a.data, 'YYYY-MM-DD') AS data,
            COALESCE((SELECT json_agg(s.nome ORDER BY s.nome)
                        FROM atendimento_servicos x JOIN servicos s ON s.id = x.servico_id
                       WHERE x.atendimento_id = a.id), '[]') AS servicos,
            COALESCE((SELECT json_agg(json_build_object('codigo', t.codigo, 'marca', t.marca,
                                                        'quantidade', y.quantidade_tubos)
                                      ORDER BY t.codigo)
                        FROM atendimento_tinturas y JOIN tinturas t ON t.id = y.tintura_id
                       WHERE y.atendimento_id = a.id), '[]') AS tinturas
       FROM atendimentos a
      WHERE a.cliente_id = $1
      ORDER BY a.data DESC, a.id DESC`, [id]
  );
  res.json({ ...ficha.rows[0], historico: historico.rows });
});

// Cadastrar cliente (RF-07)
app.post('/api/clientes', async (req, res) => {
  const { erro, dados } = lerCliente(req.body ?? {});
  if (erro) return res.status(400).json({ erro });

  const { rows } = await banco.query(
    `INSERT INTO clientes (nome, telefone, alergias, anotacoes)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nome, telefone, alergias`,
    [dados.nome, dados.telefone, dados.alergias, dados.anotacoes]
  );
  res.status(201).json(rows[0]);
});

// Editar cliente (RF-07)
app.put('/api/clientes/:id', async (req, res) => {
  const id = inteiro(req.params.id, 1);
  if (!id) return res.status(404).json({ erro: 'Cliente não encontrada.' });
  const { erro, dados } = lerCliente(req.body ?? {});
  if (erro) return res.status(400).json({ erro });

  const { rows } = await banco.query(
    `UPDATE clientes
        SET nome = $1, telefone = $2, alergias = $3, anotacoes = $4
      WHERE id = $5
     RETURNING id, nome, telefone, alergias`,
    [dados.nome, dados.telefone, dados.alergias, dados.anotacoes, id]
  );
  if (!rows.length) return res.status(404).json({ erro: 'Cliente não encontrada.' });
  res.json(rows[0]);
});

// Excluir cliente (RF-07, RNF-06): apaga a ficha, o histórico e os horários dela.
// O "ON DELETE CASCADE" do banco cuida de apagar tudo que é ligado à cliente.
app.delete('/api/clientes/:id', async (req, res) => {
  const id = inteiro(req.params.id, 1);
  if (!id) return res.status(404).json({ erro: 'Cliente não encontrada.' });
  const { rowCount } = await banco.query('DELETE FROM clientes WHERE id = $1', [id]);
  if (!rowCount) return res.status(404).json({ erro: 'Cliente não encontrada.' });
  res.status(204).end();
});

// ---------------------------------------------------------
// Rotas da API que não existem → 404 em JSON
// ---------------------------------------------------------
app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Endereço da API não encontrado.' });
});

// ---------------------------------------------------------
// Tratamento de erros: transforma erros técnicos em mensagens
// que a Lucy entende. Precisa ficar DEPOIS de todas as rotas.
// ---------------------------------------------------------
const MENSAGENS_DO_BANCO = {
  tinturas_codigo_marca_key: 'Já existe uma tintura com esse código e essa marca.',
  tinturas_quantidade_tubos_check: 'O estoque não pode ficar negativo.',
  clientes_telefone_check: 'Informe o WhatsApp com DDD.',
  clientes_nome_check: 'Informe o nome da cliente.'
};

app.use((erro, req, res, next) => {
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'Dados enviados em formato inválido.' });
  }
  if (MENSAGENS_DO_BANCO[erro.constraint]) {
    return res.status(409).json({ erro: MENSAGENS_DO_BANCO[erro.constraint] });
  }
  console.error(erro);   // o detalhe técnico fica só no terminal
  res.status(500).json({ erro: 'Erro interno no servidor. Tente de novo.' });
});

// ---------------------------------------------------------
// Liga o servidor
// ---------------------------------------------------------
const PORTA = Number(process.env.PORT) || 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
