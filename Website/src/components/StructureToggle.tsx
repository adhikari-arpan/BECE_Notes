import { STRUCTURE_LABELS, setStructure, useStructure, type Structure } from '@/content/structure';

/** "Before 2025 batch | 2025 batch onwards": which curriculum order to show. */
export function StructureToggle() {
  const structure = useStructure();
  return (
    <div className="structure-toggle" role="radiogroup" aria-label="Curriculum structure">
      {(Object.keys(STRUCTURE_LABELS) as Structure[]).map((s) => (
        <button key={s} role="radio" aria-checked={structure === s} onClick={() => setStructure(s)}>
          {STRUCTURE_LABELS[s]}
        </button>
      ))}
    </div>
  );
}
