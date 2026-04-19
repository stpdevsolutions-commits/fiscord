interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    nombre: string;
    rnc: string;
    empresa: string;
}
interface AuthFormProps {
    type: 'login' | 'register';
    onSubmit: (data: FormData) => Promise<void>;
    isLoading: boolean;
}
export default function AuthForm({ type, onSubmit, isLoading }: AuthFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AuthForm.d.ts.map