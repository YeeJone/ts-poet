import { FunctionSpec } from '@src/FunctionSpec';
import { InterfaceSpec } from '@src/InterfaceSpec';
import { Modifier } from '@src/Modifier';
import { TypeNames } from '@src/TypeNames';

const Test2 = TypeNames.anyType('Test2');
const Test3 = TypeNames.anyType('Test3');
const Test4 = TypeNames.anyType('Test4');
const Test5 = TypeNames.anyType('Test5');
const Test6 = TypeNames.anyType('Test6');

describe('InterfaceSpec', () => {
  it('generates JavaDoc at before interface definition', () => {
    const testIface = InterfaceSpec.create('Test').addJavadoc('this is a comment\n');
    expect(emit(testIface)).toMatchInlineSnapshot(`
"/**
 * this is a comment
 */
interface Test {
}
"
`);
  });

  it('generates modifiers in order', () => {
    const testIface = InterfaceSpec.create('Test').addModifiers(Modifier.EXPORT);
    expect(emit(testIface)).toMatchInlineSnapshot(`
"export interface Test {
}
"
`);
  });

  it('generates type variables', () => {
    const testIface = InterfaceSpec.create('Test')
      .addTypeVariable(TypeNames.typeVariable('X', TypeNames.bound(Test2)))
      .addTypeVariable(TypeNames.typeVariable('Y', TypeNames.bound(Test3), TypeNames.intersectBound(Test4)))
      .addTypeVariable(TypeNames.typeVariable('Z', TypeNames.bound(Test5), TypeNames.unionBound(Test6, true)));
    expect(emit(testIface)).toMatchInlineSnapshot(`
"interface Test<X extends Test2, Y extends Test3 & Test4, Z extends Test5 | keyof Test6> {
}
"
`);
  });

  it('generates super interfaces', () => {
    const testIface = InterfaceSpec.create('Test')
      .addSuperInterface(TypeNames.anyType('Test2'))
      .addSuperInterface(TypeNames.anyType('Test3'));
    expect(emit(testIface)).toMatchInlineSnapshot(`
"interface Test extends Test2, Test3 {
}
"
`);
  });

  it('generates type vars & super interfaces properly formatted', () => {
    const testIface = InterfaceSpec.create('Test')
      .addTypeVariable(TypeNames.typeVariable('Y', TypeNames.bound(Test3), TypeNames.intersectBound(Test4)))
      .addSuperInterface(Test2)
      .addSuperInterface(Test3)
      .addSuperInterface(Test4);
    expect(emit(testIface)).toMatchInlineSnapshot(`
"interface Test<Y extends Test3 & Test4> extends Test2, Test3, Test4 {
}
"
`);
  });

  it('generates property declarations', () => {
    const testIface = InterfaceSpec.create('Test')
      .addProperty('value', TypeNames.NUMBER, { modifiers: [Modifier.PRIVATE] })
      .addProperty('value2', TypeNames.STRING, { optional: true, modifiers: [Modifier.PUBLIC] });
    expect(emit(testIface)).toMatchInlineSnapshot(`
"interface Test {
  private value: number;
  value2?: string;
}
"
`);
  });

  it('generates method declarations', () => {
    const testIface = InterfaceSpec.create('Test')
      .addFunction(FunctionSpec.create('test1'))
      .addFunction(FunctionSpec.create('test2'));
    expect(emit(testIface)).toMatchInlineSnapshot(`
"interface Test {

  test1();

  test2();

}
"
`);
  });

  it('generates indexing declarations', () => {
    const testIface = InterfaceSpec.create('Test')
      .addIndexable(
        FunctionSpec.createIndexable()
          .addParameter('idx', TypeNames.STRING)
          .returns(TypeNames.ANY)
      )
      .addIndexable(
        FunctionSpec.createIndexable()
          .addModifiers(Modifier.READONLY)
          .addParameter('idx', TypeNames.STRING)
          .returns(TypeNames.ANY)
      );
    expect(emit(testIface)).toMatchInlineSnapshot(`
"interface Test {
  [idx: string]: any;
  readonly [idx: string]: any;
}
"
`);
  });

  it('generates callable declaration', () => {
    const testIface = InterfaceSpec.create('Test').callable(
      FunctionSpec.createCallable()
        .addParameter('a', TypeNames.STRING)
        .returns(TypeNames.anyType('Test'))
    );
    expect(emit(testIface)).toMatchInlineSnapshot(`
"interface Test {
  (a: string): Test;
}
"
`);
  });
});

function emit(spec: InterfaceSpec): string {
  return spec.toString();
}