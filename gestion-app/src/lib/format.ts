export function formatEuro(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} €`;
}

export function formatRatioPct(ratio: number): string {
  return `${(ratio * 100).toFixed(1).replace('.', ',')} %`;
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}
