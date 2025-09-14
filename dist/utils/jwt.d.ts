import { UserRole } from '../types';
export interface JwtPayload {
    id: string;
    email: string;
    role: UserRole;
}
export declare const generateToken: (payload: JwtPayload) => string;
export declare const verifyToken: (token: string) => JwtPayload;
//# sourceMappingURL=jwt.d.ts.map