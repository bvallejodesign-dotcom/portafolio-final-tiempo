import { createStore } from 'vuex'
import axios from 'axios'

const WMO = {
  0:  { label: 'Despejado',           icon: '☀️',  type: 'clear'  },
  1:  { label: 'Mayormente despejado',icon: '🌤️', type: 'clear'  },
  2:  { label: 'Parcialmente nublado',icon: '⛅',  type: 'cloudy' },
  3:  { label: 'Nublado',             icon: '☁️',  type: 'cloudy' },
  45: { label: 'Niebla',              icon: '🌫️',  type: 'fog'   },
  51: { label: 'Llovizna leve',       icon: '🌦️',  type: 'rain'  },
  61: { label: 'Lluvia leve',         icon: '🌧️',  type: 'rain'  },
  63: { label: 'Lluvia moderada',     icon: '🌧️',  type: 'rain'  },
  80: { label: 'Chubascos',           icon: '🌦️',  type: 'rain'  },
  95: { label: 'Tormenta',            icon: '⛈️',  type: 'storm' },
  71: { label: 'Nieve leve',          icon: '🌨️',  type: 'snow'  },
}
function getWMO(code) { return WMO[code] || { label: 'Variable', icon: '🌡️', type: 'unknown' } }

const DEFAULT_CITIES = [
  { id: 1, name: 'Santiago',         country: 'CL', lat: -33.4569, lon: -70.6483 },
  { id: 2, name: 'Buenos Aires',     country: 'AR', lat: -34.6037, lon: -58.3816 },
  { id: 3, name: 'Ciudad de México', country: 'MX', lat: 19.4326,  lon: -99.1332 },
  { id: 4, name: 'Madrid',           country: 'ES', lat: 40.4168,  lon: -3.7038  },
  { id: 5, name: 'Nueva York',       country: 'US', lat: 40.7128,  lon: -74.0060 },
  { id: 6, name: 'Tokio',            country: 'JP', lat: 35.6762,  lon: 139.6503 },
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
    searchResults: [],
    searchLoading: false,
  }),
  getters: {
    getPlace:       state => id => state.places.find(p => p.id === id),
    isFavorite:     state => id => state.favorites.includes(id),
    currentForPlace:state => id => state.currentWeather[id] || null,
    wmoInfo:        () => code => getWMO(code),
    tempDisplay:    state => celsius => {
      if (state.preferences.unit === 'F') return `${Math.round(celsius * 9/5 + 32)}°F`
      return `${Math.round(celsius)}°C`
    },
  },
  mutations: {
    SET_LOADING(state, v)   { state.loading = v },
    SET_ERROR(state, v)     { state.error = v },
    SET_CURRENT_WEATHER(state, { id, data }) {
      state.currentWeather = { ...state.currentWeather, [id]: data }
    },
    SET_SELECTED_PLACE(state, place) { state.selectedPlace = place },
    TOGGLE_FAVORITE(state, id) {
      const idx = state.favorites.indexOf(id)
      if (idx === -1) state.favorites.push(id)
      else state.favorites.splice(idx, 1)
      localStorage.setItem('wapp_favorites', JSON.stringify(state.favorites))
    },
    SET_PREFERENCES(state, prefs) {
      state.preferences = { ...state.preferences, ...prefs }
      localStorage.setItem('wapp_prefs', JSON.stringify(state.preferences))
    },
    ADD_PLACE(state, place) {
      if (!state.places.find(p => p.id === place.id)) state.places.push(place)
    },
    REMOVE_PLACE(state, id) {
      state.places    = state.places.filter(p => p.id !== id)
      state.favorites = state.favorites.filter(f => f !== id)
    },
    SET_SEARCH_RESULTS(state, r) { state.searchResults = r },
    SET_SEARCH_LOADING(state, v) { state.searchLoading = v },
  },
  actions: {
    async fetchCurrentWeather({ commit, state }, placeId) {
      const place = state.places.find(p => p.id === placeId)
      if (!place) return
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: place.lat, longitude: place.lon,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weathercode',
            timezone: 'auto',
          }
        })
        commit('SET_CURRENT_WEATHER', { id: placeId, data: data.current })
      } catch(e) {
        commit('SET_ERROR', 'Error al obtener clima actual. Verifica tu conexión.')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchAllCurrentWeather({ dispatch, state }) {
      await Promise.all(state.places.map(p => dispatch('fetchCurrentWeather', p.id)))
    },
    async searchPlaces({ commit }, query) {
      if (!query || query.length < 2) { commit('SET_SEARCH_RESULTS', []); return }
      commit('SET_SEARCH_LOADING', true)
      try {
        const { data } = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
          params: { name: query, count: 6, language: 'es' }
        })
        const results = (data.results || []).map(r => ({
          id: r.id, name: r.name, country: r.country_code,
          admin1: r.admin1 || '', lat: r.latitude, lon: r.longitude,
        }))
        commit('SET_SEARCH_RESULTS', results)
      } catch(e) {
        commit('SET_SEARCH_RESULTS', [])
      } finally {
        commit('SET_SEARCH_LOADING', false)
      }
    },
    addPlace({ commit, dispatch }, place) {
      commit('ADD_PLACE', place)
      dispatch('fetchCurrentWeather', place.id)
    },
  }
})
