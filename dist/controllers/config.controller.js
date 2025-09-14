"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDefaultConfigs = exports.updateConfig = exports.getConfigs = void 0;
const database_1 = require("../services/database");
const getConfigs = async (req, res, next) => {
    try {
        const configs = await database_1.prisma.config.findMany({
            orderBy: { key: 'asc' }
        });
        const configObject = configs.reduce((acc, config) => {
            acc[config.key] = {
                value: config.value,
                ...(config.description && { description: config.description })
            };
            return acc;
        }, {});
        res.json(configObject);
    }
    catch (error) {
        next(error);
    }
};
exports.getConfigs = getConfigs;
const updateConfig = async (req, res, next) => {
    try {
        const { key, value, description } = req.body;
        const config = await database_1.prisma.config.upsert({
            where: { key },
            update: {
                value,
                description: description || null
            },
            create: {
                key,
                value,
                description: description || null
            }
        });
        res.json(config);
    }
    catch (error) {
        next(error);
    }
};
exports.updateConfig = updateConfig;
const initializeDefaultConfigs = async () => {
    const defaultConfigs = [
        {
            key: 'IFOOD_FEE_PERCENT',
            value: process.env.IFOOD_FEE_PERCENT || '25',
            description: 'Taxa do iFood em porcentagem'
        },
        {
            key: 'DEFAULT_LABOR_RATE_PER_HOUR',
            value: process.env.DEFAULT_LABOR_RATE_PER_HOUR || '20.00',
            description: 'Taxa padrão de mão de obra por hora em reais'
        },
        {
            key: 'DEFAULT_MARGIN_PERCENT',
            value: '100',
            description: 'Margem padrão sugerida em porcentagem'
        },
        {
            key: 'CURRENCY_SYMBOL',
            value: 'R$',
            description: 'Símbolo da moeda'
        }
    ];
    for (const config of defaultConfigs) {
        await database_1.prisma.config.upsert({
            where: { key: config.key },
            update: {},
            create: config
        });
    }
};
exports.initializeDefaultConfigs = initializeDefaultConfigs;
//# sourceMappingURL=config.controller.js.map