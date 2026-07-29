'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginAction, type LoginState } from './actions';

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Input label="Email" name="email" type="email" placeholder="vous@matiereetnuance.fr" required autoFocus />
      <Input label="Mot de passe" name="password" type="password" placeholder="••••••••" required />
      {state.error && <p className="text-[13px] font-medium text-danger-fg">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="mt-2 w-full justify-center py-3 text-[14px]">
      {pending ? 'Connexion…' : 'Se connecter'}
    </Button>
  );
}
