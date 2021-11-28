const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;


//Metodo para trazer todos os registros do banco.
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error});}
        conn.query(
            'SELECT *FROM acesso',
            (error, result, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error, reponse: null});}
                const response = {
                    quantidade: result.length,
                    usuarios: result.map(users =>{
                        return {
                            id_login: users.id_login,
                            desc_email: users.desc_email,
                            desc_nome: users.desc_nome,
                            desc_password: users.desc_password,
                            dat_registro: users.dat_registro,
                            request: {
                                tipo: 'GET',
                                descricao: 'retorna todos os ususarios',
                                url: 'http://localhost:3000/acesso/' + users.desc_email
                            }
                        }
                    })
                }
                return res.status(200).send({response})
            }
        )
    });
});

//Metodo para trazer o registro de somente um item especifico.
router.get('/:desc_email/:desc_password', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error});}
        conn.query(
            'SELECT EXISTS (SELECT 1 FROM acesso WHERE desc_email = ? and desc_password = ?)',
            [req.params.desc_email, req.params.desc_password],
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error, reponse: null});}

                const response = {
                    validar: resultado.map(val =>{
                        return {
                            desc_email: val.desc_email,
                            desc_password: val.desc_password,
                            request: {
                                tipo: 'GET',
                                descricao: 'valida usuario e senha de acesso.'
                            }
                        }
                    })
                }
                return res.status(200).send({response: resultado})
            }
        )
    });
});

//Metodo para incluir um novo usuario.
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error});}
        conn.query('SELECT *FROM acesso WHERE desc_email = ?', 
        [req.body.desc_email],
        (error, result, field)=>{
                if(error){ return res.status(500).send({ error: error, reponse: null}) }
                if(result.length != 0){
                    return res.status(404).send({
                        mensagem: 'False'
                    })
                }else{
                    conn.query(
                        'INSERT INTO acesso (desc_email, desc_nome, desc_password, dat_registro) VALUES (?,?,?,?)',
                        [req.body.desc_email, req.body.desc_nome, req.body.desc_password, req.body.dat_data],
                        (error, result, fields) =>{
                            conn.release();
                            if(error){ return res.status(500).send({ error: error, reponse: null});}
                            const response = {
                                mensagem: 'Usuario cadastrado com sucesso!',
                                usuarioCriado: {
                                    desc_email: req.body.desc_email,
                                    desc_nome: req.body.desc_nome,
                                    desc_password: req.body.desc_password,
                                    dat_data: req.body.dat_data,
                                    request: {
                                        tipo: 'POST',
                                        descricao: 'Valida Criação',
                                        url: 'http://localhost:3000/acesso/'
                                    }
                                }
                            }
                            return res.status(201).send({response});
                        }
                    );
                }
        }) 
    });
});

//Metodo para trazer o registro de somente um item especifico.
router.get('/:desc_email/:desc_password', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error});}
        conn.query(
            'SELECT * FROM acesso WHERE desc_email = ? and desc_password = ?',
            [req.params.desc_email, req.params.desc_password],
            (error, result, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error, reponse: null});}

                if(result.length == 0){
                    return res.status(404).send({
                        mensagem: 'False'
                    })
                }
                const response = {
                    usuario: {
                        desc_email: result[0].desc_email,
                        desc_password: result[0].desc_password,
                        request: {
                            tipo: 'GET',
                            descricao: 'retorna usuario e senha',
                            url: 'http://localhost:3000/acesso/'
                        }
                    }
                    
                }
                return res.status(200).send({response})
            }
        )
    });
});

//Metodo para alterar um usuario.
router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error});}
        conn.query(
            'UPDATE acesso SET desc_password = ? WHERE desc_email = ?',
            [req.body.desc_password, req.body.desc_email],
            (error, result, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error, reponse: null});}
                const response = {
                    mensagem: 'Usuario autalizado com sucesso!',
                    usuario: {
                        desc_email: req.body.desc_email,

                        request: {
                            tipo: 'PACHT',
                            descricao: 'Valida Alteração',
                            url: 'http://localhost:3000/acesso/'
                        }
                    }
                    
                }
                return res.status(202).send({response});
            }
        );
    });
});

//Metodo para deletar um usuario.
router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error});}
        conn.query(
            'DELETE FROM acesso WHERE desc_email = ?',
            [req.body.desc_email],
            (error, result, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error, reponse: null});}
                const response = {
                    mensagem: 'Usuario removido com sucesso.',
                    request: {
                        tipo: 'DELETE',
                        descricao: 'Deleta um usuario.',
                        url: 'http://localhost:3000/acesso',
                        body: {
                            desc_email: 'String'
                        }
                    }
                }
                return res.status(202).send({response});
            }
        );
    });
});

module.exports = router;