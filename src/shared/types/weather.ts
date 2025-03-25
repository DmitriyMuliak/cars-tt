export interface WeatherApiResponse {
  name: string;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  cod: number;
}

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  description: string;
  iconCode: string;
  windSpeed: number;
}

export interface CityHistory {
  city: string;
  searchedAt: number; // Unix timestamp ms
}

export interface WeatherStore {
  history: CityHistory[];
  lastRemovedItems: CityHistory[];
  activeCity: string;
  addToHistory: (city: string) => void;
  removeFromHistory: (city: string) => void;
  clearHistory: () => void;
  undoRemove: () => void;
  clearLastRemovedItems: () => void;
  setActiveCity: (city: string) => void;
}
