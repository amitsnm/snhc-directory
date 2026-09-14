import { useState } from 'react'
import { DirectoryTable } from '../components/DirectoryTable'
import { SearchFilters } from '../components/SearchFilters'
import { ServiceBanners } from '../components/ServiceBanners'
import { StatusFooter } from '../components/StatusFooter'
import { useDirectory } from '../hooks/useDirectory'
import type { ViewMode } from '../types/directory'

const VIEW_KEY = 'snc-directory-view'

function loadView(): ViewMode {
  const saved = localStorage.getItem(VIEW_KEY)
  if (saved === 'list' || saved === 'grid' || saved === 'floor' || saved === 'department') {
    return saved
  }
  return 'department'
}

export function IntercomPage() {
  const {
    ready,
    entries,
    totalCount,
    filters,
    setFilter,
    clearFilters,
    filterOptions,
    status,
    sync,
    config,
  } = useDirectory()

  const [viewMode, setViewMode] = useState<ViewMode>(loadView)

  const onViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem(VIEW_KEY, mode)
  }

  return (
    <section className="portal-page intercom-page" aria-label="Intercom Directory">
      <ServiceBanners />
      <div className="app-frame intercom-frame">
        <SearchFilters
          filters={filters}
          options={filterOptions}
          resultCount={entries.length}
          totalCount={totalCount}
          viewMode={viewMode}
          onViewMode={onViewMode}
          onChange={setFilter}
          onClear={clearFilters}
        />
        <main className="directory-main">
          {!ready ? (
            <div className="loading-state">
              <p>Opening local directory…</p>
            </div>
          ) : (
            <DirectoryTable entries={entries} config={config} viewMode={viewMode} />
          )}
        </main>
        <StatusFooter status={status} onRefresh={() => void sync()} />
      </div>
    </section>
  )
}
