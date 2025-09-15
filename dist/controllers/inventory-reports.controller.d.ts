import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const getStockMovementsReport: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getInventoryValueReport: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMostUsedIngredientsReport: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getStockForecastReport: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const exportInventoryCSV: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getStockTurnoverReport: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=inventory-reports.controller.d.ts.map