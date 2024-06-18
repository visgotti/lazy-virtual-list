<template>
  <div>
    <h1>Lazy Virtual List Example</h1>

    <div class="wrapper">

    <LazyVirtualList
      class="test"
      @load="handleLoad"
      :data="formattedDatasets"
      :totalItems="totalItems"
      :itemSize="50"
      :dynamicSizes="openItems"
      :itemBuffer="3"
      :scrollDebounce="500"
    >
      <template #default="{ item, index }">
        <div class="item" :class="{'expanded': index in openItems}">
          {{ index }}: {{ item.name }}
          <span v-if="item.isExpanded" @click="handleToggleExpand(index)">▲</span>
          <span v-else @click="handleToggleExpand(index)">▼</span>
          <div v-if="item.isExpanded"
            :style="{
              height: `${openItems[index]}px`,
              minHeight:  `${openItems[index]}px`,
            }"
          ></div>
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
import { ref, computed, Ref } from 'vue';
import LazyVirtualList from './components/lazy-virtual-list.vue'; 
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

export default {
  name: 'App',
  components: {
    LazyVirtualList,
  },
  setup() {
    const expandedItemHeight = 500;
    const datasets = ref(generateMockDatasets(200, 10));

    const formattedDatasets = computed(() => {
      return datasets.value.map((d: any) => {
        return {
          startingIndex: d.startingIndex,
          data: d.data.map((item: string, i: number) => {
            return {
              name: item,
              isExpanded: (d.startingIndex + i) in openItems.value
            }
          })
        }
     });
    });
    const openItems : Ref<{[itemIndex: string]: number }> = ref({});
    const handleToggleExpand = (index: number) => {
      if(index in openItems.value) {
        delete openItems.value[index];
      } else {
        openItems.value[index] = expandedItemHeight;
      }
      openItems.value = { ...openItems.value };
    }
    const totalItems = ref(300);
    function handleLoad(v: any) {
      console.log('handleLoad', v)
    }
    const actualLen = formattedDatasets.value.map((d: any) => d.data).flat();
    console.log('actu', actualLen.length)
    return {
      handleToggleExpand,
      openItems,
      handleLoad,
      formattedDatasets,
      totalItems,
    };
  },
};
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
  &.expanded {
    background-color: red;
    &:hover {
      background-color: darken(red, 15%);
    }
  }
  &:hover {
    background-color: rgb(193, 192, 192);
    cursor: pointer;
  }
  min-height: 50px;

  &:not(.expanded) {
    height: 50px;
    max-height: 50px;
  }

  padding: 0px;
  margin: 0px;
  display: flex;

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
