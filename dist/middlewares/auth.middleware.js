"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authMiddleware = void 0;
const authMiddleware = (req, res, next) => {
    try {
        req.user = {
            id: '671dd650-0eab-4909-8d15-e356c8c5cac0',
            email: 'kawanfonseca@hotmail.com',
            role: 'ADMIN'
        };
        console.log('🔐 [AUTH] Usuário padrão logado:', req.user.email);
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Erro de autenticação' });
    }
};
exports.authMiddleware = authMiddleware;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.middleware.js.map