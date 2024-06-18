<template>
  <div class="scroll-outer" ref="scrollOuter" :style="scrollOuterStyleObject">
    <div
      class="scroll-inner"
      ref="scrollInner"
      :style="scrollInnerStyleObject"
    >
      <template v-if="autoDetectSizes">
        <div v-for="(item, index) in finalArray" :key="index" class="list-item" :ref="(e) => setItemRef(index, e as HTMLElement)">
          <slot name="default" v-if="item" :item="item" :index="startIndex + index"></slot>
          <slot name="loading" v-else :index="startIndex + index"></slot>
        </div>
      </template>
      <template v-else>
        <div v-for="(item, index) in finalArray" :key="index" class="list-item">
          <slot name="default" v-if="item" :item="item" :index="startIndex + index"></slot>
          <slot name="loading" v-else :index="startIndex + index"></slot>
        </div>
      </template>
     
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Dataset } from '../types';
import { resolveIndexes, fillItemArray } from '../calcs';
import { computed, ref, watch, defineProps, defineEmits, onMounted, onUnmounted, nextTick, toRefs } from 'vue';
import type { PropType, Ref } from 'vue';
import { useDebounceFn } from '../useDebounce';

const totalLength = ref(0);
const scrollLength = ref(0);
const scrollMargin = ref(0);
const startIndex = ref(0);
const endIndex = ref(0);
const scrollOuter: Ref<HTMLDivElement> = ref<HTMLDivElement>() as Ref<HTMLDivElement>;
const scrollInner: Ref<HTMLDivElement> = ref<HTMLDivElement>() as Ref<HTMLDivElement>;

const props = defineProps({
  scrollStart: {
    type: Number,
    default: 0,
  },
  scrollDebounce: {
    type: Number,
    default: 50,
  },
  direction: {
    type: String,
    default: 'column',
  },
  sortDatasets: {
    type: Boolean,
    default: true,
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
    type: Object as () => { [rowIndex: string]: number },
    default: null,
  },
  autoDetectSizes: {
    type: Boolean,
    default: false,
  },
});


const { dynamicSizes, autoDetectSizes, direction, totalItems } = toRefs(props);
const clientLengthProp = computed(() => direction.value === 'column' ? 'clientHeight' : 'clientWidth');
const lengthProp = computed(() => direction.value === 'column' ? 'height' : 'width');
const scrollProp = computed(() => direction.value === 'column' ? 'scrollTop' : 'scrollLeft');
const marginProp = computed(() => direction.value === 'column' ? 'marginTop' : 'marginLeft');
const internalDynamicSizes = ref<{ [key: number]: number }>({});

if(dynamicSizes.value && autoDetectSizes.value) {
  internalDynamicSizes.value = {
    ...dynamicSizes.value,
  }
}
const dynamicSizesRef = computed(() => {
  return autoDetectSizes.value ? internalDynamicSizes.value : dynamicSizes.value;
});

watch([dynamicSizesRef, totalItems], () => {
  handleScroll();
}, { deep: true });

const orderedDatasets = computed(() => {
  if (!props.sortDatasets) {
    return props.data;
  } else {
    return [...props.data].sort((a, b) => a.startingIndex - b.startingIndex);
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
  if (!scrollOuter.value) return;
  const resolved = resolveIndexes({
    scrollTop: scrollOuter.value[scrollProp.value],
    viewHeight: scrollOuter.value[clientLengthProp.value],
    ...props,
    dynamicSizes: dynamicSizesRef.value,
  });

  totalLength.value = resolved.totalItemHeight;
  scrollMargin.value = scrollOuter.value[scrollProp.value] - resolved.scrollTopPadding;
  scrollLength.value = totalLength.value - scrollMargin.value;

  if (resolved.startIndex !== startIndex.value || resolved.endIndex !== endIndex.value) {
    startIndex.value = resolved.startIndex;
    endIndex.value = resolved.endIndex;
    emit('load', {
      startIndex: startIndex.value,
      endIndex: endIndex.value,
    });
  }
};

const onScrollDebounced = useDebounceFn(handleScroll, props.scrollDebounce);

const emit = defineEmits<{
  (e: 'scroll', value: number): void;
  (e: 'load', value: { startIndex: number; endIndex: number }): void;
}>();

onMounted(() => {
  window.addEventListener('scroll', onScrollDebounced);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScrollDebounced);
});

watch(scrollOuter, (v) => {
  if (!v) {
    return;
  }
  scrollOuter.value.onscroll = () => {
    onScrollDebounced();
    emit('scroll', scrollOuter.value[scrollProp.value])
  };
  nextTick(() => {
    if(!scrollOuter.value) { return; }
    scrollOuter.value[scrollProp.value] = props.scrollStart;
    handleScroll();
  });
});

const scrollOuterStyleObject = computed(() => {
  return {
    [`max-${lengthProp.value}`]: '100%',
    [`min-${lengthProp.value}`]: '100%',
  }
});

const scrollInnerStyleObject = computed(() => {
  return {
    ['flex-direction']: direction.value,
    [lengthProp.value]: `${scrollLength.value}px`,
    [`max-${lengthProp.value}`]: `${scrollLength.value}px`,
    [`min-${lengthProp.value}`]: `${scrollLength.value}px`,
    [`${marginProp.value}`]: `${scrollMargin.value}px`,
  }
});

const setItemRef = (index: number, el: HTMLElement) => {
  if (el && autoDetectSizes.value) {
    const startedIdx = startIndex.value;
    nextTick(() => {
      const length = el.getBoundingClientRect()[lengthProp.value];
      if(length !== props.itemSize) {
        internalDynamicSizes.value[startedIdx + index] = length;
      }
    })
  }
};
</script>

<style lang="scss">
.scroll-outer {
  display: inline-block;
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
