import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const getProducts: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getProduct: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createProduct: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProduct: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteProduct: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getProductRecipe: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProductRecipe: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getPricingPreview: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=products.controller.d.ts.map