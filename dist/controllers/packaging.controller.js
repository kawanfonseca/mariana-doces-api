"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePackaging = exports.updatePackaging = exports.createPackaging = exports.getPackagingById = exports.getPackaging = void 0;
const database_1 = require("../services/database");
const getPackaging = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const skip = (page - 1) * limit;
        const where = {
            ...(search && {
                name: {
                    contains: search,
                    mode: 'insensitive'
                }
            })
        };
        const [packaging, total] = await Promise.all([
            database_1.prisma.packaging.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            database_1.prisma.packaging.count({ where })
        ]);
        res.json({
            data: packaging,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPackaging = getPackaging;
const getPackagingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const packaging = await database_1.prisma.packaging.findUnique({
            where: { id },
            include: {
                packagingUsages: {
                    include: {
                        product: { select: { id: true, name: true } },
                        variant: { select: { id: true, name: true } }
                    }
                }
            }
        });
        if (!packaging) {
            return res.status(404).json({ error: 'Embalagem não encontrada' });
        }
        res.json(packaging);
    }
    catch (error) {
        next(error);
    }
};
exports.getPackagingById = getPackagingById;
const createPackaging = async (req, res, next) => {
    try {
        const data = req.body;
        const packaging = await database_1.prisma.packaging.create({
            data
        });
        res.status(201).json(packaging);
    }
    catch (error) {
        next(error);
    }
};
exports.createPackaging = createPackaging;
const updatePackaging = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const packaging = await database_1.prisma.packaging.update({
            where: { id },
            data
        });
        res.json(packaging);
    }
    catch (error) {
        next(error);
    }
};
exports.updatePackaging = updatePackaging;
const deletePackaging = async (req, res, next) => {
    try {
        const { id } = req.params;
        const usageCount = await database_1.prisma.packagingUsage.count({
            where: { packagingId: id }
        });
        if (usageCount > 0) {
            return res.status(400).json({
                error: 'Não é possível excluir embalagem que está sendo usada em produtos'
            });
        }
        await database_1.prisma.packaging.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deletePackaging = deletePackaging;
//# sourceMappingURL=packaging.controller.js.map