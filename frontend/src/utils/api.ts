import axios from 'axios';
import { BootstrapResponse, Country, HistoryByType, RateData } from '../types';

// Prefer same-origin calls (Vite proxy in dev, server in prod). Override via VITE_API_URL when needed.
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Log API URL in development to help debug
if (import.meta.env.DEV) {
  console.log('API URL:', API_URL);
}

export const api = {
  getBootstrap: async (): Promise<BootstrapResponse> => {
    const response = await axios.get<BootstrapResponse>(`${API_URL}/bootstrap`);
    return response.data;
  },

  getCountries: async (): Promise<Country[]> => {
    try {
      const response = await axios.get<Country[]>(`${API_URL}/countries`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching countries:', error);
      console.error('API URL used:', `${API_URL}/countries`);
      throw error;
    }
  },

  getInterestRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/interest`);
    return response.data;
  },

  getInflationRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/inflation`);
    return response.data;
  },

  getExchangeRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/exchange`);
    return response.data;
  },

  getGDPGrowthRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/gdp`);
    return response.data;
  },

  getUnemploymentRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/unemployment`);
    return response.data;
  },

  getGovernmentDebtRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/government-debt`);
    return response.data;
  },

  getGDPPerCapitaRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/gdp-per-capita`);
    return response.data;
  },

  getTradeBalanceRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/trade-balance`);
    return response.data;
  },

  getCurrentAccountRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/current-account`);
    return response.data;
  },

  getFDIRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/fdi`);
    return response.data;
  },

  getPopulationGrowthRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/population-growth`);
    return response.data;
  },

  getLifeExpectancyRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/life-expectancy`);
    return response.data;
  },

  getGiniCoefficientRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/gini-coefficient`);
    return response.data;
  },

  getExportsRates: async (): Promise<RateData[]> => {
    const response = await axios.get<RateData[]>(`${API_URL}/rates/exports`);
    return response.data;
  },

  getHistoricalRates: async (countryIso: string, type: string): Promise<any[]> => {
    const response = await axios.get<any[]>(`${API_URL}/rates/history/${countryIso}/${type}`);
    return response.data;
  },

  getAllHistoricalRates: async (countryIso: string): Promise<HistoryByType> => {
    const response = await axios.get<HistoryByType>(`${API_URL}/rates/history/${countryIso}`);
    return response.data;
  },

  getAIAnalysis: async (countryIso: string): Promise<{ analysis: string; cached: boolean }> => {
    const response = await axios.get<{ analysis: string; cached: boolean }>(`${API_URL}/rates/analyze/${countryIso}`);
    return response.data;
  },
};


