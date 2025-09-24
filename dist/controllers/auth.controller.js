"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.register = exports.login = void 0;
const database_1 = require("../services/database");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const login = async (req, res, next) => {
    try {
        console.log('🔐 [LOGIN] Iniciando processo de login...');
        console.log('🔐 [LOGIN] Body recebido:', req.body);
        const { email, password } = req.body;
        console.log('🔐 [LOGIN] Email:', email);
        console.log('🔐 [LOGIN] Password presente:', !!password);
        console.log('🔐 [LOGIN] Buscando usuário no banco...');
        const user = await database_1.prisma.user.findUnique({
            where: { email, active: true }
        });
        console.log('🔐 [LOGIN] Usuário encontrado:', !!user);
        if (user) {
            console.log('🔐 [LOGIN] Usuário ativo:', user.active);
            console.log('🔐 [LOGIN] Role do usuário:', user.role);
        }
        if (!user) {
            console.log('❌ [LOGIN] Usuário não encontrado ou inativo');
            res.status(401).json({ error: 'Credenciais inválidas' });
            return;
        }
        console.log('🔐 [LOGIN] Verificando senha...');
        const isValidPassword = await (0, password_1.comparePassword)(password, user.password);
        console.log('🔐 [LOGIN] Senha válida:', isValidPassword);
        if (!isValidPassword) {
            console.log('❌ [LOGIN] Senha inválida');
            res.status(401).json({ error: 'Credenciais inválidas' });
            return;
        }
        console.log('🔐 [LOGIN] Gerando token...');
        const token = (0, jwt_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role
        });
        console.log('✅ [LOGIN] Login realizado com sucesso para:', user.email);
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('❌ [LOGIN] Erro no login:', error);
        next(error);
    }
};
exports.login = login;
const register = async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body;
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            res.status(409).json({ error: 'Usuário já existe' });
            return;
        }
        const hashedPassword = await (0, password_1.hashPassword)(password);
        const user = await database_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'OPERATOR'
            }
        });
        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const me = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });
        if (!user) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
//# sourceMappingURL=auth.controller.js.map