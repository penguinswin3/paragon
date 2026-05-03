<script setup lang="ts">
const props = defineProps<{
  value: number;
  max: number;
  color?: string;
  label?: string;
  height?: number;
}>();
</script>

<template>
  <div class="bar" :style="{ height: (height ?? 10) + 'px' }">
    <div class="bar__fill"
         :style="{
           width: Math.max(0, Math.min(100, (value / Math.max(1,max)) * 100)) + '%',
           background: color ?? 'var(--neon)'
         }" />
    <span v-if="label" class="bar__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.bar {
  position: relative;
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  overflow: hidden;
}
.bar__fill {
  height: 100%;
  transition: width 200ms ease-out;
}
.bar__label {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px;
  font-family: 'Cinzel', Georgia, serif;
  color: var(--fg);
  text-shadow: 0 0 4px #000, 0 0 8px #000;
  letter-spacing: 0.08em;
}
</style>
