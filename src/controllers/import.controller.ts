import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, CsvImportResult } from '../types';
import { prisma } from '../services/database';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadMiddleware = upload.single('csvFile');

export const importSalesCSV = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const csvData: any[] = [];
    const errors: string[] = [];

    // Parse do CSV
    await new Promise((resolve, reject) => {
      const stream = Readable.from(req.file!.buffer.toString());
      stream
        .pipe(csv())
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
      } as CsvImportResult);
      return;
    }

    // Buscar todos os produtos para mapear nomes para IDs
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { id: true, name: true, channelBasePriceDirect: true, channelBasePriceIFood: true }
    });

    const productMap = new Map<string, typeof products[0]>();
    products.forEach(product => {
      productMap.set(product.name.toLowerCase().trim(), product);
    });

    const saleItems: any[] = [];
    let totalGross = 0;

    // Processar cada linha do CSV
    csvData.forEach((row, index) => {
      const rowNumber = index + 1;

      // Assumindo formato: Produto1, Produto2, Produto3, etc.
      // Ou: Dia, Produto1, Produto2, Produto3, etc.
      Object.keys(row).forEach(columnName => {
        const qty = parseFloat(row[columnName]);
        
        if (isNaN(qty) || qty <= 0) return;
        if (columnName.toLowerCase().includes('dia') || columnName.toLowerCase().includes('data')) return;

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
      } as CsvImportResult);
      return;
    }

    // Criar o pedido
    const iFoodFeePercent = parseFloat(process.env.IFOOD_FEE_PERCENT || '25');
    const platformFees = channel === 'IFOOD' ? totalGross * (iFoodFeePercent / 100) : 0;
    const netAmount = totalGross - platformFees;

    const order = await prisma.saleOrder.create({
      data: {
        date: new Date(date),
        channel: channel as any,
        grossAmount: totalGross,
        discounts: 0,
        platformFees,
        costs: 0, // Será calculado posteriormente
        netAmount,
        notes: `Importado via CSV - ${csvData.length} linhas processadas`,
        items: {
          createMany: {
            data: saleItems
          }
        }
      }
    });

    const result: CsvImportResult = {
      success: true,
      message: `Importação concluída com sucesso. ${saleItems.length} itens importados.`,
      processedRows: csvData.length,
      errors,
      orderId: order.id
    };

    res.json(result);
  } catch (error) {
    next(error);
  }
};
