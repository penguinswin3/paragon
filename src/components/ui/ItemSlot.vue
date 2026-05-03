<script setup lang="ts">
import type { Item } from '@/types/types';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  item?: Item | null;
  qty?: number;
  empty?: string;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
}>();

defineEmits<{ (e: 'click', item: Item | null | undefined): void }>();

const rarityClass = computed(() => props.item ? `r-${props.item.rarity}` : 'dim');
const spriteError = ref(false);
const spriteSrc = computed(() =>
  props.item ? `/sprites/items/${props.item.id}.png` : null
);

watch(() => props.item?.id, () => { spriteError.value = false; });
</script>

<template>
  <button
    class="slot"
    :class="[size ?? 'md', { selected, filled: !!item }]"
    :title="item ? `${item.name}${item.description ? ' — ' + item.description : ''}` : ''"
    @click="$emit('click', item)"
  >
    <template v-if="item">
      <template v-if="spriteSrc && !spriteError">
        <img class="slot__sprite" :src="spriteSrc" :alt="item.name" @error="spriteError = true" />
        <img class="slot__border" src="/sprites/ui/item_border.png" alt="" aria-hidden="true" />
      </template>
      <span v-else class="slot__glyph" :class="rarityClass">{{ item.glyph }}</span>
    </template>
    <span v-else class="slot__empty">{{ empty ?? '·' }}</span>
    <span v-if="qty && qty > 1" class="slot__qty">{{ qty }}</span>
  </button>
</template>

<style scoped>
.slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: var(--bg-2);
  border: 1px solid var(--border-hi);
  color: var(--fg);
  padding: 0;
  cursor: pointer;
  overflow: hidden;
}
.slot.sm { width: 28px;  height: 28px;  font-size: 16px; }
.slot.md { width: 40px;  height: 40px;  font-size: 22px; }
.slot.lg { width: 56px;  height: 56px;  font-size: 30px; }

.slot:hover    { border-color: var(--gold); }
.slot.selected { border-color: var(--gold); }
.slot.filled   { background: var(--panel); }

/* Item sprite — fills the slot, pixel-crisp */
.slot__sprite {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

/* Border frame overlaid above the sprite */
.slot__border {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.slot__empty { color: var(--fg-dim); font-size: 13px; }
.slot__qty {
  position: absolute; bottom: 1px; right: 3px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 9px; color: var(--gold);
  z-index: 1;
  text-shadow: 0 0 3px #000;
}
</style>
