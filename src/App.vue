<template>
  <div>
    <h1>Lazy Virtual List Example</h1>

    <div class="wrapper">

    <LazyVirtualList
      class="test"
      @load="handleLoad"
      :data="datasets"
      :totalItems="totalItems"
      :itemSize="50"
      :itemBuffer="3"
      :startingScrollTop="1000"
    >
      <template #default="{ item, index }">
        <div class="item">
          {{ index }}: {{ item }}
        </div>
      </template>
      <template #loading="{ index }">
        <div class="item loading">
          Loading item {{ index }}...
        </div>
      </template>
    </LazyVirtualList>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import LazyVirtualList from './components/lazy-virtual-list.vue'; // Update with the correct path
import type { Dataset } from './types';

function generateMockDatasets(totalItems: number, itemsPerDataset: number): Dataset[] {
  const datasets: Dataset[] = [];
  
  for (let i = 0; i < totalItems; i += itemsPerDataset) {
    const data = Array.from({ length: itemsPerDataset }, (_, j) => `Item ${i + j}`);
    datasets.push({
      startingIndex: i,
      data,
    });
  }
  return datasets;
}
export default defineComponent({
  name: 'App',
  components: {
    LazyVirtualList,
  },
  setup() {
    const datasets = ref(generateMockDatasets(200, 10));
    const totalItems = ref(300);
    function handleLoad(v: any) {
      console.log('handleLoad', v)
    }
    return {
      handleLoad,
      datasets,
      totalItems,
    };
  },
});
</script>

<style lang="scss">
.test {
  height: 100%;
  min-height: 100%;
  width: 100%;
  align-items: center;
}
.wrapper {
  background-color: #999;
  min-width: 500px;
  width: 500px;
  height: 600px;
  max-width: 500px;
  max-height: 600px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  > div {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.item {
  &:hover {
    background-color: rgb(193, 192, 192);
    cursor: pointer;
  }
  padding: 0px;
  margin: 0px;
  display: flex;
  height: 50px;
  max-height: 50px;
  min-height: 50px;
}

.item.loading {
  &:hover {
    background-color: rgb(193, 192, 192);
    cursor: pointer;
  }
  background-color: #f0f0f0;
  color: #999;
}
</style>
