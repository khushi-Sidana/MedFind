/**
 * MedFind - Medicine Availability Network
 * Sample seed data: 12 Pharmacies, 48 Medicines, ~350 Listings, Alternatives Mapping
 */

const SEED_DATA = {
  // Pre-configured user locations for easy switching & distance simulation
  userLocations: [
    { id: 'loc-1', name: 'Downtown / Central Market', lat: 28.6328, lng: 77.2197 },
    { id: 'loc-2', name: 'South District / Green Park', lat: 28.5588, lng: 77.2028 },
    { id: 'loc-3', name: 'West Sector / Rajouri Garden', lat: 28.6492, lng: 77.1226 },
    { id: 'loc-4', name: 'East Enclave / Mayur Vihar', lat: 28.6080, lng: 77.3005 },
    { id: 'loc-5', name: 'North Campus / Model Town', lat: 28.7033, lng: 77.1932 }
  ],

  categories: [
    'All Categories',
    'Pain & Fever',
    'Antibiotics',
    'Acidity & Stomach',
    'Allergy & Respiratory',
    'Diabetes',
    'Blood Pressure & Heart',
    'Thyroid & Hormones',
    'Vitamins & Supplements',
    'First Aid & Topicals'
  ],

  pharmacies: [
    {
      id: 'pharm-1',
      name: 'Apollo Pharmacy - Downtown',
      email: 'demo1@medfind.test',
      phone: '+91 98110 23451',
      address: 'Shop 14, Connaught Circus, Block B, Downtown',
      area: 'Downtown / Central Market',
      lat: 28.6315,
      lng: 77.2185,
      hours: 'Open 24/7',
      is24x7: true,
      licenseNo: 'DL-PH-2021-00892',
      rating: 4.8,
      reviewsCount: 342,
      verified: true,
      registeredAt: '2025-01-10T08:00:00Z',
      homeDelivery: true,
      pharmacistName: 'Dr. Rajesh Sharma, B.Pharm'
    },
    {
      id: 'pharm-2',
      name: 'Green Cross Chemist & Druggist',
      email: 'demo2@medfind.test',
      phone: '+91 98112 87654',
      address: '42 Main Boulevard, Near Metro Gate 2, Downtown',
      area: 'Downtown / Central Market',
      lat: 28.6345,
      lng: 77.2210,
      hours: '8:00 AM - 11:30 PM',
      is24x7: false,
      licenseNo: 'DL-PH-2020-00431',
      rating: 4.6,
      reviewsCount: 198,
      verified: true,
      registeredAt: '2025-01-15T09:30:00Z',
      homeDelivery: true,
      pharmacistName: 'Kavita Nair, M.Pharm'
    },
    {
      id: 'pharm-3',
      name: 'CityCare Medicos',
      email: 'demo3@medfind.test',
      phone: '+91 98221 11223',
      address: 'Building 7, Community Centre, South District',
      area: 'South District / Green Park',
      lat: 28.5610,
      lng: 77.2045,
      hours: '9:00 AM - 10:30 PM',
      is24x7: false,
      licenseNo: 'DL-PH-2022-01188',
      rating: 4.5,
      reviewsCount: 145,
      verified: true,
      registeredAt: '2025-02-01T11:00:00Z',
      homeDelivery: false,
      pharmacistName: 'Amit Verma, D.Pharm'
    },
    {
      id: 'pharm-4',
      name: 'Sunrise Medical Store',
      email: 'demo4@medfind.test',
      phone: '+91 98770 44332',
      address: 'Plot 108, Main Ring Road, South District',
      area: 'South District / Green Park',
      lat: 28.5570,
      lng: 77.2010,
      hours: 'Open 24/7',
      is24x7: true,
      licenseNo: 'DL-PH-2019-00122',
      rating: 4.7,
      reviewsCount: 280,
      verified: true,
      registeredAt: '2024-11-20T14:15:00Z',
      homeDelivery: true,
      pharmacistName: 'Sanjay Gupta, B.Pharm'
    },
    {
      id: 'pharm-5',
      name: 'MedPlus Corner',
      email: 'demo5@medfind.test',
      phone: '+91 98103 99887',
      address: 'Shop 3, Ground Floor, Central Market, West Sector',
      area: 'West Sector / Rajouri Garden',
      lat: 28.6510,
      lng: 77.1240,
      hours: '8:30 AM - 11:00 PM',
      is24x7: false,
      licenseNo: 'DL-PH-2023-01452',
      rating: 4.6,
      reviewsCount: 167,
      verified: true,
      registeredAt: '2025-02-12T10:00:00Z',
      homeDelivery: true,
      pharmacistName: 'Priya Iyer, B.Pharm'
    },
    {
      id: 'pharm-6',
      name: 'Shree Ram Medical Hall',
      email: 'demo6@medfind.test',
      phone: '+91 98188 55441',
      address: '28 Old Market Chowk, West Sector',
      area: 'West Sector / Rajouri Garden',
      lat: 28.6475,
      lng: 77.1210,
      hours: '9:00 AM - 10:00 PM',
      is24x7: false,
      licenseNo: 'DL-PH-2018-00076',
      rating: 4.4,
      reviewsCount: 310,
      verified: true,
      registeredAt: '2024-09-05T16:00:00Z',
      homeDelivery: false,
      pharmacistName: 'Rameshwar Prasad, Pharmacist'
    },
    {
      id: 'pharm-7',
      name: 'Jan Aushadhi Kendra - Civic Center',
      email: 'demo7@medfind.test',
      phone: '+91 98115 66778',
      address: 'Govt. Dispensary Complex, Civic Centre, East Enclave',
      area: 'East Enclave / Mayur Vihar',
      lat: 28.6095,
      lng: 77.2990,
      hours: '9:30 AM - 8:30 PM (Sun Closed)',
      is24x7: false,
      licenseNo: 'JAK-GOV-2022-998',
      rating: 4.9,
      reviewsCount: 420,
      verified: true,
      registeredAt: '2024-10-01T09:00:00Z',
      homeDelivery: false,
      pharmacistName: 'Govt. Certified Pharmacist'
    },
    {
      id: 'pharm-8',
      name: 'LifeLine Super Specialty Pharmacy',
      email: 'demo8@medfind.test',
      phone: '+91 98199 88112',
      address: 'Tower A, Hospital Road, East Enclave',
      area: 'East Enclave / Mayur Vihar',
      lat: 28.6065,
      lng: 77.3020,
      hours: 'Open 24/7',
      is24x7: true,
      licenseNo: 'DL-PH-2021-00789',
      rating: 4.7,
      reviewsCount: 215,
      verified: true,
      registeredAt: '2025-01-22T13:40:00Z',
      homeDelivery: true,
      pharmacistName: 'Dr. Vivek Saxena, Pharm.D'
    },
    {
      id: 'pharm-9',
      name: 'Wellness Forever Chemist',
      email: 'demo9@medfind.test',
      phone: '+91 98234 55667',
      address: 'Plot 22, Ring Road Junction, North Campus',
      area: 'North Campus / Model Town',
      lat: 28.7050,
      lng: 77.1950,
      hours: 'Open 24/7',
      is24x7: true,
      licenseNo: 'DL-PH-2022-01980',
      rating: 4.8,
      reviewsCount: 388,
      verified: true,
      registeredAt: '2025-01-05T08:30:00Z',
      homeDelivery: true,
      pharmacistName: 'Neha Deshmukh, B.Pharm'
    },
    {
      id: 'pharm-10',
      name: 'Guardian Health & Pharmacy',
      email: 'demo10@medfind.test',
      phone: '+91 98114 77889',
      address: 'Shop 12, Main University Road, North Campus',
      area: 'North Campus / Model Town',
      lat: 28.7015,
      lng: 77.1910,
      hours: '8:00 AM - 11:00 PM',
      is24x7: false,
      licenseNo: 'DL-PH-2023-01675',
      rating: 4.6,
      reviewsCount: 154,
      verified: true,
      registeredAt: '2025-02-18T12:00:00Z',
      homeDelivery: true,
      pharmacistName: 'Sunil Mathur, M.Pharm'
    },
    {
      id: 'pharm-11',
      name: 'Fortis Health Pharmacy',
      email: 'demo11@medfind.test',
      phone: '+91 98111 00223',
      address: 'Adjacent to Fortis Hospital Gate 1, South District',
      area: 'South District / Green Park',
      lat: 28.5560,
      lng: 77.2060,
      hours: 'Open 24/7',
      is24x7: true,
      licenseNo: 'DL-PH-2020-00215',
      rating: 4.9,
      reviewsCount: 512,
      verified: true,
      registeredAt: '2024-08-14T07:00:00Z',
      homeDelivery: true,
      pharmacistName: 'Ananya Roy, Pharm.D'
    },
    {
      id: 'pharm-12',
      name: 'Max Care Meds & Clinic',
      email: 'demo12@medfind.test',
      phone: '+91 98711 33445',
      address: 'Opposite Metro Station, Gate 3, West Sector',
      area: 'West Sector / Rajouri Garden',
      lat: 28.6530,
      lng: 77.1260,
      hours: '8:00 AM - 10:30 PM',
      is24x7: false,
      licenseNo: 'DL-PH-2021-00912',
      rating: 4.5,
      reviewsCount: 132,
      verified: true,
      registeredAt: '2025-01-30T15:20:00Z',
      homeDelivery: false,
      pharmacistName: 'Gaurav Gill, B.Pharm'
    },
    {
      id: 'pharm-13',
      name: 'New Horizon Chemists (Pending)',
      email: 'demo13@medfind.test',
      phone: '+91 98199 00112',
      address: 'Commercial Block 9, Sector 15',
      area: 'Downtown / Central Market',
      lat: 28.6360,
      lng: 77.2250,
      hours: '9:00 AM - 9:00 PM',
      is24x7: false,
      licenseNo: 'DL-PH-2026-PENDING-44',
      rating: 0,
      reviewsCount: 0,
      verified: false,
      registeredAt: '2026-09-28T14:00:00Z',
      homeDelivery: true,
      pharmacistName: 'Vikas Malhotra, D.Pharm'
    }
  ],

  medicines: [
    // --- PAIN & FEVER ---
    {
      id: 'med-1',
      brandName: 'Crocin 500',
      genericName: 'Paracetamol',
      strength: '500 mg',
      category: 'Pain & Fever',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'GlaxoSmithKline Pharmaceuticals',
      description: 'Widely used analgesic and antipyretic for mild-to-moderate fever, headache, body aches and minor pains.',
      alternatives: ['med-2', 'med-3', 'med-4']
    },
    {
      id: 'med-2',
      brandName: 'Dolo 650',
      genericName: 'Paracetamol',
      strength: '650 mg',
      category: 'Pain & Fever',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'Micro Labs Ltd',
      description: 'Higher-strength paracetamol formulation for high fever and acute musculoskeletal pain.',
      alternatives: ['med-1', 'med-3', 'med-4']
    },
    {
      id: 'med-3',
      brandName: 'Calpol 500',
      genericName: 'Paracetamol',
      strength: '500 mg',
      category: 'Pain & Fever',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'GlaxoSmithKline Pharmaceuticals',
      description: 'Gentle on stomach antipyretic formulation for temperature reduction and fever.',
      alternatives: ['med-1', 'med-2', 'med-4']
    },
    {
      id: 'med-4',
      brandName: 'Pacimol 500',
      genericName: 'Paracetamol',
      strength: '500 mg',
      category: 'Pain & Fever',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'Ipca Laboratories',
      description: 'Cost-effective generic substitute for common cold fever and headache relief.',
      alternatives: ['med-1', 'med-2', 'med-3']
    },
    {
      id: 'med-5',
      brandName: 'Combiflam',
      genericName: 'Ibuprofen + Paracetamol',
      strength: '400 mg + 325 mg',
      category: 'Pain & Fever',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'Sanofi India Ltd',
      description: 'Dual-action combination for inflammatory pain relief, sprains, dental pain and fever.',
      alternatives: ['med-6', 'med-7']
    },
    {
      id: 'med-6',
      brandName: 'Brufen 400',
      genericName: 'Ibuprofen',
      strength: '400 mg',
      category: 'Pain & Fever',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Abbott Healthcare',
      description: 'Non-steroidal anti-inflammatory drug (NSAID) for swelling, joint arthritis and pain.',
      alternatives: ['med-5']
    },
    {
      id: 'med-7',
      brandName: 'Voveran 50',
      genericName: 'Diclofenac Sodium',
      strength: '50 mg',
      category: 'Pain & Fever',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Novartis India',
      description: 'Potent prescription anti-inflammatory medication for acute arthritic flare-ups and back pain.',
      alternatives: []
    },
    {
      id: 'med-8',
      brandName: 'Meftal Spas',
      genericName: 'Mefenamic Acid + Dicyclomine',
      strength: '250 mg + 10 mg',
      category: 'Pain & Fever',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Blue Cross Laboratories',
      description: 'Effective antispasmodic for relief of abdominal cramps and menstrual colic pain.',
      alternatives: []
    },

    // --- ANTIBIOTICS ---
    {
      id: 'med-9',
      brandName: 'Augmentin 625 Duo',
      genericName: 'Amoxicillin + Clavulanic Acid',
      strength: '500 mg + 125 mg',
      category: 'Antibiotics',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'GlaxoSmithKline Pharmaceuticals',
      description: 'Broad-spectrum beta-lactamase resistant antibiotic for respiratory, skin and ENT infections.',
      alternatives: ['med-10', 'med-11']
    },
    {
      id: 'med-10',
      brandName: 'Moxikind-CV 625',
      genericName: 'Amoxicillin + Clavulanic Acid',
      strength: '500 mg + 125 mg',
      category: 'Antibiotics',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Mankind Pharma',
      description: 'Therapeutically equivalent branded generic alternative to Augmentin 625.',
      alternatives: ['med-9', 'med-11']
    },
    {
      id: 'med-11',
      brandName: 'Clavam 625',
      genericName: 'Amoxicillin + Clavulanic Acid',
      strength: '500 mg + 125 mg',
      category: 'Antibiotics',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Alkem Laboratories',
      description: 'High-quality alternative antibiotic for sinus, throat and bacterial bronchitis.',
      alternatives: ['med-9', 'med-10']
    },
    {
      id: 'med-12',
      brandName: 'Azithral 500',
      genericName: 'Azithromycin',
      strength: '500 mg',
      category: 'Antibiotics',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Alembic Pharmaceuticals',
      description: 'Macrolide antibiotic 3-day course for upper and lower respiratory tract infections.',
      alternatives: ['med-13']
    },
    {
      id: 'med-13',
      brandName: 'Azee 500',
      genericName: 'Azithromycin',
      strength: '500 mg',
      category: 'Antibiotics',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Cipla Ltd',
      description: 'Common generic alternative for throat infections, pneumonia and ear infections.',
      alternatives: ['med-12']
    },
    {
      id: 'med-14',
      brandName: 'Ciplox 500',
      genericName: 'Ciprofloxacin',
      strength: '500 mg',
      category: 'Antibiotics',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Cipla Ltd',
      description: 'Fluoroquinolone antibiotic for bacterial urinary tract, gastrointestinal and bone infections.',
      alternatives: ['med-15']
    },
    {
      id: 'med-15',
      brandName: 'Cifran 500',
      genericName: 'Ciprofloxacin',
      strength: '500 mg',
      category: 'Antibiotics',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Sun Pharma',
      description: 'Direct substitute for bacterial diarrhoea and kidney/bladder urinary tract infections.',
      alternatives: ['med-14']
    },
    {
      id: 'med-16',
      brandName: 'Taxim-O 200',
      genericName: 'Cefixime',
      strength: '200 mg',
      category: 'Antibiotics',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Alkem Laboratories',
      description: '3rd generation cephalosporin antibiotic for typhoid and severe throat infections.',
      alternatives: []
    },
    {
      id: 'med-17',
      brandName: 'Doxt-SL',
      genericName: 'Doxycycline + Lactic Acid Bacillus',
      strength: '100 mg + 5 Billion Spores',
      category: 'Antibiotics',
      dosageForm: 'Capsule',
      rxRequired: true,
      manufacturer: 'Dr. Reddy’s Laboratories',
      description: 'Antibiotic fortified with probiotic spores for acne vulgaris and respiratory infections.',
      alternatives: []
    },

    // --- ACIDITY & STOMACH ---
    {
      id: 'med-18',
      brandName: 'Pantop 40',
      genericName: 'Pantoprazole',
      strength: '40 mg',
      category: 'Acidity & Stomach',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'Aristo Pharmaceuticals',
      description: 'Proton pump inhibitor (PPI) for GERD, acid reflux, heartburn and peptic ulcer prophylaxis.',
      alternatives: ['med-19', 'med-20']
    },
    {
      id: 'med-19',
      brandName: 'Pan 40',
      genericName: 'Pantoprazole',
      strength: '40 mg',
      category: 'Acidity & Stomach',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'Alkem Laboratories',
      description: 'Equivalent pantoprazole brand for morning acidity and gastric relief.',
      alternatives: ['med-18', 'med-20']
    },
    {
      id: 'med-20',
      brandName: 'Pantocid 40',
      genericName: 'Pantoprazole',
      strength: '40 mg',
      category: 'Acidity & Stomach',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'Sun Pharma',
      description: 'Trusted PPI brand for fast relief from hyperacidity and stomach lining irritation.',
      alternatives: ['med-18', 'med-19']
    },
    {
      id: 'med-21',
      brandName: 'Omez 20',
      genericName: 'Omeprazole',
      strength: '20 mg',
      category: 'Acidity & Stomach',
      dosageForm: 'Capsule',
      rxRequired: false,
      manufacturer: 'Dr. Reddy’s Laboratories',
      description: 'Fast-acting gastric capsule for instant relief from burning sensation and acid gas.',
      alternatives: ['med-18', 'med-22']
    },
    {
      id: 'med-22',
      brandName: 'Razo 20',
      genericName: 'Rabeprazole',
      strength: '20 mg',
      category: 'Acidity & Stomach',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'Dr. Reddy’s Laboratories',
      description: 'Rapid onset acid reducer for stubborn acid reflux and ulcer healing.',
      alternatives: ['med-21']
    },
    {
      id: 'med-23',
      brandName: 'Digene Gel Mint',
      genericName: 'Magnesium + Aluminium Hydroxide + Simethicone',
      strength: '200 ml',
      category: 'Acidity & Stomach',
      dosageForm: 'Syrup / Suspension',
      rxRequired: false,
      manufacturer: 'Abbott Healthcare',
      description: 'Soothing antacid liquid for instantaneous relief from heartburn, indigestion and gas.',
      alternatives: ['med-24']
    },
    {
      id: 'med-24',
      brandName: 'Gelusil MPS Liquid',
      genericName: 'Aluminium Hydroxide + Dimethicone + Magnesium',
      strength: '200 ml',
      category: 'Acidity & Stomach',
      dosageForm: 'Syrup / Suspension',
      rxRequired: false,
      manufacturer: 'Pfizer India',
      description: 'Non-systemic antacid syrup for immediate neutralization of gastric acid.',
      alternatives: ['med-23']
    },
    {
      id: 'med-25',
      brandName: 'Ondem 4',
      genericName: 'Ondansetron',
      strength: '4 mg',
      category: 'Acidity & Stomach',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Alkem Laboratories',
      description: 'Antiemetic medicine to prevent nausea and vomiting from gastroenteritis.',
      alternatives: []
    },

    // --- ALLERGY & RESPIRATORY ---
    {
      id: 'med-26',
      brandName: 'Cetzine 10',
      genericName: 'Cetirizine',
      strength: '10 mg',
      category: 'Allergy & Respiratory',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'Dr. Reddy’s Laboratories',
      description: 'Second-generation antihistamine for seasonal hay fever, runny nose, sneezing and hives.',
      alternatives: ['med-27']
    },
    {
      id: 'med-27',
      brandName: 'Zyrtec 10',
      genericName: 'Cetirizine',
      strength: '10 mg',
      category: 'Allergy & Respiratory',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'GlaxoSmithKline Pharmaceuticals',
      description: 'Original anti-allergy formulation for urticaria, itching, allergic conjunctivitis.',
      alternatives: ['med-26']
    },
    {
      id: 'med-28',
      brandName: 'Allegra 120',
      genericName: 'Fexofenadine',
      strength: '120 mg',
      category: 'Allergy & Respiratory',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'Sanofi India Ltd',
      description: 'Non-drowsy 24-hour antihistamine for seasonal allergies and itchy throat.',
      alternatives: ['med-29']
    },
    {
      id: 'med-29',
      brandName: 'Fexova 120',
      genericName: 'Fexofenadine',
      strength: '120 mg',
      category: 'Allergy & Respiratory',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'Ipca Laboratories',
      description: 'Economical non-sedating anti-allergy generic alternative.',
      alternatives: ['med-28']
    },
    {
      id: 'med-30',
      brandName: 'Montair LC',
      genericName: 'Montelukast + Levocetirizine',
      strength: '10 mg + 5 mg',
      category: 'Allergy & Respiratory',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Cipla Ltd',
      description: 'Dual anti-leukotriene and antihistamine formulation for allergic rhinitis and asthma prophylaxis.',
      alternatives: ['med-31']
    },
    {
      id: 'med-31',
      brandName: 'Monticope',
      genericName: 'Montelukast + Levocetirizine',
      strength: '10 mg + 5 mg',
      category: 'Allergy & Respiratory',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Mankind Pharma',
      description: 'Direct substitute for nocturnal asthma cough and persistent dust allergies.',
      alternatives: ['med-30']
    },
    {
      id: 'med-32',
      brandName: 'Asthalin Inhaler',
      genericName: 'Salbutamol',
      strength: '100 mcg (200 MDI)',
      category: 'Allergy & Respiratory',
      dosageForm: 'Inhaler',
      rxRequired: true,
      manufacturer: 'Cipla Ltd',
      description: 'Fast-acting bronchodilator rescue inhaler for sudden asthma attacks and bronchospasm.',
      alternatives: []
    },
    {
      id: 'med-33',
      brandName: 'Ascoril LS Syrup',
      genericName: 'Levosalbutamol + Ambroxol + Guaifenesin',
      strength: '100 ml',
      category: 'Allergy & Respiratory',
      dosageForm: 'Syrup / Cough Elixir',
      rxRequired: true,
      manufacturer: 'Glenmark Pharmaceuticals',
      description: 'Mucolytic and bronchodilator cough syrup for productive chesty cough with congestion.',
      alternatives: []
    },

    // --- DIABETES ---
    {
      id: 'med-34',
      brandName: 'Glycomet 500',
      genericName: 'Metformin Hydrochloride',
      strength: '500 mg',
      category: 'Diabetes',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'USV Pvt Ltd',
      description: 'First-line anti-hyperglycemic agent for managing Type 2 Diabetes Mellitus.',
      alternatives: ['med-35']
    },
    {
      id: 'med-35',
      brandName: 'Glucophage 500',
      genericName: 'Metformin Hydrochloride',
      strength: '500 mg',
      category: 'Diabetes',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Merck Healthcare',
      description: 'International benchmark metformin formulation for insulin sensitivity improvement.',
      alternatives: ['med-34']
    },
    {
      id: 'med-36',
      brandName: 'Glycomet-GP 1',
      genericName: 'Metformin + Glimepiride',
      strength: '500 mg + 1 mg',
      category: 'Diabetes',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'USV Pvt Ltd',
      description: 'Combination therapy stimulating insulin release and reducing liver glucose production.',
      alternatives: []
    },
    {
      id: 'med-37',
      brandName: 'Amaryl 2',
      genericName: 'Glimepiride',
      strength: '2 mg',
      category: 'Diabetes',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Sanofi India Ltd',
      description: 'Sulfonylurea oral hypoglycemic to stimulate pancreatic beta cells for insulin production.',
      alternatives: []
    },
    {
      id: 'med-38',
      brandName: 'Januvia 100',
      genericName: 'Sitagliptin',
      strength: '100 mg',
      category: 'Diabetes',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'MSD Pharmaceuticals',
      description: 'DPP-4 inhibitor to enhance natural incretin hormones for blood sugar regulation.',
      alternatives: []
    },

    // --- BLOOD PRESSURE & HEART ---
    {
      id: 'med-39',
      brandName: 'Amlong 5',
      genericName: 'Amlodipine',
      strength: '5 mg',
      category: 'Blood Pressure & Heart',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Micro Labs Ltd',
      description: 'Calcium channel blocker to relax arterial walls and lower high blood pressure.',
      alternatives: ['med-40']
    },
    {
      id: 'med-40',
      brandName: 'Stamlo 5',
      genericName: 'Amlodipine',
      strength: '5 mg',
      category: 'Blood Pressure & Heart',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Dr. Reddy’s Laboratories',
      description: 'Widely prescribed amlodipine substitute for cardiovascular hypertension.',
      alternatives: ['med-39']
    },
    {
      id: 'med-41',
      brandName: 'Telma 40',
      genericName: 'Telmisartan',
      strength: '40 mg',
      category: 'Blood Pressure & Heart',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Glenmark Pharmaceuticals',
      description: 'Angiotensin receptor blocker (ARB) providing 24-hr blood pressure control and kidney protection.',
      alternatives: ['med-42']
    },
    {
      id: 'med-42',
      brandName: 'Telmikind 40',
      genericName: 'Telmisartan',
      strength: '40 mg',
      category: 'Blood Pressure & Heart',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Mankind Pharma',
      description: 'Cost-saving generic alternative for daily hypertension maintenance.',
      alternatives: ['med-41']
    },
    {
      id: 'med-43',
      brandName: 'Atorva 10',
      genericName: 'Atorvastatin',
      strength: '10 mg',
      category: 'Blood Pressure & Heart',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Zydus Cadila',
      description: 'Statin to lower bad LDL cholesterol and triglycerides, reducing heart attack risk.',
      alternatives: ['med-44']
    },
    {
      id: 'med-44',
      brandName: 'Storvas 10',
      genericName: 'Atorvastatin',
      strength: '10 mg',
      category: 'Blood Pressure & Heart',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Sun Pharma',
      description: 'Therapeutically bioequivalent atorvastatin brand for lipid management.',
      alternatives: ['med-43']
    },
    {
      id: 'med-45',
      brandName: 'Ecosprin 75',
      genericName: 'Aspirin (Acetylsalicylic Acid)',
      strength: '75 mg',
      category: 'Blood Pressure & Heart',
      dosageForm: 'Enteric-Coated Tablet',
      rxRequired: true,
      manufacturer: 'USV Pvt Ltd',
      description: 'Low-dose antiplatelet blood thinner for cardiovascular and stroke prevention.',
      alternatives: []
    },

    // --- THYROID & HORMONES ---
    {
      id: 'med-46',
      brandName: 'Thyronorm 50',
      genericName: 'Thyroxine Sodium',
      strength: '50 mcg',
      category: 'Thyroid & Hormones',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'Abbott Healthcare',
      description: 'Synthetic thyroid hormone replacement for hypothyroidism management.',
      alternatives: ['med-47']
    },
    {
      id: 'med-47',
      brandName: 'Eltroxin 50',
      genericName: 'Thyroxine Sodium',
      strength: '50 mcg',
      category: 'Thyroid & Hormones',
      dosageForm: 'Tablet',
      rxRequired: true,
      manufacturer: 'GlaxoSmithKline Pharmaceuticals',
      description: 'Classic levothyroxine brand taken early morning on an empty stomach.',
      alternatives: ['med-46']
    },

    // --- VITAMINS & FIRST AID ---
    {
      id: 'med-48',
      brandName: 'Shelcal 500',
      genericName: 'Calcium Carbonate + Vitamin D3',
      strength: '500 mg + 250 IU',
      category: 'Vitamins & Supplements',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'Torrent Pharmaceuticals',
      description: 'Essential bone health supplement for osteoporosis and calcium deficiency.',
      alternatives: ['med-49']
    },
    {
      id: 'med-49',
      brandName: 'Cipcal 500',
      genericName: 'Calcium Carbonate + Vitamin D3',
      strength: '500 mg + 250 IU',
      category: 'Vitamins & Supplements',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'Cipla Ltd',
      description: 'Equivalent calcium + D3 formulation for joint strength and dental support.',
      alternatives: ['med-48']
    },
    {
      id: 'med-50',
      brandName: 'Zincovit',
      genericName: 'Multivitamins + Multiminerals + Zinc',
      strength: 'Single Strip (15 Tablets)',
      category: 'Vitamins & Supplements',
      dosageForm: 'Tablet',
      rxRequired: false,
      manufacturer: 'Apex Laboratories',
      description: 'Comprehensive nutritional immune booster with vital trace elements.',
      alternatives: []
    },
    {
      id: 'med-51',
      brandName: 'Betadine 10% Ointment',
      genericName: 'Povidone Iodine',
      strength: '20 g Tube',
      category: 'First Aid & Topicals',
      dosageForm: 'Ointment',
      rxRequired: false,
      manufacturer: 'Win-Medicare',
      description: 'Antiseptic microbicidal ointment for cuts, minor burns, abrasions and surgical wounds.',
      alternatives: ['med-52']
    },
    {
      id: 'med-52',
      brandName: 'Cipladine 5% Ointment',
      genericName: 'Povidone Iodine',
      strength: '20 g Tube',
      category: 'First Aid & Topicals',
      dosageForm: 'Ointment',
      rxRequired: false,
      manufacturer: 'Cipla Ltd',
      description: 'Topical broad spectrum antiseptic for first aid wound protection.',
      alternatives: ['med-51']
    }
  ]
};

// Procedural generator to populate ~350 realistic inventory listings across the 12 verified pharmacies
function generateInitialListings() {
  const listings = [];
  const now = new Date('2026-09-29T16:30:00Z').getTime();
  
  // Predictable pseudo-random generator so data stays realistic and reproducible
  let seed = 42;
  function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  // Prices table for realistic INR costs
  const basePrices = {
    'med-1': 24, 'med-2': 32, 'med-3': 22, 'med-4': 18,
    'med-5': 45, 'med-6': 38, 'med-7': 95, 'med-8': 52,
    'med-9': 202, 'med-10': 168, 'med-11': 175, 'med-12': 118,
    'med-13': 110, 'med-14': 46, 'med-15': 44, 'med-16': 105,
    'med-17': 88, 'med-18': 145, 'med-19': 135, 'med-20': 140,
    'med-21': 62, 'med-22': 185, 'med-23': 162, 'med-24': 150,
    'med-25': 55, 'med-26': 22, 'med-27': 28, 'med-28': 195,
    'med-29': 140, 'med-30': 180, 'med-31': 145, 'med-32': 168,
    'med-33': 120, 'med-34': 25, 'med-35': 38, 'med-36': 98,
    'med-37': 110, 'med-38': 420, 'med-39': 35, 'med-40': 32,
    'med-41': 95, 'med-42': 68, 'med-43': 85, 'med-44': 80,
    'med-45': 15, 'med-46': 145, 'med-47': 138, 'med-48': 130,
    'med-49': 122, 'med-50': 155, 'med-51': 75, 'med-52': 65
  };

  SEED_DATA.pharmacies.forEach((pharm) => {
    // Only verified pharmacies get active stock; unverified starts empty
    if (!pharm.verified) return;

    SEED_DATA.medicines.forEach((med) => {
      const includeChance = random();
      // ~68% of medicines stocked at each pharmacy
      if (includeChance > 0.32) {
        const stockRoll = random();
        let status = 'in_stock';
        let quantity = Math.floor(random() * 150) + 15;

        if (stockRoll < 0.16) {
          status = 'out_of_stock';
          quantity = 0;
        } else if (stockRoll < 0.32) {
          status = 'low_stock';
          quantity = Math.floor(random() * 8) + 2; // 2 to 9 units
        }

        // Varied timestamps:
        // 55% updated in last 6 hours
        // 25% updated 6 - 24 hours ago
        // 15% updated 24 - 48 hours ago (flagged as possibly outdated)
        // 5% updated >72 hours ago
        let ageHours = 0;
        const timeRoll = random();
        if (timeRoll < 0.55) {
          ageHours = random() * 6; // fresh
        } else if (timeRoll < 0.80) {
          ageHours = 6 + random() * 18; // recent
        } else if (timeRoll < 0.95) {
          ageHours = 24 + random() * 24; // >24h
        } else {
          ageHours = 72 + random() * 12; // >72h
        }

        const updatedAt = new Date(now - ageHours * 3600 * 1000).toISOString();
        const price = basePrices[med.id] || 50;

        listings.push({
          id: `list-${pharm.id}-${med.id}`,
          pharmacyId: pharm.id,
          medicineId: med.id,
          status: status, // 'in_stock' | 'low_stock' | 'out_of_stock'
          quantity: quantity,
          price: price,
          batchNo: `B${Math.floor(random() * 90000 + 10000)}`,
          updatedAt: updatedAt,
          notes: status === 'low_stock' ? 'Fresh shipment arriving tomorrow' : (status === 'out_of_stock' ? 'Stock expected by Friday' : 'Regular shelf inventory'),
          history: [
            {
              timestamp: updatedAt,
              status: status,
              quantity: quantity,
              action: 'Status published'
            },
            {
              timestamp: new Date(new Date(updatedAt).getTime() - 48 * 3600 * 1000).toISOString(),
              status: 'in_stock',
              quantity: quantity + 30,
              action: 'Initial inventory count'
            }
          ]
        });
      }
    });
  });

  return listings;
}

SEED_DATA.listings = generateInitialListings();

// Default restock alerts for demo
SEED_DATA.initialAlerts = [
  {
    id: 'alert-1',
    userEmail: 'patient.demo@gmail.com',
    medicineId: 'med-1', // Crocin 500
    createdAt: '2026-09-28T10:00:00Z',
    notified: true,
    notifiedAt: '2026-09-29T08:15:00Z',
    pharmacyName: 'Apollo Pharmacy - Downtown',
    message: 'Crocin 500 was restocked (120 units available)'
  },
  {
    id: 'alert-2',
    userEmail: 'patient.demo@gmail.com',
    medicineId: 'med-9', // Augmentin 625
    createdAt: '2026-09-29T11:00:00Z',
    notified: false,
    notifiedAt: null,
    pharmacyName: null,
    message: 'Waiting for stock update'
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SEED_DATA;
}
