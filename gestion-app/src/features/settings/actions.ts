'use server';

import { revalidatePath } from 'next/cache';
import { updateSettings } from '@/services/settings-repository';
import type { SettingsInput } from '@/types/settings';

export interface SettingsFormState {
  error?: string;
  success?: boolean;
}

function parseSettingsForm(formData: FormData): { data?: SettingsInput; error?: string } {
  const objectifAnnuelCA = Number(formData.get('objectifAnnuelCA'));
  const tauxMargeCible = Number(formData.get('tauxMargeCible'));
  const chargesFixesMensuelles = Number(formData.get('chargesFixesMensuelles'));
  const partFournituresReference = Number(formData.get('partFournituresReference'));
  const arrondirMontants = formData.get('arrondirMontants') === 'on';
  const comparaisonN1 = formData.get('comparaisonN1') === 'on';

  if (!Number.isFinite(objectifAnnuelCA) || objectifAnnuelCA < 0) {
    return { error: "L'objectif annuel de CA doit être un montant positif." };
  }
  if (!Number.isFinite(tauxMargeCible) || tauxMargeCible < 0 || tauxMargeCible > 100) {
    return { error: 'Le taux de marge cible doit être un pourcentage entre 0 et 100.' };
  }
  if (!Number.isFinite(chargesFixesMensuelles) || chargesFixesMensuelles < 0) {
    return { error: 'Les charges fixes mensuelles doivent être un montant positif.' };
  }
  if (!Number.isFinite(partFournituresReference) || partFournituresReference < 0 || partFournituresReference > 100) {
    return { error: 'La part fournitures de référence doit être un pourcentage entre 0 et 100.' };
  }

  return {
    data: {
      objectifAnnuelCA,
      tauxMargeCible,
      chargesFixesMensuelles,
      partFournituresReference,
      arrondirMontants,
      comparaisonN1,
    },
  };
}

export async function updateSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const { data, error } = parseSettingsForm(formData);
  if (error || !data) return { error };

  await updateSettings(data);
  revalidatePath('/parametres');
  return { success: true };
}
