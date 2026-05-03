<script setup lang="ts">
defineProps<{ title?: string; accent?: 'cyan' | 'magenta' | 'amber' }>();
</script>

<template>
  <section class="panel" :data-accent="accent ?? 'cyan'">
    <header v-if="title || $slots.header" class="panel__header">
      <span class="panel__orn">✦</span>
      <span class="panel__title"><slot name="header">{{ title }}</slot></span>
      <span class="panel__line" />
      <span class="panel__orn">✦</span>
    </header>
    <div class="panel__body"><slot /></div>
    <footer v-if="$slots.footer" class="panel__footer"><slot name="footer" /></footer>
  </section>
</template>

<style scoped>
.panel {
  position: relative;
  border: 1px solid var(--border-hi);
  background: var(--panel);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* inner rule */
.panel::before {
  content: '';
  position: absolute; inset: 3px;
  border: 1px solid var(--border);
  pointer-events: none;
}

.panel__header {
  display: flex; align-items: center;
  padding: 3px 10px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  border-bottom: 1px solid var(--border);
  background: rgba(0,0,0,0.25);
  user-select: none;
}

.panel__orn { color: var(--border-glow); font-size: 8px; }
.panel__title { padding: 0 10px; }
.panel__line { flex: 1; border-top: 1px solid var(--border); margin: 0 6px; opacity: 0.5; }

.panel__body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 10px;
  overflow: auto;
}
.panel__footer {
  border-top: 1px solid var(--border);
  padding: 5px 10px;
}
</style>
