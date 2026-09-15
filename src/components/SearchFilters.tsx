import type { DirectoryFilters, ViewMode } from '../types/directory'
import { formatFloorLabel } from '../data/locations'

interface FilterOptions {
  floors: string[]
  zones: string[]
  departments: string[]
  designations: string[]
}

interface Props {
  filters: DirectoryFilters
  options: FilterOptions
  resultCount: number
  totalCount: number
  viewMode: ViewMode
  onViewMode: (mode: ViewMode) => void
  onChange: <K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) => void
  onClear: () => void
}

const VIEW_MODES: { id: ViewMode; label: string; title: string }[] = [
  { id: 'list', label: 'List', title: 'Flat list of all contacts' },
  { id: 'grid', label: 'Grid', title: 'Card grid' },
  { id: 'floor', label: 'Floor', title: 'Grouped by floor' },
  { id: 'department', label: 'Dept', title: 'Grouped by department' },
]

export function SearchFilters({
  filters,
  options,
  resultCount,
  totalCount,
  viewMode,
  onViewMode,
  onChange,
  onClear,
}: Props) {
  const hasFilters =
    filters.query ||
    filters.floor ||
    filters.zone ||
    filters.department ||
    filters.designation

  return (
    <section className="toolbar" aria-label="Search, filters and view">
      <div className="toolbar-main">
        <input
          type="search"
          className="toolbar-search"
          placeholder="Search (min 3 characters)…"
          value={filters.query}
          onChange={(e) => onChange('query', e.target.value)}
          autoFocus
          aria-label="Search directory — starts after 3 characters"
          minLength={3}
        />
        {filters.query.trim().length > 0 && filters.query.trim().length < 3 ? (
          <span className="toolbar-hint">Type 3+ characters</span>
        ) : null}

        <select
          className="toolbar-select"
          value={filters.floor}
          onChange={(e) => onChange('floor', e.target.value)}
          aria-label="Floor"
          title="Floor"
        >
          <option value="">Floor</option>
          {options.floors.map((opt) => (
            <option key={opt} value={opt}>
              {formatFloorLabel(opt)}
            </option>
          ))}
        </select>

        <select
          className="toolbar-select"
          value={filters.zone}
          onChange={(e) => onChange('zone', e.target.value)}
          aria-label="Section"
          title="Section"
        >
          <option value="">Section</option>
          {options.zones.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <select
          className="toolbar-select toolbar-select-wide"
          value={filters.department}
          onChange={(e) => onChange('department', e.target.value)}
          aria-label="Department"
          title="Department"
        >
          <option value="">Department</option>
          {options.departments.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {hasFilters ? (
          <button type="button" className="toolbar-clear" onClick={onClear} title="Clear filters">
            Clear
          </button>
        ) : null}

        <p className="toolbar-count" aria-live="polite">
          <strong>{resultCount}</strong>/{totalCount}
        </p>
      </div>

      <div className="view-toggle" role="tablist" aria-label="View mode">
        {VIEW_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={viewMode === mode.id}
            className={`view-btn${viewMode === mode.id ? ' is-active' : ''}`}
            title={mode.title}
            onClick={() => onViewMode(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </section>
  )
}
