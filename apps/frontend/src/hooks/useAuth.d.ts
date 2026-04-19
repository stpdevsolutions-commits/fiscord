import type { User } from '../types';
interface UseAuthReturn {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    register: (email: string, password: string, nombre: string, rnc?: string, empresa?: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}
export declare function useAuth(): UseAuthReturn;
export {};
//# sourceMappingURL=useAuth.d.ts.map