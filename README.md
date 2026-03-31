# 🌤️ Meteora — App de Clima

> SPA de clima en **Vue 3** que consume la API gratuita de [Open-Meteo](https://open-meteo.com), con pronóstico de 7 días, estadísticas semanales, alertas meteorológicas y gestión de favoritos.

![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883?style=flat-square&logo=vue.js)
![Vuex](https://img.shields.io/badge/Vuex-4.x-42b883?style=flat-square)
![Vue Router](https://img.shields.io/badge/Vue_Router-4.x-42b883?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat-square&logo=vite)
![API](https://img.shields.io/badge/API-Open--Meteo-blue?style=flat-square)

---

## 🔗 Repositorio

```
https://github.com/bvallejodesign-dotcom/portafolio-final-tiempo
```

---

## 🚀 Instalación y ejecución local

### Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18.x o superior |
| npm | 9.x o superior |

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/bvallejodesign-dotcom/portafolio-final-tiempo
cd weather-app

# 2. Instalar dependencias
npm install

# 3. Levantar el servidor de desarrollo
npm run dev
```

Luego abre tu navegador en **http://localhost:5173**

### Variables de entorno

Esta app usa **Open-Meteo**, que es 100% gratuita y **no requiere API key**.  
No necesitas crear ningún archivo `.env`.

Si deseas conectar otra API en el futuro, copia `.env.example` a `.env` y configura las variables.

### Comandos disponibles

```bash
npm run dev      # Servidor de desarrollo con HMR
npm run build    # Build de producción → carpeta dist/
npm run preview  # Preview del build de producción
```

---

## 🗺️ Rutas de la aplicación

| Ruta | Nombre | Descripción |
|---|---|---|
| `/` | Home | Listado de ciudades con clima actual |
| `/place/:id` | Detail | Pronóstico 7 días, horas, estadísticas y alertas |
| `/favorites` | Favorites | Ciudades marcadas como favoritas |
| `/settings` | Settings | Unidades, lista de ciudades, sobre la app |

---

## ✨ Funcionalidades clave

### 🌐 API de clima — Open-Meteo
- **Gratuita y sin API key**: no requiere registro
- Datos en tiempo real: temperatura, humedad, viento, precipitación, código WMO
- Pronóstico horario y diario de 7 días
- Geocodificación para búsqueda de ciudades por nombre

### 📡 Consumo de API con Axios
- `GET /v1/forecast` — clima actual y pronóstico
- `GET /geocoding-api/v1/search` — búsqueda de ciudades
- Estados de carga (`loading`, `loadingForecast`) y error manejados en Vuex
- Mensajes de error visibles al usuario si falla la conexión

### 🏪 Gestión de estado con Vuex
El store global (`src/store/index.js`) centraliza:
- **`places`** — lista de ciudades
- **`currentWeather`** — objeto indexado por ID con el clima actual de cada ciudad
- **`forecast`** / **`stats`** — pronóstico y estadísticas por ciudad
- **`favorites`** — IDs de favoritos, persistidos en `localStorage`
- **`preferences`** — unidad de temperatura (°C / °F), persistida en `localStorage`
- Flags: `loading`, `loadingForecast`, `error`
- `searchResults` / `searchLoading` para la búsqueda de ciudades

### 📊 Estadísticas semanales (calculadas localmente)
A partir de los datos del pronóstico de 7 días se calcula:
- Temperatura máxima y mínima de la semana
- Promedio de máximas y mínimas
- Precipitación total acumulada (mm)
- Conteo de días por tipo de clima (despejado, nublado, lluvia, tormenta, nieve, niebla)
- Tipo de clima dominante

### 🚨 Alertas meteorológicas automáticas
Reglas basadas en los datos de la semana:
| Condición | Alerta |
|---|---|
| Promedio máximo > 35 °C | 🔥 Ola de calor |
| Mínima < 0 °C | 🥶 Riesgo de heladas |
| Precipitación total > 50 mm | 🌧️ Semana muy lluviosa |
| ≥ 2 días de tormenta | ⛈️ Varios días de tormenta |
| ≥ 2 días de nieve | ❄️ Posibles nevadas |

### ⭐ Favoritos
- Marcar / desmarcar cualquier ciudad como favorita desde la tarjeta o el detalle
- Vista dedicada `/favorites` con acceso rápido
- Persistencia automática en `localStorage`

### 🔍 Búsqueda de ciudades
- Autocompletado con debounce (300 ms) usando la API de geocodificación de Open-Meteo
- Resultados en español
- Añadir nuevas ciudades directamente desde el Home

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Vue 3 (Composition API) |
| Estado | Vuex 4 |
| Routing | Vue Router 4 |
| HTTP | Axios |
| Build | Vite 5 |
| Fuentes | Google Fonts — DM Serif Display + DM Sans |
| API clima | Open-Meteo (gratuita, sin key) |

---

## 📁 Estructura del proyecto

```
weather-app/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── main.css          # Design system global
│   ├── components/
│   │   ├── CityCard.vue      # Tarjeta de ciudad con clima actual
│   │   └── StatCard.vue      # Tarjeta de estadística individual
│   ├── router/
│   │   └── index.js          # Definición de rutas
│   ├── store/
│   │   └── index.js          # Vuex store completo
│   ├── views/
│   │   ├── HomeView.vue      # Lista de ciudades
│   │   ├── DetailView.vue    # Detalle: pronóstico + stats + alertas
│   │   ├── FavoritesView.vue # Ciudades favoritas
│   │   └── SettingsView.vue  # Configuración y preferencias
│   ├── App.vue               # Shell con sidebar / nav
│   └── main.js               # Entry point
├── index.html
├── vite.config.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

MIT — Libre para uso educativo y de portafolio.
