<template>
  <div class="scroll-outer"
    ref="scrollOuter"
  >
    <div
      class="scroll-inner"
      ref="scrollInner"
      :style="{
        'flex-direction': direction,
        'height': `${scrollHeight}px`,
        'max-height': `${scrollHeight}px`,
        'min-height': `${scrollHeight}px`,
        'margin-top': `${scrollMarginTop}px`,
      }"
    >
      <div v-for="(item, index) in finalArray" :key="index" class="list-item">
        <slot name="default" v-if="item" :item="item" :index="startIndex + index"></slot>
        <slot name="loading" v-else :index="startIndex + index"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

import type { Dataset } from '../types';
import { resolveIndexes, fillItemArray } from '../calcs';
import { computed, ref, watch, defineProps, defineEmits, onMounted, onUnmounted, nextTick  } from 'vue';


const totalHeight = ref(0);
const scrollHeight = ref(0);
const scrollMarginTop = ref(0);
const startIndex = ref(0);
const endIndex = ref(0);
const scrollOuter : Ref<HTMLDivElement> = ref<HTMLDivElement>() as Ref<HTMLDivElement>;
const scrollInner : Ref<HTMLDivElement> = ref<HTMLDivElement>() as Ref<HTMLDivElement>;

import type { PropType, Ref } from "vue";
import { useDebounceFn } from '../useDebounce';

onMounted(() => {
  window.addEventListener("scroll", onScroll);
});
onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
watch(scrollOuter, (v) => {
  if(!v) { return; }
  scrollOuter.value.onscroll = onScroll;
  nextTick(() => {
    scrollOuter.value.scrollTop = props.startingScrollTop;
    handleScroll();
  });
})

const props = defineProps({
  startingScrollTop: {
    type: Number,
    default: 0,
  },
  scrollDebounce: {
    type: Number,
    default: 50,
  },
  direction: {
    type: String,
    default: "column"
  },
  sortDatasets: {
    type: Boolean,
    default: true
  },
  data: {
    type: Array as PropType<Dataset[]>,
    required: true,
  },
  itemBuffer: {
    type: Number,
    default: 3,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  itemSize: {
    type: Number,
    required: true,
  },
  dynamicSizes: {
    type: Object as () => {[rowIndex: string]: number },
    required: false,
  }
});


watch(props.dynamicSizes, () => {
  handleScroll();
}, { deep: true });

const orderedDatasets = computed(() => {
  if(!props.sortDatasets) {
    return props.data;
  } else {
    return ([...props.data]).sort((a, b) => a.startingIndex - b.startingIndex);
  }
});

const finalArray = computed(() => {
  return fillItemArray({
    orderedDatasets: orderedDatasets.value,
    startIndex: startIndex.value,
    endIndex: endIndex.value,
  });
});

const handleScroll = (e?: any) => {
  if(!scrollOuter.value) return;
  const resolved = resolveIndexes({
      scrollTop: scrollOuter.value.scrollTop,
      viewHeight: scrollOuter.value.clientHeight,
      ...props,
  });
  totalHeight.value = resolved.totalItemHeight;
  // beforeScrollOffset.value = scrollOuter.value.scrollTop + resolved.startOverflow;
//  scrollMarginTop.value = beforeScrollOffset.value - (resolved.startOverflow);
  scrollMarginTop.value = Math.max(0,  scrollOuter.value.scrollTop - scrollOuter.value.clientHeight / 2 )
  scrollHeight.value = totalHeight.value - scrollMarginTop.value;
  //TODO:
  // if we do + resolved.startOverflow it seems to work if we're scrolling in the middle
  // but without resolved.startOverflow it is correct at top and bottom
  scrollMarginTop.value += ((resolved.startVisibleIndex - resolved.startIndex) * props.itemSize) + resolved.startOverflow;

  if(resolved.startIndex - resolved.startVisibleIndex === props.itemBuffer) {
   // scrollMarginTop.value += ((resolved.startVisibleIndex - resolved.startIndex) * props.itemSize) + resolved.startOverflow
  } else {
   // scrollMarginTop.value += ((resolved.startVisibleIndex - resolved.startIndex) * props.itemSize);
  }
  console.log('scroll margin became', scrollMarginTop.value)
  if(resolved.startIndex !== startIndex.value || resolved.endIndex !== endIndex.value) {
    startIndex.value = resolved.startIndex;
    endIndex.value = resolved.endIndex;
    emit("load", { 
      startIndex: startIndex.value, 
      endIndex: endIndex.value
    });
  }
};

const onScroll = useDebounceFn(handleScroll, props.scrollDebounce);

const emit = defineEmits<{
  (e: "load", value: { startIndex: number, endIndex: number }): void;
}>();
</script>
<style lang="scss">
  .scroll-outer {
    display: inline-block;
    max-height: 100%;
    height: 100%;
    height: 100%;
    overflow: auto;
  }
  .scroll-inner {
    overflow: hidden;
    display: flex;
  }
  .list-item {
    display: inline-block;
  }

</style>
