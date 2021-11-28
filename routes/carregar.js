const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './carregar/');
    },
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
})
const upload = multer({ storage: storage});


router.post('/', upload.single('imagem'),(req, res, next)=>{
    console.log(req.file);
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error});}
        conn.query(
            'INSERT INTO acesso (desc_email, desc_nome, desc_password, dat_registro, imagem) VALUES (?,?,?,?,?)',
            [req.body.desc_email, req.body.desc_nome, req.body.desc_password, req.body.dat_data, req.file.path],
            (error, result, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error, reponse: null});}
                const response = {
                    mensagem: 'upload cadastrado com sucesso!',
                    uploadCarregado: {
                        desc_email: req.body.desc_email,
                        imagem: req.file.path,
                        request: {
                            tipo: 'POST',
                            descricao: 'Agendamento Criado',
                            url: 'http://localhost:3000/upload/'
                        }
                    }
                    
                }
                return res.status(201).send({response});
            }
        );
    });
});

module.exports = router;