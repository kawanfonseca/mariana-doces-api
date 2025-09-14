import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const getPackaging: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getPackagingById: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createPackaging: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updatePackaging: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deletePackaging: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=packaging.controller.d.ts.map