/**
 * Validation rules for source connection fields.
 *
 * These live here rather than inside a component because two screens need the
 * same answers: the interactive form where a user types one connection, and the
 * bulk import where a file supplies many. When the rules were duplicated the two
 * drifted — the import path accepted `999.999.999.999` and any port number.
 */

/** Maximum connections a single source group can hold. */
export const CONNECTION_LIMIT_PER_GROUP = 200;

export const DEFAULT_SSH_PORT = '22';

export interface ConnectionFields {
  name?: string;
  description?: string;
  ip_address?: string;
  ssh_port?: string | number;
  user?: string;
  password?: string;
  private_key?: string;
}

export const isFilled = (value: unknown): boolean =>
  value !== undefined && value !== null && String(value).trim() !== '';

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;

/** Four dotted parts, each 0-255. */
export const isIpValid = (value: unknown): boolean => {
  const raw = String(value ?? '').trim();
  if (!IPV4.test(raw)) return false;
  return raw.split('.').every(octet => Number(octet) <= 255);
};

/**
 * Whole number in 1-65535. The earlier condition rejected the valid 65535 while
 * letting decimals and stray text through.
 */
export const isPortValid = (value: unknown): boolean => {
  const raw = String(value ?? '').trim();
  if (!/^\d+$/.test(raw)) return false;
  const port = Number(raw);
  return port >= 1 && port <= 65535;
};

/**
 * A user plus at least one of password or private key. Supplying both is fine —
 * the connected system picks whichever method works.
 */
export const hasValidCredentials = (fields: ConnectionFields): boolean =>
  isFilled(fields.user) &&
  (isFilled(fields.password) || isFilled(fields.private_key));

export const CREDENTIAL_HINT = 'Enter User + Password or User + Private Key.';

/**
 * Whether one row of a connection form is ready to be saved.
 *
 * `existing` marks a row for a connection that is already registered. Such a row
 * opens with empty inputs and only what the user typed is sent, so a blank field
 * means "keep the stored value" rather than a missing one.
 *
 * The screens ask this about every row they hold instead of collecting answers
 * the row forms report. Collecting them needed a per-row key, and a duplicated
 * key silently blocked saving.
 */
export const isConnectionRowValid = (
  fields: ConnectionFields,
  { existing = false }: { existing?: boolean } = {},
): boolean => {
  if (existing) {
    return (
      (!isFilled(fields.ip_address) || isIpValid(fields.ip_address)) &&
      (!isFilled(fields.ssh_port) || isPortValid(fields.ssh_port))
    );
  }
  return (
    isFilled(fields.name) &&
    isIpValid(fields.ip_address) &&
    isPortValid(fields.ssh_port) &&
    hasValidCredentials(fields)
  );
};

/**
 * Every problem with one connection, rather than the first one found, so a user
 * fixing an imported file sees the whole picture at once.
 */
export const validateConnection = (fields: ConnectionFields): string[] => {
  const errors: string[] = [];

  if (!isFilled(fields.name)) {
    errors.push('Name is required.');
  }
  if (!isFilled(fields.ip_address)) {
    errors.push('IP address is required.');
  } else if (!isIpValid(fields.ip_address)) {
    errors.push('Invalid IP address. Each part must be 255 or less.');
  }
  // An empty port is fine; it falls back to the default.
  if (isFilled(fields.ssh_port) && !isPortValid(fields.ssh_port)) {
    errors.push('Port must be a whole number between 1 and 65535.');
  }
  if (!isFilled(fields.user)) {
    errors.push('User is required.');
  }
  if (!isFilled(fields.password) && !isFilled(fields.private_key)) {
    errors.push('Either a password or a private key is required.');
  }

  return errors;
};

/**
 * Indexes of rows whose name repeats within the same file.
 *
 * Comparison ignores case because the connected system's uniqueness constraint
 * does too — `WEB-01` and `web-01` collide there, so catching it here saves a
 * round trip that would fail with a message pointing at neither row.
 */
export const findDuplicateNameIndexes = (
  rows: ConnectionFields[],
): Set<number> => {
  const seen = new Map<string, number>();
  const duplicates = new Set<number>();

  rows.forEach((row, index) => {
    const key = String(row.name ?? '')
      .trim()
      .toLowerCase();
    if (!key) return;

    const first = seen.get(key);
    if (first === undefined) {
      seen.set(key, index);
      return;
    }
    duplicates.add(first);
    duplicates.add(index);
  });

  return duplicates;
};
