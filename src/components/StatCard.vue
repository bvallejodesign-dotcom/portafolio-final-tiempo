<template>
  <div class="stat-card">
    <span class="stat-icon">{{ icon }}</span>
    <div>
      <p class="stat-value" :style="{ color }">{{ value }}</p>
      <p class="stat-label">{{ label }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({ icon: String, label: String, value: [String, Number], color: String })
</script>

<style scoped>
.stat-card {
  display: flex; align-items: center; gap: 12px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 14px 16px;
  transition: background .15s;
}
.stat-card:hover { background: var(--surface-2); }
.stat-icon  { font-size: 1.4rem; }
.stat-value { font-family: var(--font-display); font-size: 1.3rem; line-height: 1.2; }
.stat-label { font-size: .75rem; color: var(--fog); margin-top: 2px; }
</style>
