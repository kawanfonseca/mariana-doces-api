import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const getStockMovements: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getStockMovement: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createStockMovement: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getInventoryStatus: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getStockAlerts: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCostAnalysis: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=stock.controller.d.ts.map