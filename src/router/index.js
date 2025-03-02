import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView      from '@/views/HomeView.vue'
import DetailView    from '@/views/DetailView.vue'
import FavoritesView from '@/views/FavoritesView.vue'
import SettingsView  from '@/views/SettingsView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',           name: 'home',      component: HomeView },
    { path: '/place/:id',  name: 'detail',    component: DetailView, props: true },
    { path: '/favorites',  name: 'favorites', component: FavoritesView },
    { path: '/settings',   name: 'settings',  component: SettingsView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
