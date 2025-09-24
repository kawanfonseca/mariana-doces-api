"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugPageRouter = void 0;
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
exports.debugPageRouter = (0, express_1.Router)();
exports.debugPageRouter.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../test-debug.html'));
});
exports.debugPageRouter.get('/users', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../user-management.html'));
});
exports.debugPageRouter.get('/html', (req, res) => {
    res.json({
        message: 'Página de debug disponível em /api/debug-page',
        url: `${req.protocol}://${req.get('host')}/api/debug-page`
    });
});
//# sourceMappingURL=debug-page.routes.js.map