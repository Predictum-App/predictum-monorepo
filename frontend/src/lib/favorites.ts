import { Market } from "./types";

const FAVORITES_STORAGE_KEY = "prediction-markets-favorites";

export const getFavorites = (): string[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading favorites from localStorage:", error);
    return [];
  }
};

export const addToFavorites = (market: Market): void => {
  if (typeof window === "undefined") return;

  try {
    const favorites = getFavorites();
    const existingIndex = favorites.findIndex((fav) => fav === market.address);

    if (existingIndex === -1) {
      favorites.push(market.address);
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent("favorites-updated"));
    }
  } catch (error) {
    console.error("Error adding to favorites:", error);
  }
};

export const removeFromFavorites = (marketAddress: string): void => {
  if (typeof window === "undefined") return;

  try {
    const favorites = getFavorites();
    const filteredFavorites = favorites.filter((fav) => fav !== marketAddress);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(filteredFavorites));

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent("favorites-updated"));
  } catch (error) {
    console.error("Error removing from favorites:", error);
  }
};

export const isFavorite = (marketAddress: string): boolean => {
  if (typeof window === "undefined") return false;

  try {
    const favorites = getFavorites();
    return favorites.some((fav) => fav === marketAddress);
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};

export const toggleFavorite = (market: Market): boolean => {
  if (isFavorite(market.address)) {
    removeFromFavorites(market.address);
    return false;
  } else {
    addToFavorites(market);
    return true;
  }
};
