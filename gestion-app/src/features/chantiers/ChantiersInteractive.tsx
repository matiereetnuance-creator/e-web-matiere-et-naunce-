'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, type TableColumn } from '@/components/ui/Table';
import { formatEuro, formatRatioPct } from '@/lib/format';
import { margeNiveau } from '@/services/chantiers';
import type { ChantierComputed } from '@/types/chantier';
import { deleteChantierAction } from './actions';
import { ChantierForm } from './ChantierForm';

interface ChantiersInteractiveProps {
  rows: ChantierComputed[];
  totals: ChantierComputed;
}

type FormTarget = 'create' | ChantierComputed | null;

export function ChantiersInteractive({ rows, totals }: ChantiersInteractiveProps) {
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChantierComputed | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startDeleteTransition(async () => {
      await deleteChantierAction(id);
      setDeleteTarget(null);
    });
  }

  const columns: Array<TableColumn<ChantierComputed>> = [
    { key: 'client', header: 'Client', sticky: true, render: (r) => r.client, footer: 'Total' },
    { key: 'prix', header: 'Prix vendu HT', align: 'right', render: (r) => formatEuro(r.prixVenduHT), footer: formatEuro(totals.prixVenduHT) },
    { key: 'fournitures', header: 'Fournitures HT', align: 'right', render: (r) => formatEuro(r.fournituresHT), footer: formatEuro(totals.fournituresHT) },
    { key: 'soustraitant', header: 'Sous-traitant HT', align: 'right', render: (r) => formatEuro(r.sousTraitantHT), footer: formatEuro(totals.sousTraitantHT) },
    { key: 'apporteur', header: 'Apporteur HT', align: 'right', render: (r) => formatEuro(r.apporteurHT), footer: formatEuro(totals.apporteurHT) },
    { key: 'cout', header: 'Coût total HT', align: 'right', render: (r) => formatEuro(r.coutTotalHT), footer: formatEuro(totals.coutTotalHT) },
    { key: 'marge', header: 'Marge (€ HT)', align: 'right', render: (r) => formatEuro(r.margeHT), footer: formatEuro(totals.margeHT) },
    {
      key: 'margePct',
      header: 'Marge (%)',
      align: 'right',
      render: (r) => <Badge variant={margeNiveau(r.margePct)}>{formatRatioPct(r.margePct)}</Badge>,
      footer: formatRatioPct(totals.margePct),
    },
    { key: 'jours', header: 'Jours', align: 'right', render: (r) => r.jours, footer: totals.jours },
    { key: 'eurJour', header: '€/Jour', align: 'right', render: (r) => formatEuro(r.eurParJour), footer: formatEuro(totals.eurParJour) },
    { key: 'pctFournitures', header: '% Fournitures', align: 'right', render: (r) => formatRatioPct(r.pctFournitures), footer: formatRatioPct(totals.pctFournitures) },
    {
      key: 'rowActions',
      header: '',
      align: 'right',
      render: (r) => (
        <RowMenu onEdit={() => setFormTarget(r)} onDelete={() => setDeleteTarget(r)} />
      ),
    },
  ];

  return (
    <>
      <div className="card-hover overflow-hidden rounded-card border border-mn-card-border bg-mn-card shadow-card">
        <div className="flex items-center gap-3 px-[26px] pb-[18px] pt-[22px]">
          <div className="font-serif-display text-[20px] font-semibold">{rows.length} chantiers terminés</div>
          <div className="flex-1" />
          <button
            type="button"
            className="flex items-center gap-[7px] rounded-sm2 border border-mn-soft-border bg-mn-soft px-[13px] py-2.5 text-[13px] font-semibold text-mn-muted-4 transition-colors duration-150 hover:bg-mn-card-alt"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d="M3 5.5h14M6 10h8M9 14.5h2" />
            </svg>
            Filtrer
          </button>
          <Button variant="primary" onClick={() => setFormTarget('create')}>
            Ajouter un chantier
          </Button>
        </div>
        <Table columns={columns} rows={rows} getRowKey={(row) => row.id} showFooter />
      </div>

      {formTarget && (
        <ChantierForm
          key={formTarget === 'create' ? 'create' : formTarget.id}
          chantier={formTarget === 'create' ? undefined : formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}

      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Supprimer ce chantier ?">
        <p className="text-[14px] font-medium text-mn-muted">
          {deleteTarget && (
            <>
              Le chantier <span className="font-semibold text-mn-ink">{deleteTarget.nomChantier}</span> ({deleteTarget.client}) sera
              définitivement supprimé.
            </>
          )}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
            Annuler
          </Button>
          <Button type="button" variant="danger" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Suppression…' : 'Supprimer'}
          </Button>
        </div>
      </Modal>
    </>
  );
}

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label="Actions du chantier"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-8 items-center justify-center rounded-sm2 text-mn-muted opacity-0 transition-colors duration-150 hover:bg-mn-card-alt focus-visible:opacity-100 group-hover:opacity-100"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="4" cy="10" r="1.6" />
          <circle cx="10" cy="10" r="1.6" />
          <circle cx="16" cy="10" r="1.6" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-9 z-10 w-40 rounded-sm2 border border-mn-card-border bg-mn-card py-1.5 shadow-popover">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="block w-full px-4 py-2 text-left text-[13.5px] font-medium text-mn-ink transition-colors duration-150 hover:bg-mn-card-alt"
          >
            Modifier
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="block w-full px-4 py-2 text-left text-[13.5px] font-medium text-danger-fg transition-colors duration-150 hover:bg-mn-card-alt"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

