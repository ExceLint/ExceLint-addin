import { Primitives as P, CharUtil as CU } from 'parsecco';
import { AST } from './ast';
import { Primitives as PP } from './primitives';
import { Reference as PRF } from './reference';
import { ReservedWords as PRW } from './reserved_words';

export module Expression {
  /**
   * expr is the top-level parser in the grammar.
   */
  export let [expr, exprImpl] = P.rec1ArgParser<P.IParser<AST.Range>, AST.Expression>();

  /*
   * The following classes represent partial function parses
   * for Excel operator precedence classes listed here:
   * https://support.microsoft.com/en-us/office/calculation-operators-and-precedence-in-excel-48be406d-4975-4d31-b2b8-7af9e0e2878a
   */
  abstract class PrecedenceClass {
    tag = 'precedenceclass';
    public readonly op: string;
    public readonly expr: AST.Expression;
    constructor(op: string, e: AST.Expression) {
      this.op = op;
      this.expr = e;
    }
  }

  /**
   * Level 2: exponentiation (^)
   */
  class PrecedenceLevel2 extends PrecedenceClass {
    tag = 'precedencelevel2';
    constructor(e: AST.Expression) {
      super('^', e);
    }
  }
  /**
   * Level 3: addition (+) and subtraction (-)
   */
  class PrecedenceLevel3 extends PrecedenceClass {
    tag = 'precedencelevel3';
  }
  /**
   * Level 4: multiplication (*) and division (/)
   */
  class PrecedenceLevel4 extends PrecedenceClass {
    tag = 'precedencelevel4';
  }
  /**
   * Level 5: concatenation (&)
   */
  class PrecedenceLevel5 extends PrecedenceClass {
    tag = 'precedencelevel5';
    constructor(e: AST.Expression) {
      super('&', e);
    }
  }
  /**
   * Level 6: equal to(=), greater than (>), less than (<),
   * not equal to (<>), less than or equal to (<=), and
   * greater than or equal to (>=).
   */
  class PrecedenceLevel6 extends PrecedenceClass {
    tag = 'precedencelevel6';
  }

  function exponent(R: P.IParser<AST.Range>) {
    // exponent MUST consume something
    return P.pipe2<AST.Expression, CU.CharStream, PrecedenceLevel2>(level1(R))(PP.wsPad(P.char('^')))(
      (e, _op) => new PrecedenceLevel2(e)
    );
  }

  function mult(R: P.IParser<AST.Range>) {
    // mult MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(PP.wsPad(P.char('*')))(level2(R))((_op, e) => e);
  }

  function divide(R: P.IParser<AST.Range>) {
    // divide MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(PP.wsPad(P.char('/')))(level2(R))((_op, e) => e);
  }

  function plus(R: P.IParser<AST.Range>) {
    // plus MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(PP.wsPad(P.char('+')))(level3(R))((_op, e) => e);
  }

  function minus(R: P.IParser<AST.Range>) {
    // minus MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(PP.wsPad(P.char('-')))(level3(R))((_op, e) => e);
  }

  function concatenation(R: P.IParser<AST.Range>) {
    // concatenation MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(PP.wsPad(P.char('&')))(level4(R))((_op, e) => e);
  }

  function equalTo(R: P.IParser<AST.Range>) {
    // equalTo MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(PP.wsPad(P.char('=')))(level5(R))((_op, e) => e);
  }

  function notEqualTo(R: P.IParser<AST.Range>) {
    // notEqualTo MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(PP.wsPad(P.str('<>')))(level5(R))((_siopgn, e) => e);
  }

  function greaterThan(R: P.IParser<AST.Range>) {
    // greaterThan MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(PP.wsPad(P.char('>')))(level5(R))((_op, e) => e);
  }

  function lessThan(R: P.IParser<AST.Range>) {
    // lessThan MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(PP.wsPad(P.char('<')))(level5(R))((_op, e) => e);
  }

  function lessThanOrEqualTo(R: P.IParser<AST.Range>) {
    // lessThanOrEqualTo MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(PP.wsPad(P.str('<=')))(level5(R))((_sopign, e) => e);
  }

  function greaterThanOrEqualTo(R: P.IParser<AST.Range>) {
    // greaterThanOrEqualTo MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(PP.wsPad(P.str('>=')))(level5(R))((_op, e) => e);
  }

  function level1(R: P.IParser<AST.Range>) {
    // we now MUST consume something
    return P.choice<AST.Expression>(
      // try a parenthesized expression
      exprParens(R)
    )(
      // barring that, try a simple (i.e., nonrecursive) expression
      exprSimple(R)
    );
  }

  /**
   * Parses right-associative exponentiation expressions.
   * @param R A Range parser.
   */
  function level2(R: P.IParser<AST.Range>): P.IParser<AST.Expression> {
    return P.pipe2<PrecedenceLevel2[], AST.Expression, AST.Expression>(P.many(exponent(R)))(level1(R))((es, e) => {
      if (es.length > 0) {
        const exps = rev(es).reduce((acc, lhs) => {
          const exp = new AST.BinOpExpr(lhs.op, lhs.expr, acc);
          return exp;
        }, e);
        return exps;
      } else {
        return e;
      }
    });
  }

  /**
   * Parses left-associative multiplication or division expressions.
   * @param R A Range parser.
   */
  function level3(R: P.IParser<AST.Range>): P.IParser<AST.Expression> {
    return P.prefix<AST.Expression, PrecedenceLevel3[]>(
      // first the term
      level2(R)
    )(
      // then the operation and another term
      P.many1(
        P.choice(P.pipe<AST.Expression, PrecedenceLevel3>(mult(R))(e => new PrecedenceLevel3('*', e)))(
          P.pipe<AST.Expression, PrecedenceLevel3>(divide(R))(e => new PrecedenceLevel3('/', e))
        )
      )
    )(
      // yields a binop from a list of multiplicands
      (t1, t2) => t2.reduce((acc, rhs) => new AST.BinOpExpr(rhs.op, acc, rhs.expr), t1)
    );
  }

  /**
   * Parses left-associative addition or subtraction expressions.
   * @param R A Range parser.
   */
  function level4(R: P.IParser<AST.Range>): P.IParser<AST.Expression> {
    return P.prefix<AST.Expression, PrecedenceLevel4[]>(
      // first the term
      level3(R)
    )(
      // then the operation and another term
      P.many1(
        P.choice(P.pipe<AST.Expression, PrecedenceLevel4>(plus(R))(e => new PrecedenceLevel4('+', e)))(
          P.pipe<AST.Expression, PrecedenceLevel4>(minus(R))(e => new PrecedenceLevel4('-', e))
        )
      )
    )(
      // yields a binop from a list of addends
      (t1, t2) => t2.reduce((acc, rhs) => new AST.BinOpExpr(rhs.op, acc, rhs.expr), t1)
    );
  }

  /**
   * Parses left-associative concatenation expressions.
   * @param R A Range parser.
   */
  function level5(R: P.IParser<AST.Range>): P.IParser<AST.Expression> {
    return P.prefix<AST.Expression, PrecedenceLevel5[]>(
      // first the term
      level4(R)
    )(
      // then the operation and another term
      P.many1(P.pipe<AST.Expression, PrecedenceLevel5>(concatenation(R))(e => new PrecedenceLevel5(e)))
    )(
      // yields a binop from a list of addends
      (t1, t2) => t2.reduce((acc, rhs) => new AST.BinOpExpr(rhs.op, acc, rhs.expr), t1)
    );
  }

  /**
   * Parses left-associative comparison expressions.
   * @param R A Range parser.
   */
  function level6(R: P.IParser<AST.Range>): P.IParser<AST.Expression> {
    return P.prefix<AST.Expression, PrecedenceLevel6[]>(
      // first the term
      level5(R)
    )(
      // then the operation and another term
      P.many1(
        P.choices(
          P.pipe<AST.Expression, PrecedenceLevel6>(equalTo(R))(e => new PrecedenceLevel6('=', e)),
          P.pipe<AST.Expression, PrecedenceLevel6>(lessThan(R))(e => new PrecedenceLevel6('<', e)),
          P.pipe<AST.Expression, PrecedenceLevel6>(greaterThan(R))(e => new PrecedenceLevel6('>', e)),
          P.pipe<AST.Expression, PrecedenceLevel6>(lessThanOrEqualTo(R))(e => new PrecedenceLevel6('<=', e)),
          P.pipe<AST.Expression, PrecedenceLevel6>(greaterThanOrEqualTo(R))(e => new PrecedenceLevel6('>=', e)),
          P.pipe<AST.Expression, PrecedenceLevel6>(notEqualTo(R))(e => new PrecedenceLevel6('<>', e))
        )
      )
    )(
      // yields a binop from a list of addends
      (t1, t2) => t2.reduce((acc, rhs) => new AST.BinOpExpr(rhs.op, acc, rhs.expr), t1)
    );
  }

  /**
   * Parses unary expressions.
   * @param R A Range parser.
   */
  function unary(R: P.IParser<AST.Range>): P.IParser<AST.Expression> {
    return P.choices<AST.Expression>(
      P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(P.char('+'))(exprSimple(R))(
        (_sign, e) => new AST.UnaryOpExpr('+', e)
      ),
      P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(P.char('-'))(exprSimple(R))(
        (_sign, e) => new AST.UnaryOpExpr('-', e)
      ),
      P.pipe2<AST.Expression, CU.CharStream, AST.Expression>(exprSimple(R))(P.char('%'))(
        (e, _op) => new AST.UnaryOpExpr('%', e)
      )
    );
  }

  /**
   * `binOp` parses any binary operator expression.  This parser should
   * ensure that Excel's operator precedence and associativity rules
   * are followed.
   */
  export function binOp(R: P.IParser<AST.Range>) {
    return P.choice(unary(R))(level6(R));
  }

  /**
   * Like a functional list cons, except probably a lot
   * less efficient.  Makes a shallow copy of the array tail.
   * @param elem The element to prepend.
   * @param arr The array.
   */
  function cons<T>(elem: T, arr: T[]): T[] {
    const arr2 = arr.slice();
    arr2.unshift(elem);
    return arr2;
  }

  /**
   * Returns a shallow copy of the given array, reversed.
   * @param arr The array.
   */
  function rev<T>(arr: T[]): T[] {
    const arr2 = arr.slice();
    arr2.reverse();
    return arr2;
  }

  /**
   * Returns true if the character is alphanumeric (case insensitive).
   * @param ch The character to check.
   */
  export function isAlphaNum(ch: string): boolean {
    const result =
      (ch.charCodeAt(0) >= 48 && ch.charCodeAt(0) <= 57) ||
      (ch.charCodeAt(0) >= 65 && ch.charCodeAt(0) <= 90) ||
      (ch.charCodeAt(0) >= 97 && ch.charCodeAt(0) <= 122);
    return result;
  }

  /**
   * Parses a valid function identifier.
   */
  export const functionName = P.pipe2<CU.CharStream, CU.CharStream, CU.CharStream>(P.letter)(P.matchWhile(isAlphaNum))(
    (ch, str) => ch.concat(str)
  );

  /**
   * Parses a function of arbitrary arity.
   */
  export function fApply(R: P.IParser<AST.Range>): P.IParser<AST.FunctionApplication> {
    return P.bind<CU.CharStream, AST.FunctionApplication>(
      // first parse the function name
      P.left<CU.CharStream, CU.CharStream>(functionName)(P.char('('))
    )(nameCS => {
      // what happens next depends on the arity associated with the name
      const name = nameCS.toString();
      switch (PRW.whichArity(name)) {
        case 'fixed' /* fixed arity */: {
          const fixedArities = PRW.arityFixed[name];
          const next = P.left<AST.Expression[], CU.CharStream>(sepBy(expr(R))(PP.Comma))(P.char(')'));
          return P.bind<AST.Expression[], AST.FunctionApplication>(next)(exprs => {
            // is this an arity that we expect?
            if (!fixedArities.has(exprs.length)) {
              return P.zero<AST.FunctionApplication>('Arity ' + fixedArities + ' expected for function ' + name);
            }
            return P.result(new AST.FunctionApplication(name, exprs, new AST.FixedArity(exprs.length)));
          });
        }
        case 'atleast': {
          const atLeastArity = PRW.arityAtLeastN[name];
          const next = P.left<AST.Expression[], CU.CharStream>(sepBy1(expr(R))(PP.Comma))(P.char(')'));
          return P.bind<AST.Expression[], AST.FunctionApplication>(next)(exprs => {
            // is this an arity that we expect?
            if (!(exprs.length >= atLeastArity)) {
              return P.zero<AST.FunctionApplication>('Arity ' + atLeastArity + ' expected for function ' + name);
            }
            return P.result(new AST.FunctionApplication(name, exprs, new AST.LowBoundArity(atLeastArity)));
          });
        }
        case 'any': {
          const next = P.left<AST.Expression[], CU.CharStream>(sepBy(expr(R))(PP.Comma))(P.char(')'));
          return P.bind<AST.Expression[], AST.FunctionApplication>(next)(exprs => {
            return P.result(new AST.FunctionApplication(name, exprs, AST.VarArgsArityInst));
          });
        }
        case 'unknown':
          return P.zero<AST.FunctionApplication>("Unrecognized function name '" + name + "'");
      }
    });
  }

  /**
   * Parses at least one `p`, followed by repeated sequences of `sep` and `p`.
   * In BNF: `p (sep p)*`.
   * @param p A parser
   * @param sep A separator
   */
  function sepBy1<T, U>(p: P.IParser<T>) {
    return (sep: P.IParser<U>) => {
      return P.pipe2<T, T[], T[]>(
        // parse the one
        // P.right<CU.CharStream, T>(PP.Comma)(p)
        p
      )(
        // then the many
        P.many(P.right<U, T>(sep)(p))
      )(
        // then combine them
        (a, bs) => cons(a, bs)
      );
    };
  }

  /**
   * Parses `p` followed by repeated sequences of `sep` and `p`, zero or
   * more times.
   * In BNF: `p (sep p)*`.
   * @param p A parser
   * @param sep A separator
   */
  function sepBy<T, U>(p: P.IParser<T>) {
    return (sep: P.IParser<U>) => {
      return P.choice(
        // parse as many as possible
        sepBy1(p)(sep)
      )(
        // but none is also OK
        P.result<T[]>([])
      );
    };
  }

  /**
   * Parses a parenthesized expression.
   * @param R A range parser.
   * @returns
   */
  export function exprParens(R: P.IParser<AST.Range>) {
    return P.between<CU.CharStream, CU.CharStream, AST.ParensExpr>(P.char('('))(P.char(')'))(
      P.pipe<AST.Expression, AST.ParensExpr>(expr(R))(e => new AST.ParensExpr(e))
    );
  }

  /**
   * Parses either functions or data.
   */
  export function exprAtom(R: P.IParser<AST.Range>) {
    return P.choice<AST.Expression>(fApply(R))(PRF.data(R));
  }

  /**
   * Parses a simple expression.
   * @param R A range parser.
   */
  export function exprSimple(R: P.IParser<AST.Range>) {
    return P.choice<AST.Expression>(exprAtom(R))(exprParens(R));
  }

  /**
   * Parses an arbitrarily complex expression.
   * @param R A range parser.
   */
  exprImpl.contents = (R: P.IParser<AST.Range>) => P.choice(binOp(R))(exprSimple(R));
}
