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
    blurb: 'Find doctors by name, speciality, symptom, or treatment — with profile and appointment links.',
  },
  {
    id: 'speciality',
    label: 'Speciality',
    title: 'Speciality',
    blurb: 'Departments and specialities available across the hospital.',
  },
  {
    id: 'packages',
    label: 'Packages',
    title: 'Packages',
    blurb: 'IP packages, OP packages, and care plans from the tariff master.',
  },
]
