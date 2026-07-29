export function formatEuro(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} €`;
}

export function formatRatioPct(ratio: number): string {
  return `${(ratio * 100).toFixed(1).replace('.', ',')} %`;
}
