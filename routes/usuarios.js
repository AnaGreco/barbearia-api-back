const express = require('express');
const router = express.Router();
const setUser = require('../controllers/usuario-controllers');

router.post('/cadastro', setUser.getCadastro);
router.post('/login', setUser.getLogin);
router.get('/horarios', setUser.getHorarios);
router.post('/agendar', setUser.getAgendar);

module.exports = router;