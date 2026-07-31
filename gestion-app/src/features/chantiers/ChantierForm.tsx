'use client';

import { useActionState, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import { formatEuro, formatRatioPct } from '@/lib/format';
import { computeChantier, margeNiveau } from '@/services/chantiers';
import type { ChantierInput } from '@/types/chantier';
import { createChantierAction, updateChantierAction, type ChantierFormState } from './actions';

interface ChantierFormProps {
  chantier?: ChantierInput; // absent = création
  onClose: () => void;
}

interface FormValues {
  client: string;
  nomChantier: string;
  prixVenduHT: string;
  fournituresHT: string;
  sousTraitantHT: string;
  apporteurHT: string;
  jours: string;
}

const emptyValues: FormValues = {
  client: '',
  nomChantier: '',
  prixVenduHT: '',
  fournituresHT: '',
  sousTraitantHT: '',
  apporteurHT: '',
  jours: '',
};

function toValues(chantier: ChantierInput): FormValues {
  return {
    client: chantier.client,
    nomChantier: chantier.nomChantier,
    prixVenduHT: String(chantier.prixVenduHT),
    fournituresHT: String(chantier.fournituresHT),
    sousTraitantHT: String(chantier.sousTraitantHT),
    apporteurHT: String(chantier.apporteurHT),
    jours: String(chantier.jours),
  };
}

const initialFormState: ChantierFormState = {};

export function ChantierForm({ chantier, onClose }: ChantierFormProps) {
  const isEdit = Boolean(chantier);
  const action = isEdit ? updateChantierAction.bind(null, chantier!.id) : createChantierAction;
  const [state, formAction, isPending] = useActionState<ChantierFormState, FormData>(action, initialFormState);
  const [values, setValues] = useState<FormValues>(() => (chantier ? toValues(chantier) : emptyValues));

  useEffect(() => {
    if (state.success) onClose();
  }, [state, onClose]);

  const preview = useMemo(() => {
    const toNumber = (raw: string) => {
      const n = Number(raw);
      return Number.isFinite(n) ? n : 0;
    };
    return computeChantier({
      id: chantier?.id ?? '',
      client: values.client,
      nomChantier: values.nomChantier,
      prixVenduHT: toNumber(values.prixVenduHT),
      fournituresHT: toNumber(values.fournituresHT),
      sousTraitantHT: toNumber(values.sousTraitantHT),
      apporteurHT: toNumber(values.apporteurHT),
      jours: toNumber(values.jours),
    });
  }, [chantier?.id, values]);

  function updateField(field: keyof FormValues) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setValues((current) => ({ ...current, [field]: next }));
    };
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={isEdit ? 'Modifier le chantier' : 'Nouveau chantier'}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="chantier-form" disabled={isPending}>
            {isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </>
      }
    >
      <form id="chantier-form" action={formAction} className="flex flex-col gap-7">
        {state.error && <p className="text-[13px] font-medium text-danger-fg">{state.error}</p>}

        <section className="flex flex-col gap-4">
          <div className="lbl">Informations</div>
          <Input label="Client" name="client" value={values.client} onChange={updateField('client')} required />
          <Input
            label="Nom du chantier"
            name="nomChantier"
            value={values.nomChantier}
            onChange={updateField('nomChantier')}
            required
          />
        </section>

        <section className="flex flex-col gap-4">
          <div className="lbl">Vente</div>
          <Input
            label="Prix de vente HT"
            name="prixVenduHT"
            type="number"
            min="0"
            step="1"
            value={values.prixVenduHT}
            onChange={updateField('prixVenduHT')}
            required
          />
        </section>

        <section className="flex flex-col gap-4">
          <div className="lbl">Coûts</div>
          <Input
            label="Fournitures HT"
            name="fournituresHT"
            type="number"
            min="0"
            step="1"
            value={values.fournituresHT}
            onChange={updateField('fournituresHT')}
            required
          />
          <Input
            label="Sous-traitance HT"
            name="sousTraitantHT"
            type="number"
            min="0"
            step="1"
            value={values.sousTraitantHT}
            onChange={updateField('sousTraitantHT')}
            required
          />
          <Input
            label="Apporteur HT"
            name="apporteurHT"
            type="number"
            min="0"
            step="1"
            value={values.apporteurHT}
            onChange={updateField('apporteurHT')}
            required
          />
        </section>

        <section className="flex flex-col gap-4">
          <div className="lbl">Temps</div>
          <Input
            label="Nombre de jours"
            name="jours"
            type="number"
            min="0"
            step="0.5"
            value={values.jours}
            onChange={updateField('jours')}
            required
          />
        </section>

        <section className="flex flex-col gap-3 rounded-sm2 bg-mn-soft p-5">
          <div className="lbl">Résumé (calculé automatiquement)</div>
          <SummaryRow label="Coût total HT" value={formatEuro(preview.coutTotalHT)} />
          <SummaryRow label="Marge €" value={formatEuro(preview.margeHT)} />
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-mn-muted-2">Marge %</span>
            <Badge variant={margeNiveau(preview.margePct)}>{formatRatioPct(preview.margePct)}</Badge>
          </div>
          <SummaryRow label="€/Jour" value={formatEuro(preview.eurParJour)} />
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
