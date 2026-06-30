export interface Region {
  id: string
  name: string
  slug: string
  lat: number
  lng: number
  description: string
  color: string
}

export const TANZANIA_REGIONS: Region[] = [
  {
    id: 'western-circuit',
    name: 'Western Circuit',
    slug: 'western-circuit',
    lat: -6.3536,
    lng: 29.7167,
    description: 'Mahale Mountains, Katavi, Rubondo Island, Gombe Stream — remote, untouched wilderness.',
    color: 'teal',
  },
  {
    id: 'northern-circuit',
    name: 'Northern Circuit',
    slug: 'northern-circuit',
    lat: -2.6,
    lng: 35.0,
    description: 'Serengeti, Ngorongoro Crater, Lake Manyara, Tarangire — classic safari country.',
    color: 'amber',
  },
  {
    id: 'zanzibar',
    name: 'Zanzibar',
    slug: 'zanzibar',
    lat: -6.1357,
    lng: 39.3621,
    description: 'White-sand beaches, Stone Town, spice farms, and turquoise water.',
    color: 'blue',
  },
  {
    id: 'kilimanjaro',
    name: 'Kilimanjaro',
    slug: 'kilimanjaro',
    lat: -3.0674,
    lng: 37.3556,
    description: "Africa's tallest peak — multiple climbing routes and acclimatization options.",
    color: 'purple',
  },
  {
    id: 'southern-circuit',
    name: 'Southern Circuit',
    slug: 'southern-circuit',
    lat: -8.0,
    lng: 36.5,
    description: 'Ruaha, Selous (Nyerere), Mikumi — vast and far less crowded than the north.',
    color: 'green',
  },
  {
    id: 'lake-victoria',
    name: 'Lake Victoria',
    slug: 'lake-victoria',
    lat: -2.5164,
    lng: 32.9,
    description: 'Mwanza and the shores of Africa\'s largest lake — gateway to Western Tanzania.',
    color: 'cyan',
  },
]

export const TOUR_TYPES = [
  { id: 'safari', name: 'Safari', icon: 'binoculars' },
  { id: 'trekking', name: 'Trekking', icon: 'mountain' },
  { id: 'beach', name: 'Beach', icon: 'umbrella' },
  { id: 'day-trip', name: 'Day Trip', icon: 'sun' },
  { id: 'cultural', name: 'Cultural', icon: 'users' },
]

export const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', description: 'Suitable for all fitness levels' },
  { id: 'moderate', name: 'Moderate', description: 'Some walking and early mornings required' },
  { id: 'challenging', name: 'Challenging', description: 'Physically demanding, good fitness required' },
]

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'sw', name: 'Swahili' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' },
]

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KE', name: 'Kenya' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'PT', name: 'Portugal' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PL', name: 'Poland' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SG', name: 'Singapore' },
]

export const PLATFORM_COMMISSION = 0.15
export const USD_TO_TZS = 2600

export interface Destination {
  slug: string
  name: string
  tagline: string
  image: string
  regions: string[]
  overview: string
  highlights: string[]
  bestTime: string
  tips: string[]
  tourCount: number
}

export const DESTINATIONS: Destination[] = [
  {
    slug: 'western-circuit',
    name: 'Western Tanzania Circuit',
    tagline: "Africa's most remote wilderness",
    image: 'https://images.unsplash.com/photo-1534476478164-b15fec4f091c?w=1200',
    regions: ['Mahale Mountains', 'Katavi National Park', 'Rubondo Island', 'Gombe Stream'],
    overview:
      "The Western Tanzania Circuit is Africa's best-kept secret — vast wilderness of rainforests, savannah, and lakeshores virtually untouched by mass tourism. Trek to sit metres from wild chimpanzees at Mahale, witness Katavi's legendary hippo pools with no other tourist vehicles in sight, and explore Rubondo Island's shores by boat. Access is by charter aircraft, keeping visitor numbers naturally low.",
    highlights: [
      'Habituated chimpanzee trekking at Mahale — 95%+ sighting success',
      "Katavi National Park — Tanzania's third-largest, virtually no tourists",
      'Rubondo Island — forested island sanctuary on Lake Victoria',
      "Gombe Stream — Jane Goodall's original chimpanzee research site",
      "Lake Tanganyika — world's second-deepest lake, swim and snorkel",
    ],
    bestTime: 'June to October (dry season). Mahale open year-round; July–October is peak.',
    tips: [
      'Access by charter flight from Dar, Arusha, or Mwanza',
      'Combine Mahale and Katavi — 2 hours apart by charter',
      'Book 3–6 months ahead for July–September peak',
    ],
    tourCount: 12,
  },
  {
    slug: 'northern-circuit',
    name: 'Northern Circuit',
    tagline: 'The Great Migration and year-round Big Five',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200',
    regions: ['Serengeti National Park', 'Ngorongoro Crater', 'Tarangire', 'Lake Manyara'],
    overview:
      "Tanzania's Northern Circuit is home to the planet's most famous wildlife spectacle — the wildebeest migration. Over 1.5 million wildebeest sweep across the Serengeti in a continuous cycle. The Ngorongoro Crater shelters one of Africa's highest wildlife densities. Tarangire is famous for its ancient baobabs and elephant herds of 300+.",
    highlights: [
      'Serengeti wildebeest migration — year-round, river crossings July–October',
      'Ngorongoro Crater — lions, elephants, rhinos in a natural amphitheatre',
      "Tarangire — Africa's highest elephant concentration per km²",
      'Lake Manyara — flamingos, tree-climbing lions, groundwater forest',
    ],
    bestTime: 'Year-round. Calving January–March (south Serengeti); crossings July–October (north).',
    tips: [
      'Combine with Zanzibar for the classic safari + beach',
      'Book lodges 6–12 months ahead for peak migration',
      'Fly into Kilimanjaro International (JRO)',
    ],
    tourCount: 18,
  },
  {
    slug: 'kilimanjaro',
    name: 'Kilimanjaro',
    tagline: "Climb Africa's highest peak — 5,895m",
    image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1200',
    regions: ['Kilimanjaro National Park', 'Moshi', 'Arusha'],
    overview:
      "Mount Kilimanjaro is the highest freestanding mountain on Earth and one of the world's most accessible high-altitude climbs. No technical skills required — just determination and a good acclimatisation itinerary. Six routes offer varying scenery; the Lemosho route has the highest success rates at 85%+.",
    highlights: [
      'Uhuru Peak at 5,895m — the Roof of Africa',
      'Lemosho Route — best acclimatisation and highest success rates',
      'Six ecological zones from rainforest to arctic summit',
      'Day walks on lower slopes for non-summitters',
    ],
    bestTime: 'January–March and June–October. Avoid April–May (heavy rains).',
    tips: ['Choose at least 7 days for best acclimatisation', 'Tip your crew generously', 'Fly into Kilimanjaro International (JRO)'],
    tourCount: 9,
  },
  {
    slug: 'southern-circuit',
    name: 'Southern Circuit',
    tagline: "Tanzania's largest untouched wilderness",
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200',
    regions: ['Ruaha National Park', 'Nyerere National Park', 'Mikumi', 'Udzungwa Mountains'],
    overview:
      "Tanzania's Southern Circuit remains one of Africa's most undiscovered safari destinations. Ruaha hosts 10,000+ elephants and rare wild dogs. Nyerere (formerly Selous) is Africa's largest protected area with unique boat safaris on the Rufiji River. Visitor numbers are a fraction of the Serengeti.",
    highlights: [
      'Ruaha — 10,000 elephants, wild dogs, minimal tourists',
      "Nyerere/Selous — Africa's largest protected area, boat safaris",
      'Mikumi — accessible from Dar, excellent for first-time safaris',
      'Udzungwa Mountains — primate tracking and endemic birds',
    ],
    bestTime: 'June to October (dry season).',
    tips: [
      'Combine with Zanzibar — both fly from Dar es Salaam',
      'Walking safaris available in Ruaha and Nyerere',
      'Nyerere boat safaris are unique to Tanzania',
    ],
    tourCount: 7,
  },
  {
    slug: 'zanzibar',
    name: 'Zanzibar & Coastal Tanzania',
    tagline: 'Indian Ocean paradise and UNESCO Stone Town',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200',
    regions: ['Stone Town (UNESCO)', 'North Coast', 'East Coast', 'Pemba Island', 'Mafia Island'],
    overview:
      "Zanzibar is Tanzania's spice island — white sand beaches, turquoise Indian Ocean waters, and a UNESCO-listed capital blending Arab, Persian, Indian, and African cultures. Stone Town's alleys lead to spice markets and ornate carved doorways. Mnemba Atoll, Pemba Island, and Mafia Island offer world-class diving.",
    highlights: [
      'Stone Town — UNESCO World Heritage Site',
      'Mnemba Atoll — pristine coral reef, sea turtles',
      "Pemba Island — East Africa's finest dive destination",
      'Whale sharks at Mafia Island (October–March)',
      'Spice Farm tours — cloves, vanilla, cinnamon',
    ],
    bestTime: 'June–October and December–February. Avoid April–May.',
    tips: [
      'Combine with any mainland safari',
      'North coast (Nungwi) for beach; East (Paje) for kitesurfing',
      'Ferry from Dar or fly direct to Zanzibar (ZNZ)',
    ],
    tourCount: 11,
  },
  {
    slug: 'lake-victoria',
    name: 'Lake Victoria & Mwanza',
    tagline: "Africa's largest lake and the Mwanza gateway",
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
    regions: ['Mwanza', 'Saanane Island', 'Rubondo Island', 'Lake Victoria'],
    overview:
      "Lake Victoria is the world's largest tropical lake — a vast inland sea with 3,000+ islands, Nile perch fishing, and the source of the Nile River. Mwanza, Tanzania's second city, is the gateway to the Western Circuit and offers Saanane Island NP, granite kopje rock climbing, and fishing safaris.",
    highlights: [
      "Saanane Island NP — Tanzania's smallest national park, day trip",
      'Nile perch fishing — world-record fish caught here',
      'Rubondo Island — accessible by boat or plane from Mwanza',
      'Bismarck Rock — iconic formation in Mwanza Bay',
      'Gateway to Mahale and Katavi by charter',
    ],
    bestTime: 'Year-round. Best fishing June–September.',
    tips: [
      'Combine a lake day trip with Western Circuit fly-in',
      'Mwanza has flights to Dar, Arusha, and Mahale',
      'Saanane Island is a great half-day trip',
    ],
    tourCount: 6,
  },
]
