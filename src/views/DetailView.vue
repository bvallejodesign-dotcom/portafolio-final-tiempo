<template>
  <div class="detail" v-if="place">
    <!-- Hero -->
    <div class="detail-hero" :class="`type-${currentType}`">
      <div class="hero-bg-icon" aria-hidden="true">{{ currentWmo.icon }}</div>
      <div class="hero-content">
        <button class="back-btn" @click="$router.back()">← Volver</button>
        <div class="hero-main">
          <div>
            <h1 class="hero-city">{{ place.name }}</h1>
            <p class="hero-country">{{ place.country }} · {{ coords }}</p>
          </div>
          <button
            class="hero-fav" :class="{ active: isFavorite }"
            @click="toggleFav"
          >{{ isFavorite ? '⭐ Favorito' : '☆ Favorito' }}</button>
        </div>

        <div v-if="current" class="hero-weather">
          <span class="hero-temp">{{ tempDisplay(current.temperature_2m) }}</span>
          <div class="hero-meta">
            <p class="hero-label">{{ currentWmo.label }}</p>
            <p class="hero-feels">Sensación {{ tempDisplay(current.apparent_temperature) }}</p>
            <div class="hero-stats">
              <span>💧 {{ current.relative_humidity_2m }}%</span>
              <span>💨 {{ current.wind_speed_10m }} km/h</span>
              <span>🌧️ {{ current.precipitation }} mm</span>
            </div>
          </div>
        </div>

        <div v-else-if="loading" class="hero-skeleton">
          <div class="skeleton" style="width:120px;height:60px"></div>
          <div class="skeleton" style="width:180px;height:20px"></div>
        </div>
      </div>
    </div>

    <div class="detail-body">
      <!-- Error -->
      <Transition name="fade">
        <div v-if="error" class="error-banner">⚠️ {{ error }}</div>
      </Transition>

      <!-- Alerts -->
      <div v-if="stats && stats.alerts.length" class="alerts-section">
        <h2 class="section-title">🚨 Alertas meteorológicas</h2>
        <div class="alerts-grid">
          <div v-for="a in stats.alerts" :key="a.type" class="alert-card" :class="`alert-${a.type}`">
            <span class="alert-icon">{{ a.icon }}</span>
            <p class="alert-msg">{{ a.msg }}</p>
          </div>
        </div>
      </div>

      <!-- 7-day forecast -->
      <section class="forecast-section">
        <h2 class="section-title">📅 Pronóstico 7 días</h2>

        <div v-if="loadingForecast" class="forecast-skeleton">
          <div v-for="i in 7" :key="i" class="skeleton" style="height:80px;border-radius:12px"></div>
        </div>

        <div v-else-if="forecast" class="forecast-list">
          <div
            v-for="(day, i) in forecastDays" :key="i"
            class="forecast-day"
            :class="{ today: i === 0 }"
          >
            <span class="day-name">{{ i===0 ? 'Hoy' : day.name }}</span>
            <span class="day-icon">{{ day.wmo.icon }}</span>
            <div class="day-bar-wrap">
              <div
                class="day-bar"
                :style="{ '--pct': barPct(day.min, day.max) }"
              ></div>
            </div>
            <span class="day-min">{{ tempDisplay(day.min) }}</span>
            <span class="day-sep">—</span>
            <span class="day-max">{{ tempDisplay(day.max) }}</span>
            <span class="day-precip" title="Precipitación">🌧️ {{ day.precip }}mm</span>
          </div>
        </div>
      </section>

      <!-- Hourly strip -->
      <section v-if="forecast" class="hourly-section">
        <h2 class="section-title">⏱ Próximas 24 horas</h2>
        <div class="hourly-strip">
          <div v-for="h in hourlySlice" :key="h.time" class="hourly-item">
            <span class="h-time">{{ h.timeLabel }}</span>
            <span class="h-icon">{{ h.wmo.icon }}</span>
            <span class="h-temp">{{ tempDisplay(h.temp) }}</span>
            <div class="h-precip-bar" :style="{ height: h.precipProb + '%' }" title="% precipitación"></div>
          </div>
        </div>
      </section>

      <!-- Weekly stats -->
      <section v-if="stats" class="stats-section">
        <h2 class="section-title">📊 Estadísticas de la semana</h2>
        <div class="stats-grid">
          <StatCard icon="🔥" label="Máxima semana"  :value="tempDisplay(stats.maxTemp)" color="var(--dawn)" />
          <StatCard icon="🥶" label="Mínima semana"  :value="tempDisplay(stats.minTemp)" color="var(--rain)" />
          <StatCard icon="📈" label="Promedio máx"   :value="tempDisplay(stats.avgMaxTemp)" color="var(--sky)" />
          <StatCard icon="📉" label="Promedio mín"   :value="tempDisplay(stats.avgMinTemp)" color="var(--fog)" />
          <StatCard icon="🌧️" label="Precip. total"  :value="`${stats.totalPrecip} mm`" color="var(--rain)" />
          <StatCard icon="☁️" label="Clima dominante" :value="dominantLabel" color="var(--fog-lt)" />
        </div>

        <!-- Type breakdown -->
        <div class="type-breakdown">
          <h3 class="sub-title">Distribución del clima</h3>
          <div class="type-bars">
            <div v-for="(count, type) in stats.typeCounts" :key="type" class="type-bar-row">
              <span class="type-label">{{ typeLabel(type) }}</span>
              <div class="type-bar-track">
                <div class="type-bar-fill" :style="{ width: (count/7*100)+'%', background: typeColor(type) }"></div>
              </div>
              <span class="type-count">{{ count }}d</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>

  <!-- Place not found -->
  <div v-else class="not-found">
    <p>Ciudad no encontrada.</p>
    <RouterLink to="/">← Volver al inicio</RouterLink>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import StatCard from '@/components/StatCard.vue'

const props = defineProps({ id: [String, Number] })
const store  = useStore()

const placeId = computed(() => +props.id)
const place   = computed(() => store.getters.getPlace(placeId.value))
const current = computed(() => store.getters.currentForPlace(placeId.value))
const forecast= computed(() => store.getters.forecastForPlace(placeId.value))
const stats   = computed(() => store.getters.statsForPlace(placeId.value))
const loading         = computed(() => store.state.loading)
const loadingForecast = computed(() => store.state.loadingForecast)
const error   = computed(() => store.state.error)
const isFavorite = computed(() => store.getters.isFavorite(placeId.value))

const currentWmo  = computed(() => current.value ? store.getters.wmoInfo(current.value.weathercode) : { icon:'🌡️', label:'—', type:'unknown' })
const currentType = computed(() => currentWmo.value.type)
const coords = computed(() => place.value ? `${place.value.lat.toFixed(2)}, ${place.value.lon.toFixed(2)}` : '')

const tempDisplay = v => store.getters.tempDisplay(v)
function toggleFav() { store.commit('TOGGLE_FAVORITE', placeId.value) }

onMounted(() => {
  if (!current.value)  store.dispatch('fetchCurrentWeather', placeId.value)
  if (!forecast.value) store.dispatch('fetchForecast', placeId.value)
})

// Forecast days
const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const forecastDays = computed(() => {
  if (!forecast.value?.daily) return []
  const { time, temperature_2m_max, temperature_2m_min, weathercode, precipitation_sum } = forecast.value.daily
  return time.map((t,i) => {
    const d = new Date(t)
    return {
      name: DAYS[d.getDay()],
      wmo:  store.getters.wmoInfo(weathercode[i]),
      max:  temperature_2m_max[i],
      min:  temperature_2m_min[i],
      precip: precipitation_sum[i]?.toFixed(1) || '0',
    }
  })
})

function barPct(min, max) {
  if (!forecastDays.value.length) return 0
  const globalMin = Math.min(...forecastDays.value.map(d=>d.min))
  const globalMax = Math.max(...forecastDays.value.map(d=>d.max))
  const range = globalMax - globalMin || 1
  return ((max - globalMin) / range * 80 + 10).toFixed(1)
}

// Hourly
const hourlySlice = computed(() => {
  if (!forecast.value?.hourly) return []
  const now = new Date()
  const { time, temperature_2m, weathercode, precipitation_probability } = forecast.value.hourly
  const start = time.findIndex(t => new Date(t) >= now)
  const slice = time.slice(start, start+24)
  return slice.map((t, i) => {
    const idx = start + i
    const d   = new Date(t)
    return {
      time: t,
      timeLabel: d.getHours() === 0 ? `${DAYS[d.getDay()]}` : `${String(d.getHours()).padStart(2,'0')}h`,
      temp: temperature_2m[idx],
      wmo:  store.getters.wmoInfo(weathercode[idx]),
      precipProb: precipitation_probability[idx] || 0,
    }
  })
})

// Stats helpers
const dominantLabel = computed(() => {
  if (!stats.value) return '—'
  const t = stats.value.dominantType
  return typeLabel(t)
})

const TYPE_LABELS = { clear:'Despejado', cloudy:'Nublado', rain:'Lluvia', storm:'Tormenta', snow:'Nieve', fog:'Niebla', unknown:'Variado' }
const TYPE_COLORS = { clear:'var(--sun)', cloudy:'var(--fog)', rain:'var(--rain)', storm:'var(--storm)', snow:'#a5f3fc', fog:'var(--fog-lt)', unknown:'var(--sky)' }
function typeLabel(t) { return TYPE_LABELS[t] || t }
function typeColor(t) { return TYPE_COLORS[t] || 'var(--sky)' }
</script>

<style scoped>
/* Hero */
.detail-hero {
  position: relative; overflow: hidden;
  padding: 0; min-height: 280px;
  border-bottom: 1px solid var(--border);
}

.type-clear  { background: linear-gradient(135deg,#1a2a4a,#2a3f6f); }
.type-cloudy { background: linear-gradient(135deg,#1a1f2e,#2d3447); }
.type-rain   { background: linear-gradient(135deg,#0f1e2e,#1e3a5a); }
.type-storm  { background: linear-gradient(135deg,#1a0a2e,#2d1b4e); }
.type-snow   { background: linear-gradient(135deg,#1a2535,#2a3f55); }
.type-fog    { background: linear-gradient(135deg,#1e2030,#303550); }
.type-unknown{ background: linear-gradient(135deg,#151824,#1f2438); }

.hero-bg-icon {
  position: absolute; right: -20px; top: -20px;
  font-size: 12rem; opacity: .07; pointer-events: none;
  transform: rotate(15deg);
}

.hero-content {
  position: relative; z-index: 1; padding: 28px 32px;
}

.back-btn {
  background: rgba(255,255,255,.07); border: 1px solid var(--border-2);
  color: var(--fog-lt); padding: 6px 14px; border-radius: 20px;
  cursor: pointer; font-size: .85rem; font-family: var(--font-body);
  transition: all .15s; margin-bottom: 24px; display: inline-block;
}
.back-btn:hover { background: rgba(255,255,255,.12); color: var(--snow); }

.hero-main {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
}
.hero-city    { font-family: var(--font-display); font-size: 2.6rem; line-height: 1; }
.hero-country { color: var(--fog); font-size: .9rem; margin-top: 6px; }

.hero-fav {
  background: rgba(255,255,255,.07); border: 1px solid var(--border-2);
  color: var(--fog-lt); padding: 8px 16px; border-radius: 20px;
  cursor: pointer; font-family: var(--font-body); font-size: .85rem;
  transition: all .15s; white-space: nowrap;
}
.hero-fav.active { background: rgba(246,201,14,.15); border-color: var(--sun); color: var(--sun); }
.hero-fav:hover  { background: rgba(255,255,255,.12); }

.hero-weather { display: flex; align-items: flex-start; gap: 24px; flex-wrap: wrap; }
.hero-temp { font-family: var(--font-display); font-size: 4rem; line-height: 1; }
.hero-label  { font-size: 1.1rem; color: var(--fog-lt); margin-bottom: 4px; }
.hero-feels  { font-size: .85rem; color: var(--fog); margin-bottom: 12px; }
.hero-stats  { display: flex; gap: 16px; font-size: .85rem; color: var(--fog-lt); flex-wrap: wrap; }

.hero-skeleton { display: flex; flex-direction: column; gap: 10px; }
.skeleton {
  background: linear-gradient(90deg, rgba(255,255,255,.04) 25%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.04) 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px;
}
@keyframes shimmer { to { background-position: -200% 0; } }

/* Body */
.detail-body { padding: 32px; max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }

.section-title {
  font-family: var(--font-display); font-size: 1.3rem; font-weight: 400;
  margin-bottom: 16px; color: var(--snow);
}
.sub-title { font-size: .9rem; font-weight: 500; color: var(--fog-lt); margin-bottom: 12px; }

/* Error */
.error-banner {
  background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3);
  color: #fca5a5; border-radius: var(--radius); padding: 12px 16px; font-size: .9rem;
}

/* Alerts */
.alerts-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.alert-card {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-radius: var(--radius); border: 1px solid;
  font-size: .9rem; flex: 1; min-width: 220px;
}
.alert-heat  { background: rgba(240,122,91,.1); border-color: rgba(240,122,91,.3); color: #fca5a5; }
.alert-cold  { background: rgba(99,179,237,.1); border-color: rgba(99,179,237,.3); color: #bfdbfe; }
.alert-rain  { background: rgba(99,179,237,.1); border-color: rgba(99,179,237,.3); color: #bfdbfe; }
.alert-storm { background: rgba(139,92,246,.1); border-color: rgba(139,92,246,.3); color: #c4b5fd; }
.alert-snow  { background: rgba(165,243,252,.1); border-color: rgba(165,243,252,.3); color: #a5f3fc; }
.alert-icon  { font-size: 1.4rem; }

/* Forecast */
.forecast-skeleton { display: flex; flex-direction: column; gap: 8px; }
.forecast-list { display: flex; flex-direction: column; gap: 6px; }

.forecast-day {
  display: grid;
  grid-template-columns: 50px 30px 1fr 60px 10px 60px 70px;
  align-items: center; gap: 8px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 12px 16px;
  transition: background .15s;
}
.forecast-day.today { border-color: var(--sky); background: rgba(91,138,240,.06); }
.forecast-day:hover { background: var(--surface-2); }

.day-name { font-weight: 500; font-size: .9rem; color: var(--fog-lt); }
.day-icon { font-size: 1.2rem; }
.day-bar-wrap { position: relative; height: 4px; background: var(--ink-muted); border-radius: 2px; }
.day-bar {
  position: absolute; left: 0; top: 0; bottom: 0;
  width: calc(var(--pct, 50) * 1%); background: var(--sky);
  border-radius: 2px; transition: width .6s var(--ease-out);
}
.day-min, .day-max { font-size: .9rem; text-align: right; }
.day-min { color: var(--fog); }
.day-max { font-weight: 500; }
.day-sep { color: var(--fog); font-size: .8rem; text-align: center; }
.day-precip { font-size: .78rem; color: var(--fog); text-align: right; }

/* Hourly */
.hourly-strip {
  display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px;
  scrollbar-width: thin;
}
.hourly-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  min-width: 56px; background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 10px 8px;
  transition: background .15s;
}
.hourly-item:hover { background: var(--surface-2); }
.h-time { font-size: .72rem; color: var(--fog); font-weight: 500; }
.h-icon { font-size: 1.1rem; }
.h-temp { font-size: .8rem; font-weight: 500; }
.h-precip-bar {
  width: 4px; min-height: 2px; max-height: 30px;
  background: var(--rain); border-radius: 2px;
  transition: height .3s var(--ease-out);
}

/* Stats */
.stats-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(150px,1fr));
  gap: 12px; margin-bottom: 24px;
}

.type-bars { display: flex; flex-direction: column; gap: 10px; }
.type-bar-row { display: grid; grid-template-columns: 90px 1fr 30px; align-items: center; gap: 10px; }
.type-label { font-size: .85rem; color: var(--fog-lt); }
.type-bar-track { height: 6px; background: var(--ink-muted); border-radius: 3px; overflow: hidden; }
.type-bar-fill  { height: 100%; border-radius: 3px; transition: width .7s var(--ease-out); }
.type-count { font-size: .8rem; color: var(--fog); text-align: right; }

.not-found { padding: 80px 32px; text-align: center; color: var(--fog); }
.not-found a { color: var(--sky-lt); text-decoration: none; margin-top: 12px; display: block; }

@media (max-width: 600px) {
  .hero-content { padding: 20px 16px; }
  .hero-city { font-size: 2rem; }
  .hero-temp { font-size: 3rem; }
  .detail-body { padding: 20px 16px; }
  .forecast-day { grid-template-columns: 44px 26px 1fr 52px 8px 52px 60px; gap: 4px; padding: 10px 10px; }
}
</style>
