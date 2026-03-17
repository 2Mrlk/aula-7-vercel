// =============================================================
// routes/produtos.js — Rotas de Produtos (CRUD Completo)
// =============================================================
// O que é CRUD?
//   Create (POST)   → Criar produto novo
//   Read   (GET)    → Ler/listar produtos
//   Update (PUT)    → Atualizar produto existente
//   Delete (DELETE) → Remover produto
//
// Todas as 4 operações estão implementadas aqui!
// =============================================================

const express = require('express');
const router = express.Router();
let db = require('../data/database');
// ⚠️ Usamos 'let' (não 'const') porque a rota DELETE vai
//    reatribuir db.produtos com um novo array filtrado.

// =============================================================
// ── AULA 6: ROTA ESPECIAL PARA TESTE DE ERRO ─────────────────
// =============================================================
// Esta rota existe apenas para demonstrar o Middleware de Erros.
// Quando acessada, ela "explode" de propósito para mostrar
// que o errorHandler captura o erro e devolve um JSON elegante
// em vez de travar o servidor.
//
// Teste no Thunder Client:
//   Método: GET
//   URL: http://localhost:3000/api/produtos/erro-teste
//
// Resposta esperada (com o errorHandler funcionando):
//   { "sucesso": false, "mensagem": "Ops!...", "detalhe": "O servidor do Haruy Sushi tropeçou!" }
//
// ⚠️ DEVE VIR ANTES da rota '/:id', senão "erro-teste" seria
//    interpretado como um ID de produto!
// =============================================================
router.get('/erro-teste', (req, res) => {
    // throw new Error() lança um erro intencional.
    // O Express captura e repassa para o middleware de erro (errorHandler.js).
    throw new Error("O servidor do Haruy Sushi tropeçou!");
});

// =============================================================
// ── [GET] /api/produtos ───────────────────────────────────────
// Retorna todos os produtos OU filtra por categoriaId.
//
// Exemplos de teste no Thunder Client:
//   Todos:             GET http://localhost:3000/api/produtos
//   Filtrar categoria: GET http://localhost:3000/api/produtos?categoriaId=1
//
// Query Params (parâmetros na URL com ?):
//   São acessados via req.query.nomeDoParametro
//   Ex: /api/produtos?categoriaId=2 → req.query.categoriaId === "2"
// =============================================================
router.get('/', (req, res) => {

    // Tentamos ler o parâmetro "categoriaId" da URL (ex: ?categoriaId=1)
    const categoriaId = req.query.categoriaId;

    // Se o parâmetro foi enviado, filtramos os produtos por categoria
    if (categoriaId) {
        // .filter() retorna um novo array com apenas os produtos
        // onde p.categoriaId == categoriaId (note: == e não === para
        // comparar número com string da URL sem precisar converter)
        const produtosFiltrados = db.produtos.filter(p => p.categoriaId == categoriaId);
        return res.json(produtosFiltrados);
    }

    // Se não tem filtro, retorna todos os produtos
    res.json(db.produtos);
});

// =============================================================
// ── [GET] /api/produtos/:id ───────────────────────────────────
// Busca um produto específico pelo seu ID.
//
// Route Params (parâmetros na rota com :):
//   São acessados via req.params.nomeDoParametro
//   Ex: /api/produtos/1 → req.params.id === "1"
//
// Teste: GET http://localhost:3000/api/produtos/1
// =============================================================
router.get('/:id', (req, res) => {

    // Convertemos o ID de string para número inteiro com parseInt()
    const produtoId = parseInt(req.params.id);

    // .find() retorna o PRIMEIRO produto cujo id corresponde
    const produto = db.produtos.find(p => p.id === produtoId);

    if (produto) {
        res.json(produto);
    } else {
        // Status 404 = "Not Found" (não encontrado)
        res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }
});

// =============================================================
// ── [POST] /api/produtos ──────────────────────────────────────
// Adiciona um novo produto ao cardápio.
//
// O corpo (body) da requisição deve ser JSON:
//   { "categoriaId": 1, "nome": "Uramaki", "descricao": "...", "preco": 45.00, "imagem": "uramaki.png" }
//
// Status 201 = Created (recurso criado com sucesso)
//
// Teste no Thunder Client:
//   Método: POST
//   URL: http://localhost:3000/api/produtos
//   Body → JSON → cole o body acima
// =============================================================
router.post('/', (req, res) => {

    // Calcula o novo ID automaticamente.
    // Se a lista não estiver vazia: pega o maior ID existente + 1
    // Se a lista estiver vazia: começa do 1
    const novoId = db.produtos.length > 0
        ? Math.max(...db.produtos.map(p => p.id)) + 1
        : 1;

    // Monta o objeto do novo produto com os dados recebidos no body
    const novoProduto = {
        id: novoId,
        categoriaId: req.body.categoriaId,
        nome: req.body.nome,
        descricao: req.body.descricao,
        preco: req.body.preco,
        imagem: req.body.imagem
    };

    // Adiciona ao nosso array (banco em memória)
    db.produtos.push(novoProduto);

    // Responde com status 201 e o produto criado
    res.status(201).json(novoProduto);
});

// =============================================================
// ── [PUT] /api/produtos/:id ───────────────────────────────────
// Atualiza um produto existente pelo ID.
//
// Body: os campos que deseja alterar, ex:
//   { "preco": 99.90 }
//
// Teste no Thunder Client:
//   Método: PUT
//   URL: http://localhost:3000/api/produtos/1
//   Body → JSON → { "preco": 99.90 }
// =============================================================
router.put('/:id', (req, res) => {

    const produtoId = parseInt(req.params.id);

    // .findIndex() retorna o ÍNDICE (posição) do item no array.
    // Retorna -1 se não encontrar.
    const index = db.produtos.findIndex(p => p.id === produtoId);

    if (index !== -1) {
        // Spread operator (...): mescla o produto original com os novos dados.
        // Os campos do req.body sobrescrevem apenas os campos enviados,
        // mantendo os campos não enviados intactos.
        db.produtos[index] = { ...db.produtos[index], ...req.body };
        res.json(db.produtos[index]);
    } else {
        res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }
});

// =============================================================
// ── [DELETE] /api/produtos/:id ────────────────────────────────
// Remove um produto do cardápio pelo ID.
//
// Teste no Thunder Client:
//   Método: DELETE
//   URL: http://localhost:3000/api/produtos/2
// =============================================================
router.delete('/:id', (req, res) => {

    const produtoId = parseInt(req.params.id);

    // .filter() cria um NOVO array excluindo o produto com o ID informado.
    // Reatribuímos db.produtos (por isso usamos 'let' na importação).
    db.produtos = db.produtos.filter(p => p.id !== produtoId);

    res.json({ mensagem: 'Produto deletado com sucesso!' });
});

// ─── Exportação do Router ─────────────────────────────────────
module.exports = router;
