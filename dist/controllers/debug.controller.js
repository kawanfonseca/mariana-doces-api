"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugEnvironment = exports.debugLogin = void 0;
const database_1 = require("../services/database");
const debugLogin = async (req, res) => {
    try {
        console.log('🔍 [DEBUG] Iniciando debug do login...');
        console.log('🔍 [DEBUG] Headers:', req.headers);
        console.log('🔍 [DEBUG] Body:', req.body);
        console.log('🔍 [DEBUG] Query:', req.query);
        const { email, password } = req.body;
        console.log('🔍 [DEBUG] Email recebido:', email);
        console.log('🔍 [DEBUG] Password recebido:', password ? '***' : 'undefined');
        console.log('🔍 [DEBUG] DATABASE_URL configurada:', !!process.env.DATABASE_URL);
        console.log('🔍 [DEBUG] JWT_SECRET configurada:', !!process.env.JWT_SECRET);
        console.log('🔍 [DEBUG] NODE_ENV:', process.env.NODE_ENV);
        try {
            console.log('🔍 [DEBUG] Testando conexão com o banco...');
            await database_1.prisma.$connect();
            console.log('✅ [DEBUG] Conexão com banco estabelecida');
            const userCount = await database_1.prisma.user.count();
            console.log('🔍 [DEBUG] Total de usuários no banco:', userCount);
            if (userCount === 0) {
                console.log('⚠️ [DEBUG] Nenhum usuário encontrado no banco!');
                res.json({
                    success: false,
                    error: 'Nenhum usuário encontrado no banco',
                    debug: {
                        databaseConnected: true,
                        userCount: 0,
                        environment: {
                            DATABASE_URL: !!process.env.DATABASE_URL,
                            JWT_SECRET: !!process.env.JWT_SECRET,
                            NODE_ENV: process.env.NODE_ENV
                        }
                    }
                });
                return;
            }
            if (email) {
                console.log('🔍 [DEBUG] Buscando usuário:', email);
                const user = await database_1.prisma.user.findUnique({
                    where: { email }
                });
                console.log('🔍 [DEBUG] Usuário encontrado:', user ? 'Sim' : 'Não');
                if (user) {
                    console.log('🔍 [DEBUG] Usuário ativo:', user.active);
                    console.log('🔍 [DEBUG] Role do usuário:', user.role);
                }
                res.json({
                    success: true,
                    debug: {
                        databaseConnected: true,
                        userCount,
                        userFound: !!user,
                        userActive: user?.active,
                        userRole: user?.role,
                        environment: {
                            DATABASE_URL: !!process.env.DATABASE_URL,
                            JWT_SECRET: !!process.env.JWT_SECRET,
                            NODE_ENV: process.env.NODE_ENV
                        },
                        request: {
                            email,
                            hasPassword: !!password
                        }
                    }
                });
            }
            else {
                res.json({
                    success: true,
                    debug: {
                        databaseConnected: true,
                        userCount,
                        environment: {
                            DATABASE_URL: !!process.env.DATABASE_URL,
                            JWT_SECRET: !!process.env.JWT_SECRET,
                            NODE_ENV: process.env.NODE_ENV
                        }
                    }
                });
            }
        }
        catch (dbError) {
            console.error('❌ [DEBUG] Erro na conexão com banco:', dbError);
            res.json({
                success: false,
                error: 'Erro na conexão com banco',
                debug: {
                    databaseConnected: false,
                    databaseError: dbError instanceof Error ? dbError.message : String(dbError),
                    environment: {
                        DATABASE_URL: !!process.env.DATABASE_URL,
                        JWT_SECRET: !!process.env.JWT_SECRET,
                        NODE_ENV: process.env.NODE_ENV
                    }
                }
            });
        }
    }
    catch (error) {
        console.error('❌ [DEBUG] Erro geral:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            debug: {
                error: error instanceof Error ? error.message : String(error),
                environment: {
                    DATABASE_URL: !!process.env.DATABASE_URL,
                    JWT_SECRET: !!process.env.JWT_SECRET,
                    NODE_ENV: process.env.NODE_ENV
                }
            }
        });
    }
};
exports.debugLogin = debugLogin;
const debugEnvironment = async (req, res) => {
    res.json({
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            DATABASE_URL: process.env.DATABASE_URL ? 'Configurada' : 'Não configurada',
            JWT_SECRET: process.env.JWT_SECRET ? 'Configurada' : 'Não configurada',
            PORT: process.env.PORT || '3001'
        },
        timestamp: new Date().toISOString()
    });
};
exports.debugEnvironment = debugEnvironment;
//# sourceMappingURL=debug.controller.js.map