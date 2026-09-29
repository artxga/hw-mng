import { useEffect, useState, useMemo } from 'react';
import { Search, Calendar, Hash, Palette, Filter, PackageOpen, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBrand, type Car } from './types';
import './App.css';

const API_URL = 'http://localhost:3000/api/cars';

function App() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Car Form State
  const [newCar, setNewCar] = useState<Partial<Car>>({
    model: '', year: '', col_or_serie: '', color: '', used: 'false', notes: ''
  });

  const loadData = async () => {
    try {
      const response = await fetch(API_URL);
      const data: Car[] = await response.json();
      
      const parsedCars = data
        .filter(c => c.model)
        .map(c => ({
          ...c,
          brand: getBrand(c.model)
        }));
      setCars(parsedCars);
    } catch (error) {
      console.error("Failed to load cars", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id?: number) => {
    if (id === undefined) return;
    if (!confirm('Are you sure you want to delete this car?')) return;
    
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setCars(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCar.model) return;
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCar)
      });
      const addedCar = await response.json();
      addedCar.brand = getBrand(addedCar.model);
      
      setCars(prev => [...prev, addedCar]);
      setShowAddModal(false);
      setNewCar({ model: '', year: '', col_or_serie: '', color: '', used: 'false', notes: '' });
    } catch (err) {
      console.error('Failed to add car', err);
    }
  };

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
        
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Car
        </button>
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
                key={car.id !== undefined ? car.id : `${car.model}-${idx}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="panel car-card group"
              >
                <div className={`status-badge ${car.used?.toLowerCase() === 'true' ? 'status-photographed' : 'status-pending'}`}>
                  {car.used?.toLowerCase() === 'true' ? '📸 Photographed' : '📷 Pending Photo'}
                </div>
                
                <button 
                  onClick={() => handleDelete(car.id)} 
                  className="delete-btn"
                  title="Delete Car"
                >
                  <Trash2 size={16} />
                </button>
                
                <div className="car-header">
                  <div className="car-model">{car.model}</div>
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

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content panel"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <div className="modal-header">
                <h3>Add New Car</h3>
                <button className="icon-btn" onClick={() => setShowAddModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="modal-body">
                <div className="form-group">
                  <label>Model Name *</label>
                  <input required type="text" className="input-field" value={newCar.model} onChange={e => setNewCar({...newCar, model: e.target.value})} placeholder="e.g. '67 Ford Mustang" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Year</label>
                    <input type="text" className="input-field" value={newCar.year} onChange={e => setNewCar({...newCar, year: e.target.value})} placeholder="e.g. 2025" />
                  </div>
                  <div className="form-group">
                    <label>Col / Serie</label>
                    <input type="text" className="input-field" value={newCar.col_or_serie} onChange={e => setNewCar({...newCar, col_or_serie: e.target.value})} placeholder="e.g. 122/250" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Color</label>
                    <input type="text" className="input-field" value={newCar.color} onChange={e => setNewCar({...newCar, color: e.target.value})} placeholder="e.g. Metalflake Blue" />
                  </div>
                  <div className="form-group">
                    <label>Photographed?</label>
                    <select className="input-field" value={newCar.used} onChange={e => setNewCar({...newCar, used: e.target.value})}>
                      <option value="false">No (Pending)</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <input type="text" className="input-field" value={newCar.notes} onChange={e => setNewCar({...newCar, notes: e.target.value})} placeholder="Any extra info..." />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Car</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
