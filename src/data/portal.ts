export type PortalPage =
  | 'home'
  | 'helpdesk'
  | 'tariff-master'
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
    id: 'helpdesk',
    label: 'Helpdesk',
    title: 'Helpdesk',
    blurb: 'Grievance & Feedback, Enquiry, and Complaint tickets with TAT, assignment, and escalation.',
  },
  {
    id: 'tariff-master',
    label: 'Tariff Master',
    title: 'Tariff Master',
    blurb: 'Full revised tariff catalogue with every billing category and price row.',
  },
  {
    id: 'intercom',
    label: 'Intercom Directory',
    title: 'Intercom Directory',
    blurb: 'Extension numbers from the hospital Apps Script directory (Management + Departments & Staff).',
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
