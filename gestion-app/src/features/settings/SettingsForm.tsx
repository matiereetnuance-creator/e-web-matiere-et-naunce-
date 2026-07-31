'use client';

import { useActionState, useEffect, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import type { SettingsInput } from '@/types/settings';
import { updateSettingsAction, type SettingsFormState } from './actions';

interface SettingsFormProps {
  settings: SettingsInput;
  onClose: () => void;
}

interface FormValues {
  objectifAnnuelCA: string;
  tauxMargeCible: string;
  chargesFixesMensuelles: string;
  partFournituresReference: string;
  arrondirMontants: boolean;
  comparaisonN1: boolean;
}

function toValues(settings: SettingsInput): FormValues {
  return {
    objectifAnnuelCA: String(settings.objectifAnnuelCA),
    tauxMargeCible: String(settings.tauxMargeCible),
    chargesFixesMensuelles: String(settings.chargesFixesMensuelles),
    partFournituresReference: String(settings.partFournituresReference),
    arrondirMontants: settings.arrondirMontants,
    comparaisonN1: settings.comparaisonN1,
  };
}

const initialFormState: SettingsFormState = {};

export function SettingsForm({ settings, onClose }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState<SettingsFormState, FormData>(updateSettingsAction, initialFormState);
  const [values, setValues] = useState<FormValues>(() => toValues(settings));

  useEffect(() => {
    if (state.success) onClose();
  }, [state, onClose]);

  function updateField<K extends keyof FormValues>(field: K) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setValues((current) => ({ ...current, [field]: next }));
    };
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title="Modifier les paramètres"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="settings-form" disabled={isPending}>
            {isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </>
      }
    >
      <form id="settings-form" action={formAction} className="flex flex-col gap-7">
        {state.error && <p className="text-[13px] font-medium text-danger-fg">{state.error}</p>}

        <section className="flex flex-col gap-4">
          <div className="lbl">Objectifs</div>
          <Input
            label="Objectif annuel de CA"
            name="objectifAnnuelCA"
            type="number"
            min="0"
            step="1"
            value={values.objectifAnnuelCA}
            onChange={updateField('objectifAnnuelCA')}
            required
          />
          <Input
            label="Taux de marge cible (%)"
            name="tauxMargeCible"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={values.tauxMargeCible}
            onChange={updateField('tauxMargeCible')}
            required
          />
        </section>

        <section className="flex flex-col gap-4">
          <div className="lbl">Hypothèses de calcul</div>
          <Input
            label="Charges fixes mensuelles"
            name="chargesFixesMensuelles"
            type="number"
            min="0"
            step="1"
            value={values.chargesFixesMensuelles}
            onChange={updateField('chargesFixesMensuelles')}
            required
          />
          <Input
            label="Part fournitures de référence (%)"
            name="partFournituresReference"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={values.partFournituresReference}
            onChange={updateField('partFournituresReference')}
            required
          />
        </section>

        <section className="flex flex-col gap-4">
          <div className="lbl">Affichage</div>
          <PreferenceToggle
            id="arrondirMontants"
            label="Arrondir les montants"
            description="Masquer les décimales"
            checked={values.arrondirMontants}
            onChange={(checked) => setValues((current) => ({ ...current, arrondirMontants: checked }))}
          />
          <PreferenceToggle
            id="comparaisonN1"
            label="Comparaison N-1"
            description="Afficher les évolutions annuelles"
            checked={values.comparaisonN1}
            onChange={(checked) => setValues((current) => ({ ...current, comparaisonN1: checked }))}
          />
        </section>
      </form>
    </Drawer>
  );
}

function PreferenceToggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3.5">
      <label htmlFor={id} className="flex-1 text-[14px] font-semibold text-mn-ink">
        {label}
        <span className="mt-0.5 block text-[12.5px] font-medium text-mn-muted-2">{description}</span>
      </label>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={id}
        onClick={() => onChange(!checked)}
        className={`relative h-[26px] w-11 flex-none rounded-pill transition-colors duration-150 ${
          checked ? 'bg-success-line' : 'bg-mn-table-border'
        }`}
      >
        <span
          className={`absolute top-[3px] h-5 w-5 rounded-full bg-white transition-all duration-150 ${
            checked ? 'right-[3px]' : 'left-[3px]'
          }`}
        />
      </button>
      <input type="hidden" name={id} value={checked ? 'on' : ''} />
    </div>
  );
}
