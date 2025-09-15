import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const bulkStockAdjustment: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const transferStock: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const consumeIngredientsForProduction: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const autoRestock: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getIngredientHistory: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getExpiringIngredients: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=inventory-advanced.controller.d.ts.map