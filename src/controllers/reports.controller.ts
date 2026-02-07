import { Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import { AuthenticatedRequest, ReportSummary, ProductReport } from '../types';

export const getSummaryReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { dateFrom, dateTo, channel } = req.query as any;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    if (channel) {
      where.channel = channel;
    }

    const orders = await prisma.saleOrder.findMany({
      where,
      select: {
        grossAmount: true,
        discounts: true,
        platformFees: true,
        costs: true,
        netAmount: true,
        channel: true
      }
    });

    const summary: ReportSummary = {
      period: {
        from: dateFrom || '',
        to: dateTo || ''
      },
      channel,
      grossRevenue: orders.reduce((sum, order) => sum + order.grossAmount, 0),
      discounts: orders.reduce((sum, order) => sum + order.discounts, 0),
      platformFees: orders.reduce((sum, order) => sum + order.platformFees, 0),
      costs: orders.reduce((sum, order) => sum + order.costs, 0),
      netRevenue: orders.reduce((sum, order) => sum + order.netAmount, 0),
      orderCount: orders.length,
      avgOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.grossAmount, 0) / orders.length : 0
    };

    // Arredondar valores
    Object.keys(summary).forEach(key => {
      if (typeof summary[key as keyof ReportSummary] === 'number') {
        (summary as any)[key] = Math.round((summary as any)[key] * 100) / 100;
      }
    });

    res.json(summary);
  } catch (error) {
    next(error);
  }
};

export const getProductsReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { dateFrom, dateTo, channel } = req.query as any;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.order = {
        date: {}
      };
      if (dateFrom) where.order.date.gte = new Date(dateFrom);
      if (dateTo) where.order.date.lte = new Date(dateTo);
    }

    if (channel) {
      if (!where.order) where.order = {};
      where.order.channel = channel;
    }

    const saleItems = await prisma.saleItem.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true
          }
        },
        order: {
          select: {
            channel: true,
            date: true
          }
        }
      }
    });

    // Agrupar por produto
    const productMap = new Map<string, ProductReport>();

    saleItems.forEach(item => {
      if (!item.product) return;

      const productId = item.product.id;
      const productName = item.product.name;

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          productId,
          productName,
          quantitySold: 0,
          revenue: 0,
          costs: 0,
          profit: 0,
          marginPercent: 0
        });
      }

      const report = productMap.get(productId)!;
      report.quantitySold += item.qty;
      report.revenue += item.lineNet;
    });

    // Buscar custos dos produtos
    for (const [productId, report] of productMap) {
      const whereCondition: any = { productId };
      if (dateFrom || dateTo) {
        whereCondition.createdAt = {};
        if (dateFrom) whereCondition.createdAt.gte = new Date(dateFrom);
        if (dateTo) whereCondition.createdAt.lte = new Date(dateTo);
      }

      const costSnapshots = await prisma.costSnapshot.findMany({
        where: whereCondition
      });

      if (costSnapshots.length > 0) {
        const avgCost = costSnapshots.reduce((sum, snapshot) => sum + snapshot.totalUnitCost, 0) / costSnapshots.length;
        report.costs = avgCost * report.quantitySold;
      }

      report.profit = report.revenue - report.costs;
      report.marginPercent = report.revenue > 0 ? (report.profit / report.revenue) * 100 : 0;

      // Arredondar valores
      report.revenue = Math.round(report.revenue * 100) / 100;
      report.costs = Math.round(report.costs * 100) / 100;
      report.profit = Math.round(report.profit * 100) / 100;
      report.marginPercent = Math.round(report.marginPercent * 100) / 100;
    }

    const productsReport = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue);

    res.json(productsReport);
  } catch (error) {
    next(error);
  }
};

export const exportSummaryCSV = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { dateFrom, dateTo, channel } = req.query as any;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    if (channel) {
      where.channel = channel;
    }

    const orders = await prisma.saleOrder.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      }
    });

    // Helper para escapar campos CSV (previne CSV injection)
    const escapeCSV = (field: any): string => {
      const str = String(field ?? '');
      if (/^[=+\-@\t\r]/.test(str)) {
        return `"'${str.replace(/"/g, '""')}"`;
      }
      if (/[,"\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Gerar CSV
    let csv = 'Data,Canal,Produto,Quantidade,Preço Unitário,Receita Bruta,Descontos,Taxas,Custos,Receita Líquida\n';

    orders.forEach(order => {
      order.items.forEach(item => {
        const proportion = order.grossAmount > 0 ? item.lineGross / order.grossAmount : 0;
        const row = [
          escapeCSV(order.date.toLocaleDateString('pt-BR')),
          escapeCSV(order.channel === 'DIRECT' ? 'Direto' : 'iFood'),
          escapeCSV(item.product?.name || 'N/A'),
          escapeCSV(item.qty),
          escapeCSV(item.unitPrice.toFixed(2)),
          escapeCSV(item.lineGross.toFixed(2)),
          escapeCSV((order.discounts * proportion).toFixed(2)),
          escapeCSV((order.platformFees * proportion).toFixed(2)),
          escapeCSV((order.costs * proportion).toFixed(2)),
          escapeCSV(item.lineNet.toFixed(2))
        ].join(',');
        csv += row + '\n';
      });
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio-vendas.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
