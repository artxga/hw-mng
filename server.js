import express from 'express';
import cors from 'cors';
import fs from 'fs';
import csvParser from 'csv-parser';
import { stringify } from 'csv-stringify/sync';

const app = express();
app.use(cors());
app.use(express.json());

const CSV_FILE = 'cars.csv';

// Helper to read cars from CSV
const readCars = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(CSV_FILE)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

// Helper to write cars to CSV
const writeCars = (cars) => {
  // Extract headers from the first car or use defaults
  const columns = ['model', 'year', 'col_or_serie', 'color', 'used', 'date_added', 'notes'];
  
  const csvData = stringify(cars, { header: true, columns });
  fs.writeFileSync(CSV_FILE, csvData);
};

// GET all cars
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await readCars();
    // Attach an ID to each car based on index for the frontend to use
    const carsWithIds = cars.map((car, index) => ({ ...car, id: index }));
    res.json(carsWithIds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read cars' });
  }
});

// POST a new car
app.post('/api/cars', async (req, res) => {
  try {
    const cars = await readCars();
    const newCar = {
      model: req.body.model || '',
      year: req.body.year || '',
      col_or_serie: req.body.col_or_serie || '',
      color: req.body.color || '',
      used: req.body.used || 'false',
      date_added: req.body.date_added || new Date().toISOString().split('T')[0],
      notes: req.body.notes || ''
    };
    cars.push(newCar);
    writeCars(cars);
    res.status(201).json({ ...newCar, id: cars.length - 1 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add car' });
  }
});

// PUT (update) a car by ID (index)
app.put('/api/cars/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const cars = await readCars();
    
    if (id >= 0 && id < cars.length) {
      cars[id] = { ...cars[id], ...req.body };
      // Remove 'id' if it was accidentally passed in body
      delete cars[id].id;
      writeCars(cars);
      res.json({ ...cars[id], id });
    } else {
      res.status(404).json({ error: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update car' });
  }
});

// DELETE a car by ID (index)
app.delete('/api/cars/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const cars = await readCars();
    
    if (id >= 0 && id < cars.length) {
      cars.splice(id, 1);
      writeCars(cars);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete car' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
