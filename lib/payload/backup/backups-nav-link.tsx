'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HREF = '/admin/backups';

export function BackupsNavLink() {
  const isActive = usePathname() === HREF;

  return (
    <Link className="nav__link" href={HREF} id="nav-backups">
      {isActive && <div className="nav__link-indicator" />}
      <span className="nav__link-label">Backups</span>
    </Link>
  );
}
