import {onMounted, onUnmounted} from 'vue';

// export function useEventListener(
//   target: EventTarget,
//   event: string,
//   handler: EventListener,
// ): void {
//   onMounted(() => target.addEventListener(event, handler));
//   onUnmounted(() => target.removeEventListener(event, handler));
// }

export function useEventListener<T extends Event>(
  target: EventTarget,
  event: string,
  handler: (event: T) => void,
): void {
  const listener = (e: Event) => handler(e as T);

  onMounted(() => target.addEventListener(event, listener));

  onUnmounted(() => target.removeEventListener(event, listener));
}
