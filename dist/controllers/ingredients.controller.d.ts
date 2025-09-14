import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const getIngredients: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getIngredient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createIngredient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateIngredient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteIngredient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=ingredients.controller.d.ts.map