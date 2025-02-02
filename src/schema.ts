import types, { ObjectType } from './types';
import { BaseSchema, TimestampSchema, VALIDATION_ACTIONS, VALIDATION_LEVEL } from './utils';

interface SchemaOptions<TProperties, TDefaults extends Partial<TProperties>> {
  defaults?: TDefaults;
  timestamps?: boolean;
  validationAction?: VALIDATION_ACTIONS;
  validationLevel?: VALIDATION_LEVEL;
}

type TimestampsOptions = Required<Pick<SchemaOptions<unknown, any>, 'timestamps'>>;

export type SchemaType<TProperties, TOptions extends SchemaOptions<unknown, any>> =
  TOptions extends TimestampsOptions
    ? ObjectType<BaseSchema & TProperties & TimestampSchema>
    : ObjectType<BaseSchema & TProperties>;

// This removes the artificial `$required` attributes added in the object schemas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitize(value: any): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  if ('$required' in value) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete value.$required;
  }

  for (const key of Object.keys(value)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    sanitize(value[key]);
  }
}

/**
 * @module intro
 * @description
 *
 * A schema is what defines a Model and the validation performed on the collection associated with the Model.
 */

/**
 * Creates a schema for a model and define validation options for it.
 *
 * Read more about the validation [options](https://docs.mongodb.com/manual/core/schema-validation/index.html#behavior)
 * in the MongoDB docs.
 *
 * Under the hood it is just a wrapper around the [`object`](api/types.md#object) type with some default properties
 * (e.g. `_id` and timestamps properties).
 *
 * @name schema
 *
 * @param properties {Record<string, unknown>}
 * @param [options] {SchemaOptions}
 * @param [options.defaults] {Partial<TProperties>}
 * @param [options.timestamps=false] {boolean}
 * @param [options.validationAction=VALIDATION_ACTION.ERROR] {VALIDATION_ACTION}
 * @param [options.validationLevel=VALIDATION_LEVEL.STRICT] {VALIDATION_LEVEL}
 *
 * @returns {TSchema}
 *
 * @example
 * import { schema, types } from 'papr';
 *
 * const userSchema = schema({
 *   active: types.boolean(),
 *   age: types.number(),
 *   firstName: types.string({ required: true }),
 *   lastName: types.string({ required: true }),
 * });
 *
 * const orderSchema = schema({
 *   user: types.objectId(),
 *   product: types.string()
 * }, {
 *   defaults: { product: 'test' },
 *   timestamps: true,
 *   validationAction: VALIDATION_ACTION.WARN,
 *   validationLevel: VALIDATION_LEVEL.MODERATE
 * });
 */
export default function schema<
  TProperties extends Record<string, unknown>,
  TDefaults extends Partial<TProperties>,
  TOptions extends SchemaOptions<TProperties, TDefaults>
>(properties: TProperties, options?: TOptions): [SchemaType<TProperties, TOptions>, TDefaults] {
  const {
    defaults,
    timestamps = false,
    validationAction = VALIDATION_ACTIONS.ERROR,
    validationLevel = VALIDATION_LEVEL.STRICT,
  } = options || {};

  const value = types.object(
    {
      _id: types.objectId({ required: true }),
      ...properties,
      ...(timestamps && {
        createdAt: types.date({ required: true }),
        updatedAt: types.date({ required: true }),
      }),
      // Support for legacy data generated by Mongoose
      __v: types.number(),
    },
    { required: true }
  );

  sanitize(value);

  if (defaults) {
    // @ts-expect-error We're defining these defaults now and removing them later in `updateSchema()`
    value.$defaults = defaults;
  }
  // @ts-expect-error We're defining this option now and removing it later in `updateSchema()`
  value.$validationAction = validationAction;
  // @ts-expect-error We're defining this option now and removing it later in `updateSchema()`
  value.$validationLevel = validationLevel;

  return value as unknown as [SchemaType<TProperties, TOptions>, TDefaults];
}
