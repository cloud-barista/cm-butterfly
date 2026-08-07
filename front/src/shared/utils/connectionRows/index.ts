/**
 * Row identity for the source connection screens.
 *
 * Both screens (register during source service creation, add/edit from the
 * connection tab) render a list of connection rows and have to tell them apart:
 * for the `v-for` key, and for the per-row validity the save button reads. A row
 * has no server id until it is saved, so the screen hands out a local one.
 *
 * The counter sits at module scope on purpose. Row lists live in the store and
 * survive the dialog closing, while a counter declared inside the component
 * restarts at 0 every time the dialog opens — it then handed out an id that a
 * surviving row already held. Two rows sharing one id meant one shared validity
 * entry, and the save button stopped opening from the third connection onward.
 */
let rowSequence = 0;

/**
 * A local row id. Always a non-empty string, so a falsy check (`!id`, `a || b`)
 * cannot mistake it for "no id" the way `0` was mistaken.
 */
export const newConnectionRowId = (): string => `row-${++rowSequence}`;

/** Key a row by its local id, falling back to the server id. */
export const connectionRowKey = (row: any): string =>
  String(row?._id ?? row?.id ?? '');
