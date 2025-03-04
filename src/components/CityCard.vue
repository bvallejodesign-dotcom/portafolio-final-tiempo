<template>
  <div class="city-card" :class="typeClass" @click="goToDetail">
    <div class="card-header">
      <div class="city-info">
        <span class="country-badge">{{ place.country }}</span>
        <button
          class="fav-btn"
          :class="{ active: isFavorite }"
          @click.stop="toggleFav"
          :title="isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
        >{{ isFavorite ? '⭐' : '☆' }}</button>
      </div>
      <button class="remove-btn" @click.stop="$emit('remove')" title="Eliminar ciudad">✕</button>
    </div>

    <div v-if="weather" class="card-body">
      <div class="temp-icon">
        <span class="weather-icon">{{ wmoInfo.icon }}</span>
        <span class="temperature">{{ tempDisplay(weather.temperature_2m) }}</span>
      </div>
      <h3 class="city-name">{{ place.name }}</h3>
      <p class="weather-label">{{ wmoInfo.label }}</p>

      <div class="card-details">
        <div class="detail">
          <span class="detail-icon">💧</span>
          <span>{{ weather.relative_humidity_2m }}%</span>
        </div>
        <div class="detail">
          <span class="detail-icon">💨</span>
          <span>{{ weather.wind_speed_10m }} km/h</span>
        </div>
        <div class="detail">
          <span class="detail-icon">🌡️</span>
          <span>ST {{ tempDisplay(weather.apparent_temperature) }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="card-loading">
      <div class="skeleton sk-icon"></div>
      <div class="skeleton sk-temp"></div>
      <div class="skeleton sk-name"></div>
      <div class="skeleton sk-label"></div>
    </div>

    <div v-else class="card-empty">
      <p>{{ place.name }}</p>
      <p class="card-empty-sub">Sin datos</p>
    </div>

    <div class="card-arrow">→</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const props = defineProps({ place: Object })
const emit  = defineEmits(['remove'])

const store  = useStore()
const router = useRouter()

const weather    = computed(() => store.getters.currentForPlace(props.place.id))
const loading    = computed(() => store.state.loading)
const isFavorite = computed(() => store.getters.isFavorite(props.place.id))
const wmoInfo    = computed(() => weather.value ? store.getters.wmoInfo(weather.value.weathercode) : { icon: '🌡️', label: '—', type: 'unknown' })
const typeClass  = computed(() => `type-${wmoInfo.value.type}`)
const tempDisplay= (v) => store.getters.tempDisplay(v)

function goToDetail() { router.push({ name: 'detail', params: { id: props.place.id } }) }
function toggleFav()  { store.commit('TOGGLE_FAVORITE', props.place.id) }
</script>

<style scoped>
.city-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 20px;
  cursor: pointer; position: relative; overflow: hidden;
  transition: transform .2s var(--ease-out), box-shadow .2s, border-color .2s;
}
.city-card:hover {
  transform: translateY(-4px); box-shadow: var(--shadow-lg);
  border-color: var(--border-2);
}
.city-card::before {
  content: ''; position: absolute; inset: 0; opacity: .05;
  pointer-events: none; transition: opacity .3s;
}
.city-card:hover::before { opacity: .08; }

.type-clear  ::before, .type-clear  { --card-accent: var(--sun); }
.type-cloudy                         { --card-accent: var(--fog); }
.type-rain                           { --card-accent: var(--rain); }
.type-storm                          { --card-accent: var(--storm); }
.type-snow                           { --card-accent: #a5f3fc; }
.type-fog                            { --card-accent: var(--fog-lt); }
.type-unknown                        { --card-accent: var(--sky); }

.city-card { border-top: 2px solid var(--card-accent, var(--sky)); }

.card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.city-info { display: flex; align-items: center; gap: 8px; }

.country-badge {
  font-size: .7rem; font-weight: 600; letter-spacing: .06em;
  background: var(--ink-muted); padding: 2px 8px; border-radius: 20px;
  color: var(--fog-lt);
}

.fav-btn {
  background: transparent; border: none; cursor: pointer;
  font-size: 1rem; padding: 2px; transition: transform .15s;
}
.fav-btn:hover { transform: scale(1.2); }

.remove-btn {
  background: transparent; border: none; cursor: pointer;
  color: var(--fog); font-size: .8rem; padding: 4px;
  border-radius: 6px; transition: all .15s; opacity: 0;
}
.city-card:hover .remove-btn { opacity: 1; }
.remove-btn:hover { background: rgba(239,68,68,.15); color: #fca5a5; }

.temp-icon {
  display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
}
.weather-icon { font-size: 2rem; }
.temperature  { font-family: var(--font-display); font-size: 2.4rem; color: var(--snow); }

.city-name    { font-size: 1.1rem; font-weight: 500; margin-bottom: 2px; }
.weather-label{ color: var(--fog); font-size: .85rem; margin-bottom: 16px; }

.card-details { display: flex; gap: 12px; flex-wrap: wrap; }
.detail {
  display: flex; align-items: center; gap: 4px;
  font-size: .8rem; color: var(--fog-lt);
}
.detail-icon { font-size: .9rem; }

.card-arrow {
  position: absolute; bottom: 16px; right: 16px;
  color: var(--fog); font-size: .9rem; opacity: 0;
  transform: translateX(-4px); transition: all .2s;
}
.city-card:hover .card-arrow { opacity: 1; transform: translateX(0); }

/* Skeleton */
.card-loading { display: flex; flex-direction: column; gap: 10px; }
.skeleton {
  background: linear-gradient(90deg, var(--ink-muted) 25%, var(--surface-2) 50%, var(--ink-muted) 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
  border-radius: 6px;
}
@keyframes shimmer { to { background-position: -200% 0; } }
.sk-icon  { width: 60px; height: 50px; border-radius: 8px; }
.sk-temp  { width: 80px; height: 20px; }
.sk-name  { width: 120px; height: 16px; }
.sk-label { width: 90px; height: 14px; }

.card-empty { text-align: center; padding: 20px 0; }
.card-empty p { font-size: 1rem; font-weight: 500; }
.card-empty-sub { color: var(--fog); font-size: .85rem; margin-top: 4px; }
</style>
