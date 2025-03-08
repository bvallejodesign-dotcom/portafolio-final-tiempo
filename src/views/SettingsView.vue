<template>
  <div class="settings">
    <header class="page-header">
      <h1 class="page-title">Configuración</h1>
      <p class="page-sub">Personaliza tu experiencia</p>
    </header>

    <div class="settings-body">
      <!-- Units -->
      <section class="settings-card">
        <h2 class="card-title">🌡️ Unidad de temperatura</h2>
        <p class="card-desc">Elige entre Celsius y Fahrenheit.</p>
        <div class="toggle-group">
          <button
            v-for="u in ['C','F']"
            :key="u"
            class="toggle-btn"
            :class="{ active: unit === u }"
            @click="setUnit(u)"
          >
            <span class="toggle-icon">{{ u === 'C' ? '🇪🇺' : '🇺🇸' }}</span>
            <span class="toggle-label">Grados {{ u === 'C' ? 'Celsius (°C)' : 'Fahrenheit (°F)' }}</span>
            <span v-if="unit===u" class="toggle-check">✓</span>
          </button>
        </div>
      </section>

      <!-- Cities -->
      <section class="settings-card">
        <h2 class="card-title">🗺️ Ciudades guardadas</h2>
        <p class="card-desc">{{ cityCount }} ciudad{{ cityCount!==1?'es':'' }} en tu lista.</p>
        <div class="places-list">
          <div v-for="place in places" :key="place.id" class="place-row">
            <div class="place-info">
              <span class="place-name">{{ place.name }}</span>
              <span class="place-country">{{ place.country }}</span>
              <span v-if="isFav(place.id)" class="place-fav">⭐</span>
            </div>
            <button class="remove-btn" @click="removePlace(place.id)">✕</button>
          </div>
        </div>
        <p v-if="!places.length" class="no-cities">No hay ciudades. Agrega desde el inicio.</p>
      </section>

      <!-- About -->
      <section class="settings-card about-card">
        <h2 class="card-title">ℹ️ Acerca de Meteora</h2>
        <div class="about-grid">
          <div class="about-item">
            <span class="about-icon">🌐</span>
            <div>
              <p class="about-label">API de clima</p>
              <p class="about-value">Open-Meteo (gratuita, sin API key)</p>
            </div>
          </div>
          <div class="about-item">
            <span class="about-icon">🛠️</span>
            <div>
              <p class="about-label">Stack</p>
              <p class="about-value">Vue 3 + Vuex + Vue Router + Axios</p>
            </div>
          </div>
          <div class="about-item">
            <span class="about-icon">📦</span>
            <div>
              <p class="about-label">Build</p>
              <p class="about-value">Vite 5</p>
            </div>
          </div>
          <div class="about-item">
            <span class="about-icon">🎨</span>
            <div>
              <p class="about-label">Fuente</p>
              <p class="about-value">DM Serif Display + DM Sans</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Reset -->
      <section class="settings-card danger-card">
        <h2 class="card-title">🗑️ Restablecer</h2>
        <p class="card-desc">Borra favoritos y preferencias guardadas en tu navegador.</p>
        <button class="danger-btn" @click="confirmReset">Restablecer configuración</button>
      </section>
    </div>

    <!-- Confirm dialog -->
    <Transition name="fade">
      <div v-if="showConfirm" class="overlay" @click.self="showConfirm=false">
        <div class="dialog">
          <p class="dialog-title">¿Confirmar restablecimiento?</p>
          <p class="dialog-sub">Se perderán tus favoritos y preferencias.</p>
          <div class="dialog-btns">
            <button class="dialog-cancel" @click="showConfirm=false">Cancelar</button>
            <button class="dialog-ok" @click="doReset">Restablecer</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const unit      = computed(() => store.state.preferences.unit)
const places    = computed(() => store.state.places)
const cityCount = computed(() => places.value.length)
const isFav = id => store.getters.isFavorite(id)

const showConfirm = ref(false)

function setUnit(u)    { store.commit('SET_PREFERENCES', { unit: u }) }
function removePlace(id){ store.commit('REMOVE_PLACE', id) }
function confirmReset(){ showConfirm.value = true }
function doReset() {
  localStorage.removeItem('wapp_favorites')
  localStorage.removeItem('wapp_prefs')
  store.commit('SET_PREFERENCES', { unit:'C' })
  store.state.favorites.splice(0)
  showConfirm.value = false
}
</script>

<style scoped>
.settings { padding: 40px 32px; max-width: 700px; margin: 0 auto; }
.page-header { margin-bottom: 32px; }
.page-title { font-family: var(--font-display); font-size: 2.4rem; font-weight: 400; }
.page-sub   { color: var(--fog); font-size: .9rem; margin-top: 6px; }

.settings-body { display: flex; flex-direction: column; gap: 20px; }

.settings-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 24px;
}
.card-title { font-size: 1rem; font-weight: 600; margin-bottom: 6px; }
.card-desc  { color: var(--fog); font-size: .85rem; margin-bottom: 16px; }

/* Units toggle */
.toggle-group { display: flex; flex-direction: column; gap: 8px; }
.toggle-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-radius: var(--radius);
  background: transparent; border: 1px solid var(--border-2);
  color: var(--fog-lt); cursor: pointer; font-family: var(--font-body);
  text-align: left; transition: all .15s;
}
.toggle-btn.active {
  background: rgba(91,138,240,.1); border-color: var(--sky); color: var(--sky-lt);
}
.toggle-btn:hover:not(.active) { background: var(--ink-muted); color: var(--snow); }
.toggle-icon  { font-size: 1.2rem; }
.toggle-label { flex: 1; font-size: .9rem; }
.toggle-check { color: var(--sky); font-weight: 700; }

/* Places */
.places-list { display: flex; flex-direction: column; gap: 6px; }
.place-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; background: var(--ink-muted); border-radius: var(--radius);
}
.place-info { display: flex; align-items: center; gap: 8px; }
.place-name { font-size: .9rem; font-weight: 500; }
.place-country {
  font-size: .7rem; background: var(--surface-2); padding: 1px 6px;
  border-radius: 10px; color: var(--fog);
}
.place-fav { font-size: .8rem; }
.remove-btn {
  background: transparent; border: none; color: var(--fog);
  cursor: pointer; font-size: .8rem; padding: 4px 8px;
  border-radius: 6px; transition: all .15s;
}
.remove-btn:hover { background: rgba(239,68,68,.15); color: #fca5a5; }
.no-cities { color: var(--fog); font-size: .85rem; }

/* About */
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.about-item { display: flex; align-items: flex-start; gap: 10px; }
.about-icon  { font-size: 1.2rem; margin-top: 2px; }
.about-label { font-size: .75rem; color: var(--fog); }
.about-value { font-size: .85rem; color: var(--fog-lt); margin-top: 2px; }

/* Danger */
.danger-card { border-color: rgba(239,68,68,.2); }
.danger-btn {
  background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3);
  color: #fca5a5; padding: 10px 20px; border-radius: var(--radius);
  cursor: pointer; font-family: var(--font-body); font-size: .9rem;
  transition: all .15s;
}
.danger-btn:hover { background: rgba(239,68,68,.2); }

/* Dialog */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.6);
  backdrop-filter: blur(4px); z-index: 200;
  display: flex; align-items: center; justify-content: center;
}
.dialog {
  background: var(--surface); border: 1px solid var(--border-2);
  border-radius: var(--radius-lg); padding: 28px; max-width: 360px; width: 90%;
}
.dialog-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; }
.dialog-sub   { color: var(--fog); font-size: .85rem; margin-bottom: 20px; }
.dialog-btns  { display: flex; gap: 10px; justify-content: flex-end; }
.dialog-cancel {
  background: transparent; border: 1px solid var(--border-2);
  color: var(--fog-lt); padding: 8px 18px; border-radius: var(--radius);
  cursor: pointer; font-family: var(--font-body); transition: all .15s;
}
.dialog-cancel:hover { background: var(--surface-2); color: var(--snow); }
.dialog-ok {
  background: rgba(239,68,68,.15); border: 1px solid rgba(239,68,68,.3);
  color: #fca5a5; padding: 8px 18px; border-radius: var(--radius);
  cursor: pointer; font-family: var(--font-body); transition: all .15s;
}
.dialog-ok:hover { background: rgba(239,68,68,.25); }

@media (max-width: 600px) {
  .settings { padding: 24px 16px; }
  .about-grid { grid-template-columns: 1fr; }
}
</style>
