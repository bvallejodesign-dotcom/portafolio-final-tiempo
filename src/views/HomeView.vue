<template>
  <div class="home">
    <header class="page-header">
      <div>
        <h1 class="page-title">Tu Mundo, <em>hoy</em></h1>
        <p class="page-sub">{{ dateStr }} · {{ cityCount }} ciudades</p>
      </div>
      <button class="btn-icon refresh-btn" @click="refreshAll" :class="{ spinning: loading }" title="Actualizar">↻</button>
    </header>

    <div class="search-wrap">
      <div class="search-box" :class="{ focused: searchFocused }">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          @focus="searchFocused = true"
          @blur="onBlur"
          @input="onSearch"
          placeholder="Buscar ciudad…"
          class="search-input"
        />
        <span v-if="searchLoading" class="search-spin">⟳</span>
      </div>
      <Transition name="fade">
        <ul v-if="searchResults.length && searchFocused" class="search-dropdown">
          <li v-for="r in searchResults" :key="r.id" class="search-item" @mousedown.prevent="addCity(r)">
            <span>📍</span>
            <div>
              <strong>{{ r.name }}</strong>
              <span class="search-sub"> {{ r.admin1 ? r.admin1 + ', ' : '' }}{{ r.country }}</span>
            </div>
          </li>
        </ul>
      </Transition>
    </div>

    <Transition name="fade">
      <div v-if="error" class="error-banner">
        ⚠️ {{ error }}
        <button @click="clearError" class="error-close">✕</button>
      </div>
    </Transition>

    <div class="city-grid">
      <TransitionGroup name="slide-up" tag="div" class="city-grid-inner">
        <CityCard v-for="place in places" :key="place.id" :place="place" @remove="removePlace(place.id)" />
      </TransitionGroup>
    </div>

    <div v-if="!places.length" class="empty-state">
      <p class="empty-icon">🌍</p>
      <p>No hay ciudades. Busca una para empezar.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import CityCard from '@/components/CityCard.vue'

const store = useStore()
const places        = computed(() => store.state.places)
const loading       = computed(() => store.state.loading)
const error         = computed(() => store.state.error)
const searchResults = computed(() => store.state.searchResults)
const searchLoading = computed(() => store.state.searchLoading)
const cityCount     = computed(() => places.value.length)

const searchQuery   = ref('')
const searchFocused = ref(false)
let   searchTimer   = null

const dateStr = computed(() =>
  new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' })
)

onMounted(() => { store.dispatch('fetchAllCurrentWeather') })

function refreshAll() { store.dispatch('fetchAllCurrentWeather') }
function clearError()  { store.commit('SET_ERROR', null) }

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.dispatch('searchPlaces', searchQuery.value), 300)
}
function onBlur() { setTimeout(() => { searchFocused.value = false }, 150) }
function addCity(r) {
  store.dispatch('addPlace', r)
  searchQuery.value = ''
  store.commit('SET_SEARCH_RESULTS', [])
  searchFocused.value = false
}
function removePlace(id) { store.commit('REMOVE_PLACE', id) }
</script>

<style scoped>
.home { padding: 40px 32px; max-width: 1100px; margin: 0 auto; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; }
.page-title { font-family: var(--font-display); font-size: 2.4rem; font-weight: 400; line-height: 1.1; }
.page-title em { font-style: italic; color: var(--sky-lt); }
.page-sub { color: var(--fog); font-size: .9rem; margin-top: 6px; text-transform: capitalize; }
.btn-icon { width: 40px; height: 40px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border-2); color: var(--fog); cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: all .15s; }
.btn-icon:hover { background: var(--surface-2); color: var(--snow); }
.refresh-btn.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.search-wrap { position: relative; margin-bottom: 24px; }
.search-box { display: flex; align-items: center; gap: 10px; background: var(--surface); border: 1px solid var(--border-2); border-radius: var(--radius-lg); padding: 10px 16px; transition: border-color .2s; }
.search-box.focused { border-color: var(--sky); box-shadow: 0 0 0 3px rgba(91,138,240,.15); }
.search-input { flex: 1; background: transparent; border: none; outline: none; color: var(--snow); font-family: var(--font-body); font-size: .95rem; }
.search-input::placeholder { color: var(--fog); }
.search-spin { animation: spin 1s linear infinite; color: var(--fog); }
.search-dropdown { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: var(--surface); border: 1px solid var(--border-2); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-lg); z-index: 100; list-style: none; }
.search-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; transition: background .1s; }
.search-item:hover { background: var(--surface-2); }
.search-sub { color: var(--fog); font-size: .85rem; }
.error-banner { display: flex; align-items: center; justify-content: space-between; background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3); color: #fca5a5; border-radius: var(--radius); padding: 12px 16px; margin-bottom: 20px; font-size: .9rem; }
.error-close { background: transparent; border: none; color: #fca5a5; cursor: pointer; font-size: 1rem; padding: 2px 6px; }
.city-grid-inner { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.empty-state { text-align: center; padding: 80px 20px; color: var(--fog); }
.empty-icon { font-size: 4rem; margin-bottom: 16px; }
@media (max-width: 600px) { .home { padding: 24px 16px; } .page-title { font-size: 1.8rem; } }
</style>
