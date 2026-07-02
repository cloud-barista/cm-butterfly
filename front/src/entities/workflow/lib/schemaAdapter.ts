/**
 * Backend schema adapter (cm-cicada Type/Spec migration).
 *
 * cm-cicada refactored task components and workflow tasks to a Type/Spec schema:
 *   task_component: { id, name, description, type, spec, is_example, ... }
 *   workflow task:  { name, task_component, spec, dependencies }
 *
 * where `type` is one of http | http_xcom | bash | ssh | trigger_workflow and
 * `spec` is a type-specific map (see cm-cicada conf/task_types.yaml).
 *
 * The existing designer/editor code is built around the previous
 * "data.options + path_params/query_params/body_params" shape. The helpers here
 * translate between the two so the designer keeps working for http tasks and the
 * new task types are supported by dedicated editors.
 */

export type TaskType =
  | 'http'
  | 'http_xcom'
  | 'bash'
  | 'ssh'
  | 'trigger_workflow';

/** Non-http task types that need dedicated editors. */
export const CUSTOM_EDITOR_TASK_TYPES: TaskType[] = [
  'http_xcom',
  'bash',
  'ssh',
  'trigger_workflow',
];

/**
 * Build the default legacy `options.request_body` string (parsed later into
 * step.properties.model) for a component of the given type.
 */
function defaultComponentModelString(type: string, spec: any): string {
  switch (type) {
    case 'bash':
      return JSON.stringify({ bash_command: spec.bash_command ?? '' });
    case 'ssh':
      return JSON.stringify({ command: spec.command ?? '' });
    case 'trigger_workflow':
      return JSON.stringify({ conf: spec.conf ?? {} });
    case 'http_xcom':
      return JSON.stringify({
        request_body: spec.request_body ?? '',
        response_path: spec.response_path ?? '',
      });
    case 'http':
    default:
      return spec.request_body && spec.request_body !== ''
        ? spec.request_body
        : '{}';
  }
}

/**
 * Convert a raw cm-cicada task component into the legacy shape the designer
 * consumes. Mutates in place and is idempotent (already-legacy objects are left
 * untouched). Keeps `type` and `spec` on the object for the per-type editors.
 */
export function normalizeTaskComponentInPlace(tc: any): any {
  if (!tc || (tc.data && tc.data.options)) return tc; // already legacy shape
  const spec = tc.spec ?? {};
  const type: string = tc.type ?? 'http';

  tc.type = type;
  tc.spec = spec;
  tc.data = {
    options: {
      api_connection_id: spec.api_connection_id ?? '',
      endpoint: spec.endpoint ?? '',
      method: spec.method ?? '',
      request_body: defaultComponentModelString(type, spec),
      path_params: {},
    },
    body_params: spec.body_params_schema ?? undefined,
    path_params: { properties: spec.path_params_schema ?? null },
    query_params: { properties: spec.query_params_schema ?? null },
  };
  return tc;
}

/** Normalize a task component list in place (idempotent). */
export function normalizeTaskComponentList<T = any>(list: T[]): T[] {
  if (Array.isArray(list)) list.forEach(normalizeTaskComponentInPlace);
  return list;
}

/**
 * Ensure a workflow/template task carries the legacy fields the http flow reads
 * (`request_body`, `path_params`, `query_params`) and a resolved `type`, derived
 * from its `spec`. Mutates in place, idempotent.
 */
export function normalizeWorkflowTaskInPlace(
  task: any,
  taskComponentList: any[],
): any {
  if (!task) return task;
  // Idempotent: skip if already normalized (type resolved + legacy fields present).
  if (task.type !== undefined && task.request_body !== undefined) return task;
  const component = (taskComponentList || []).find(
    c => c.name === task.task_component,
  );
  // `spec` may be absent for tasks with no task-level overrides (e.g. a GET http
  // task, or a task whose fields live only on the component). Treat as empty.
  const spec = task.spec ?? {};
  task.spec = spec;
  if (task.type === undefined) task.type = component?.type ?? 'http';
  if (task.request_body === undefined) task.request_body = spec.request_body ?? '';
  if (task.path_params === undefined) task.path_params = spec.path_params;
  if (task.query_params === undefined) task.query_params = spec.query_params;
  return task;
}

/**
 * Build a designer step `model` from a loaded task's spec for non-http types.
 * Returns null for http (the caller keeps using the request_body flow).
 */
export function buildStepModelFromTaskSpec(
  type: string,
  taskSpec: any,
  component: any,
): any | null {
  const spec = taskSpec ?? {};
  const compSpec = component?.spec ?? {};
  switch (type) {
    case 'bash':
      return { bash_command: spec.bash_command ?? compSpec.bash_command ?? '' };
    case 'ssh':
      return { command: spec.command ?? compSpec.command ?? '' };
    case 'trigger_workflow':
      return { conf: spec.conf ?? {} };
    case 'http_xcom':
      return {
        request_body: spec.request_body ?? compSpec.request_body ?? '',
        response_path: spec.response_path ?? compSpec.response_path ?? '',
      };
    case 'http':
    default:
      return null;
  }
}

/**
 * Build the cm-cicada task `spec` (task-level fields only; component-level
 * fields like api_connection_id/ssh_conn_id/trigger_dag_id are resolved from the
 * task component) from a designer step's model/fixedModel for the given type.
 */
export function buildTaskSpecFromStep(
  type: string,
  model: any,
  fixedModel: any,
): Record<string, any> {
  const m = model ?? {};
  switch (type) {
    case 'bash':
      return { bash_command: m.bash_command ?? '' };
    case 'ssh':
      return { command: m.command ?? '' };
    case 'trigger_workflow':
      return { conf: m.conf ?? {} };
    case 'http_xcom': {
      const spec: Record<string, any> = { request_body: m.request_body ?? '' };
      if (m.response_path) spec.response_path = m.response_path;
      return spec;
    }
    case 'http':
    default:
      return {
        request_body: JSON.stringify(m),
        path_params: fixedModel?.path_params ?? {},
        query_params: fixedModel?.query_params ?? {},
      };
  }
}
