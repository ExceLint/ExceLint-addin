import { AST } from './ast';
import { Primitives as P, CharUtil as CU } from '../../parsecco/src/index';
import { Expression as PE } from './expression';
import { Range as PR } from './range';

export module Paraformula {
  /**
   * Top-level grammar definition.
   */
  export const grammar: P.IParser<AST.Expression> = P.right<CU.CharStream, AST.Expression>(P.char('='))(
    PE.expr(PR.rangeAny)
  );

  /**
   * Parses an Excel formula and returns an AST.  Throws an
   * exception if the input is invalid.
   * @param input A formula string
   */
  export function parse(input: string): AST.Expression {
    const cs = new CU.CharStream(input);
    const it = grammar(cs);
    const elem = it.next();
    if (elem.done) {
      const output = elem.value;
      switch (output.tag) {
        case 'success':
          return output.result;
        case 'failure':
          throw new Error('Unable to parse input: ' + output.error_msg);
      }
    } else {
      throw new Error('This should never happen.');
    }
  }

  /**
   * Parses an Excel formula and returns an AST.  Throws an
   * exception if the input is invalid. Yieldable.
   * @param input A formula string
   */
  export function* yieldableParse(input: string): Generator<undefined, AST.Expression, undefined> {
    const cs = new CU.CharStream(input);
    const output = yield* grammar(cs);
    switch (output.tag) {
      case 'success':
        return output.result;
      case 'failure':
        throw new Error('Unable to parse input: ' + output.error_msg);
    }
  }
}
