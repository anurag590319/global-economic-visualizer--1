export type DataType = 'interest' | 'inflation' | 'exchange' | 'gdp' | 'unemployment' | 'government-debt' | 'gdp-per-capita' | 'trade-balance' | 'current-account' | 'fdi' | 'population-growth' | 'life-expectancy' | 'gini-coefficient' | 'exports';


export interface Country {
  id: number;
  iso_code: string;
  iso_code_3?: string;
  name: string;
  region?: string;
}

export interface RateData {
  country_iso: string;
  country_name?: string;
  value: number;
  currency_code?: string | null;
  period?: string | null;
  effective_date?: string;
  updated_at: string;
  is_estimated?: boolean;
  estimated_from?: 'region_avg' | 'global_avg';
}

export type RatesByType = Record<DataType, RateData[]>;

export interface BootstrapResponse {
  countries: Country[];
  rates: RatesByType;
}

export type HistoryByType = Record<DataType, any[]>;

