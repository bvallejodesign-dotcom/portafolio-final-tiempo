<template>
  <div class="favorites">
    <header class="page-header">
      <div>
        <h1 class="page-title">Favoritos</h1>
        <p class="page-sub">Tus ciudades guardadas</p>
      </div>
    </header>

    <div v-if="favorites.length" class="city-grid">
      <CityCard
        v-for="place in favorites"
        :key="place.id"
        :place="place"
        @remove="removeFav(place.id)"
      />
    </div>

    <div v-else class="empty-state">
      <p class="empty-icon">⭐</p>
      <p>No tienes ciudades favoritas aún.</p>
      <p class="empty-sub">Abre el detalle de una ciudad y márcala como favorita.</p>
      <RouterLink to="/" class="empty-link">← Ir al inicio</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import CityCard from '@/components/CityCard.vue'

const store     = useStore()
const favorites = computed(() => store.getters.favoritesList)
function removeFav(id) { store.commit('TOGGLE_FAVORITE', id) }
</script>

<style scoped>
.favorites { padding: 40px 32px; max-width: 1100px; margin: 0 auto; }
.page-header { margin-bottom: 32px; }
.page-title { font-family: var(--font-display); font-size: 2.4rem; font-weight: 400; }
.page-sub { color: var(--fog); font-size: .9rem; margin-top: 6px; }

.city-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px,1fr));
  gap: 16px;
}

.empty-state { text-align: center; padding: 80px 20px; color: var(--fog); }
.empty-icon  { font-size: 4rem; margin-bottom: 16px; }
.empty-sub   { font-size: .85rem; margin-top: 8px; }
.empty-link  {
  display: inline-block; margin-top: 20px; color: var(--sky-lt);
  text-decoration: none; font-size: .9rem;
}
.empty-link:hover { text-decoration: underline; }

@media (max-width: 600px) { .favorites { padding: 24px 16px; } }
</style>
