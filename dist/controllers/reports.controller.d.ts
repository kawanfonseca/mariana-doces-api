import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const getSummaryReport: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getProductsReport: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const exportSummaryCSV: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=reports.controller.d.ts.map