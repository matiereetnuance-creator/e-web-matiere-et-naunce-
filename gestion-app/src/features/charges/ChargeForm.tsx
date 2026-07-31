'use client';

import { useActionState, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatEuro } from '@/lib/format';
import { computeCharge } from '@/services/charges';
import { CHARGE_CATEGORIES, CHARGE_PERIODICITES, CHARGE_TAUX_TVA, type ChargeInput } from '@/types/charge';
import { createChargeAction, updateChargeAction, type ChargeFormState } from './actions';

interface ChargeFormProps {
  charge?: ChargeInput; // absent = création
  onClose: () => void;
}

interface FormValues {
  date: string;
  categorie: string;
  motif: string;
  montantTTC: string;
  tauxTVA: string;
  periodicite: string;
  actif: boolean;
}

const emptyValues: FormValues = {
  date: '',
  categorie: CHARGE_CATEGORIES[0],
  motif: '',
  montantTTC: '',
  tauxTVA: String(CHARGE_TAUX_TVA[0]),
  periodicite: CHARGE_PERIODICITES[0],
  actif: true,
};

function toValues(charge: ChargeInput): FormValues {
  return {
    date: charge.date,
    categorie: charge.categorie,
    motif: charge.motif,
    montantTTC: String(charge.montantTTC),
    tauxTVA: String(charge.tauxTVA),
    periodicite: charge.periodicite,
    actif: charge.actif,
  };
}

function formatTauxLabel(taux: number): string {
  return `${(taux * 100).toString().replace('.', ',')} %`;
}

const initialFormState: ChargeFormState = {};

export function ChargeForm({ charge, onClose }: ChargeFormProps) {
  const isEdit = Boolean(charge);
  const action = isEdit ? updateChargeAction.bind(null, charge!.id) : createChargeAction;
  const [state, formAction, isPending] = useActionState<ChargeFormState, FormData>(action, initialFormState);
  const [values, setValues] = useState<FormValues>(() => (charge ? toValues(charge) : emptyValues));

  useEffect(() => {
    if (state.success) onClose();
  }, [state, onClose]);

  const preview = useMemo(() => {
    const montantTTC = Number(values.montantTTC);
    const tauxTVA = Number(values.tauxTVA);
    return computeCharge({
      id: charge?.id ?? '',
      date: values.date,
      categorie: values.categorie as ChargeInput['categorie'],
      motif: values.motif,
      montantTTC: Number.isFinite(montantTTC) ? montantTTC : 0,
      tauxTVA: Number.isFinite(tauxTVA) ? tauxTVA : 0,
      periodicite: values.periodicite as ChargeInput['periodicite'],
      actif: values.actif,
    });
  }, [charge?.id, values]);

  function updateField<K extends keyof FormValues>(field: K) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const next = event.target.value;
      setValues((current) => ({ ...current, [field]: next }));
    };
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={isEdit ? 'Modifier la charge' : 'Nouvelle charge'}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="charge-form" disabled={isPending}>
            {isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </>
      }
    >
      <form id="charge-form" action={formAction} className="flex flex-col gap-7">
        {state.error && <p className="text-[13px] font-medium text-danger-fg">{state.error}</p>}

        <section className="flex flex-col gap-4">
          <div className="lbl">Informations</div>
          <Select label="Catégorie" name="categorie" value={values.categorie} onChange={updateField('categorie')} required>
            {CHARGE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          <Input label="Motif" name="motif" value={values.motif} onChange={updateField('motif')} required />
          <Input
            label="Date de prélèvement"
            name="date"
            type="date"
            value={values.date}
            onChange={updateField('date')}
            required
          />
        </section>

        <section className="flex flex-col gap-4">
          <div className="lbl">Montant</div>
          <Input
            label="Montant TTC"
            name="montantTTC"
            type="number"
            min="0"
            step="0.01"
            value={values.montantTTC}
            onChange={updateField('montantTTC')}
            required
          />
          <Select label="Taux de TVA" name="tauxTVA" value={values.tauxTVA} onChange={updateField('tauxTVA')} required>
            {CHARGE_TAUX_TVA.map((taux) => (
              <option key={taux} value={taux}>
                {formatTauxLabel(taux)}
              </option>
            ))}
          </Select>
        </section>

        <section className="flex flex-col gap-4">
          <div className="lbl">Récurrence</div>
          <Select
            label="Périodicité"
            name="periodicite"
            value={values.periodicite}
            onChange={updateField('periodicite')}
            required
          >
            {CHARGE_PERIODICITES.map((periodicite) => (
              <option key={periodicite} value={periodicite}>
                {periodicite}
              </option>
            ))}
          </Select>
          <ActifToggle
            checked={values.actif}
            onChange={(actif) => setValues((current) => ({ ...current, actif }))}
          />
        </section>

        <section className="flex flex-col gap-3 rounded-sm2 bg-mn-soft p-5">
          <div className="lbl">Résumé (calculé automatiquement)</div>
          <SummaryRow label="Montant HT" value={formatEuro(preview.montantHT)} />
          <SummaryRow label="TVA" value={formatEuro(preview.montantTVA)} />
        </section>
      </form>
    </Drawer>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-medium text-mn-muted-2">{label}</span>
      <span className="tnum text-[14px] font-semibold text-mn-ink">{value}</span>
    </div>
  );
}

function ActifToggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center gap-3.5">
      <label htmlFor="actif" className="flex-1 text-[14px] font-semibold text-mn-ink">
        Charge active
        <span className="mt-0.5 block text-[12.5px] font-medium text-mn-muted-2">
          Désactivez-la si elle n&apos;est plus d&apos;actualité.
        </span>
      </label>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id="actif"
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
      <input type="hidden" name="actif" value={checked ? 'on' : ''} />
    </div>
  );
}
