import type { Config } from 'tailwindcss';

// Design tokens extraits fidèlement de la maquette Claude Design
// (Matière & Nuance ERP.dc.html) — source unique de vérité pour tout
// le design system. Ne jamais introduire de couleur/valeur en dehors
// de cette échelle : cf. Blueprint Technique §9 ("aucune réinterprétation").
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mn: {
          bg: '#F4F0E9',
          'sidebar-bg': '#F0EBE1',
          'sidebar-border': '#E7DFD1',
          'sidebar-active': '#E7DFCF',
          card: '#FFFDFA',
          'card-border': '#EFE7D9',
          'card-alt': '#F3EEE4',
          'card-alt-border': '#E7DECD',
          soft: '#F5F0E6',
          'soft-border': '#EAE1D0',
          'table-head': '#FBF8F2',
          'table-border': '#F0EADF',
          'row-border': '#F4EFE5',
          avatar: '#E9E2D5',
          'avatar-border': '#E1D8C8',
          ink: '#211E19',
          'ink-2': '#4A453C',
          'ink-3': '#5A5347',
          muted: '#8B8271',
          'muted-2': '#9C927E',
          'muted-3': '#77705F',
          'muted-4': '#6F6857',
          label: '#A79C88',
          'label-2': '#B3A992',
          border: '#E9E1D2',
          hairline: '#C6BBA4',
          hero: '#211E19',
          'hero-fg': '#EFE9DE',
          'hero-muted': '#B4AC9B',
          'hero-label': '#8D8574',
        },
        success: { fg: '#4C6B51', bg: '#E7EDE4', line: '#5E7E63', line2: '#8FB088' },
        warning: { fg: '#9A6E2E', bg: '#F4E9D5', line: '#BC8A47' },
        danger: { fg: '#A2493F', bg: '#F1E0DB' },
        chart: {
          '1': '#211E19',
          '2': '#8A7B60',
          '3': '#B6A585',
          '4': '#CBBEA4',
          '5': '#DCD3C0',
          '6': '#EAE2D2',
        },
      },
      fontFamily: {
        sans: ['var(--font-hanken)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        tnum: ['var(--font-lora)', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '20px',
        control: '13px',
        sm2: '11px',
        pill: '20px',
      },
      boxShadow: {
        card: '0 2px 10px rgba(80,65,40,.045)',
        popover: '0 6px 18px rgba(80,65,40,.1)',
        hero: '0 12px 30px -14px rgba(33,30,25,.5)',
        control: '0 1px 2px rgba(80,65,40,.04)',
      },
    },
  },
  plugins: [],
};

export default config;
