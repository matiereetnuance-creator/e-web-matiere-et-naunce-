'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, type TableColumn } from '@/components/ui/Table';
import { formatDate, formatEuro, formatRatioPct } from '@/lib/format';
import type { ChargeComputed } from '@/types/charge';
import { deleteChargeAction } from './actions';
import { ChargeForm } from './ChargeForm';

interface ChargesInteractiveProps {
  rows: ChargeComputed[];
  totals: { montantTTC: number; montantHT: number; montantTVA: number };
}

type FormTarget = 'create' | ChargeComputed | null;

export function ChargesInteractive({ rows, totals }: ChargesInteractiveProps) {
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChargeComputed | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startDeleteTransition(async () => {
      await deleteChargeAction(id);
      setDeleteTarget(null);
    });
  }

  const columns: Array<TableColumn<ChargeComputed>> = [
    { key: 'date', header: 'Date', sticky: true, render: (r) => formatDate(r.date), footer: 'Total' },
    { key: 'categorie', header: 'Catégorie', render: (r) => r.categorie },
    { key: 'motif', header: 'Motif', render: (r) => r.motif },
    { key: 'montantTTC', header: 'Montant TTC', align: 'right', render: (r) => formatEuro(r.montantTTC), footer: formatEuro(totals.montantTTC) },
    { key: 'tauxTVA', header: 'Taux TVA', align: 'right', render: (r) => formatRatioPct(r.tauxTVA) },
    { key: 'montantHT', header: 'Montant HT', align: 'right', render: (r) => formatEuro(r.montantHT), footer: formatEuro(totals.montantHT) },
    { key: 'montantTVA', header: 'TVA', align: 'right', render: (r) => formatEuro(r.montantTVA), footer: formatEuro(totals.montantTVA) },
    { key: 'periodicite', header: 'Périodicité', render: (r) => r.periodicite },
    {
      key: 'actif',
      header: 'Actif',
      render: (r) => <Badge variant={r.actif ? 'success' : 'info'}>{r.actif ? 'Actif' : 'Inactif'}</Badge>,
    },
    {
      key: 'rowActions',
      header: '',
      align: 'right',
      render: (r) => <RowMenu onEdit={() => setFormTarget(r)} onDelete={() => setDeleteTarget(r)} />,
    },
  ];

  return (
    <>
      <div className="card-hover overflow-hidden rounded-card border border-mn-card-border bg-mn-card shadow-card">
        <div className="flex items-center gap-3 px-[26px] pb-[18px] pt-[22px]">
          <div className="font-serif-display text-[20px] font-semibold">{rows.length} charges enregistrées</div>
          <div className="flex-1" />
          <Button variant="primary" onClick={() => setFormTarget('create')}>
            Ajouter une charge
          </Button>
        </div>
        <Table columns={columns} rows={rows} getRowKey={(row) => row.id} showFooter />
      </div>

      {formTarget && (
        <ChargeForm
          key={formTarget === 'create' ? 'create' : formTarget.id}
          charge={formTarget === 'create' ? undefined : formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}

      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Supprimer cette charge ?">
        <p className="text-[14px] font-medium text-mn-muted">
          {deleteTarget && (
            <>
              La charge <span className="font-semibold text-mn-ink">{deleteTarget.motif}</span> ({deleteTarget.categorie}) sera
              définitivement supprimée.
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
        aria-label="Actions de la charge"
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
