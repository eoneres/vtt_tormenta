'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { authApi, ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth.store';

const schema = z
  .object({
    displayName: z.string().min(2, 'Mínimo 2 caracteres').max(50),
    email: z.string().email('E-mail inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter letra maiúscula')
      .regex(/[0-9]/, 'Deve conter número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const tokens = await authApi.register(data.email, data.password, data.displayName);
      setTokens(tokens.accessToken, tokens.refreshToken);
      const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]!)) as {
        sub: string; email: string; roles: string[];
      };
      setUser({ id: payload.sub, email: payload.email, displayName: data.displayName, roles: payload.roles as never });
      router.push('/campaigns');
    } catch (err) {
      if (err instanceof ApiError) setServerError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-vtt-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vtt-text">VTT Tormenta</h1>
          <p className="text-vtt-muted mt-2">Criar nova conta</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {(
              [
                { name: 'displayName', label: 'Nome de exibição', type: 'text', placeholder: 'Seu nome' },
                { name: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
                { name: 'password', label: 'Senha', type: 'password', placeholder: '••••••••' },
                { name: 'confirmPassword', label: 'Confirmar senha', type: 'password', placeholder: '••••••••' },
              ] as const
            ).map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-vtt-text mb-1">{label}</label>
                <input
                  {...register(name)}
                  type={type}
                  className="input-field"
                  placeholder={placeholder}
                />
                {errors[name] && (
                  <p className="text-vtt-danger text-xs mt-1">{errors[name]?.message}</p>
                )}
              </div>
            ))}

            {serverError && (
              <div className="bg-vtt-danger/10 border border-vtt-danger/30 rounded-lg px-3 py-2">
                <p className="text-vtt-danger text-sm">{serverError}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-vtt-muted text-sm mt-4">
            Já tem conta?{' '}
            <Link href="/login" className="text-vtt-accent hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
