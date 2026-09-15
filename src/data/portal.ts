export type PortalPage =
  | 'home'
  | 'emergency'
  | 'helpdesk'
  | 'tariff-master'
  | 'intercom'
  | 'doctors'
  | 'speciality'
  | 'packages'
  | 'admin'

export const PORTAL_NAV: { id: PortalPage; label: string; title: string; blurb: string }[] = [
  {
    id: 'home',
    label: 'Home',
    title: 'Contact Center',
    blurb: 'Sant Nirankari Health City contact center for emergency codes, directory, and clinical references.',
  },
  {
    id: 'emergency',
    label: 'Emergency Codes',
    title: 'Emergency Codes',
    blurb: 'Official clinical and administrative emergency telephone codes plus quick dial desks.',
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
    blurb: 'Name, designation, department, section, floor, intercom, mobile, and email — with dial and mail actions.',
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
  {
    id: 'admin',
    label: 'Admin',
    title: 'Admin',
    blurb: 'Add, update, activate/deactivate contacts, and bulk-import the Contact Center Excel/CSV template.',
  },
]
