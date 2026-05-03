<script setup lang="ts">
import TopBar from '@/components/layout/TopBar.vue';
import SideMenu from '@/components/layout/SideMenu.vue';
import HeroBar from '@/components/layout/HeroBar.vue';
import GameScreen from '@/components/layout/GameScreen.vue';
import PartyConfig from '@/components/layout/PartyConfig.vue';
import DungeonPanel from '@/components/layout/DungeonPanel.vue';
import Inventory from '@/components/layout/Inventory.vue';
import NeonPanel from '@/components/ui/NeonPanel.vue';
import OptionsMenu from '@/components/layout/OptionsMenu.vue';
</script>

<template>
  <div class="app">
    <TopBar />
    <OptionsMenu />

    <main class="grid">
      <!-- Left: game screen with side menu + hero bar -->
      <NeonPanel class="cell game" title="Game Screen" accent="cyan">
        <div class="gameInner">
          <SideMenu />
          <div class="gameMain">
            <HeroBar />
            <GameScreen />
          </div>
        </div>
      </NeonPanel>

      <!-- Middle top: party config -->
      <NeonPanel class="cell party" title="Party Config" accent="magenta">
        <PartyConfig />
      </NeonPanel>

      <!-- Right top: dungeon -->
      <NeonPanel class="cell dungeon" title="Dungeon" accent="amber">
        <DungeonPanel />
      </NeonPanel>

      <!-- Bottom right: vault (spans middle + right cols) -->
      <NeonPanel class="cell vault" title="Party Vault" accent="cyan">
        <Inventory />
      </NeonPanel>
    </main>
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 8px;
}
.grid {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 8px;
  min-height: 0;
}
.cell { min-height: 0; min-width: 0; }
.game     { grid-column: 1 / 2; grid-row: 1 / 3; }
.party    { grid-column: 2 / 3; grid-row: 1 / 2; }
.dungeon  { grid-column: 3 / 4; grid-row: 1 / 2; }
.vault    { grid-column: 2 / 4; grid-row: 2 / 3; }

.gameInner { display: flex; height: 100%; min-height: 0; }
.gameMain  { display: flex; flex-direction: column; flex: 1; min-width: 0; min-height: 0; }
</style>

