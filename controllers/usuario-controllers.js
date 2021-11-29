const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Metodo para cadastrar um novo usuario.
exports.getCadastro = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query('SELECT * FROM acesso WHERE desc_email = ?',
            [req.body.desc_email],
            (error, results) => {
                if (error) { return res.status(500).send({ error: error }) }
                if (results.length > 0) {
                    res.status(409).send({ mensagem: 'Usuario já cadastrado' })
                } else {
                    bcrypt.hash(req.body.desc_password, 10, (errBcrypt, hash) => {
                        if (errBcrypt) { return res.status(500).send({ error: errBcrypt }) }
                        const query = `INSERT INTO acesso (desc_email, desc_nome, desc_password, dat_registro) 
                                       VALUES(?, ?, ?, ?)`
                        conn.query(query, [req.body.desc_email, req.body.desc_nome, hash, req.body.dat_data],
                            (error, results) => {
                                conn.release();
                                if (error) { return res.status(500).send({ error: error }) }
                                response = {
                                    mensagem: 'Usuario criado com sucesso',
                                    usuarioCriado: {
                                        id_login: results.insertId,
                                        desc_email: req.body.desc_email
                                    }
                                }
                                return res.status(201).send({ response })
                            });
                    });
                }
            });
    });
}
//Metodo para autenticar o usuario.
exports.getLogin = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * FROM acesso WHERE desc_email = ?`;
        conn.query(query, [req.body.desc_email], (error, results, fields) => {
            conn.release();
            if (error) { return res.status(500).send({ error: error }) }
            if (results.length < 1) {
                return res.status(401).send({ mensagem: 'Falha na autenticação' });
            }
            bcrypt.compare(req.body.desc_password, results[0].desc_password, (err, result) => {
                if (err) {
                    return res.status(401).send({ mensagem: 'Falha na autenticação' });
                }
                if (result) {
                    const token = jwt.sign({
                        id_login: results[0].id_login,
                        desc_email: results[0].desc_email
                    },
                        process.env.JWT_KEY,
                        { expiresIn: "5h" })
                    return res.status(200).send({
                        mensagem: 'Autenticado com sucesso',
                        token: token
                    });
                }
                return res.status(401).send({ mensagem: 'Falha na autenticação' });
            });
        });
    });
}
//Metodo agenda um dia e horario.
exports.getAgendar = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query('SELECT * FROM acesso WHERE dat_dataag = ? AND desc_horario = ?',
            [req.body.dat_dataag, req.body.desc_horario],
            (error, results) => {
                if (error) { return res.status(500).send({ error: error }) }
                if (results.length > 0) {
                    res.status(409).send({ mensagem: 'Já existe um agendamento.' })
                } else {
                    conn.query(
                        'INSERT INTO agendamento (dat_dataag, desc_horario) VALUES (?,?)',
                        [req.body.dat_dataag, req.body.desc_horario],
                        (error, result) => {
                            conn.release();
                            if (error) { return res.status(500).send({ error: error }) }
                            response = {
                                mensagem: 'Agendamento realizado com sucesso.',
                                usuarioCriado: {
                                    id_login: result.insertId,
                                    desc_email: req.body.desc_email
                                }
                            }
                            return res.status(201).send({ response })
                        });
                }
            });
    });
}