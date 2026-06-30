import { Continent, PlaceCategory } from "@prisma/client";

export type { Continent, PlaceCategory };

export interface PersonWithTrips {
  id: string;
  name: string;
  color: string;
  emoji: string;
  order: number;
  trips: { tripId: string }[];
}

export interface CountryWithVisitors {
  code: string;
  name: string;
  continent: Continent;
  /** Person colors sorted by person.order */
  visitorColors: string[];
  /** Person ids sorted by person.order */
  visitorIds: string[];
  trips: TripSummary[];
}

export interface TripSummary {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  endDate: string;
  coverPhotoUrl: string | null;
  participants: { personId: string; person: { name: string; color: string; emoji: string } }[];
  countries: { countryCode: string }[];
}

export interface TripDetail extends TripSummary {
  description: string | null;
  funFacts: string | null;
  blogUrl: string | null;
  places: PlaceItem[];
  photos: PhotoItem[];
}

export interface PlaceItem {
  id: string;
  name: string;
  description: string | null;
  lat: number | null;
  lng: number | null;
  category: PlaceCategory;
  date: string | null;
  order: number;
  photos: PhotoItem[];
}

export interface PhotoItem {
  id: string;
  url: string;
  caption: string | null;
  order: number;
}

export type ContinentFilter = Continent | "ALL";

export interface MapFilters {
  continents: Continent[];
  personIds: string[];
}

// Stripe pattern key: sorted colors joined with "-"
// e.g. colors ["#3B82F6","#22C55E"] -> "pattern-3B82F6-22C55E"
export function buildPatternId(colors: string[]): string {
  return "pat-" + colors.map((c) => c.replace("#", "")).join("-");
}
