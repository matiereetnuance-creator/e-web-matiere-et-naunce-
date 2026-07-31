import { formatEuro, formatRatioPct } from '@/lib/format';
import type { DonutSegment } from '@/lib/charts';
import type { ChantierComputed } from '@/types/chantier';
import type { ChargeComputed } from '@/types/charge';
import { computeChantiersTotals, margeNiveau } from './chantiers';

/**
 * Moteur de calcul Dashboard — Sprint 4. Source unique de vérité pour
 * tout le Dashboard : compose uniquement les sorties déjà calculées par
 * `chantiers.ts` / `charges.ts` (jamais de logique métier dupliquée),
 * et centralise ici les quelques règles d'affichage propres au
 * Dashboard (tri "les plus rentables", seuil "points d'attention",
 * regroupement par catégorie). Aucune nouvelle formule financière
 * n'est introduite (cf. validation Sprint 4, point 3).
 */

interface DashboardKpi {
  value: string;
  trendValue: string;
}

export interface DashboardChantierRentable {
  client: string;
  type: string;
  marge: string;
  margePct: string;
  eurJour: string;
}

export interface DashboardPointAttention {
  title: string;
  detail: string;
  tone: 'warning' | 'neutral';
}

export interface DashboardData {
  kpis: {
    caRealise: DashboardKpi;
    margeMoyenne: DashboardKpi;
    resultatPrevisionnel: DashboardKpi;
    chargesDuMois: DashboardKpi;
  };
  chargesRepartition: DonutSegment[];
  chantiersRentables: DashboardChantierRentable[];
  pointsAttention: DashboardPointAttention[];
  caEvolutionIndisponibleRaison: string;
}

// "Résultat prévisionnel" : aucune formule métier n'a été validée avec
// le client. Reste volontairement sur la valeur d'exemple Sprint 1
// tant que la formule n'est pas définie — ne pas inventer de calcul.
const RESULTAT_PREVISIONNEL_PLACEHOLDER: DashboardKpi = { value: '146 850 €', trendValue: '24,1 %' };

// Badges "vs N-1" : ni Chantiers ni Charges ne conservent de notion
// d'exercice précédent dans le repository — valeurs d'exemple Sprint 1
// conservées telles quelles tant qu'aucun historique n'existe.
const TREND_PLACEHOLDER = {
  caRealise: '17,6 %',
  margeMoyenne: '2,8 pts',
  chargesDuMois: '3,4 %',
};

function estDansLeMoisEnCours(dateIso: string): boolean {
  const date = new Date(`${dateIso}T00:00:00`);
  const maintenant = new Date();
  return date.getFullYear() === maintenant.getFullYear() && date.getMonth() === maintenant.getMonth();
}

export function computeDashboardData(chantiers: ChantierComputed[], charges: ChargeComputed[]): DashboardData {
  const chantiersTotals = computeChantiersTotals(chantiers);
  const chargesActives = charges.filter((charge) => charge.actif);

  const chargesDuMoisHT = chargesActives
    .filter((charge) => estDansLeMoisEnCours(charge.date))
    .reduce((total, charge) => total + charge.montantHT, 0);

  const chargesActivesTotalHT = chargesActives.reduce((total, charge) => total + charge.montantHT, 0);
  const montantParCategorie = new Map<string, number>();
  for (const charge of chargesActives) {
    montantParCategorie.set(charge.categorie, (montantParCategorie.get(charge.categorie) ?? 0) + charge.montantHT);
  }
  const chargesRepartition: DonutSegment[] = Array.from(montantParCategorie.entries())
    .map(([label, montantHT]) => ({
      label,
      pct: chargesActivesTotalHT === 0 ? 0 : Math.round((montantHT / chargesActivesTotalHT) * 1000) / 10,
    }))
    .filter((segment) => segment.pct > 0)
    .sort((a, b) => b.pct - a.pct);

  const chantiersRentables: DashboardChantierRentable[] = [...chantiers]
    .sort((a, b) => b.margePct - a.margePct)
    .slice(0, 5)
    .map((chantier) => ({
      client: chantier.client,
      type: '—',
      marge: formatEuro(chantier.margeHT),
      margePct: formatRatioPct(chantier.margePct),
      eurJour: formatEuro(chantier.eurParJour),
    }));

  const pointsAttention: DashboardPointAttention[] = chantiers
    .filter((chantier) => margeNiveau(chantier.margePct) === 'error')
    .map((chantier) => ({
      title: `Marge faible : ${chantier.client}`,
      detail: `Marge de ${formatRatioPct(chantier.margePct)} — à surveiller`,
      tone: 'warning' as const,
    }));

  if (pointsAttention.length === 0) {
    pointsAttention.push({
      title: "Aucun point d'attention",
      detail: 'Toutes les marges sont au-dessus du seuil de vigilance',
      tone: 'neutral',
    });
  }

  return {
    kpis: {
      caRealise: { value: formatEuro(chantiersTotals.prixVenduHT), trendValue: TREND_PLACEHOLDER.caRealise },
      margeMoyenne: { value: formatRatioPct(chantiersTotals.margePct), trendValue: TREND_PLACEHOLDER.margeMoyenne },
      resultatPrevisionnel: RESULTAT_PREVISIONNEL_PLACEHOLDER,
      chargesDuMois: { value: formatEuro(chargesDuMoisHT), trendValue: TREND_PLACEHOLDER.chargesDuMois },
    },
    chargesRepartition,
    chantiersRentables,
    pointsAttention,
    caEvolutionIndisponibleRaison:
      "Les chantiers ne renseignent pas encore de date : l'évolution mensuelle du chiffre d'affaires ne peut pas être calculée.",
  };
}
