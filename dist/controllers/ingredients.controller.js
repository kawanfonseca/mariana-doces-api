"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIngredient = exports.updateIngredient = exports.createIngredient = exports.getIngredient = exports.getIngredients = void 0;
const database_1 = require("../services/database");
const getIngredients = async (req, res, next) => {
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
        const [ingredients, total] = await Promise.all([
            database_1.prisma.ingredient.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            database_1.prisma.ingredient.count({ where })
        ]);
        res.json({
            data: ingredients,
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
exports.getIngredients = getIngredients;
const getIngredient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ingredient = await database_1.prisma.ingredient.findUnique({
            where: { id },
            include: {
                recipeItems: {
                    include: {
                        product: { select: { id: true, name: true } },
                        variant: { select: { id: true, name: true } }
                    }
                }
            }
        });
        if (!ingredient) {
            res.status(404).json({ error: 'Ingrediente não encontrado' });
            return;
        }
        res.json(ingredient);
    }
    catch (error) {
        next(error);
    }
};
exports.getIngredient = getIngredient;
const createIngredient = async (req, res, next) => {
    try {
        const data = req.body;
        const ingredient = await database_1.prisma.ingredient.create({
            data
        });
        res.status(201).json(ingredient);
    }
    catch (error) {
        next(error);
    }
};
exports.createIngredient = createIngredient;
const updateIngredient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const ingredient = await database_1.prisma.ingredient.update({
            where: { id },
            data
        });
        res.json(ingredient);
    }
    catch (error) {
        next(error);
    }
};
exports.updateIngredient = updateIngredient;
const deleteIngredient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const usageCount = await database_1.prisma.recipeItem.count({
            where: { ingredientId: id }
        });
        if (usageCount > 0) {
            res.status(400).json({
                error: 'Não é possível excluir ingrediente que está sendo usado em receitas'
            });
            return;
        }
        await database_1.prisma.ingredient.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteIngredient = deleteIngredient;
//# sourceMappingURL=ingredients.controller.js.map