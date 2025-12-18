import NodeCache from 'node-cache';

const cacheTTL = parseInt(process.env.CACHE_TTL || '3600', 10);

export const cache = new NodeCache({
  stdTTL: cacheTTL, // Time to live in seconds (default 1 hour)
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false, // Better performance
});

// Cache key generators
export const cacheKeys = {
  bootstrap: 'bootstrap:v1',
  countries: 'countries:all',
  interestRates: 'rates:interest',
  inflationRates: 'rates:inflation',
  exchangeRates: 'rates:exchange',
  gdpGrowthRates: 'rates:gdp',
  unemploymentRates: 'rates:unemployment',
  governmentDebtRates: 'rates:government-debt',
  gdpPerCapitaRates: 'rates:gdp-per-capita',
  tradeBalanceRates: 'rates:trade-balance',
  currentAccountRates: 'rates:current-account',
  fdiRates: 'rates:fdi',
  populationGrowthRates: 'rates:population-growth',
  lifeExpectancyRates: 'rates:life-expectancy',
  giniCoefficientRates: 'rates:gini-coefficient',
  exportsRates: 'rates:exports',
};


