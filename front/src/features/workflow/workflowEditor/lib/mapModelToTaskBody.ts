/**
 * Fills a task's request body from a model, matching by **path** rather than by name.
 *
 * ## Why by path
 *
 * A task component's body shape comes from the target system's swagger; a target model holds the
 * values. The two use the same names for the same things, so most of the body can be filled by
 * simply carrying values across. What cannot be done is matching on the *leaf name alone* — the
 * same name means different things in different places:
 *
 *   targetSecurityGroupList   under a recommended infra  → the security groups to create
 *   targetSecurityGroupList   under a recommendation set → recommendation entries wrapping them
 *   targetSpecList            under a recommended infra  → the specs that were chosen
 *   targetSpec                under a recommendation     → one server's recommended spec
 *   specId                    under a node group         → the spec that node group will use
 *
 * Matching "spec" to "spec" would hand a candidate list to a field expecting the chosen ones. So a
 * value is carried across only when **the whole path agrees**, and the shape agrees with it.
 *
 * ## Why not a list of keys
 *
 * The previous approach named every key in code. It worked, and it kept working — until the other
 * side grew a field. Then nothing failed: the new field simply was not carried, and the workflow
 * was built without it. Silence is the problem this replaces. Here, whatever the body asks for is
 * looked up, and **whatever could not be filled is reported** rather than passed over.
 */

/** A JSON-schema-ish node as it arrives from the task component (`body_params`). */
interface SchemaNode {
  type?: string;
  properties?: Record<string, SchemaNode>;
  items?: SchemaNode;
  required?: string[];
  [key: string]: unknown;
}

export interface MapResult {
  /** The body to send, with everything that could be carried across. */
  body: Record<string, any>;
  /** Paths that were filled from the model. */
  filled: string[];
  /** Paths the body asks for that the model had nothing for. */
  missing: string[];
  /** Of those, the ones the body declares as required — worth telling the user about. */
  missingRequired: string[];
  /** Paths where both sides had a value but the shapes disagreed (array vs object vs plain). */
  mismatched: string[];
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Whether a schema node and a value describe the same kind of thing. */
function shapeAgrees(schema: SchemaNode, value: unknown): boolean {
  const declared = schema?.type;
  if (declared === 'array') return Array.isArray(value);
  if (declared === 'object') return isPlainObject(value);
  if (declared === undefined) {
    // No declared type — infer from what the schema carries.
    if (schema?.items) return Array.isArray(value);
    if (schema?.properties) return isPlainObject(value);
    return true;
  }
  // string / number / boolean / integer
  return !Array.isArray(value) && !isPlainObject(value);
}

/**
 * Walks the body's schema and carries values across from the model at the same path.
 *
 * A path that the model has is taken whole — no descending into it. Its inside is the other
 * system's business, and rebuilding it here is how values get quietly dropped. Descending happens
 * only where the model has nothing at that path but the body asks for something deeper.
 */
function walk(
  schemaProps: Record<string, SchemaNode>,
  requiredHere: string[],
  source: unknown,
  into: Record<string, any>,
  prefix: string,
  result: MapResult,
): void {
  for (const [key, schema] of Object.entries(schemaProps ?? {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    const isRequired = requiredHere.includes(key);
    const value = isPlainObject(source) ? source[key] : undefined;

    if (value !== undefined && value !== null) {
      if (shapeAgrees(schema, value)) {
        into[key] = value;
        result.filled.push(path);
      } else {
        result.mismatched.push(path);
        if (isRequired) result.missingRequired.push(path);
        else result.missing.push(path);
      }
      continue;
    }

    // Nothing at this path. If the body asks for something deeper, look there before giving up —
    // a model may carry the pieces without carrying the container.
    if (schema?.properties) {
      const nested: Record<string, any> = {};
      const before = result.filled.length;
      walk(
        schema.properties,
        schema.required ?? [],
        isPlainObject(source) ? source[key] : undefined,
        nested,
        path,
        result,
      );
      if (result.filled.length > before) {
        into[key] = nested;
        continue;
      }
    }

    result.missing.push(path);
    if (isRequired) result.missingRequired.push(path);
  }
}

/**
 * Fills a body from a model.
 *
 * @param bodyParams the task component's `body_params` (properties + required)
 * @param model      the model with the values, **already unwrapped** (see unwrapModel)
 * @param skeleton   the body the component came with; kept as the starting point so anything the
 *                   schema does not describe is not thrown away
 */
export function mapModelToTaskBody(
  bodyParams: { properties?: Record<string, SchemaNode>; required?: string[] } | undefined,
  model: unknown,
  skeleton: Record<string, any> = {},
): MapResult {
  const result: MapResult = {
    body: { ...skeleton },
    filled: [],
    missing: [],
    missingRequired: [],
    mismatched: [],
  };

  if (!bodyParams?.properties) {
    // No schema to go by. Carrying values across blind would be guessing, so the body is left as
    // it came and the caller is told nothing was filled.
    return result;
  }

  walk(
    bodyParams.properties,
    bodyParams.required ?? [],
    model,
    result.body,
    '',
    result,
  );
  return result;
}

/**
 * Takes the values out of the wrapper a target model keeps them in.
 *
 * A target model holds its values under `cloudInfraModel` (infra) or `targetSoftwareModel`
 * (software), while the body asks for them at the top. The wrapper is the only difference, so
 * removing it lines the two up.
 *
 * `targetSoftwareModel` is also a field *inside* the software body, so it is kept alongside the
 * unwrapped values rather than replaced by them.
 */
export function unwrapModel(targetModel: any): Record<string, any> {
  if (!isPlainObject(targetModel)) return {};

  if (isPlainObject(targetModel.cloudInfraModel)) {
    return { ...targetModel, ...targetModel.cloudInfraModel };
  }
  if (isPlainObject(targetModel.targetSoftwareModel)) {
    return {
      ...targetModel,
      ...targetModel.targetSoftwareModel,
      targetSoftwareModel: targetModel.targetSoftwareModel,
    };
  }
  return { ...targetModel };
}
