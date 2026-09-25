import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { navigate, withBase } from '@/content/router';

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
}

/**
 * A real link (so Ctrl/middle-click opens a new tab and search engines can follow it) that
 * navigates inside the app on a normal click instead of reloading the page.
 */
export function Link({ to, onClick, ...rest }: LinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={withBase(to)} onClick={handleClick} {...rest} />;
}
