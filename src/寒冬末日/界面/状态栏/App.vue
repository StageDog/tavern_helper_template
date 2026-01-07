<template>
  <main id="eden-main-container">
    <WorldSection />
    <StorySection :raw="raw" />
    <ShelterSection />
    <MissionSection />
    <CharactersSection />
    <OtherResidentsSection />
    <ChoicesSection :options="options" />
  </main>
</template>

<script setup lang="ts">
import CharactersSection from './components/CharactersSection.vue';
import ChoicesSection from './components/ChoicesSection.vue';
import MissionSection from './components/MissionSection.vue';
import OtherResidentsSection from './components/OtherResidentsSection.vue';
import ShelterSection from './components/ShelterSection.vue';
import StorySection from './components/StorySection.vue';
import WorldSection from './components/WorldSection.vue';
import { useInjectedData } from './useInjectedData';

const { raw, options } = useInjectedData();

watchDebounced(
  () => [raw.value, options.value.join('\n')],
  () => {
    window.dispatchEvent(new Event('resize'));
  },
  { debounce: 200 },
);
</script>
