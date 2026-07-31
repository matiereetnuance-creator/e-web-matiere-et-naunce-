'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { formatPct } from '@/lib/charts';
import { formatEuro } from '@/lib/format';
import type { SettingsInput } from '@/types/settings';
import { SettingsForm } from './SettingsForm';

interface SettingsInteractiveProps {
  settings: SettingsInput;
}

export function SettingsInteractive({ settings }: SettingsInteractiveProps) {
  const [isEditing, setIsEditing] = useState(false);

  const objectifs = [
    { label: 'Objectif annuel de CA', value: formatEuro(settings.objectifAnnuelCA) },
    { label: 'Taux de marge cible', value: formatPct(settings.tauxMargeCible) },
  ];

  const hypotheses = [
    { label: 'Charges fixes mensuelles', value: formatEuro(settings.chargesFixesMensuelles) },
    { label: 'Part fournitures de référence', value: formatPct(settings.partFournituresReference) },
  ];

  const preferencesAffichage = [
    { label: 'Arrondir les montants', description: 'Masquer les décimales', actif: settings.arrondirMontants },
    { label: 'Comparaison N-1', description: 'Afficher les évolutions annuelles', actif: settings.comparaisonN1 },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex max-w-[1000px] items-center gap-3">
        <div className="flex-1" />
        <Button variant="primary" onClick={() => setIsEditing(true)}>
          Modifier
        </Button>
      </div>

      <div className="stagger-children grid max-w-[1000px] grid-cols-2 gap-5">
        <div className="card-hover rounded-card border border-mn-card-border bg-mn-card p-[26px] px-7 shadow-card">
          <div className="font-serif-display text-[22px] font-semibold">Objectifs</div>
          <div className="mt-5 flex flex-col gap-4">
            {objectifs.map((champ) => (
              <ParamChamp key={champ.label} {...champ} />
            ))}
          </div>
        </div>

        <div className="card-hover rounded-card border border-mn-card-border bg-mn-card p-[26px] px-7 shadow-card">
          <div className="font-serif-display text-[22px] font-semibold">Hypothèses de calcul</div>
          <div className="mt-5 flex flex-col gap-4">
            {hypotheses.map((champ) => (
              <ParamChamp key={champ.label} {...champ} />
            ))}
          </div>
        </div>

        <div className="card-hover rounded-card border border-mn-card-border bg-mn-card p-[26px] px-7 shadow-card">
          <div className="font-serif-display text-[22px] font-semibold">Affichage</div>
          <div className="mt-3.5 flex flex-col gap-1">
            {preferencesAffichage.map((pref, index) => (
              <div
                key={pref.label}
                className={`flex items-center gap-3.5 py-3.5 px-0.5 ${
                  index < preferencesAffichage.length - 1 ? 'border-b border-mn-row-border' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="text-[14px] font-semibold">{pref.label}</div>
                  <div className="text-[12.5px] font-medium text-mn-muted-2">{pref.description}</div>
                </div>
                <div className={`relative h-[26px] w-11 flex-none rounded-pill ${pref.actif ? 'bg-success-line' : 'bg-mn-table-border'}`}>
                  <div
                    className={`absolute top-[3px] h-5 w-5 rounded-full bg-white transition-all ${
                      pref.actif ? 'right-[3px]' : 'left-[3px]'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-card border border-mn-card-alt-border bg-mn-card-alt p-[26px] px-7">
          <Image src="/logo-noir.png" alt="Matière & Nuance" width={200} height={45} />
          <p className="mt-4 text-[13.5px] font-medium leading-[1.55] text-mn-muted">
            Cockpit financier · Plâtrerie, peinture, béton ciré.
            <br />
            Les calculs et données restent gérés par votre feuille de calcul — cet écran n&apos;en change que la
            présentation.
          </p>
        </div>
      </div>

      {isEditing && <SettingsForm settings={settings} onClose={() => setIsEditing(false)} />}
    </div>
  );
}

function ParamChamp({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="lbl mb-2">{label}</div>
      <div className="flex items-center rounded-sm2 border border-mn-soft-border bg-mn-soft px-[15px] py-3">
        <span className="tnum flex-1 text-[15px] font-semibold">{value}</span>
      </div>
    </div>
  );
}
