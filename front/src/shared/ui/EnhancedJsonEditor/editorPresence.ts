import { computed, ref } from 'vue';

/**
 * Is the JSON editor on screen right now?
 *
 * The editor opens over the screen underneath rather than at an address of its
 * own, so the route cannot answer this - on Source Models the address is the
 * list whether the list or the editor is what you are looking at. The help panel
 * needs the answer to lead with the editor when the editor is what is in front
 * of you.
 *
 * A count rather than a flag: a screen may hold more than one editor, and the
 * last one to close is what turns this off.
 */
const openEditors = ref(0);

export const isJsonEditorOpen = computed(() => openEditors.value > 0);

export function registerJsonEditor(): void {
  openEditors.value += 1;
}

export function unregisterJsonEditor(): void {
  openEditors.value = Math.max(0, openEditors.value - 1);
}
