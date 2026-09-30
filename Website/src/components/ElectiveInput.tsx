import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  'aria-label'?: string;
}

/**
 * Text input with a suggestion list exactly as wide as the input (a native <datalist> can't be styled).
 * Any text can still be typed; the list only suggests. The list is drawn on the page body so the
 * table's scroll container doesn't clip it.
 */
export function ElectiveInput({ value, onChange, options, placeholder, 'aria-label': ariaLabel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; up: boolean } | null>(null);

  const query = value.trim().toLowerCase();
  const matches = options.filter((o) => !query || o.toLowerCase().includes(query) && o.toLowerCase() !== query);
  const shown = open && matches.length > 0;

  // Keep the list under (or above, near the bottom of the screen) the input while the page scrolls.
  useLayoutEffect(() => {
    if (!shown) return;
    const place = () => {
      const r = inputRef.current?.getBoundingClientRect();
      if (!r) return;
      const up = window.innerHeight - r.bottom < 220 && r.top > window.innerHeight - r.bottom;
      setPos({ left: r.left, top: up ? r.top - 4 : r.bottom + 4, width: r.width, up });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [shown]);

  useEffect(() => setActive(-1), [query]);

  const pick = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return setOpen(true);
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => (i + step + matches.length) % matches.length);
    } else if (e.key === 'Enter' && shown && active >= 0) {
      e.preventDefault();
      pick(matches[active]);
    } else if (e.key === 'Escape' && open) {
      setOpen(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        className="cgpa-elective"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={shown}
        aria-controls={listId}
        aria-activedescendant={shown && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
      />
      {shown && pos && createPortal(
        <ul
          id={listId}
          role="listbox"
          className={`elective-menu ${pos.up ? 'elective-menu-up' : ''}`}
          style={{ left: pos.left, top: pos.top, width: pos.width }}
        >
          {matches.map((option, i) => (
            <li
              key={option}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
              // mousedown, not click: picking must happen before the input's blur closes the list.
              onMouseDown={(e) => { e.preventDefault(); pick(option); }}
              onMouseEnter={() => setActive(i)}
            >
              {option}
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </>
  );
}
