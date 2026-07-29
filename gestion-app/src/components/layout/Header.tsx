'use client';

import { usePathname } from 'next/navigation';
import { findNavItem } from '@/lib/nav';
import { logoutAction } from '@/app/login/actions';

interface HeaderProps {
  greeting: string;
}

export function Header({ greeting }: HeaderProps) {
  const pathname = usePathname();
  const navItem = findNavItem(pathname);
  const isDashboard = navItem?.href === '/dashboard';

  return (
    <header className="flex items-start gap-5 px-12 pb-2 pt-10">
      <div className="min-w-0 flex-1">
        <h1 className="font-serif-display text-[42px] font-semibold leading-[1.05]">
          {isDashboard ? (
            <>
              {greeting} <span className="text-[32px]">👋</span>
            </>
          ) : (
            navItem?.pageTitle
          )}
        </h1>
        <p className="mt-2 text-[15px] font-medium text-mn-muted">{navItem?.pageSubtitle}</p>
      </div>

      <div className="flex items-center gap-3 pt-1.5">
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-control border border-mn-border bg-mn-card px-[15px] py-[11px] font-sans text-[13.5px] font-semibold text-mn-ink-2 shadow-control"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#A79C88" strokeWidth="1.6">
            <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" />
            <path d="M3 8H17M7 2.5V6M13 2.5V6" strokeLinecap="round" />
          </svg>
          1 Janv. – 22 Nov. 2024
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#B3A992" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8l4 4 4-4" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="flex h-11 w-11 flex-none items-center justify-center rounded-control border border-mn-border bg-mn-card text-mn-muted shadow-control"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M10 3a3.2 3.2 0 0 0-3.2 3.2c0 3-1.3 4-2 4.8h10.4c-.7-.8-2-1.8-2-4.8A3.2 3.2 0 0 0 10 3Z" />
            <path d="M8.3 15a1.8 1.8 0 0 0 3.4 0" strokeLinecap="round" />
          </svg>
        </button>

        <form action={logoutAction}>
          <button
            type="submit"
            aria-label="Déconnexion"
            title="Déconnexion"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-control border border-mn-border bg-mn-card text-mn-muted shadow-control transition-colors hover:text-danger-fg"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3" />
              <path d="M13 14l4-4-4-4" />
              <path d="M17 10H8" />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
}
