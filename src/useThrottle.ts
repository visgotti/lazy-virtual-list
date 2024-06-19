import { ref } from 'vue';

export function useThrottle(fn: Function, delay: number) {
  const lastCalled = ref(0);

  function throttle(func: Function, wait: number) {
    const now = Date.now();
    if (now - lastCalled.value >= wait) {
      lastCalled.value = now;
      func();
    }
  }
  const throttledFn = (...args: any[]) => throttle(() => fn(...args), delay);
  return throttledFn;
}