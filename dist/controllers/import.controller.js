"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importSalesCSV = exports.uploadMiddleware = void 0;
const database_1 = require("../services/database");
const multer_1 = __importDefault(require("multer"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const stream_1 = require("stream");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
exports.uploadMiddleware = upload.single('csvFile');
const importSalesCSV = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Arquivo CSV não fornecido' });
            return;
        }
        const { date, channel = 'DIRECT' } = req.body;
        if (!date) {
            res.status(400).json({ error: 'Data é obrigatória' });
            return;
        }
        const csvData = [];
        const errors = [];
        await new Promise((resolve, reject) => {
            const stream = stream_1.Readable.from(req.file.buffer.toString());
            stream
                .pipe((0, csv_parser_1.default)())
                .on('data', (data) => csvData.push(data))
                .on('end', resolve)
                .on('error', reject);
        });
        if (csvData.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Arquivo CSV vazio',
                processedRows: 0,
                errors: ['Nenhum dado encontrado no arquivo']
            });
            return;
        }
        const products = await database_1.prisma.product.findMany({
            where: { active: true },
            select: { id: true, name: true, channelBasePriceDirect: true, channelBasePriceIFood: true }
        });
        const productMap = new Map();
        products.forEach((product) => {
            productMap.set(product.name.toLowerCase().trim(), product);
        });
        const saleItems = [];
        let totalGross = 0;
        csvData.forEach((row, index) => {
            const rowNumber = index + 1;
            Object.keys(row).forEach(columnName => {
                const qty = parseFloat(row[columnName]);
                if (isNaN(qty) || qty <= 0)
                    return;
                if (columnName.toLowerCase().includes('dia') || columnName.toLowerCase().includes('data'))
                    return;
                const productName = columnName.trim().toLowerCase();
                const product = productMap.get(productName);
                if (!product) {
                    errors.push(`Linha ${rowNumber}: Produto "${columnName}" não encontrado`);
                    return;
                }
                const unitPrice = channel === 'IFOOD'
                    ? product.channelBasePriceIFood || product.channelBasePriceDirect || 0
                    : product.channelBasePriceDirect || 0;
                if (unitPrice <= 0) {
                    errors.push(`Linha ${rowNumber}: Produto "${columnName}" não possui preço configurado para o canal ${channel}`);
                    return;
                }
                const lineGross = qty * unitPrice;
                totalGross += lineGross;
                saleItems.push({
                    productId: product.id,
                    qty,
                    unitPrice,
                    lineGross,
                    lineDiscount: 0,
                    lineNet: lineGross
                });
            });
        });
        if (saleItems.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Nenhum item válido encontrado no CSV',
                processedRows: 0,
                errors
            });
            return;
        }
        const iFoodFeePercent = parseFloat(process.env.IFOOD_FEE_PERCENT || '25');
        const platformFees = channel === 'IFOOD' ? totalGross * (iFoodFeePercent / 100) : 0;
        const netAmount = totalGross - platformFees;
        const order = await database_1.prisma.saleOrder.create({
            data: {
                date: new Date(date),
                channel: channel,
                grossAmount: totalGross,
                discounts: 0,
                platformFees,
                costs: 0,
                netAmount,
                notes: `Importado via CSV - ${csvData.length} linhas processadas`,
                items: {
                    createMany: {
                        data: saleItems
                    }
                }
            }
        });
        const result = {
            success: true,
            message: `Importação concluída com sucesso. ${saleItems.length} itens importados.`,
            processedRows: csvData.length,
            errors,
            orderId: order.id
        };
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.importSalesCSV = importSalesCSV;
//# sourceMappingURL=import.controller.js.map