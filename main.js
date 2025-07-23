const fs = require('fs');
const csv = require('csv-parser');

const cars = [];
const brandCount = {};  // Objeto para contar las marcas
const usedCars = [];     // Arreglo para autos usados

const brandKeywords = {
  'Chevrolet': ['chevy', 'copo', 'corvette', 'chevelle'],
  'Mercedes': ['mercedes', 'benz', 'amg'],
  'Nissan': ['nissan'],
  'Ford': ['mustang'],
  'De Tomaso': ['de tomaso'],
  'Pininfarina': ['pininfarina'],
  'Gordon Murray': ['gordon murray'],
  'Aston Martin': ['aston martin'],
  'Alfa Romeo': ['alfa romeo'],
};

const getBrand = (model) => {
  const lowerModel = model.toLowerCase();

  // Intentar encontrar una marca por palabras clave
  for (const [brand, keywords] of Object.entries(brandKeywords)) {
    if (keywords.some(keyword => lowerModel.includes(keyword))) {
      return brand;
    }
  }

  // Si no se encuentra ninguna palabra clave, buscar una palabra alfabética en el modelo
  const words = model.split(' ');
  const brand = words.find(word => /^[A-Za-z]+$/.test(word)) || 'Unknown';

  return brand;
};

// Función para convertir un objeto de datos en formato CSV
const toCsv = (data) => {
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(header => row[header]).join(','));
  return [headers.join(','), ...rows].join('\n');
};

// Leer el archivo CSV
fs.createReadStream('cars.csv')
  .pipe(csv())
  .on('data', (row) => {
    if (row.model) {
      row.brand = getBrand(row.model);

      // Si el coche no está marcado como usado (used = false), lo agregamos al array de autos usados
      if (row.used && row.used.toLowerCase() === 'false') {
        usedCars.push(row);  // Agregar auto a la lista de autos usados
      }

      cars.push(row);

      // Contar las marcas
      brandCount[row.brand] = (brandCount[row.brand] || 0) + 1;
    }
  })
  .on('end', () => {
    if (cars.length === 0) {
      console.log('No se encontraron registros.');
      return;
    }

    // Ordenar por brand y luego model
    cars.sort((a, b) => {
      if (a.brand === b.brand) {
        return a.model.localeCompare(b.model);
      }
      return a.brand.localeCompare(b.brand);
    });

    // Mostrar en consola la tabla de autos
    console.table(cars);

    // Ordenar el conteo de marcas de forma descendente
    const sortedBrandCount = Object.entries(brandCount)
      .sort(([, a], [, b]) => b - a)
      .map(([brand, count]) => `${brand}: ${count}`);

    // Imprimir el conteo de autos por marca en orden descendente
    console.log("\nConteo de autos por marca (ordenado de manera descendente):");
    sortedBrandCount.forEach(count => console.log(count));

    // Guardar autos usados en un nuevo archivo CSV
    if (usedCars.length > 0) {
      const usedCarsCsv = toCsv(usedCars);
      fs.writeFileSync('unused_cars.csv', usedCarsCsv);
      console.log('Autos usados guardados en used_cars.csv');
    }

    // Guardar resultado ordenado en nuevo CSV (para todos los autos)
    const carsCsv = toCsv(cars);
    fs.writeFileSync('cars_sorted.csv', carsCsv);

    console.log('Archivo ordenado guardado como cars_sorted.csv');
  });
