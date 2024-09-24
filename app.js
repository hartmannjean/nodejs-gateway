// api-gateway.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Middleware para autenticar o JWT (somente para rotas privadas)
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido.' });
    }
};

// Rota de Login (público, não precisa de autenticação)
app.post('/auth/login', async (req, res) => {
    try {
        const response = await axios.post(`${process.env.USER_SERVICE_URL}/auth/login`, req.body);
        res.json(response.data); 
    } catch (error) {
        //console.log(error); // Adicionando log do erro
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Erro no login' });
    }
});

// Rota de Registro (público, não precisa de autenticação)
app.post('/auth/register', async (req, res) => {
    try {
        const response = await axios.post(`${process.env.USER_SERVICE_URL}/auth/register`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Erro no registro' });
    }
});

// Rota privada protegida (exemplo)
app.get('/user/:id', authenticateJWT, async (req, res) => {
    try {
        // Encaminha a requisição para o microserviço de usuário (rota protegida)
        const response = await axios.get(`${process.env.USER_SERVICE_URL}/user/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.json(response.data);  // Retorna a resposta do microserviço para o cliente
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Erro ao acessar o usuário' });
    }
});

app.listen(3000, () => {
    console.log('API Gateway rodando na porta 3000');
});
