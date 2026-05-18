import type { City, Place, Deal, Event } from "@/types";

// ──────────────────────────────────────────────────────────────────────
//  CITIES — start with a focused MVP set, easy to expand.
// ──────────────────────────────────────────────────────────────────────
export const CITIES: City[] = [
  { id: "c-chi",  slug: "chicago",       name: "Chicago",         state: "IL", lat: 41.8781, lng: -87.6298, blurb: "Steel skyline, deep pours, deeper history.",            heroImage: "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=1600" },
  { id: "c-nyc",  slug: "new-york",      name: "New York City",   state: "NY", lat: 40.7128, lng: -74.0060, blurb: "Five boroughs, ten thousand happy hours.",              heroImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600" },
  { id: "c-sf",   slug: "san-francisco", name: "San Francisco",   state: "CA", lat: 37.7749, lng: -122.4194, blurb: "Fog, foundries, and four-dollar oysters.",             heroImage: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600" },
  { id: "c-sea",  slug: "seattle",       name: "Seattle",         state: "WA", lat: 47.6062, lng: -122.3321, blurb: "Rain-soaked rooftops with a view of the Sound.",        heroImage: "https://images.unsplash.com/photo-1502175353174-a7a1b8bb89e7?w=1600" },
  { id: "c-la",   slug: "los-angeles",   name: "Los Angeles",     state: "CA", lat: 34.0522, lng: -118.2437, blurb: "Golden-hour patios from DTLA to Venice.",               heroImage: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1600" },
  { id: "c-phl",  slug: "philadelphia",  name: "Philadelphia",    state: "PA", lat: 39.9526, lng: -75.1652, blurb: "Brick alleys and BYOB grit.",                            heroImage: "https://images.unsplash.com/photo-1569761316261-9a8696fa2ca3?w=1600" },
  { id: "c-rdu",  slug: "raleigh",       name: "Raleigh",         state: "NC", lat: 35.7796, lng: -78.6382, blurb: "Tar Heel patios, craft pours, Carolina sundowns.",       heroImage: "https://images.unsplash.com/photo-1564594985645-4427056e22e2?w=1600" },
  { id: "c-sac",  slug: "sacramento",    name: "Sacramento",      state: "CA", lat: 38.5816, lng: -121.4944, blurb: "Farm-to-fork capital with riverbed cocktails.",         heroImage: "https://images.unsplash.com/photo-1572945000-69d3a8e3a6a2?w=1600" },
  { id: "c-bos",  slug: "boston",        name: "Boston",          state: "MA", lat: 42.3601, lng: -71.0589, blurb: "Brownstone basements and oyster towers.",                heroImage: "https://images.unsplash.com/photo-1501979376754-9305c33b3e74?w=1600" },
  { id: "c-dc",   slug: "washington-dc", name: "Washington DC",   state: "DC", lat: 38.9072, lng: -77.0369, blurb: "Power-hour bourbon and rooftop monuments.",              heroImage: "https://images.unsplash.com/photo-1617581629397-a72507c3de9d?w=1600" },
  { id: "c-atx",  slug: "austin",        name: "Austin",          state: "TX", lat: 30.2672, lng: -97.7431, blurb: "Live music, smoked everything, $3 frozen margs.",         heroImage: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=1600" },
  { id: "c-mia",  slug: "miami",         name: "Miami",           state: "FL", lat: 25.7617, lng: -80.1918, blurb: "Neon rooftops, salt-rim spritzes, late nights.",         heroImage: "https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=1600" },
  { id: "c-atl",  slug: "atlanta",       name: "Atlanta",         state: "GA", lat: 33.7490, lng: -84.3880, blurb: "Southern hospitality, Beltline patios.",                  heroImage: "https://images.unsplash.com/photo-1571974089171-2bb0a3a36678?w=1600" },
  { id: "c-jc",   slug: "jersey-city",   name: "Jersey City",     state: "NJ", lat: 40.7178, lng: -74.0431, blurb: "Skyline-view happy hours minus the Manhattan markup.",   heroImage: "https://images.unsplash.com/photo-1582610116397-edb318620f90?w=1600" },
  { id: "c-clt",  slug: "charlotte",     name: "Charlotte",       state: "NC", lat: 35.2271, lng: -80.8431, blurb: "Uptown rooftop pours and South End breweries.",          heroImage: "https://images.unsplash.com/photo-1545986770-67b81a7e74e3?w=1600" }
];

// ──────────────────────────────────────────────────────────────────────
//  Helper to fan out coords slightly so the map looks alive.
// ──────────────────────────────────────────────────────────────────────
const jitter = (base: number, range = 0.04, seed = 1) => {
  // deterministic pseudo-random so the layout is stable across reloads
  const x = Math.sin(seed * 9999) * 10000;
  const n = x - Math.floor(x); // 0..1
  return base + (n - 0.5) * range * 2;
};

// ──────────────────────────────────────────────────────────────────────
//  PLACES — a curated bar/restaurant mix for each MVP city.
// ──────────────────────────────────────────────────────────────────────
const placeTemplate = (
  id: string,
  cityId: string,
  cityLat: number,
  cityLng: number,
  i: number,
  data: Partial<Place>
): Place => ({
  id,
  slug: data.slug ?? id,
  name: data.name ?? "Unnamed",
  cityId,
  neighborhood: data.neighborhood ?? "Downtown",
  address: data.address ?? "123 Main St",
  zip: data.zip ?? "00000",
  lat: jitter(cityLat, 0.05, i),
  lng: jitter(cityLng, 0.05, i + 7),
  phone: data.phone,
  website: data.website,
  imageUrl: data.imageUrl ?? `https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200`,
  priceLevel: data.priceLevel ?? 2,
  rating: data.rating ?? 4.3,
  reviewCount: data.reviewCount ?? 412,
  vibeTags: data.vibeTags ?? ["after-work"],
  cuisineTags: data.cuisineTags ?? [],
  isFeatured: data.isFeatured ?? false,
  isClaimed: data.isClaimed ?? false,
  isVerified: data.isVerified ?? true
});

const chiPlaces: Place[] = [
  placeTemplate("p-chi-1", "c-chi", 41.8781, -87.6298, 1, {
    slug: "the-aviary-loop",
    name: "The Aviary Loop",
    neighborhood: "The Loop",
    address: "210 N State St, Chicago, IL",
    imageUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200",
    priceLevel: 3, rating: 4.7, reviewCount: 1820,
    vibeTags: ["rooftop", "date-night", "cocktails"],
    cuisineTags: ["modern american", "small plates"],
    isFeatured: true
  }),
  placeTemplate("p-chi-2", "c-chi", 41.8781, -87.6298, 2, {
    slug: "river-north-tap",
    name: "River North Tap",
    neighborhood: "River North",
    address: "55 W Hubbard St, Chicago, IL",
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200",
    priceLevel: 2, rating: 4.4, reviewCount: 980,
    vibeTags: ["after-work", "groups", "sports"],
    cuisineTags: ["pub", "burgers"]
  }),
  placeTemplate("p-chi-3", "c-chi", 41.8781, -87.6298, 3, {
    slug: "wicker-park-wine-bar",
    name: "Wicker Park Wine Bar",
    neighborhood: "Wicker Park",
    address: "1422 N Milwaukee Ave, Chicago, IL",
    imageUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200",
    priceLevel: 3, rating: 4.6, reviewCount: 612,
    vibeTags: ["date-night", "intimate", "wine"],
    cuisineTags: ["wine bar", "tapas"]
  }),
  placeTemplate("p-chi-4", "c-chi", 41.8781, -87.6298, 4, {
    slug: "lincoln-park-taqueria",
    name: "Lincoln Park Taqueria",
    neighborhood: "Lincoln Park",
    address: "2330 N Clark St, Chicago, IL",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200",
    priceLevel: 1, rating: 4.5, reviewCount: 1402,
    vibeTags: ["student-budget", "groups", "casual"],
    cuisineTags: ["mexican", "tacos"]
  })
];

const nycPlaces: Place[] = [
  placeTemplate("p-nyc-1", "c-nyc", 40.7128, -74.006, 11, {
    slug: "soho-rooftop",
    name: "SoHo Rooftop",
    neighborhood: "SoHo",
    address: "120 Greene St, New York, NY",
    imageUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1200",
    priceLevel: 4, rating: 4.7, reviewCount: 2230,
    vibeTags: ["rooftop", "date-night", "skyline"],
    cuisineTags: ["modern american", "small plates"],
    isFeatured: true
  }),
  placeTemplate("p-nyc-2", "c-nyc", 40.7128, -74.006, 12, {
    slug: "east-village-dive",
    name: "East Village Dive",
    neighborhood: "East Village",
    address: "212 Ave A, New York, NY",
    imageUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200",
    priceLevel: 1, rating: 4.3, reviewCount: 845,
    vibeTags: ["dive", "student-budget", "late-night"],
    cuisineTags: ["pub"]
  }),
  placeTemplate("p-nyc-3", "c-nyc", 40.7128, -74.006, 13, {
    slug: "midtown-sushi-bar",
    name: "Midtown Sushi Bar",
    neighborhood: "Midtown",
    address: "550 5th Ave, New York, NY",
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200",
    priceLevel: 3, rating: 4.6, reviewCount: 1102,
    vibeTags: ["after-work", "networking", "date-night"],
    cuisineTags: ["sushi", "japanese"]
  })
];

const sfPlaces: Place[] = [
  placeTemplate("p-sf-1", "c-sf", 37.7749, -122.4194, 21, {
    slug: "mission-mezcal-house",
    name: "Mission Mezcal House",
    neighborhood: "The Mission",
    address: "2810 Mission St, San Francisco, CA",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200",
    priceLevel: 2, rating: 4.6, reviewCount: 712,
    vibeTags: ["cocktails", "patio", "groups"],
    cuisineTags: ["mexican", "small plates"]
  }),
  placeTemplate("p-sf-2", "c-sf", 37.7749, -122.4194, 22, {
    slug: "soma-skybar",
    name: "SoMa Skybar",
    neighborhood: "SoMa",
    address: "120 Folsom St, San Francisco, CA",
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200",
    priceLevel: 3, rating: 4.5, reviewCount: 980,
    vibeTags: ["rooftop", "after-work", "networking"],
    cuisineTags: ["small plates"],
    isFeatured: true
  })
];

const rduPlaces: Place[] = [
  placeTemplate("p-rdu-1", "c-rdu", 35.7796, -78.6382, 31, {
    slug: "warehouse-district-pour",
    name: "Warehouse District Pour",
    neighborhood: "Warehouse District",
    address: "411 W Hargett St, Raleigh, NC",
    imageUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200",
    priceLevel: 2, rating: 4.5, reviewCount: 480,
    vibeTags: ["after-work", "patio", "craft-beer"],
    cuisineTags: ["southern", "shared plates"],
    isFeatured: true
  }),
  placeTemplate("p-rdu-2", "c-rdu", 35.7796, -78.6382, 32, {
    slug: "glenwood-south-cantina",
    name: "Glenwood South Cantina",
    neighborhood: "Glenwood South",
    address: "510 Glenwood Ave, Raleigh, NC",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200",
    priceLevel: 1, rating: 4.4, reviewCount: 612,
    vibeTags: ["student-budget", "groups", "casual"],
    cuisineTags: ["mexican", "tacos"]
  }),
  placeTemplate("p-rdu-3", "c-rdu", 35.7796, -78.6382, 33, {
    slug: "five-points-oyster",
    name: "Five Points Oyster Co.",
    neighborhood: "Five Points",
    address: "2015 Fairview Rd, Raleigh, NC",
    imageUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1200",
    priceLevel: 3, rating: 4.7, reviewCount: 320,
    vibeTags: ["date-night", "seafood", "raw-bar"],
    cuisineTags: ["seafood", "southern"]
  })
];

const sacPlaces: Place[] = [
  placeTemplate("p-sac-1", "c-sac", 38.5816, -121.4944, 41, {
    slug: "midtown-cocktail-club",
    name: "Midtown Cocktail Club",
    neighborhood: "Midtown",
    address: "1827 Capitol Ave, Sacramento, CA",
    imageUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200",
    priceLevel: 3, rating: 4.6, reviewCount: 411,
    vibeTags: ["cocktails", "date-night", "intimate"],
    cuisineTags: ["small plates"],
    isFeatured: true
  }),
  placeTemplate("p-sac-2", "c-sac", 38.5816, -121.4944, 42, {
    slug: "river-park-brewhouse",
    name: "River Park Brewhouse",
    neighborhood: "River Park",
    address: "5409 H St, Sacramento, CA",
    imageUrl: "https://images.unsplash.com/photo-1559527615-79de8a76d11d?w=1200",
    priceLevel: 2, rating: 4.4, reviewCount: 530,
    vibeTags: ["groups", "outdoor", "craft-beer"],
    cuisineTags: ["pub", "burgers"]
  })
];

export const PLACES: Place[] = [
  ...chiPlaces,
  ...nycPlaces,
  ...sfPlaces,
  ...rduPlaces,
  ...sacPlaces
];

// ──────────────────────────────────────────────────────────────────────
//  DEALS — recurring weekday windows, plus a few one-offs.
// ──────────────────────────────────────────────────────────────────────
type DayCode = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
const WEEKDAYS: DayCode[] = ["MON", "TUE", "WED", "THU", "FRI"];
const ALL_DAYS: DayCode[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const windows = (days: DayCode[], start: string, end: string) =>
  days.map((d) => ({ day: d, start, end }));

export const DEALS: Deal[] = [
  { id: "d-1", placeId: "p-chi-1", title: "Golden Hour", description: "$8 signature cocktails, $1 oysters.",      type: "BOTH",  schedule: windows(WEEKDAYS, "16:00", "18:30"), priceHint: "$8 cocktails / $1 oysters" },
  { id: "d-2", placeId: "p-chi-2", title: "Loop Lager Hour", description: "$4 drafts, half-off wings.",          type: "BOTH",  schedule: windows(WEEKDAYS, "15:30", "19:00"), priceHint: "$4 drafts" },
  { id: "d-3", placeId: "p-chi-3", title: "Wine Down", description: "Half-off bottles every Tuesday.",            type: "DRINK", schedule: [{ day: "TUE", start: "17:00", end: "22:00" }], priceHint: "1/2 off bottles" },
  { id: "d-4", placeId: "p-chi-4", title: "Taco Tuesday", description: "$2 tacos, $5 margs.",                     type: "BOTH",  schedule: [{ day: "TUE", start: "16:00", end: "20:00" }], priceHint: "$2 tacos" },

  { id: "d-5", placeId: "p-nyc-1", title: "Skyline Spritz Hour", description: "$10 Aperol Spritz, $1 oysters.",   type: "BOTH",  schedule: windows(WEEKDAYS, "16:00", "19:00"), priceHint: "$10 spritz" },
  { id: "d-6", placeId: "p-nyc-2", title: "Dive Daze", description: "$3 PBR, $4 well drinks all day.",            type: "DRINK", schedule: windows(ALL_DAYS, "12:00", "20:00"), priceHint: "$3 PBR" },
  { id: "d-7", placeId: "p-nyc-3", title: "Sake & Spicy Tuna", description: "$6 sake, half-off rolls.",          type: "BOTH",  schedule: windows(["MON","TUE","WED","THU"], "17:00", "19:00"), priceHint: "$6 sake" },

  { id: "d-8", placeId: "p-sf-1",  title: "Mezcal Sundown", description: "$7 mezcal pours, $4 elote.",            type: "BOTH",  schedule: windows(WEEKDAYS, "16:30", "18:30"), priceHint: "$7 mezcal" },
  { id: "d-9", placeId: "p-sf-2",  title: "Boardroom Hour", description: "$9 cocktails on the roof.",             type: "DRINK", schedule: windows(WEEKDAYS, "17:00", "19:00"), priceHint: "$9 cocktails" },

  { id: "d-10", placeId: "p-rdu-1", title: "Carolina Crush", description: "$5 local drafts, $6 sliders.",         type: "BOTH",  schedule: windows(WEEKDAYS, "16:00", "19:00"), priceHint: "$5 drafts" },
  { id: "d-11", placeId: "p-rdu-2", title: "Margarita Monday", description: "$4 house margs, $3 street tacos.",   type: "BOTH",  schedule: [{ day: "MON", start: "16:00", end: "21:00" }], priceHint: "$4 margs" },
  { id: "d-12", placeId: "p-rdu-3", title: "Oyster Hour", description: "$1.50 oysters, $7 bubbles.",              type: "BOTH",  schedule: windows(["TUE","WED","THU"], "16:30", "18:30"), priceHint: "$1.50 oysters" },

  { id: "d-13", placeId: "p-sac-1", title: "Capitol Hour", description: "$8 craft cocktails.",                    type: "DRINK", schedule: windows(WEEKDAYS, "17:00", "19:00"), priceHint: "$8 cocktails" },
  { id: "d-14", placeId: "p-sac-2", title: "Pints & Plates", description: "$5 pints, half-off shareables.",       type: "BOTH",  schedule: windows(WEEKDAYS, "15:00", "18:00"), priceHint: "$5 pints" }
];

// ──────────────────────────────────────────────────────────────────────
//  EVENTS
// ──────────────────────────────────────────────────────────────────────
const today = new Date();
const inHours = (h: number) => new Date(today.getTime() + h * 3600 * 1000);

export const EVENTS: Event[] = [
  { id: "e-1", cityId: "c-chi", placeId: "p-chi-2", title: "Trivia Night",        description: "5-round geek-out.",         category: "trivia",       startsAt: inHours(3),  endsAt: inHours(5),  isFree: true,  imageUrl: "https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=1200" },
  { id: "e-2", cityId: "c-nyc", placeId: "p-nyc-1", title: "Live Jazz",          description: "Quartet on the roof.",       category: "live-music",   startsAt: inHours(5),  endsAt: inHours(8),  isFree: false, imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200" },
  { id: "e-3", cityId: "c-rdu", placeId: "p-rdu-1", title: "After-Work Mixer",   description: "Tech & startup networking.", category: "networking",   startsAt: inHours(2),  endsAt: inHours(4),  isFree: true,  imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200" },
  { id: "e-4", cityId: "c-sac", placeId: "p-sac-2", title: "Comedy Open Mic",    description: "Local stand-ups.",           category: "comedy",       startsAt: inHours(6),  endsAt: inHours(8),  isFree: true,  imageUrl: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1200" },
  { id: "e-5", cityId: "c-sf",  placeId: "p-sf-1",  title: "Karaoke Night",      description: "Sing your heart out.",       category: "karaoke",      startsAt: inHours(7),  endsAt: inHours(11), isFree: true,  imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200" }
];
