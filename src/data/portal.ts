export type PortalPage =
  | 'home'
  | 'service-master'
  | 'intercom'
  | 'doctors'
  | 'speciality'
  | 'packages'

export const PORTAL_NAV: { id: PortalPage; label: string; title: string; blurb: string }[] = [
  {
    id: 'home',
    label: 'Home',
    title: 'Internal Portal',
    blurb: 'Sant Nirankari Health City staff portal for services, directory, and clinical references.',
  },
  {
    id: 'service-master',
    label: 'Service Master',
    title: 'Service Master',
    blurb: 'Tariff and service catalogue with prices, departments, and billing categories.',
  },
  {
    id: 'intercom',
    label: 'Intercom Directory',
    title: 'Intercom Directory',
    blurb: 'Extension numbers for leadership, departments, OPD rooms, and support desks.',
  },
  {
    id: 'doctors',
    label: 'Doctors',
    title: 'Doctors',
    blurb: 'Find doctors by name, speciality, symptom, or treatment — photos from the hospital site, kept in-portal.',
  },
  {
    id: 'speciality',
    label: 'Speciality',
    title: 'Speciality',
    blurb: 'Browse hospital specialities with icons, short descriptions, and links to know more.',
  },
  {
    id: 'packages',
    label: 'Packages',
    title: 'Packages',
    blurb: 'Demo packages only — Preventive Health Checkup, Eye Care, Heart Care, and more (dummy data).',
  },
]
