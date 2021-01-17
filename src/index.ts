import { Import } from './Import';
import { Code, deepGenerate, Def } from './Code';
import { Node } from './Node';
import { ConditionalOutput } from './ConditionalOutput';
export { Code } from './Code';
export { Import } from './Import';

/** A template literal to format code and auto-organize imports. */
export function code(literals: TemplateStringsArray, ...placeholders: unknown[]): Code {
  return new Code(literals, placeholders);
}

export function arrayOf(...elements: unknown[]): Node {
  return new (class extends Node {
    get childNodes(): unknown[] {
      return elements;
    }

    toCodeString(): string {
      return '[' + elements.map(deepGenerate).join(', ') + ']';
    }
  })();
}

/** Creates an import that will be auto-imported at the top of the output file. */
export function imp(spec: string, opts: { definedIn?: string } = {}): Import {
  const sym = Import.from(spec);
  if (opts && opts.definedIn) {
    sym.definedIn = opts.definedIn;
  }
  return sym;
}

/** Defines `symbol` as being locally defined in the file, to avoid import collisions. */
export function def(symbol: string): Def {
  return new Def(symbol);
}

/** Creates a conditionally-output code snippet. */
export function conditionalOutput(usageSite: string, declarationSite: Code): ConditionalOutput {
  return new ConditionalOutput(usageSite, declarationSite);
}
