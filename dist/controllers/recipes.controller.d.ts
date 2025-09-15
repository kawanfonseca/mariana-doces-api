import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const getProductRecipe: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProductRecipe: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const calculateRecipeCost: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const duplicateRecipe: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=recipes.controller.d.ts.map