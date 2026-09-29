export interface Car {
  id?: number;
  model: string;
  year: string;
  col_or_serie: string;
  color: string;
  used: string;
  date_added: string;
  notes: string;
  brand?: string;
}

export const brandKeywords: Record<string, string[]> = {
  'Chevrolet': ['chevy', 'copo', 'corvette', 'chevelle', 'impala', 'silverado', 'camaro'],
  'Mercedes': ['mercedes', 'benz', 'amg'],
  'Nissan': ['nissan', 'skyline', 'datsun', 'fairlady'],
  'Ford': ['mustang', 'ford', 'thunderbird'],
  'De Tomaso': ['de tomaso'],
  'Pininfarina': ['pininfarina'],
  'Gordon Murray': ['gordon murray'],
  'Aston Martin': ['aston martin'],
  'Alfa Romeo': ['alfa romeo'],
  'Porsche': ['porsche'],
  'Lamborghini': ['lamborghini', 'huracan', 'countach'],
  'McLaren': ['mclaren'],
  'Ferrari': ['ferrari'],
  'Dodge': ['dodge', 'charger', 'challenger', 'viper'],
  'Honda': ['honda', 'civic', 'prelude'],
  'Mazda': ['mazda', 'rx-7', 'rx-3', 'miata'],
  'Toyota': ['toyota', 'celica', 'supra', 'gr86'],
  'Subaru': ['subaru', 'impreza', 'wrx', 'brz'],
  'BMW': ['bmw'],
  'Audi': ['audi'],
  'Bugatti': ['bugatti'],
  'Tesla': ['tesla'],
  'Maserati': ['maserati']
};

export const getBrand = (model: string): string => {
  if (!model) return 'Unknown';
  const lowerModel = model.toLowerCase();

  for (const [brand, keywords] of Object.entries(brandKeywords)) {
    if (keywords.some(keyword => lowerModel.includes(keyword))) {
      return brand;
    }
  }

  const words = model.split(' ');
  const brand = words.find(word => /^[A-Za-z]+$/.test(word)) || 'Unknown';
  return brand;
};
