export type RateRow = {
  country_iso: string;
  country_name?: string;
  value: number;
  currency_code?: string | null;
  period?: string | null;
  effective_date?: string;
  updated_at: string;
  is_estimated?: boolean;
  estimated_from?: 'region_avg' | 'global_avg';
};

// Format rates for frontend consumption (map + drawer)
export function formatRatesForMap(rates: any[]): RateRow[] {
  return rates.map((rate) => ({
    country_iso: rate.country_iso,
    country_name: rate.country_name,
    value: rate.rate ?? rate.rate_to_usd ?? rate.value,
    currency_code: rate.currency_code ?? null,
    period: rate.period ?? null,
    effective_date: rate.effective_date,
    updated_at: rate.updated_at,
    is_estimated: rate.is_estimated,
    estimated_from: rate.estimated_from,
  }));
}

// Deduplicate by country, keeping the most recent data by effective_date
// This ensures we return the latest available data for each country
export function dedupeLatestByCountry<T extends RateRow>(rows: T[]): T[] {
  const byIso = new Map<string, T>();
  for (const row of rows) {
    const iso = row.country_iso;
    const existing = byIso.get(iso);
    if (!existing) {
      byIso.set(iso, row);
      continue;
    }

    // Compare by effective_date first (actual data date), then updated_at as fallback
    const existingDate = existing.effective_date
      ? new Date(existing.effective_date).getTime()
      : new Date(existing.updated_at).getTime();
    const rowDate = row.effective_date
      ? new Date(row.effective_date).getTime()
      : new Date(row.updated_at).getTime();

    // Keep the row with the most recent effective_date
    if (rowDate >= existingDate) {
      byIso.set(iso, row);
    }
  }
  return Array.from(byIso.values());
}

