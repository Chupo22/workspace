import { SchemaDSL } from './dsl/schema-dsl';

export function build(params: { schema: (dsl: SchemaDSL) => void }): string {
  const { schema } = params;
  const dsl = new SchemaDSL();

  schema(dsl);

  return dsl.toString();
}
