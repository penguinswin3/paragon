import { defineStore } from 'pinia';
import { ref } from 'vue';

export type GameView = 'quest' | 'gear' | 'talents' | 'dungeon';

export const useGameStore = defineStore('game', () => {
  const view = ref<GameView>('quest');
  const resources = ref({ gold: 87, silver: 37, copper: 14 });
  const optionsOpen = ref(false);

  function setView(v: GameView) { view.value = v; }
  function addGold(amount: number) {
    let copper = resources.value.copper + amount;
    let silver = resources.value.silver + Math.floor(copper / 100);
    copper = copper % 100;
    let gold = resources.value.gold + Math.floor(silver / 100);
    silver = silver % 100;
    resources.value = { gold, silver, copper };
  }

  return { view, resources, optionsOpen, setView, addGold };
});

