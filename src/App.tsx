import { useState } from 'react'
import { HeaderBar } from './components/HeaderBar'
import { PORTAL_NAV, type PortalPage } from './data/portal'
import { DoctorsPage } from './pages/DoctorsPage'
import { EmergencyPage } from './pages/EmergencyPage'
import { HomePage } from './pages/HomePage'
import { IntercomPage } from './pages/IntercomPage'
import { PackagesPage } from './pages/PackagesPage'
import { HelpdeskPage } from './pages/HelpdeskPage'
import { TariffMasterPage } from './pages/TariffMasterPage'
import { SpecialityPage } from './pages/SpecialityPage'
import './App.css'

const PAGE_KEY = 'snhc-portal-page'

function loadPage(): PortalPage {
  const saved = localStorage.getItem(PAGE_KEY)
  if (saved === 'service-master') return 'tariff-master'
  if (PORTAL_NAV.some((item) => item.id === saved)) {
    return saved as PortalPage
  }
  return 'home'
}

export default function App() {
  const [page, setPage] = useState<PortalPage>(loadPage)

  const onNavigate = (next: PortalPage) => {
    setPage(next)
    localStorage.setItem(PAGE_KEY, next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <div className="atmosphere" aria-hidden />
      <HeaderBar activePage={page} onNavigate={onNavigate} />
      <div className={`app-frame${page === 'intercom' ? ' app-frame-flush' : ''}`}>
        {page === 'home' ? <HomePage onNavigate={onNavigate} /> : null}
        {page === 'emergency' ? <EmergencyPage /> : null}
        {page === 'helpdesk' ? <HelpdeskPage /> : null}
        {page === 'tariff-master' ? <TariffMasterPage /> : null}
        {page === 'intercom' ? <IntercomPage /> : null}
        {page === 'doctors' ? <DoctorsPage onNavigate={onNavigate} /> : null}
        {page === 'speciality' ? <SpecialityPage /> : null}
        {page === 'packages' ? <PackagesPage /> : null}
      </div>
    </div>
  )
}
