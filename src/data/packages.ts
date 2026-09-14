export type PackageCategory =
  | 'Preventive'
  | 'Eye Care'
  | 'Heart Care'
  | 'Women’s Health'
  | 'Senior Care'
  | 'Executive'

export interface DemoPackage {
  id: string
  name: string
  category: PackageCategory
  summary: string
  includes: string[]
  duration: string
  /** Demo price in INR — not a live tariff. */
  price: number
  recommendedFor: string
}

/**
 * Demo-only packages for UI preview.
 * Not linked to Tariff Master / live hospital tariffs.
 */
export const DEMO_PACKAGES: DemoPackage[] = [
  {
    id: 'phc-basic',
    name: 'Preventive Health Checkup — Basic',
    category: 'Preventive',
    summary: 'Entry-level annual screening for adults with no known chronic illness.',
    includes: ['CBC', 'Blood sugar (F)', 'Lipid profile', 'Urine routine', 'Physician consult'],
    duration: '3–4 hours',
    price: 2499,
    recommendedFor: 'Adults 18–40 years',
  },
  {
    id: 'phc-comprehensive',
    name: 'Preventive Health Checkup — Comprehensive',
    category: 'Preventive',
    summary: 'Broader preventive panel with imaging and lifestyle review.',
    includes: [
      'Basic panel tests',
      'Liver & kidney function',
      'Thyroid (TSH)',
      'ECG',
      'Chest X-ray',
      'Diet counselling',
    ],
    duration: 'Half day',
    price: 5499,
    recommendedFor: 'Adults 40+ or family history of lifestyle disease',
  },
  {
    id: 'eye-basic',
    name: 'Eye Care — Vision Screen',
    category: 'Eye Care',
    summary: 'Routine eye examination for refraction and basic ocular health.',
    includes: ['Visual acuity', 'Refraction', 'IOP check', 'Anterior segment exam'],
    duration: '45–60 minutes',
    price: 999,
    recommendedFor: 'Anyone with blurred vision or annual eye review',
  },
  {
    id: 'eye-advanced',
    name: 'Eye Care — Advanced Retina Package',
    category: 'Eye Care',
    summary: 'Deeper retinal assessment for diabetes and high-risk patients.',
    includes: ['Vision screen', 'Dilated fundus exam', 'OCT retina (demo)', 'Ophthalmologist consult'],
    duration: '2 hours',
    price: 3999,
    recommendedFor: 'Diabetics / known retinal risk',
  },
  {
    id: 'heart-basic',
    name: 'Heart Care — Cardiac Screen',
    category: 'Heart Care',
    summary: 'Baseline heart health package with ECG and risk labs.',
    includes: ['ECG', 'Lipid profile', 'Blood pressure review', 'Cardiology OPD consult'],
    duration: '2–3 hours',
    price: 3499,
    recommendedFor: 'Adults with BP, cholesterol, or chest discomfort concerns',
  },
  {
    id: 'heart-executive',
    name: 'Heart Care — Executive Cardiac',
    category: 'Heart Care',
    summary: 'Expanded cardiac workup for executives and high-stress roles.',
    includes: [
      'Cardiac screen',
      '2D Echo (demo)',
      'Treadmill test (if advised)',
      'Lifestyle risk counselling',
    ],
    duration: 'Half day',
    price: 8999,
    recommendedFor: '40+ executives / known cardiac risk factors',
  },
  {
    id: 'women-wellness',
    name: 'Women’s Wellness Package',
    category: 'Women’s Health',
    summary: 'Preventive package focused on women’s health screening.',
    includes: ['CBC', 'Thyroid', 'Vitamin D', 'Pap smear counselling', 'Gynaecology consult'],
    duration: 'Half day',
    price: 4499,
    recommendedFor: 'Women 25–55 years',
  },
  {
    id: 'senior-care',
    name: 'Senior Care Package',
    category: 'Senior Care',
    summary: 'Age-appropriate screening for adults 60 and above.',
    includes: [
      'Comprehensive blood panel',
      'ECG',
      'Bone health review',
      'Geriatric medicine consult',
    ],
    duration: 'Half day',
    price: 6999,
    recommendedFor: 'Adults 60+ years',
  },
  {
    id: 'executive-full',
    name: 'Executive Full Body Checkup',
    category: 'Executive',
    summary: 'Premium demo package combining preventive, heart, and lifestyle modules.',
    includes: [
      'Comprehensive preventive panel',
      'Cardiac screen',
      'Eye vision screen',
      'Diet & lifestyle consult',
    ],
    duration: 'Full day',
    price: 12999,
    recommendedFor: 'Busy professionals needing a one-day overview',
  },
]

export const PACKAGE_CATEGORIES: Array<PackageCategory | 'All'> = [
  'All',
  'Preventive',
  'Eye Care',
  'Heart Care',
  'Women’s Health',
  'Senior Care',
  'Executive',
]

export function formatPackagePrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}
