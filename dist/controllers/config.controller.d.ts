import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const getConfigs: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateConfig: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const initializeDefaultConfigs: () => Promise<void>;
//# sourceMappingURL=config.controller.d.ts.map