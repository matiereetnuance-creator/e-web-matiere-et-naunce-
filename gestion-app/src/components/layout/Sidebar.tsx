'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { NAV_ITEMS } from '@/lib/nav';
import { ChevronDownIcon } from './NavIcons';

interface SidebarProps {
  userLabel: string;
}

export function Sidebar({ userLabel }: SidebarProps) {
  const pathname = usePathname();
  const initials = userLabel.slice(0, 2).toUpperCase();

  return (
    <aside className="sticky top-0 flex h-screen w-[264px] flex-none flex-col border-r border-mn-sidebar-border bg-mn-sidebar-bg px-5 py-[30px] pb-[22px]">
      <div className="px-2.5 pb-[30px] pt-0.5">
        <Image src="/logo-noir.png" alt="Matière & Nuance" width={186} height={42} />
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex w-full items-center gap-3.5 rounded-control px-3.5 py-2.5 font-sans text-[14.5px] transition-all duration-150',
                active
                  ? 'bg-mn-sidebar-active font-semibold text-mn-ink'
                  : 'font-medium text-mn-muted-4 hover:bg-mn-sidebar-active/50 hover:text-mn-ink',
              )}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-[14px] border border-mn-avatar-border bg-mn-avatar px-3 py-2.75">
        <div className="font-serif-display flex h-[38px] w-[38px] flex-none items-center justify-center rounded-sm2 bg-mn-ink text-[15px] font-semibold text-mn-sidebar-bg">
          {initials}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[13.5px] font-semibold">{userLabel}</div>
          <div className="text-[11.5px] font-medium text-mn-muted-2">Matière &amp; Nuance</div>
        </div>
        <ChevronDownIcon />
      </div>
    </aside>
  );
}
