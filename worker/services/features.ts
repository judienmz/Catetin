import { getSetting } from "./settings";

export interface Features {
  stock: boolean;
}

/** Satu-satunya tempat membaca flag fitur (lihat ARCHITECTURE.md §9.4). */
export async function getFeatures(db: D1Database): Promise<Features> {
  return { stock: (await getSetting(db, "feature_stock")) === "1" };
}
