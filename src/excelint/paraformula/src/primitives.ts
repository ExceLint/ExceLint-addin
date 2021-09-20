import { AST } from './ast';
import { Primitives as P, CharUtil as CU } from 'parsecco';

export module Primitives {
  /**
   * TODO remove: this is a stub until parsecco supports parsing with user state.
   */
  export const EnvStub = new AST.Env('', '', '');

  /**
   * Parse an Excel integer.
   */
  export const Z = P.choices(
    // leading + sign
    P.pipe2<CU.CharStream, number, number>(P.str('+'))(P.integer)((_sign, num) => num),
    // leading - sign
    P.pipe2<CU.CharStream, number, number>(P.str('-'))(P.integer)((_sign, num) => -num),
    // no leading sign
    P.integer
  );

  /**
   * Parses a `p`, preceeded and suceeded with whitespace. Returns
   * only the result of `p`.
   * @param p A parser
   */
  export function wsPad<T>(p: P.IParser<T>) {
    return P.between<CU.CharStream, CU.CharStream, T>(P.ws)(P.ws)(p);
  }

  /**
   * Parses a comma surrounded by optional whitespace.
   */
  export const Comma = wsPad(P.str(','));
}
