import type { ComponentType } from 'react';
import {
  AnalysesIcon,
  ChantiersIcon,
  ChargesIcon,
  DashboardIcon,
  ParametresIcon,
  SanteIcon,
} from '@/components/layout/NavIcons';

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType;
  pageTitle: string;
  pageSubtitle: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Tableau de bord',
    icon: DashboardIcon,
    pageTitle: 'Tableau de bord',
    pageSubtitle: 'Voici la santé financière de votre entreprise.',
  },
  {
    href: '/sante-financiere',
    label: 'Santé financière',
    icon: SanteIcon,
    pageTitle: 'Santé financière',
    pageSubtitle: 'Votre seuil de rentabilité et le chiffre d’affaires minimum à réaliser.',
  },
  {
    href: '/chantiers',
    label: 'Chantiers',
    icon: ChantiersIcon,
    pageTitle: 'Chantiers',
    pageSubtitle: 'Analyse de la rentabilité de vos chantiers terminés.',
  },
  {
    href: '/charges',
    label: 'Charges',
    icon: ChargesIcon,
    pageTitle: 'Charges',
    pageSubtitle: 'Où part votre argent — répartition et évolution.',
  },
  {
    href: '/analyses',
    label: 'Analyses',
    icon: AnalysesIcon,
    pageTitle: 'Analyses',
    pageSubtitle: 'Lecture croisée de vos marges et de votre rentabilité.',
  },
  {
    href: '/parametres',
    label: 'Paramètres',
    icon: ParametresIcon,
    pageTitle: 'Paramètres',
    pageSubtitle: 'Objectifs, hypothèses de calcul et préférences.',
  },
];

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => pathname.startsWith(item.href));
}
