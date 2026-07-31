'use server';

import { revalidatePath } from 'next/cache';
import { createChantier, deleteChantier, updateChantier, type ChantierFormInput } from '@/services/chantiers-repository';

export interface ChantierFormState {
  error?: string;
  success?: boolean;
}

function parseChantierForm(formData: FormData): { data?: ChantierFormInput; error?: string } {
  const client = String(formData.get('client') ?? '').trim();
  const nomChantier = String(formData.get('nomChantier') ?? '').trim();

  if (!client) return { error: 'Le client est obligatoire.' };
  if (!nomChantier) return { error: 'Le nom du chantier est obligatoire.' };

  const numericFields = {
    prixVenduHT: Number(formData.get('prixVenduHT')),
    fournituresHT: Number(formData.get('fournituresHT')),
    sousTraitantHT: Number(formData.get('sousTraitantHT')),
    apporteurHT: Number(formData.get('apporteurHT')),
    jours: Number(formData.get('jours')),
  };

  for (const value of Object.values(numericFields)) {
    if (!Number.isFinite(value) || value < 0) {
      return { error: 'Merci de renseigner des montants et un nombre de jours valides (0 ou plus).' };
    }
  }

  return { data: { client, nomChantier, ...numericFields } };
}

export async function createChantierAction(
  _prevState: ChantierFormState,
  formData: FormData,
): Promise<ChantierFormState> {
  const { data, error } = parseChantierForm(formData);
  if (error || !data) return { error };

  await createChantier(data);
  revalidatePath('/chantiers');
  return { success: true };
}

export async function updateChantierAction(
  id: string,
  _prevState: ChantierFormState,
  formData: FormData,
): Promise<ChantierFormState> {
  const { data, error } = parseChantierForm(formData);
  if (error || !data) return { error };

  const updated = await updateChantier(id, data);
  if (!updated) return { error: 'Ce chantier n’existe plus — il a peut-être déjà été supprimé.' };

  revalidatePath('/chantiers');
  return { success: true };
}

export async function deleteChantierAction(id: string): Promise<void> {
  await deleteChantier(id);
  revalidatePath('/chantiers');
}
