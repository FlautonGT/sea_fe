// Local Storage key for favorites
const FAVORITES_KEY = 'sea_favorites';

// Get favorites from localStorage
export function getFavorites(): { code: string; timestamp: number }[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Add product to favorites
export function addToFavorites(productCode: string) {
  if (typeof window === 'undefined') return;
  try {
    const favorites = getFavorites();
    const existing = favorites.findIndex(f => f.code === productCode);
    if (existing >= 0) {
      favorites[existing].timestamp = Date.now();
    } else {
      favorites.unshift({ code: productCode, timestamp: Date.now() });
    }
    // Keep only last 10 favorites
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.slice(0, 10)));
  } catch (e) {
    console.error('Failed to save favorite:', e);
  }
}

// Remove product from favorites
export function removeFromFavorites(productCode: string) {
  if (typeof window === 'undefined') return;
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(f => f.code !== productCode);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to remove favorite:', e);
  }
}

// Clear all favorites
export function clearFavorites() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(FAVORITES_KEY);
  } catch (e) {
    console.error('Failed to clear favorites:', e);
  }
}

