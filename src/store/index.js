import { createStore } from 'vuex'
import axios from 'axios'

const WMO = {
  0: { label: 'Despejado',        icon: '☀️',  type: 'clear'  },
  1: { label: 'Mayormente despejado', icon: '🌤️', type: 'clear' },
  2: { label: 'Parcialmente nublado', icon: '⛅', type: 'cloudy'},
  3: { label: 'Nublado',          icon: '☁️',  type: 'cloudy' },
  45:{ label: 'Niebla',           icon: '🌫️',  type: 'fog'   },
  48:{ label: 'Niebla con escarcha',icon:'🌫️', type: 'fog'   },
  51:{ label: 'Llovizna leve',    icon: '🌦️',  type: 'rain'  },
  53:{ label: 'Llovizna moderada',icon: '🌦️',  type: 'rain'  },
  55:{ label: 'Llovizna densa',   icon: '🌧️',  type: 'rain'  },
  61:{ label: 'Lluvia leve',      icon: '🌧️',  type: 'rain'  },
  63:{ label: 'Lluvia moderada',  icon: '🌧️',  type: 'rain'  },
  65:{ label: 'Lluvia intensa',   icon: '🌧️',  type: 'rain'  },
  71:{ label: 'Nieve leve',       icon: '🌨️',  type: 'snow'  },
  73:{ label: 'Nieve moderada',   icon: '❄️',   type: 'snow'  },
  75:{ label: 'Nieve intensa',    icon: '❄️',   type: 'snow'  },
  80:{ label: 'Chubascos leves',  icon: '🌦️',  type: 'rain'  },
  81:{ label: 'Chubascos moderados',icon:'🌧️', type: 'rain'  },
  82:{ label: 'Chubascos violentos',icon:'⛈️', type: 'storm' },
  95:{ label: 'Tormenta',         icon: '⛈️',  type: 'storm' },
  96:{ label: 'Tormenta con granizo',icon:'⛈️',type: 'storm' },
  99:{ label: 'Tormenta con granizo intenso',icon:'⛈️',type:'storm'},
}

function getWMO(code) {
  return WMO[code] || { label: 'Desconocido', icon: '🌡️', type: 'unknown' }
}

function computeStats(forecast) {
  if (!forecast || !forecast.daily) return null
  const { temperature_2m_max, temperature_2m_min, weathercode, precipitation_sum } = forecast.daily

  const maxTemps  = temperature_2m_max.filter(v => v != null)
  const minTemps  = temperature_2m_min.filter(v => v != null)
  const precips   = precipitation_sum.filter(v => v != null)

  const typeCounts = {}
  weathercode.forEach(code => {
    const type = getWMO(code).type
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })

  const avgMax = maxTemps.reduce((a,b)=>a+b,0) / maxTemps.length
  const avgMin = minTemps.reduce((a,b)=>a+b,0) / minTemps.length
  const totalPrecip = precips.reduce((a,b)=>a+b,0)

  const alerts = []
  if (avgMax > 35) alerts.push({ type: 'heat',  icon: '🔥', msg: 'Ola de calor prevista — mantenerse hidratado.' })
  if (avgMin < 0)  alerts.push({ type: 'cold',  icon: '🥶', msg: 'Temperaturas bajo cero — riesgo de heladas.' })
  if (totalPrecip > 50) alerts.push({ type: 'rain',  icon: '🌧️', msg: 'Semana muy lluviosa — lleva paraguas.' })
  if ((typeCounts['storm']||0) >= 2) alerts.push({ type: 'storm', icon: '⛈️', msg: 'Varios días de tormenta previstos.' })
  if ((typeCounts['snow']||0) >= 2)  alerts.push({ type: 'snow',  icon: '❄️', msg: 'Posibles nevadas esta semana.' })

  return {
    maxTemp:    Math.max(...maxTemps),
    minTemp:    Math.min(...minTemps),
    avgMaxTemp: +avgMax.toFixed(1),
    avgMinTemp: +avgMin.toFixed(1),
    totalPrecip:+totalPrecip.toFixed(1),
    typeCounts,
    dominantType: Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'clear',
    alerts,
  }
}

const DEFAULT_CITIES = [
  { id: 1, name: 'Santiago',     country: 'CL', lat: -33.4569, lon: -70.6483 },
  { id: 2, name: 'Buenos Aires', country: 'AR', lat: -34.6037, lon: -58.3816 },
  { id: 3, name: 'Ciudad de México', country: 'MX', lat: 19.4326, lon: -99.1332 },
  { id: 4, name: 'Madrid',       country: 'ES', lat: 40.4168, lon: -3.7038  },
  { id: 5, name: 'Nueva York',   country: 'US', lat: 40.7128, lon: -74.0060 },
  { id: 6, name: 'Tokio',        country: 'JP', lat: 35.6762, lon: 139.6503 },
]

export default createStore({
  state: () => ({
    places: DEFAULT_CITIES,
    favorites: JSON.parse(localStorage.getItem('wapp_favorites') || '[]'),
    currentWeather: {},
    forecast: {},
    stats: {},
    selectedPlace: null,
    loading: false,
    loadingForecast: false,
    error: null,
    preferences: JSON.parse(localStorage.getItem('wapp_prefs') || '{"unit":"C","theme":"dark"}'),
    searchResults: [],
    searchLoading: false,
  }),
  getters: {
    getPlace:        state => id => state.places.find(p => p.id === id),
    isFavorite:      state => id => state.favorites.includes(id),
    favoritesList:   state => state.places.filter(p => state.favorites.includes(p.id)),
    currentForPlace: state => id => state.currentWeather[id] || null,
    forecastForPlace:state => id => state.forecast[id]    || null,
    statsForPlace:   state => id => state.stats[id]       || null,
    wmoInfo:         () => code => getWMO(code),
    tempDisplay:     state => celsius => {
      if (state.preferences.unit === 'F') return `${Math.round(celsius * 9/5 + 32)}°F`
      return `${Math.round(celsius)}°C`
    },
  },
  mutations: {
    SET_LOADING(state, v)          { state.loading = v },
    SET_LOADING_FORECAST(state, v) { state.loadingForecast = v },
    SET_ERROR(state, v)            { state.error = v },
    SET_CURRENT_WEATHER(state, { id, data }) {
      state.currentWeather = { ...state.currentWeather, [id]: data }
    },
    SET_FORECAST(state, { id, data }) {
      state.forecast = { ...state.forecast, [id]: data }
    },
    SET_STATS(state, { id, data }) {
      state.stats = { ...state.stats, [id]: data }
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
      state.places = state.places.filter(p => p.id !== id)
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
    async fetchForecast({ commit, state }, placeId) {
      const place = state.places.find(p => p.id === placeId)
      if (!place) return
      commit('SET_LOADING_FORECAST', true)
      commit('SET_ERROR', null)
      try {
        const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: place.lat, longitude: place.lon,
            daily: 'temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,windspeed_10m_max,sunrise,sunset',
            hourly: 'temperature_2m,weathercode,precipitation_probability',
            timezone: 'auto',
            forecast_days: 7,
          }
        })
        commit('SET_FORECAST', { id: placeId, data })
        commit('SET_STATS',    { id: placeId, data: computeStats(data) })
      } catch(e) {
        commit('SET_ERROR', 'Error al obtener pronóstico. Intenta de nuevo.')
      } finally {
        commit('SET_LOADING_FORECAST', false)
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
