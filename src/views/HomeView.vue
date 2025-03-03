<template>
  <div class="home">
    <header class="page-header">
      <div>
        <h1 class="page-title">Tu Mundo, <em>hoy</em></h1>
        <p class="page-sub">{{ places.length }} ciudades configuradas</p>
      </div>
    </header>
    <div class="city-grid">
      <div v-for="place in places" :key="place.id" class="city-card">
        <div class="card-header">
          <span class="country-badge">{{ place.country }}</span>
        </div>
        <h3 class="city-name">{{ place.name }}</h3>
        <p class="weather-label">Cargando clima...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
const store  = useStore()
const places = computed(() => store.state.places)
</script>

<style scoped>
.home { padding: 40px 32px; }
.page-title { font-family: var(--font-display); font-size: 2.4rem; font-weight: 400; }
.page-title em { font-style: italic; color: var(--sky-lt); }
.page-sub { color: var(--fog); font-size: .9rem; margin-top: 6px; margin-bottom: 24px; }
.city-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 16px; }
.city-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
.country-badge { font-size: .7rem; font-weight: 600; background: var(--ink-muted); padding: 2px 8px; border-radius: 20px; color: var(--fog-lt); }
.city-name { font-size: 1.1rem; font-weight: 500; margin: 10px 0 4px; }
.weather-label { color: var(--fog); font-size: .85rem; }
</style>
