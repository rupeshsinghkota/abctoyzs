import { AuthForm } from '@/components/auth/AuthForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen pt-20 pb-20 flex items-center justify-center bg-muted/20 px-4">
            <AuthForm view="login" />
        </div>
    );
}
