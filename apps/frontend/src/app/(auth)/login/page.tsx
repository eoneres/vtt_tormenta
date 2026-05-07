'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { authApi, ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth.store';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  mfaCode: z.string().length(6).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsMfa, setNeedsMfa] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const tokens = await authApi.login(data.email, data.password, data.mfaCode || undefined);
      setTokens(tokens.accessToken, tokens.refreshToken);

      // Decode JWT payload to get user info (no verification needed client-side)
      const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]!)) as {
        sub: string; email: string; displayName?: string; roles: string[];
      };
      setUser({
        id: payload.sub,
        email: payload.email,
        displayName: payload.displayName ?? payload.email,
        roles: payload.roles as never,
      });

      router.push('/campaigns');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 && err.message === 'MFA code required') {
          setNeedsMfa(true);
          return;
        }
        setServerError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-vtt-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vtt-text">VTT Tormenta</h1>
          <p className="text-vtt-muted mt-2">Entre na sua conta</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-vtt-text mb-1">E-mail</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-vtt-danger text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-vtt-text mb-1">Senha</label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="input-field"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-vtt-danger text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {needsMfa && (
              <div>
                <label className="block text-sm font-medium text-vtt-text mb-1">
                  Código MFA (6 dígitos)
                </label>
                <input
                  {...register('mfaCode')}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="input-field font-mono tracking-widest text-center"
                  placeholder="000000"
                />
              </div>
            )}

            {serverError && (
              <div className="bg-vtt-danger/10 border border-vtt-danger/30 rounded-lg px-3 py-2">
                <p className="text-vtt-danger text-sm">{serverError}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-vtt-muted text-sm mt-4">
            Não tem conta?{' '}
            <Link href="/register" className="text-vtt-accent hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
