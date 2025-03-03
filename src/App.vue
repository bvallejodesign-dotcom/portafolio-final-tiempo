<template>
  <div class="app-shell">
    <!-- Ambient background -->
    <div class="ambient" :class="ambientClass" aria-hidden="true">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
    </div>

    <!-- Sidebar Nav -->
    <nav class="sidebar">
      <RouterLink to="/" class="brand">
        <span class="brand-icon">🌤️</span>
        <span class="brand-name">Meteora</span>
      </RouterLink>

      <ul class="nav-list">
        <li v-for="item in navItems" :key="item.to">
          <RouterLink :to="item.to" class="nav-link" :class="{ active: $route.name === item.name }">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
            <span v-if="item.name==='favorites' && favCount" class="badge">{{ favCount }}</span>
          </RouterLink>
        </li>
      </ul>

      <div class="sidebar-footer">
        <div class="unit-toggle">
          <button
            v-for="u in ['C','F']" :key="u"
            class="unit-btn"
            :class="{ active: unit === u }"
            @click="setUnit(u)"
          >°{{ u }}</button>
        </div>
      </div>
    </nav>

    <!-- Mobile nav -->
    <nav class="mobile-nav">
      <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="mobile-link">
        <span>{{ item.icon }}</span>
        <span class="mobile-label">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Main content -->
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const unit     = computed(() => store.state.preferences.unit)
const favCount = computed(() => store.state.favorites.length)

const navItems = [
  { to: '/',          name: 'home',      icon: '🏠', label: 'Inicio'        },
  { to: '/favorites', name: 'favorites', icon: '⭐', label: 'Favoritos'     },
  { to: '/settings',  name: 'settings',  icon: '⚙️', label: 'Configuración' },
]

const ambientClass = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5  && hour < 9)  return 'dawn'
  if (hour >= 9  && hour < 18) return 'day'
  if (hour >= 18 && hour < 21) return 'dusk'
  return 'night'
})

function setUnit(u) {
  store.commit('SET_PREFERENCES', { unit: u })
}
</script>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: 1fr auto;
  min-height: 100vh;
  position: relative;
}

/* Ambient */
.ambient {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
}
.orb {
  position: absolute; border-radius: 50%; filter: blur(120px); opacity: .15;
  transition: background 2s ease;
}
.orb-1 { width: 600px; height: 600px; top: -200px; left: -100px; }
.orb-2 { width: 400px; height: 400px; bottom: -100px; right: -100px; }

.ambient.day  .orb-1 { background: #5b8af0; }
.ambient.day  .orb-2 { background: #63b3ed; }
.ambient.dawn .orb-1 { background: #f07a5b; }
.ambient.dawn .orb-2 { background: #f6c90e; }
.ambient.dusk .orb-1 { background: #8b5cf6; }
.ambient.dusk .orb-2 { background: #f07a5b; }
.ambient.night .orb-1{ background: #1e3a5f; }
.ambient.night .orb-2{ background: #8b5cf6; }

/* Sidebar */
.sidebar {
  grid-column: 1; grid-row: 1;
  display: flex; flex-direction: column; gap: 0;
  background: rgba(13,15,20,.7);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border);
  padding: 28px 16px;
  position: sticky; top: 0; height: 100vh;
  z-index: 10;
}

.brand {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none; color: var(--snow);
  padding: 8px 12px; margin-bottom: 32px;
}
.brand-icon { font-size: 1.6rem; }
.brand-name { font-family: var(--font-display); font-size: 1.4rem; letter-spacing: -.01em; }

.nav-list { list-style: none; display: flex; flex-direction: column; gap: 4px; flex: 1; }

.nav-link {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: var(--radius);
  text-decoration: none; color: var(--fog);
  transition: background .15s, color .15s;
  position: relative;
}
.nav-link:hover  { background: var(--ink-soft); color: var(--snow); }
.nav-link.active { background: var(--surface); color: var(--sky-lt); }
.nav-icon { font-size: 1.1rem; }
.nav-label{ font-size: .9rem; font-weight: 500; }
.badge {
  margin-left: auto; background: var(--sky); color: #fff;
  font-size: .7rem; font-weight: 600;
  padding: 1px 7px; border-radius: 10px;
}

.sidebar-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border); }
.unit-toggle { display: flex; gap: 4px; }
.unit-btn {
  flex: 1; padding: 6px; border-radius: 8px; border: 1px solid var(--border-2);
  background: transparent; color: var(--fog); cursor: pointer; font-family: var(--font-body);
  font-size: .85rem; transition: all .15s;
}
.unit-btn.active { background: var(--sky); color: #fff; border-color: var(--sky); }
.unit-btn:hover:not(.active) { background: var(--surface); color: var(--snow); }

/* Main */
.main-content {
  grid-column: 2; grid-row: 1;
  position: relative; z-index: 1;
  overflow-y: auto;
}

/* Mobile nav */
.mobile-nav { display: none; }

@media (max-width: 768px) {
  .app-shell {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 60px;
  }
  .sidebar { display: none; }
  .main-content { grid-column: 1; grid-row: 1; }
  .mobile-nav {
    display: flex; grid-column:1; grid-row:2;
    background: rgba(13,15,20,.95); backdrop-filter: blur(20px);
    border-top: 1px solid var(--border); position: sticky; bottom: 0; z-index: 10;
  }
  .mobile-link {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 2px; text-decoration: none;
    color: var(--fog); font-size: .65rem; padding: 8px 4px;
    transition: color .15s;
  }
  .mobile-link.router-link-active { color: var(--sky-lt); }
  .mobile-label { font-weight: 500; }
}
</style>
