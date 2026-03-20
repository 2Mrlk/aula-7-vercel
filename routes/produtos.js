
const express = require('express');
const router = express.Router();
let supabase = require('../data/supabase');

router.get('/erro-teste', (req, res) => {

    throw new Error("O servidor do Haruy Sushi tropeçou!");
});

router.get('/', async (req, res, next) => {
    try{
        const {categoriaId} = req.query;
        let consulta = supabase.from('produtos').select('*');

        if (categoriaId){
            consulta = consulta.eq('categoriaId', categoriaId);
        }
        const {data, error} = await consulta.order('id', {ascendir: true});

        if (error) throw error;
        res.json(data);
    }catch (err) {
        next(err);
    }
});



router.get('/:id', async (req, res) => {
    try{
        const {id} = req.params;
        const{data,error} = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .maybeSingle();

        if (error) throw error;
        if(data) {
            res.json(data);
        }else {
            res.status(404).json ({mensagem: 'Não encontrado'})
        }
    }catch (err) {
        next(err)
    }
});

router.post('/', async (req, res) => {
try{
    const {data, error} = await supabase
    .from('produtos')
    .insert([req.body])
    .select();

    if (error) throw error;
    res.status(201).json(data[0]);
}catch (err) {
    next(err);
}
});

router.put('/:id', (req, res) => {

    const produtoId = parseInt(req.params.id);

    const index = db.produtos.findIndex(p => p.id === produtoId);

    if (index !== -1) {
       
        db.produtos[index] = { ...db.produtos[index], ...req.body };
        res.json(db.produtos[index]);
    } else {
        res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }
});

router.delete('/:id', (req, res) => {

    const produtoId = parseInt(req.params.id);
    
    db.produtos = db.produtos.filter(p => p.id !== produtoId);

    res.json({ mensagem: 'Produto deletado com sucesso!' });
});

module.exports = router;
