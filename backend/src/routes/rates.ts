import { Router } from 'express';
import { RateModel } from '../models/Rate';
import { CountryModel } from '../models/Country';
import { cache, cacheKeys } from '../config/cache';
import { fetchExchangeRates } from '../services/exchangeRateService';
import { analyzeCountryEconomy, CountryData } from '../services/aiAnalysisService';
import { dataLimiter, aiLimiter } from '../middleware/rateLimiter';
import { aiRequestQueue } from '../utils/requestQueue';
import { dedupeLatestByCountry, formatRatesForMap, RateRow } from '../utils/ratesFormat';

const router = Router();

// Apply rate limiting to all data endpoints
router.use(dataLimiter);

// No longer filling missing countries with estimates - only return real data

router.get('/interest', (req, res) => {
  try {
    // Check cache first
    const cached = cache.get(cacheKeys.interestRates);
    if (cached) {
      return res.json(cached);
    }

    // Fetch from database - only real data, no estimates
    const rates = RateModel.getInterestRates();
    const formatted = dedupeLatestByCountry(formatRatesForMap(rates) as RateRow[]);

    // Cache the result
    cache.set(cacheKeys.interestRates, formatted);

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching interest rates:', error);
    res.status(500).json({ error: 'Failed to fetch interest rates' });
  }
});

router.get('/inflation', (req, res) => {
  try {
    // Check cache first
    const cached = cache.get(cacheKeys.inflationRates);
    if (cached) {
      return res.json(cached);
    }

    // Fetch from database - only real data, no estimates
    const rates = RateModel.getInflationRates();
    const formatted = dedupeLatestByCountry(formatRatesForMap(rates) as RateRow[]);

    // Cache the result
    cache.set(cacheKeys.inflationRates, formatted);

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching inflation rates:', error);
    res.status(500).json({ error: 'Failed to fetch inflation rates' });
  }
});

router.get('/exchange', async (req, res) => {
  try {
    // Check cache first
    const cached = cache.get(cacheKeys.exchangeRates);
    if (cached) {
      return res.json(cached);
    }

    // Fetch from database
    let rates = RateModel.getExchangeRates();

    // If we have no real exchange rows yet, fetch once on-demand (then serve)
    if (!rates || rates.length === 0) {
      // Note: this will run only the first time on a fresh DB (cache empty)
      // and avoids making every request hit the external API.
      console.log('No exchange rates in DB; fetching once on-demand...');
      try {
        await fetchExchangeRates();
        // Invalidate any stale cache and re-read
        cache.del(cacheKeys.exchangeRates);
        rates = RateModel.getExchangeRates();
      } catch (e) {
        console.warn('On-demand exchange rate fetch failed; serving estimated-only response.');
        rates = [];
      }
    }

    const formatted = dedupeLatestByCountry(formatRatesForMap(rates) as RateRow[]);

    // Cache the result
    cache.set(cacheKeys.exchangeRates, formatted);

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

router.get('/gdp', (req, res) => {
  try {
    const cached = cache.get(cacheKeys.gdpGrowthRates);
    if (cached) return res.json(cached);

    const rates = RateModel.getGDPGrowthRates();
    const formatted = dedupeLatestByCountry(formatRatesForMap(rates) as RateRow[]);

    cache.set(cacheKeys.gdpGrowthRates, formatted);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching GDP growth rates:', error);
    res.status(500).json({ error: 'Failed to fetch GDP growth rates' });
  }
});

router.get('/unemployment', (req, res) => {
  try {
    const cached = cache.get(cacheKeys.unemploymentRates);
    if (cached) return res.json(cached);

    const rates = RateModel.getUnemploymentRates();
    const formatted = dedupeLatestByCountry(formatRatesForMap(rates) as RateRow[]);

    cache.set(cacheKeys.unemploymentRates, formatted);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching unemployment rates:', error);
    res.status(500).json({ error: 'Failed to fetch unemployment rates' });
  }
});

router.get('/government-debt', (req, res) => {
  try {
    const cached = cache.get(cacheKeys.governmentDebtRates);
    if (cached) return res.json(cached);

    const rates = RateModel.getGovernmentDebtRates();
    const formatted = dedupeLatestByCountry(formatRatesForMap(rates) as RateRow[]);

    cache.set(cacheKeys.governmentDebtRates, formatted);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching government debt rates:', error);
    res.status(500).json({ error: 'Failed to fetch government debt rates' });
  }
});

router.get('/gdp-per-capita', (req, res) => {
  try {
    const cached = cache.get(cacheKeys.gdpPerCapitaRates);
    if (cached) return res.json(cached);

    const rates = RateModel.getGDPPerCapitaRates();
    const formatted = dedupeLatestByCountry(formatRatesForMap(rates) as RateRow[]);

    cache.set(cacheKeys.gdpPerCapitaRates, formatted);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching GDP per capita rates:', error);
    res.status(500).json({ error: 'Failed to fetch GDP per capita rates' });
  }
});

router.get('/trade-balance', (req, res) => {
  try {
    const cached = cache.get(cacheKeys.tradeBalanceRates);
    if (cached) return res.json(cached);

    const rates = RateModel.getTradeBalanceRates();
    const formatted = dedupeLatestByCountry(formatRatesForMap(rates) as RateRow[]);

    cache.set(cacheKeys.tradeBalanceRates, formatted);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching trade balance rates:', error);
    res.status(500).json({ error: 'Failed to fetch trade balance rates' });
  }
});

router.get('/current-account', (req, res) => {
  try {
    const cached = cache.get(cacheKeys.currentAccountRates);
    if (cached) return res.json(cached);

    const rates = RateModel.getCurrentAccountRates();
    const formatted = dedupeLatestByCountry(formatRatesForMap(rates) as RateRow[]);

    cache.set(cacheKeys.currentAccountRates, formatted);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching current account rates:', error);
    res.status(500).json({ error: 'Failed to fetch current account rates' });
  }
});

router.get('/fdi', (req, res) => {
  try {
    const cached = cache.get(cacheKeys.fdiRates);
    if (cached) return res.json(cached);

    const rates = RateModel.getFDIRates();
    const formatted = dedupeLatestByCountry(formatRatesForMap(rates) as RateRow[]);

    cache.set(cacheKeys.fdiRates, formatted);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching FDI rates:', error);
    res.status(500).json({ error: 'Failed to fetch FDI rates' });
  }
});

router.get('/population-growth', (req, res) => {
  try {
    const cached = cache.get(cacheKeys.populationGrowthRates);
    if (cached) return res.json(cached);

    const rates = RateModel.getPopulationGrowthRates();
    const formatted = dedupeLatestByCountry(formatRatesForMap(rates) as RateRow[]);

    cache.set(cacheKeys.populationGrowthRates, formatted);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching population growth rates:', error);
    res.status(500).json({ error: 'Failed to fetch population growth rates' });
  }
});

router.get('/life-expectancy', (req, res) => {
  try {
    const cached = cache.get(cacheKeys.lifeExpectancyRates);
    if (cached) return res.json(cached);

    const rates = RateModel.getLifeExpectancyRates();
    const formatted = dedupeLatestByCountry(formatRatesForMap(rates) as RateRow[]);

    cache.set(cacheKeys.lifeExpectancyRates, formatted);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching life expectancy rates:', error);
    res.status(500).json({ error: 'Failed to fetch life expectancy rates' });
  }
});

router.get('/gini-coefficient', (req, res) => {
  try {
    const cached = cache.get(cacheKeys.giniCoefficientRates);
    if (cached) return res.json(cached);

    const rates = RateModel.getGiniCoefficientRates();
    const formatted = dedupeLatestByCountry(formatRatesForMap(rates) as RateRow[]);

    cache.set(cacheKeys.giniCoefficientRates, formatted);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching Gini coefficient rates:', error);
    res.status(500).json({ error: 'Failed to fetch Gini coefficient rates' });
  }
});

router.get('/exports', (req, res) => {
  try {
    const cached = cache.get(cacheKeys.exportsRates);
    if (cached) return res.json(cached);

    const rates = RateModel.getExportsRates();
    const formatted = dedupeLatestByCountry(formatRatesForMap(rates) as RateRow[]);

    cache.set(cacheKeys.exportsRates, formatted);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching exports rates:', error);
    res.status(500).json({ error: 'Failed to fetch exports rates' });
  }
});

// AI analysis endpoint with stricter rate limiting and request queue
router.get('/analyze/:countryIso', aiLimiter, async (req, res) => {
  try {
    const { countryIso } = req.params;
    if (!countryIso) {
      return res.status(400).json({ error: 'Country ISO code required' });
    }

    // Check cache (24 hour TTL = 86400 seconds)
    const cacheKey = `ai-analysis:${countryIso.toUpperCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ analysis: cached, cached: true });
    }

    // Fetch all current data for the country
    const [
      interestRates,
      inflationRates,
      exchangeRates,
      gdpRates,
      unemploymentRates,
      governmentDebtRates,
      gdpPerCapitaRates,
      tradeBalanceRates,
      currentAccountRates,
      fdiRates,
      populationGrowthRates,
      lifeExpectancyRates,
      giniCoefficientRates,
      exportsRates,
    ] = await Promise.all([
      RateModel.getInterestRates(),
      RateModel.getInflationRates(),
      RateModel.getExchangeRates(),
      RateModel.getGDPGrowthRates(),
      RateModel.getUnemploymentRates(),
      RateModel.getGovernmentDebtRates(),
      RateModel.getGDPPerCapitaRates(),
      RateModel.getTradeBalanceRates(),
      RateModel.getCurrentAccountRates(),
      RateModel.getFDIRates(),
      RateModel.getPopulationGrowthRates(),
      RateModel.getLifeExpectancyRates(),
      RateModel.getGiniCoefficientRates(),
      RateModel.getExportsRates(),
    ]);

    const country = CountryModel.getByIso(countryIso.toUpperCase());
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }

    // Get current values
    const getCurrent = (rates: any[]) => {
      const rate = rates.find(r => r.country_iso.toUpperCase() === countryIso.toUpperCase());
      return rate?.rate ?? rate?.rate_to_usd ?? rate?.value;
    };

    // Get historical data
    const getHistory = async (type: string) => {
      const history = RateModel.getHistoricalRates(countryIso.toUpperCase(), type as any);
      return history
        .map((h: any) => ({
          date: h.effective_date || h.updated_at,
          value: h.rate ?? h.rate_to_usd ?? h.value,
        }))
        .filter((h: any) => h.value !== null && h.value !== undefined && !isNaN(h.value))
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const [interestHist, inflationHist, exchangeHist, gdpHist, unemploymentHist, govDebtHist] = await Promise.all([
      getHistory('interest'),
      getHistory('inflation'),
      getHistory('exchange'),
      getHistory('gdp'),
      getHistory('unemployment'),
      getHistory('government-debt'),
    ]);

    const countryData: CountryData = {
      countryName: country.name,
      region: country.region,
      current: {
        interestRate: getCurrent(interestRates),
        inflation: getCurrent(inflationRates),
        exchangeRate: getCurrent(exchangeRates),
        gdpGrowth: getCurrent(gdpRates),
        unemployment: getCurrent(unemploymentRates),
        governmentDebt: getCurrent(governmentDebtRates),
        gdpPerCapita: getCurrent(gdpPerCapitaRates),
        tradeBalance: getCurrent(tradeBalanceRates),
        currentAccount: getCurrent(currentAccountRates),
        fdi: getCurrent(fdiRates),
        populationGrowth: getCurrent(populationGrowthRates),
        lifeExpectancy: getCurrent(lifeExpectancyRates),
        giniCoefficient: getCurrent(giniCoefficientRates),
        exports: getCurrent(exportsRates),
      },
      historical: {
        interest: interestHist,
        inflation: inflationHist,
        exchange: exchangeHist,
        gdp: gdpHist,
        unemployment: unemploymentHist,
        'government-debt': govDebtHist,
      },
    };

    // Generate analysis using request queue to limit concurrent requests
    const analysis = await aiRequestQueue.add(async () => {
      return await analyzeCountryEconomy(countryData);
    });

    // Cache for 24 hours (86400 seconds)
    cache.set(cacheKey, analysis, 86400);

    res.json({ analysis, cached: false });
  } catch (error: any) {
    console.error('Error generating AI analysis:', error);
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'Failed to generate analysis';
    
    if (errorMessage.includes('Gemini API key not configured') || errorMessage.includes('GEMINI_API_KEY')) {
      errorMessage = 'AI analysis is not configured. Please set GEMINI_API_KEY in Railway environment variables.';
    } else if (errorMessage.includes('failed after retries')) {
      errorMessage = 'AI analysis service is temporarily unavailable. Please try again later.';
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// Fetch all historical series for a country in a single request (faster than 14 round trips).
router.get('/history/:countryIso', (req, res) => {
  try {
    const { countryIso } = req.params;
    if (!countryIso) return res.status(400).json({ error: 'Country ISO code required' });

    const iso = countryIso.toUpperCase();
    const series = {
      interest: RateModel.getHistoricalRates(iso, 'interest'),
      inflation: RateModel.getHistoricalRates(iso, 'inflation'),
      exchange: RateModel.getHistoricalRates(iso, 'exchange'),
      gdp: RateModel.getHistoricalRates(iso, 'gdp'),
      unemployment: RateModel.getHistoricalRates(iso, 'unemployment'),
      'government-debt': RateModel.getHistoricalRates(iso, 'government-debt'),
      'gdp-per-capita': RateModel.getHistoricalRates(iso, 'gdp-per-capita'),
      'trade-balance': RateModel.getHistoricalRates(iso, 'trade-balance'),
      'current-account': RateModel.getHistoricalRates(iso, 'current-account'),
      fdi: RateModel.getHistoricalRates(iso, 'fdi'),
      'population-growth': RateModel.getHistoricalRates(iso, 'population-growth'),
      'life-expectancy': RateModel.getHistoricalRates(iso, 'life-expectancy'),
      'gini-coefficient': RateModel.getHistoricalRates(iso, 'gini-coefficient'),
      exports: RateModel.getHistoricalRates(iso, 'exports'),
    };

    res.json(series);
  } catch (error) {
    console.error(`Error fetching all history for ${req.params.countryIso}:`, error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

router.get('/history/:countryIso/:type', (req, res) => {
  try {
    const { countryIso, type } = req.params;

    // Basic validation
    if (!countryIso || !['interest', 'inflation', 'exchange', 'gdp', 'unemployment', 'government-debt', 'gdp-per-capita', 'trade-balance', 'current-account', 'fdi', 'population-growth', 'life-expectancy', 'gini-coefficient', 'exports'].includes(type)) {
      return res.status(400).json({ error: 'Invalid country code or data type' });
    }

    // Historical data is dynamic and country-specific, maybe short-term cache?
    // For now, no cache or very short TTL if implemented.
    const history = RateModel.getHistoricalRates(countryIso, type as any);

    // Simple response, no need to "fill all countries" or global averages
    res.json(history);
  } catch (error) {
    console.error(`Error fetching history for ${req.params.countryIso}/${req.params.type}:`, error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

export default router;

