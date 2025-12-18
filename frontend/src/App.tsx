import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import LazyMap from './components/LazyMap';
import { Country, RateData, DataType } from './types';
import { api } from './utils/api';
import './App.css';

// Code-split drawer-only components (recharts is heavy and should not be in entry bundle)
const HistoryChart = lazy(() => import('./components/HistoryChart'));
const AIAnalysis = lazy(() => import('./components/AIAnalysis'));

function App() {
  const [countries, setCountries] = useState<Country[]>([]);

  // Data Layers
  const [interestData, setInterestData] = useState<RateData[]>([]);
  const [inflationData, setInflationData] = useState<RateData[]>([]);
  const [exchangeData, setExchangeData] = useState<RateData[]>([]);
  const [gdpData, setGdpData] = useState<RateData[]>([]);
  const [unemploymentData, setUnemploymentData] = useState<RateData[]>([]);
  const [governmentDebtData, setGovernmentDebtData] = useState<RateData[]>([]);
  const [gdpPerCapitaData, setGdpPerCapitaData] = useState<RateData[]>([]);
  const [tradeBalanceData, setTradeBalanceData] = useState<RateData[]>([]);
  const [currentAccountData, setCurrentAccountData] = useState<RateData[]>([]);
  const [fdiData, setFdiData] = useState<RateData[]>([]);
  const [populationGrowthData, setPopulationGrowthData] = useState<RateData[]>([]);
  const [lifeExpectancyData, setLifeExpectancyData] = useState<RateData[]>([]);
  const [giniCoefficientData, setGiniCoefficientData] = useState<RateData[]>([]);
  const [exportsData, setExportsData] = useState<RateData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction State
  const [searchValue, setSearchValue] = useState('');
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Historical Data State
  const [history, setHistory] = useState<Record<string, any[]>>({});
  const [loadingHistory, setLoadingHistory] = useState(false);

  const countriesByIso = useMemo(() => {
    const m = new globalThis.Map<string, Country>();
    for (const c of countries) m.set(c.iso_code.toUpperCase(), c);
    return m;
  }, [countries]);

  const ratesByIso = useMemo(() => {
    const build = (rows: RateData[]) => {
      const m = new globalThis.Map<string, RateData>();
      for (const r of rows) m.set(r.country_iso.toUpperCase(), r);
      return m;
    };
    return {
      interest: build(interestData),
      inflation: build(inflationData),
      exchange: build(exchangeData),
      gdp: build(gdpData),
      unemployment: build(unemploymentData),
      'government-debt': build(governmentDebtData),
      'gdp-per-capita': build(gdpPerCapitaData),
      'trade-balance': build(tradeBalanceData),
      'current-account': build(currentAccountData),
      'fdi': build(fdiData),
      'population-growth': build(populationGrowthData),
      'life-expectancy': build(lifeExpectancyData),
      'gini-coefficient': build(giniCoefficientData),
      'exports': build(exportsData),
    };
  }, [interestData, inflationData, exchangeData, gdpData, unemploymentData, governmentDebtData, gdpPerCapitaData, tradeBalanceData, currentAccountData, fdiData, populationGrowthData, lifeExpectancyData, giniCoefficientData, exportsData]);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fast path: one request instead of ~14 round trips
        const bootstrap = await api.getBootstrap();

        if (!bootstrap.countries || bootstrap.countries.length === 0) {
          throw new Error('Failed to load countries. Please check your API connection.');
        }

        setCountries(bootstrap.countries);
        setInterestData(bootstrap.rates.interest);
        setInflationData(bootstrap.rates.inflation);
        setExchangeData(bootstrap.rates.exchange);
        setGdpData(bootstrap.rates.gdp);
        setUnemploymentData(bootstrap.rates.unemployment);
        setGovernmentDebtData(bootstrap.rates['government-debt']);
        setGdpPerCapitaData(bootstrap.rates['gdp-per-capita']);
        setTradeBalanceData(bootstrap.rates['trade-balance']);
        setCurrentAccountData(bootstrap.rates['current-account']);
        setFdiData(bootstrap.rates.fdi);
        setPopulationGrowthData(bootstrap.rates['population-growth']);
        setLifeExpectancyData(bootstrap.rates['life-expectancy']);
        setGiniCoefficientData(bootstrap.rates['gini-coefficient']);
        setExportsData(bootstrap.rates.exports);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(
          err.message ||
            'Failed to load data. Please ensure the backend is running and check the browser console for details.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch History on Selection
  useEffect(() => {
    if (!selectedIso || !drawerOpen) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const iso = selectedIso;
        // Single request instead of 14 round trips
        const all = await api.getAllHistoricalRates(iso);
        setHistory(all);
      } catch (e) {
        console.error('Failed to fetch history', e);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [selectedIso, drawerOpen]);

  const openCountry = (iso: string) => {
    const cleaned = iso.trim().toUpperCase();
    if (!cleaned) return;

    if (selectedIso !== cleaned) {
      setHistory({}); // Clear old history
    }
    setSelectedIso(cleaned);
    setDrawerOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;

    if (/^[A-Za-z]{2}$/.test(q)) {
      openCountry(q);
      setSearchValue('');
      return;
    }

    const lower = q.toLowerCase();
    const match = countries.find((c) => c.name.toLowerCase() === lower) ||
      countries.find((c) => c.name.toLowerCase().includes(lower));

    if (match) {
      openCountry(match.iso_code);
      setSearchValue(match.name);
    }
  };

  const selectedCountry = selectedIso ? countriesByIso.get(selectedIso) : undefined;
  const selectedInterest = selectedIso ? ratesByIso.interest.get(selectedIso) : undefined;
  const selectedInflation = selectedIso ? ratesByIso.inflation.get(selectedIso) : undefined;
  const selectedExchange = selectedIso ? ratesByIso.exchange.get(selectedIso) : undefined;
  const selectedGdp = selectedIso ? ratesByIso.gdp.get(selectedIso) : undefined;
  const selectedUnemployment = selectedIso ? ratesByIso.unemployment.get(selectedIso) : undefined;
  const selectedGovernmentDebt = selectedIso ? ratesByIso['government-debt'].get(selectedIso) : undefined;
  const selectedGdpPerCapita = selectedIso ? ratesByIso['gdp-per-capita'].get(selectedIso) : undefined;
  const selectedTradeBalance = selectedIso ? ratesByIso['trade-balance'].get(selectedIso) : undefined;
  const selectedCurrentAccount = selectedIso ? ratesByIso['current-account'].get(selectedIso) : undefined;
  const selectedFDI = selectedIso ? ratesByIso['fdi'].get(selectedIso) : undefined;
  const selectedPopulationGrowth = selectedIso ? ratesByIso['population-growth'].get(selectedIso) : undefined;
  const selectedLifeExpectancy = selectedIso ? ratesByIso['life-expectancy'].get(selectedIso) : undefined;
  const selectedGiniCoefficient = selectedIso ? ratesByIso['gini-coefficient'].get(selectedIso) : undefined;
  const selectedExports = selectedIso ? ratesByIso['exports'].get(selectedIso) : undefined;

  const formatValue = (type: DataType, v?: number) => {
    if (v === null || v === undefined || Number.isNaN(v)) return '—';
    if (type === 'exchange') return v.toFixed(4);
    if (type === 'gdp-per-capita') return `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (type === 'life-expectancy') return `${v.toFixed(1)} years`;
    if (type === 'gini-coefficient') return v.toFixed(2);
    return `${v.toFixed(2)}%`;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>Global Economic Visualizer</h1>
            <p className="subtitle">Explore global economic indicators and historical trends</p>
          </div>
          <div className="header-right">
            <form className="search" onSubmit={handleSearchSubmit}>
              <input
                className="search-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search country..."
                list="country-list"
              />
              <datalist id="country-list">
                {countries.slice(0, 250).map((c) => (
                  <option key={c.iso_code} value={c.name} />
                ))}
              </datalist>
              <button className="search-button" type="submit">Go</button>
            </form>

          </div>
        </div>
      </header>

      <div className="maps-grid">
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading global data...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Row 1: Original Metircs */}
            <div className="map-panel">
              <div className="map-panel-title">Real Interest Rates</div>
              <div className="map-panel-canvas">
                <LazyMap
                  dataType="interest"
                  rateData={interestData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                  title="Real Interest Rates"
                />
              </div>
            </div>

            <div className="map-panel">
              <div className="map-panel-title">Inflation Rates</div>
              <div className="map-panel-canvas">
                <LazyMap
                  dataType="inflation"
                  rateData={inflationData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                  title="Inflation Rates"
                />
              </div>
            </div>

            <div className="map-panel">
              <div className="map-panel-title">Exchange (vs USD)</div>
              <div className="map-panel-canvas">
                <LazyMap
                  dataType="exchange"
                  rateData={exchangeData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                  title="Exchange Rates"
                />
              </div>
            </div>

            {/* Row 2: New Metrics */}
            <div className="map-panel">
              <div className="map-panel-title">GDP Growth</div>
              <div className="map-panel-canvas">
                <LazyMap
                  dataType="gdp"
                  rateData={gdpData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                  title="GDP Growth"
                />
              </div>
            </div>

            <div className="map-panel">
              <div className="map-panel-title">Unemployment</div>
              <div className="map-panel-canvas">
                <LazyMap
                  dataType="unemployment"
                  rateData={unemploymentData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                  title="Unemployment"
                />
              </div>
            </div>

            <div className="map-panel">
              <div className="map-panel-title">Government Debt (% of GDP)</div>
              <div className="map-panel-canvas">
                <LazyMap
                  dataType="government-debt"
                  rateData={governmentDebtData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                  title="Government Debt"
                />
              </div>
            </div>

            {/* Row 3: High Priority New Metrics */}
            <div className="map-panel">
              <div className="map-panel-title">GDP Per Capita</div>
              <div className="map-panel-canvas">
                <LazyMap
                  dataType="gdp-per-capita"
                  rateData={gdpPerCapitaData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                  title="GDP Per Capita"
                />
              </div>
            </div>

            <div className="map-panel">
              <div className="map-panel-title">Trade Balance (% of GDP)</div>
              <div className="map-panel-canvas">
                <LazyMap
                  dataType="trade-balance"
                  rateData={tradeBalanceData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                  title="Trade Balance"
                />
              </div>
            </div>

            <div className="map-panel">
              <div className="map-panel-title">Current Account (% of GDP)</div>
              <div className="map-panel-canvas">
                <LazyMap
                  dataType="current-account"
                  rateData={currentAccountData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                  title="Current Account"
                />
              </div>
            </div>

            <div className="map-panel">
              <div className="map-panel-title">FDI (% of GDP)</div>
              <div className="map-panel-canvas">
                <LazyMap
                  dataType="fdi"
                  rateData={fdiData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                  title="FDI"
                />
              </div>
            </div>

            {/* Row 4: Additional Metrics */}
            <div className="map-panel">
              <div className="map-panel-title">Population Growth</div>
              <div className="map-panel-canvas">
                <LazyMap
                  dataType="population-growth"
                  rateData={populationGrowthData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                  title="Population Growth"
                />
              </div>
            </div>

            <div className="map-panel">
              <div className="map-panel-title">Life Expectancy</div>
              <div className="map-panel-canvas">
                <LazyMap
                  dataType="life-expectancy"
                  rateData={lifeExpectancyData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                  title="Life Expectancy"
                />
              </div>
            </div>

            <div className="map-panel">
              <div className="map-panel-title">Gini Coefficient</div>
              <div className="map-panel-canvas">
                <LazyMap
                  dataType="gini-coefficient"
                  rateData={giniCoefficientData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                  title="Gini Coefficient"
                />
              </div>
            </div>

            <div className="map-panel">
              <div className="map-panel-title">Exports (% of GDP)</div>
              <div className="map-panel-canvas">
                <LazyMap
                  dataType="exports"
                  rateData={exportsData}
                  selectedIso={selectedIso}
                  onSelectCountry={openCountry}
                  title="Exports"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details drawer */}
      <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div>
            <div className="drawer-title">
              {selectedCountry?.name || selectedIso || 'Country Details'}
            </div>
            <div className="drawer-subtitle">
              {selectedIso}
              {selectedCountry?.region ? ` • ${selectedCountry.region}` : ''}
            </div>
          </div>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
        </div>

        <div className="drawer-body">
          {drawerOpen && selectedIso && (
            <Suspense fallback={null}>
              <AIAnalysis
                countryIso={selectedIso || ''}
                countryName={selectedCountry?.name || selectedIso || ''}
                autoGenerate={false}
              />
            </Suspense>
          )}

          <div className="drawer-section-title">Current Indicators</div>

          {/* Metric Rows */}
          <div className="metric-row">
            <div className="metric-name">Real Interest Rate</div>
            <div className="metric-value">{formatValue('interest', selectedInterest?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">Inflation</div>
            <div className="metric-value">{formatValue('inflation', selectedInflation?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">Exchange (to USD)</div>
            <div className="metric-value">{formatValue('exchange', selectedExchange?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">GDP Growth</div>
            <div className="metric-value">{formatValue('gdp', selectedGdp?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">Unemployment</div>
            <div className="metric-value">{formatValue('unemployment', selectedUnemployment?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">Government Debt (% of GDP)</div>
            <div className="metric-value">{formatValue('government-debt', selectedGovernmentDebt?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">GDP Per Capita</div>
            <div className="metric-value">{formatValue('gdp-per-capita', selectedGdpPerCapita?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">Trade Balance (% of GDP)</div>
            <div className="metric-value">{formatValue('trade-balance', selectedTradeBalance?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">Current Account (% of GDP)</div>
            <div className="metric-value">{formatValue('current-account', selectedCurrentAccount?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">FDI (% of GDP)</div>
            <div className="metric-value">{formatValue('fdi', selectedFDI?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">Population Growth</div>
            <div className="metric-value">{formatValue('population-growth', selectedPopulationGrowth?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">Life Expectancy</div>
            <div className="metric-value">{formatValue('life-expectancy', selectedLifeExpectancy?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">Gini Coefficient</div>
            <div className="metric-value">{formatValue('gini-coefficient', selectedGiniCoefficient?.value)}</div>
          </div>
          <div className="metric-row">
            <div className="metric-name">Exports (% of GDP)</div>
            <div className="metric-value">{formatValue('exports', selectedExports?.value)}</div>
          </div>

          <div className="drawer-section-title" style={{ marginTop: '24px' }}>Historical Trends</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Suspense fallback={null}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Real Interest Rate History</div>
              <HistoryChart
                data={history.interest}
                type="interest"
                color="#2196f3"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Inflation History</div>
              <HistoryChart
                data={history.inflation}
                type="inflation"
                color="#ff9800"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>GDP Growth History</div>
              <HistoryChart
                data={history.gdp}
                type="gdp"
                color="#4caf50"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Unemployment History</div>
              <HistoryChart
                data={history.unemployment}
                type="unemployment"
                color="#f44336"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Government Debt History</div>
              <HistoryChart
                data={history['government-debt']}
                type="government-debt"
                color="#9c27b0"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>GDP Per Capita History</div>
              <HistoryChart
                data={history['gdp-per-capita']}
                type="gdp-per-capita"
                color="#ff9800"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Trade Balance History</div>
              <HistoryChart
                data={history['trade-balance']}
                type="trade-balance"
                color="#2196f3"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Current Account History</div>
              <HistoryChart
                data={history['current-account']}
                type="current-account"
                color="#00bcd4"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>FDI History</div>
              <HistoryChart
                data={history['fdi']}
                type="fdi"
                color="#4caf50"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Population Growth History</div>
              <HistoryChart
                data={history['population-growth']}
                type="population-growth"
                color="#4292c6"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Life Expectancy History</div>
              <HistoryChart
                data={history['life-expectancy']}
                type="life-expectancy"
                color="#4caf50"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Gini Coefficient History</div>
              <HistoryChart
                data={history['gini-coefficient']}
                type="gini-coefficient"
                color="#ef3b2c"
                loading={loadingHistory}
              />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Exports History</div>
              <HistoryChart
                data={history['exports']}
                type="exports"
                color="#2171b5"
                loading={loadingHistory}
              />
            </div>
            </Suspense>
          </div>

          <div className="drawer-note" style={{ marginTop: 20 }}>
            charts show up to 15 years provided by World Bank API.
          </div>
        </div>
      </aside>
    </div>
  );
}

export default App;
