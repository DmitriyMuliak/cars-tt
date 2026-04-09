export const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const mockLondonResponse = {
  name: 'London',
  sys: { country: 'GB' },
  main: { temp: 15, feels_like: 13, temp_min: 10, temp_max: 18, humidity: 72 },
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  wind: { speed: 3.5 },
  cod: 200,
};
