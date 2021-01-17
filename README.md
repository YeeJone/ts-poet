
[![CircleCI](https://circleci.com/gh/stephenh/ts-poet.svg?style=svg)](https://circleci.com/gh/stephenh/ts-poet)

Overview
========

ts-poet is a TypeScript code generator that is really just a fancy wrapper around [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

Here's some example `HelloWorld` output generated by ts-poet:

```typescript
import { Observable } from 'rxjs/Observable';

class Greeter {

  private name: string;

  constructor(private name: string) {
  }

  greet(): Observable<string> {
    return Observable.from(`Hello $name`);
  }
}
```

And this is the code to generate it with ts-poet:

```typescript
import { code, imp } from "ts-poet";

const Observable = imp("@rxjs/Observable");

const greet = code`
  greet(): ${Observable}<string> {
    return ${Observable}.from(\`Hello $name\`)};
  }
`;

const greeter = code`
export class Greeter {

  private name: string;

  constructor(private name: string) {
  }

  ${greet}
}
`;

const output = greeter.toStringWithImports("Greeter");
```

I.e. really all ts-poet does is:

* "Auto organize imports" symbols, i.e. if you use `imp` to define the modules/imports you need in your generated code, ts-poet will create the import stanza at the top of the file.

  This can seem fairly minor, but it facilitates decomposition of your code generation code, so that you can have multiple levels of helper methods/etc. that can return `code` template literals that embed both the code itself as well as the import types, so that when the final file is generated, ts-poet can collect and emit all of the imports.

* Formats the output with prettier (using your local `.prettierrc` if it exists)

Import Specs
============

Given the primary goal of ts-poet is to manage imports for you, there are several ways of specifying imports to the `imp` function:

* `imp("Observable@rxjs")` --> `import { Observable } from "rxjs"`
* `imp("Observable@./Api")` --> `import { Observable } from "./Api"`
* `imp("Observable*./Api")` --> `import * as Observable from "./Api"`
* `imp("Observable=./Api")` --> `import Observable from "./Api"`
* `imp("@rxjs/Observable")` --> `import { Observable } from "rxjs/Observable"`
* `imp("*rxjs/Observable")` --> `import * as Observable from "rxjs/Observable"`
* `imp("@Api")` --> `import { Api } from "Api"`
* `imp("describe+mocha")` --> `import "mocha"`

### Avoiding Import Conflicts

Sometimes code generation output may declare a symbol that conflicts with an imported type (usually for generic names like `Error`).

ts-poet will automatically detect and avoid conflicts if you tell it which symbols you're declaring, i.e.:

```typescript
const bar = imp('Bar@./bar');
const output = code`
  class ${def("Bar")} extends ${bar} {
     ...
  }
`;
```

Will result in the imported `Bar` symbol being remapped to `Bar1` in the output:

```typescript
import { Bar as Bar1 } from "./bar";
class Bar extends Bar1 {}
```

This is an admittedly contrived example for documentation purposes, but can be really useful when generating code against arbitrary / user-defined input (i.e. a schema that happens to uses a really common term).

# Conditional Output

Sometimes when generating larger, intricate output, you want to conditionally include helper methods. I.e. have a `convertTimestamps` function declared at the top of your module, but only actually include that function if some other part of the output actually uses timestamps (which might depend on the specific input/schema you're generating code against).

ts-poet supports this with a `conditionalOutput` method:

```typescript
const convertTimestamps = conditionalOutput(
  // The string to output at the usage site
  "convertTimestamps",
  // The code to conditionally output if convertTimestamps is used
  code`function convertTimestamps() { ...impl... }`,
);

const output = code`
  ${someSchema.map(f => {
    if (f.type === "timestamp") {
      // Using the convertTimestamps const marks it as used in our output
      return code`${convertTimestamps}(f)`;
    }
  })}
  // The .ifUsed result will be empty unless `convertTimestamps` has been marked has used
  ${convertTimestamps.ifUsed}
`;
```

And your output will have the `convertTimestamps` declaration only if one of the schema fields had a `timestamp` type.

This helps cut down on unnecessary output in the code, and compiler/IDE warnings like unused functions.

History
=======

ts-poet was originally inspired by Square's [JavaPoet](https://github.com/square/javapoet) code generation DSL, which has a very "Java-esque" builder API of `addFunction`/`addProperty`/etc. that ts-poet copied in it's original v1/v2 releases.

JavaPoet's approach worked very well for the Java ecosystem, as it was providing three features:
 
1. nice formatting (historically code generation output has looked terrible; bad formatting, bad indentation, etc.)
2. nice multi-line string support, via `appendLine(...).appendLine(...)` style methods.
3. "auto organize imports", of collecting imported symbols across the entire compilation unit of output, and organizing/formatting them at the top of the output file.

However, in the JavaScript/TypeScript world we have prettier for formatting, and nice multi-line string support via template literals, so really the only value add that ts-poet needs to provide is the "auto organize imports", which is what the post-v2/3.0 API has been rewritten (and dramatically simplified as a result) to provide.

