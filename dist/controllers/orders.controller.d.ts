import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const getOrders: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getOrder: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createOrder: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateOrder: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteOrder: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=orders.controller.d.ts.map