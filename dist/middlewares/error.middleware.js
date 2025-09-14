"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: 'Dados inválidos',
            details: error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))
        });
    }
    if (error.code && typeof error.code === 'string') {
        switch (error.code) {
            case 'P2002':
                return res.status(409).json({
                    error: 'Recurso já existe',
                    details: 'Violação de restrição única'
                });
            case 'P2025':
                return res.status(404).json({
                    error: 'Recurso não encontrado'
                });
            default:
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: 'Erro no banco de dados'
                });
        }
    }
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Dados inválidos',
            details: error.message
        });
    }
    if (error.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Não autorizado'
        });
    }
    return res.status(500).json({
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map