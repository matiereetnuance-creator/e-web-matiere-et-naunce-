'use server';

import { revalidatePath } from 'next/cache';
import { CHARGE_CATEGORIES, CHARGE_PERIODICITES, CHARGE_TAUX_TVA, type ChargeCategorie, type ChargePeriodicite } from '@/types/charge';
import { createCharge, deleteCharge, updateCharge, type ChargeFormInput } from '@/services/charges-repository';

export interface ChargeFormState {
  error?: string;
  success?: boolean;
}

function parseChargeForm(formData: FormData): { data?: ChargeFormInput; error?: string } {
  const date = String(formData.get('date') ?? '').trim();
  const categorie = String(formData.get('categorie') ?? '');
  const motif = String(formData.get('motif') ?? '').trim();
  const montantTTC = Number(formData.get('montantTTC'));
  const tauxTVA = Number(formData.get('tauxTVA'));
  const periodicite = String(formData.get('periodicite') ?? '');
  const actif = formData.get('actif') === 'on';

  if (!date) return { error: 'La date de prélèvement est obligatoire.' };
  if (!motif) return { error: 'Le motif est obligatoire.' };
  if (!CHARGE_CATEGORIES.includes(categorie as ChargeCategorie)) return { error: 'Catégorie invalide.' };
  if (!CHARGE_PERIODICITES.includes(periodicite as ChargePeriodicite)) return { error: 'Périodicité invalide.' };
  if (!Number.isFinite(montantTTC) || montantTTC < 0) return { error: 'Le montant TTC doit être un nombre positif.' };
  if (!(CHARGE_TAUX_TVA as readonly number[]).includes(tauxTVA)) return { error: 'Taux de TVA invalide.' };

  return {
    data: {
      date,
      categorie: categorie as ChargeCategorie,
      motif,
      montantTTC,
      tauxTVA,
      periodicite: periodicite as ChargePeriodicite,
      actif,
    },
  };
}

export async function createChargeAction(
  _prevState: ChargeFormState,
  formData: FormData,
): Promise<ChargeFormState> {
  const { data, error } = parseChargeForm(formData);
  if (error || !data) return { error };

  createCharge(data);
  revalidatePath('/charges');
  return { success: true };
}

export async function updateChargeAction(
  id: string,
  _prevState: ChargeFormState,
  formData: FormData,
): Promise<ChargeFormState> {
  const { data, error } = parseChargeForm(formData);
  if (error || !data) return { error };

  const updated = updateCharge(id, data);
  if (!updated) return { error: 'Cette charge n’existe plus — elle a peut-être déjà été supprimée.' };

  revalidatePath('/charges');
  return { success: true };
}

export async function deleteChargeAction(id: string): Promise<void> {
  deleteCharge(id);
  revalidatePath('/charges');
}
