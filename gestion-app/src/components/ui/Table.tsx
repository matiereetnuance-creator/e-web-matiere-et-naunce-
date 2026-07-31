import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  sticky?: boolean;
  render: (row: T) => ReactNode;
  footer?: ReactNode;
}

interface TableProps<T> {
  columns: Array<TableColumn<T>>;
  rows: T[];
  getRowKey: (row: T, index: number) => string | number;
  showFooter?: boolean;
}

export function Table<T>({ columns, rows, getRowKey, showFooter = false }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-y border-mn-table-border bg-mn-table-head">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'lbl px-5 py-3',
                  column.align === 'right' ? 'text-right' : 'text-left',
                  column.sticky && 'sticky left-0 bg-mn-table-head',
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={getRowKey(row, index)}
              className="group border-b border-mn-row-border transition-colors duration-150 last:border-0 hover:bg-mn-table-head"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-5 py-[15px] text-[13.5px] font-medium text-mn-muted-3',
                    column.align === 'right' ? 'tnum text-right' : 'text-left',
                    column.sticky && 'sticky left-0 bg-inherit font-semibold text-mn-ink',
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {showFooter && columns.some((c) => c.footer !== undefined) && (
          <tfoot>
            <tr className="border-t-2 border-mn-card-border bg-mn-table-head">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-5 py-4 text-[13.5px] font-bold text-mn-ink',
                    column.align === 'right' ? 'tnum text-right' : 'text-left',
                    column.sticky && 'sticky left-0 bg-mn-table-head',
                  )}
                >
                  {column.footer}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
