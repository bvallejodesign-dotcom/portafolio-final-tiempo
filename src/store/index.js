import { createStore } from 'vuex'

const DEFAULT_CITIES = [
  { id: 1, name: 'Santiago',     country: 'CL', lat: -33.4569, lon: -70.6483 },
  { id: 2, name: 'Buenos Aires', country: 'AR', lat: -34.6037, lon: -58.3816 },
  { id: 3, name: 'Madrid',       country: 'ES', lat: 40.4168,  lon: -3.7038  },
  { id: 4, name: 'Nueva York',   country: 'US', lat: 40.7128,  lon: -74.0060 },
]

export default createStore({
  state: () => ({
    places: DEFAULT_CITIES,
    favorites: JSON.parse(localStorage.getItem('wapp_favorites') || '[]'),
    currentWeather: {},
    selectedPlace: null,
    loading: false,
    error: null,
    preferences: JSON.parse(localStorage.getItem('wapp_prefs') || '{"unit":"C"}'),
  }),
  getters: {
    getPlace: state => id => state.places.find(p => p.id === id),
    isFavorite: state => id => state.favorites.includes(id),
    tempDisplay: state => celsius => {
      if (state.preferences.unit === 'F') return `${Math.round(celsius * 9/5 + 32)}°F`
      return `${Math.round(celsius)}°C`
    },
  },
  mutations: {
    SET_LOADING(state, v) { state.loading = v },
    SET_ERROR(state, v)   { state.error = v },
    SET_PREFERENCES(state, prefs) {
      state.preferences = { ...state.preferences, ...prefs }
      localStorage.setItem('wapp_prefs', JSON.stringify(state.preferences))
    },
    TOGGLE_FAVORITE(state, id) {
      const idx = state.favorites.indexOf(id)
      if (idx === -1) state.favorites.push(id)
      else state.favorites.splice(idx, 1)
      localStorage.setItem('wapp_favorites', JSON.stringify(state.favorites))
    },
  },
  actions: {}
})
