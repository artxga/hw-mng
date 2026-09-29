import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Search, Car as CarIcon, Calendar, Hash, Palette, Filter, PackageOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBrand, type Car } from './types';
import './App.css';

function App() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/cars.csv');
        const csvText = await response.text();
        
        Papa.parse<Car>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedCars = results.data
              .filter(c => c.model)
              .map(c => ({
                ...c,
                brand: getBrand(c.model)
              }));
            setCars(parsedCars);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error("Failed to load cars", error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const brands = useMemo(() => {
    const brandSet = new Set(cars.map(c => c.brand));
    return ['All', ...Array.from(brandSet).sort()];
  }, [cars]);

  const filteredCars = useMemo(() => {
    return cars.filter(c => {
      const matchesSearch = c.model.toLowerCase().includes(search.toLowerCase()) || 
                            (c.brand && c.brand.toLowerCase().includes(search.toLowerCase()));
      const matchesBrand = brandFilter === 'All' || c.brand === brandFilter;
      return matchesSearch && matchesBrand;
    });
  }, [cars, search, brandFilter]);

  const totalCars = cars.length;
  const totalBrands = brands.length - 1; // excluding 'All'
  const pendingPhoto = cars.filter(c => c.used?.toLowerCase() === 'false').length;

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh' }}>
        <div className="title animate-pulse">Loading Collection...</div>
      </div>
    );
  }

  return (
    <div className="container dashboard">
      <header className="header">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="title"
        >
          Hot Wheels Garage
        </motion.h1>
        <motion.p 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="subtitle"
        >
          Manage and explore your awesome toy car collection
        </motion.p>
      </header>

      <motion.div 
        className="stats-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="panel stat-card">
          <div className="stat-value">{totalCars}</div>
          <div className="stat-label">Total Cars</div>
        </div>
        <div className="panel stat-card">
          <div className="stat-value">{totalBrands}</div>
          <div className="stat-label">Unique Brands</div>
        </div>
        <div className="panel stat-card">
          <div className="stat-value">{pendingPhoto}</div>
          <div className="stat-label">Pending Photo</div>
        </div>
      </motion.div>

      <motion.div 
        className="controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            className="input-field search-input" 
            placeholder="Search by model or brand..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-wrapper">
          <Filter size={18} className="filter-icon" />
          <select 
            className="filter-select"
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
          >
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {filteredCars.length === 0 ? (
        <div className="empty-state">
          <PackageOpen size={48} className="empty-icon" />
          <h3>No cars found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid-cards"
        >
          <AnimatePresence>
            {filteredCars.map((car, idx) => (
              <motion.div
                key={`${car.model}-${idx}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="panel car-card"
              >
                <div className={`status-badge ${car.used?.toLowerCase() === 'true' ? 'status-photographed' : 'status-pending'}`}>
                  {car.used?.toLowerCase() === 'true' ? '📸 Photographed' : '📷 Pending Photo'}
                </div>
                
                <div className="car-header">
                  <div className="car-model pr-12">{car.model}</div>
                </div>
                
                <div className="car-badges">
                  <span className="badge badge-brand">{car.brand}</span>
                  {car.year && <span className="badge badge-year">{car.year}</span>}
                </div>
                
                <div className="car-details">
                  {car.col_or_serie && (
                    <div className="detail-row">
                      <Hash size={16} className="detail-icon" />
                      <span>{car.col_or_serie}</span>
                    </div>
                  )}
                  {car.color && (
                    <div className="detail-row">
                      <Palette size={16} className="detail-icon" />
                      <span>{car.color}</span>
                    </div>
                  )}
                  {car.date_added && (
                    <div className="detail-row">
                      <Calendar size={16} className="detail-icon" />
                      <span>{car.date_added}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default App;
