export const historyItemLabels = {
  searchCity: (city: string) => `Search weather for ${city}`,
  removeCity: (city: string) => `Remove ${city} from history`,
} as const;
