export const SITE_ORIGIN = 'https://nirankarihealthcity.org'
export const SPECIALITY_IMAGE_BASE = `${SITE_ORIGIN}/wp-content/uploads/2026/02/`

export interface Speciality {
  n: string
  i: string
  d: string
  u: string
  active: boolean
  /** Explicit visibility override; when set, wins over `active`. */
  show?: boolean
}

export const SPECIALITIES: Speciality[] = [
  {
    n: 'Anesthesiology',
    i: 'Anesthesiology.png',
    d: 'Advanced anesthesia and pain management',
    u: '/specialities/anaesthesiology/',
    active: true,
  },
  {
    n: 'Biochemistry',
    i: 'Biochemistry.png',
    d: 'Clinical laboratory and diagnostic services',
    u: '/specialities/clinical-biochemistry/',
    active: true,
  },
  {
    n: 'Cardiology',
    i: 'Cardiology.png',
    d: 'Comprehensive heart and cardiovascular care',
    u: '/specialities/cardiology/',
    active: true,
  },
  {
    n: 'Critical Care Medicine',
    i: 'Critical-Care-Medicine.png',
    d: 'Intensive care for critically ill patients',
    u: '/specialities/critical-care-medicine/',
    active: false,
  },
  {
    n: 'CTVS & Vascular Surgery',
    i: 'CTVS-Vascular-Surgery.png',
    d: 'Cardiothoracic and vascular surgical procedures',
    u: '/specialities/ctvs-vascular-surgery/',
    active: false,
  },
  {
    n: 'Dental & Faciomaxillary Surgery',
    i: 'Dental.png',
    d: 'Complete dental health and oral care',
    u: '/specialities/dental/',
    active: true,
  },
  {
    n: 'Dermatology',
    i: 'Dermatology.png',
    d: 'Skin, hair, and nail care treatment',
    u: '/specialities/dermatology/',
    active: true,
  },
  {
    n: 'Emergency Medicine',
    i: 'Emergency-Medicine.png',
    d: '24/7 emergency and trauma care',
    u: '/specialities/emergency-medicine/',
    active: true,
  },
  {
    n: 'Endocrinology',
    i: 'Endocrinology.png',
    d: 'Hormone and metabolic disorders treatment',
    u: '/specialities/endocrinology/',
    active: true,
  },
  {
    n: 'ENT',
    i: 'ENT.png',
    d: 'Ear, nose, and throat specialist care',
    u: '/specialities/otorhinolaryngology-ent-head-and-neck-surgery/',
    active: true,
  },
  {
    n: 'Eye (Ophthalmology)',
    i: 'Ophthalmology.png',
    d: 'Eye care and vision treatment',
    u: '/specialities/ophthalmology/',
    active: true,
  },
  {
    n: 'Gastroenterology',
    i: 'Gastroenterology.png',
    d: 'Digestive system and liver care',
    u: '/specialities/gastroenterology/',
    active: true,
  },
  {
    n: 'Geriatric Medicine',
    i: 'Medicine.png',
    d: 'Specialized care for elder adults',
    u: '/specialities/geriatric-medicine/',
    active: true,
  },
  {
    n: 'GI Surgery',
    i: 'GI-Surgery.png',
    d: 'Specialized gastrointestinal surgical care',
    u: '/specialities/gastrointestinal-and-hepatobiliary-surgery/',
    active: true,
  },
  {
    n: 'Haematology',
    i: 'Haematology.png',
    d: 'Blood disorders and diseases treatment',
    u: '/specialities/haematology/',
    active: false,
  },
  {
    n: 'Interventional Radiology',
    i: 'Interventional-Radiology.png',
    d: 'Minimally invasive image-guided procedures',
    u: '/specialities/interventional-radiology/',
    active: false,
  },
  {
    n: 'IVF & Reproductive Medicine',
    i: 'IVF-Reproductive-Medicine.png',
    d: 'Fertility treatment and reproductive care',
    u: '/specialities/reproductive-medicine-ivf/',
    active: true,
  },
  {
    n: 'Medical Oncology',
    i: 'Medical-Oncology.png',
    d: 'Cancer diagnosis and chemotherapy treatment',
    u: '/specialities/medical-oncology/',
    active: false,
  },
  {
    n: 'Medicine',
    i: 'Medicine.png',
    d: 'General medicine and internal medicine care',
    u: '/specialities/internal-medicine/',
    active: true,
  },
  {
    n: 'Microbiology',
    i: 'Microbiology.png',
    d: 'Infectious disease diagnosis and testing',
    u: '/specialities/microbiology/',
    active: true,
  },
  {
    n: 'Neonatology',
    i: 'Neonatology.png',
    d: 'Specialized newborn and infant care',
    u: '/specialities/paediatrics-neonatology/',
    active: true,
  },
  {
    n: 'Nephrology',
    i: 'Nephrology.png',
    d: 'Kidney care and dialysis treatment',
    u: '/specialities/nephrology/',
    active: false,
  },
  {
    n: 'Neuro & Spine Surgery',
    i: 'Neuro-Spine-Surgery.png',
    d: 'Brain, spine, and nervous system surgery',
    u: '/specialities/neurosurgery-neuro-intervention/',
    active: true,
  },
  {
    n: 'Neurology',
    i: 'Neurology.png',
    d: 'Neurological disorders and brain care',
    u: '/specialities/neurology/',
    active: true,
  },
  {
    n: 'Nuclear Medicine',
    i: 'Nuclear-Medicine.png',
    d: 'Nuclear imaging and therapeutic procedures',
    u: '/specialities/nuclear-medicine/',
    active: false,
  },
  {
    n: 'Obst. & Gynecology',
    i: 'Obst-Gynecology.png',
    d: "Women's health and maternity care",
    u: '/specialities/obstetrics-gynaecology/',
    active: true,
  },
  {
    n: 'Orthopedics & Joint Surgery',
    i: 'Orthopedics-Joint-Surgery.png',
    d: 'Bone, joint, and musculoskeletal care',
    u: '/specialities/orthopaedics/',
    active: true,
  },
  {
    n: 'Pain Medicine',
    i: 'Pain-Medicine.png',
    d: 'Chronic pain management and treatment',
    u: '/specialities/pain-medicine/',
    active: false,
  },
  {
    n: 'Pathology',
    i: 'Pathology.png',
    d: 'Disease diagnosis through laboratory testing',
    u: '/specialities/pathology/',
    active: true,
  },
  {
    n: 'Paediatric Surgery',
    i: 'Paediatric-Surgery.png',
    d: 'Surgical care for children and infants',
    u: '/specialities/paediatric-surgery/',
    active: false,
  },
  {
    n: 'Paediatrics',
    i: 'Paediatrics.png',
    d: "Comprehensive children's healthcare",
    u: '/specialities/paediatrics-neonatology/',
    active: true,
  },
  {
    n: 'Plastic & Reconstructive Surgery',
    i: 'Plastic-Reconstructive-Surgery.png',
    d: 'Cosmetic and reconstructive procedures',
    u: '/specialities/plastic-reconstructive-surgery/',
    active: false,
  },
  {
    n: 'Physical Medicine & Rehabilitation',
    i: 'Physical-Medicine-Rehabilitation.png',
    d: 'Recovery and rehabilitation services',
    u: '/specialities/physiotherapy-and-rehabilitation/',
    active: true,
  },
  {
    n: 'Psychiatry',
    i: 'Psychiatry.png',
    d: 'Mental health and psychiatric care',
    u: '/specialities/psychiatry/',
    active: false,
  },
  {
    n: 'Pulmonary Medicine & Sleep Disorder',
    i: 'Pulmonary-Medicine.png',
    d: 'Respiratory and lung care treatment',
    u: '/specialities/pulmonary-medicine/',
    active: true,
  },
  {
    n: 'Radiation Oncology',
    i: 'Radiation-Oncology.png',
    d: 'Cancer treatment with radiation therapy',
    u: '/specialities/radiation-oncology/',
    active: false,
  },
  {
    n: 'Radiology',
    i: 'Radiology.png',
    d: 'Medical imaging and diagnostic services',
    u: '/specialities/radiology/',
    active: true,
  },
  {
    n: 'Rheumatology and Immunology',
    i: 'Rheumatology-and-Immunology.png',
    d: 'Autoimmune and joint disorders treatment',
    u: '/specialities/rheumatology-and-immunology/',
    active: false,
  },
  {
    n: 'Surgical Disciplines',
    i: 'General-Surgery.png',
    d: 'Comprehensive surgical procedures',
    u: '/specialities/surgical-disciplines/',
    active: true,
  },
  {
    n: 'Surgical Oncology',
    i: 'Surgical-Oncology.png',
    d: 'Surgical treatment for cancer patients',
    u: '/specialities/surgical-oncology/',
    active: true,
  },
  {
    n: 'Urology',
    i: 'Urology.png',
    d: 'Urinary system and male reproductive care',
    u: '/specialities/urology/',
    active: true,
  },
]

export function isSpecialityVisible(item: Speciality): boolean {
  if (typeof item.show === 'boolean') return item.show
  return item.active === true
}

export function isSpecialityActive(item: Speciality): boolean {
  return item.active === true && typeof item.u === 'string' && item.u.trim() !== ''
}

export function specialityImageUrl(item: Speciality): string {
  return `${SPECIALITY_IMAGE_BASE}${item.i}`
}

export function specialityPageUrl(item: Speciality): string {
  if (!item.u) return SITE_ORIGIN
  if (item.u.startsWith('http')) return item.u
  return `${SITE_ORIGIN}${item.u}`
}
