import { CharUtil } from './charstream';
import CharStream = CharUtil.CharStream;

export namespace Primitives {
  export class EOFMark {
    private static _instance: EOFMark;
    private constructor() {}
    public static get Instance() {
      return this._instance || (this._instance = new this());
    }
  }
  export const EOF = EOFMark.Instance;

  /**
   * Represents a successful parse.
   */
  export class Success<T> {
    tag: 'success' = 'success';
    inputstream: CharStream;
    result: T;

    /**
     * Returns an object representing a successful parse.
     * @param istream The remaining string.
     * @param res The result of the parse
     */
    constructor(istream: CharStream, res: T) {
      this.inputstream = istream;
      this.result = res;
    }
  }

  /**
   * Represents a failed parse.
   */
  export class Failure {
    tag: 'failure' = 'failure';
    inputstream: CharStream;
    error_pos: number;
    error_msg: string;
    is_critical: boolean;

    /**
     * Returns an object representing a failed parse.
     * If the failure is critical, then parsing will stop immediately.
     *
     * @param istream The string, unmodified, that was given to the parser.
     * @param error_pos The position of the parsing failure in istream
     * @param error_msg The error message for the failure
     * @param is_critical Whether or not the failure is critical
     */
    constructor(istream: CharStream, error_pos: number, error_msg: string = '', is_critical = false) {
      this.inputstream = istream;
      this.error_pos = error_pos;
      this.error_msg = error_msg;
      this.is_critical = is_critical;
    }
  }

  /**
   * Union type representing a successful or failed parse.
   */
  export type Outcome<T> = Success<T> | Failure;

  /**
   * Generic type of a parser.
   */
  export interface IParser<T> {
    (inputstream: CharStream): Generator<any, Outcome<T>, undefined>;
  }

  /**
   * result succeeds without consuming any input, and returns v.
   * @param v The result of the parse.
   */
  export function result<T>(v: T): IParser<T> {
    return function* (istream: CharStream) {
      return new Success<T>(istream, v);
    };
  }

  /**
   * This data structure represents a mutable "cell" for
   * separating declarations from implementations ala
   * the recparser from FParsec.
   */
  export interface RefCell<T> {
    contents: IParser<T>;
  }

  /**
   * This data structure represents a mutable "cell" for
   * separating declarations from implementations ala
   * the recparser from FParsec. The difference between
   * Arg1RefCell and RefCell is that the former can
   * store parser functions that take an argument.
   */
  export interface Arg1RefCell<A, T> {
    contents: (arg: A) => IParser<T>;
  }

  /**
   * `recParser` is a forward declaration for a recursive parser.
   * It is effectively a form of deferred evaluation to prevent
   * Javascript from eagerly expanding recursive grammar productions.
   * @returns A pair, `[decl,impl]` where `decl` is a parser declaration and `impl` is an implementation for p
   */
  export function recParser<T>(): [IParser<T>, RefCell<T>] {
    const dumbParser: IParser<T> = (_input: CharStream) => {
      throw new Error('You forgot to initialize your recursive parser.');
    };
    const r = { contents: dumbParser };
    const p: IParser<T> = (input: CharStream) => r.contents(input);
    return [p, r];
  }

  /**
   * `rec1ArgParser` is a forward declaration for a recursive parser that
   * takes one argument. It is effectively a form of deferred evaluation to
   * prevent Javascript from eagerly expanding recursive grammar productions.
   * @returns A pair, `[decl,impl]` where `decl` is a parser declaration and `impl` is an implementation for p
   */
  export function rec1ArgParser<A, T>(): [(arg: A) => IParser<T>, Arg1RefCell<A, T>] {
    const dumbParser: (arg: A) => IParser<T> = (_arg: A) => (_input: CharStream) => {
      throw new Error('You forgot to initialize your recursive parser.');
    };
    const r = { contents: dumbParser };
    const p: (arg: A) => IParser<T> = (arg: A) => (input: CharStream) => r.contents(arg)(input);
    return [p, r];
  }

  /**
   * zero fails without consuming any input.
   * @param msg the error message.
   */
  export function zero<T>(msg: string): IParser<T> {
    return function* (istream: CharStream) {
      return new Failure(istream, istream.startpos, msg);
    };
  }

  /**
   * `fail` fails if the given parser `p` succeeds.  On failure,
   * `fail` returns the given error message.  For either outcome,
   * success or failure, `fail` never consumes input.
   * @param p A parser
   * @param msg An error message
   * @returns
   */
  export function fail<T>(p: IParser<T>) {
    return function (msg: string): IParser<undefined> {
      return function* (istream: CharStream) {
        const o = yield* p(istream);
        switch (o.tag) {
          case 'success':
            return new Failure(istream, istream.startpos, msg, true);
          case 'failure':
            return new Success(istream, undefined);
        }
      };
    };
  }

  /**
   * `ok` succeeds without consuming any input, returning whatever
   * is given here.
   * @param res A result object.
   */
  export function ok<T>(res: T): IParser<T> {
    return function* (istream) {
      return new Success(istream, res);
    };
  }

  /**
   * expect tries to apply the given parser and returns the result of that parser
   * if it succeeds, otherwise it returns a critical Failure
   * If the parser results in a critical Failure, expect simply returns it,
   * otherwise expect creates a critical Failure with the given error message
   * and the start pos of the istream as the error pos.
   *
   * @param parser The parser to try
   * @param error_msg The error message if the parser fails
   */
  export function expect<T>(parser: IParser<T>) {
    return function (error_msg: string) {
      return function* (istream: CharStream) {
        const outcome: Outcome<T> = yield* parser(istream);
        switch (outcome.tag) {
          case 'success':
            return outcome;
          case 'failure':
            return outcome.is_critical ? outcome : new Failure(istream, istream.startpos, error_msg, true);
        }
      };
    };
  }

  /**
   * item successfully consumes the first character if the input
   * string is non-empty, otherwise it fails.
   */
  export const item: IParser<CharStream> = function* (istream: CharStream) {
    if (istream.isEmpty()) {
      return new Failure(istream, istream.startpos);
    } else {
      const remaining = istream.tail(); // remaining string;
      const res = istream.head(); // result of parse;
      return new Success(remaining, res);
    }
  };

  /**
   * bind is a curried function that takes a parser p and returns
   * a function that takes a parser f which returns the composition
   * of p and f.  If _any_ of the parsers fail, the original inputstream
   * is returned in the Failure object (i.e., bind backtracks).
   * @param p A parser
   */
  export function bind<T, U>(p: IParser<T>) {
    return function (f: (t: T) => IParser<U>) {
      return function* (istream: CharStream) {
        const r = yield* p(istream);
        switch (r.tag) {
          case 'success':
            const o = yield* f(r.result)(r.inputstream);
            switch (o.tag) {
              case 'success':
                break;
              case 'failure': // note: backtracks, returning original istream
                return new Failure(istream, o.error_pos, o.error_msg, o.is_critical);
            }
            return o;
          case 'failure':
            return new Failure(istream, r.error_pos, r.error_msg, r.is_critical);
        }
      };
    };
  }

  export function delay<T>(p: IParser<T>) {
    return () => p;
  }

  /**
   * `seq` takes a parser `p` and a parser `q`. It applies `p` to the input,
   * passing the remaining input stream to `q`; `q` is then applied. It
   * returns the result of `p` and `q` as a tuple.
   * @param p A parser
   */
  export function seq<T, U>(p: IParser<T>) {
    return (q: IParser<U>) => {
      return bind<T, [T, U]>(p)(t => {
        return bind<U, [T, U]>(q)(u => {
          return result([t, u]);
        });
      });
    };
  }

  /**
   * `sat` takes a predicate and yields a parser that consumes a
   * single character if the character satisfies the predicate,
   * otherwise it fails.
   */
  export function sat(p: (ch: string) => boolean): IParser<CharStream> {
    const f = function (x: CharStream) {
      const char = x.toString();
      if (char.length !== 1) throw new Error('Input to predicate must be a character.');
      return p(char)
        ? result(x)
        : function* (istream: CharStream) {
            return new Failure(istream, istream.startpos - 1);
          };
    };
    return bind<CharStream, CharStream>(item)(f);
  }

  /**
   * `satClass` takes an array of satisfactory characters and yields
   * a parser that consumes a single character if the character
   * is in the array, otherwise it fails.
   */
  export function satClass(char_class: string[]): IParser<CharStream> {
    const f = (x: CharStream) => {
      return char_class.indexOf(x.toString()) > -1
        ? result(x)
        : function* (istream: CharStream) {
            return new Failure(istream, istream.startpos - 1);
          };
    };
    return bind<CharStream, CharStream>(item)(f);
  }

  /**
   * char takes a character and yields a parser that consume
   * that character. The returned parser succeeds if the next
   * character in the input stream is c, otherwise it fails.
   * @param c
   */
  export function char(c: string): IParser<CharStream> {
    if (c.length != 1) {
      throw new Error('char parser takes a string of length 1 (i.e., a char)');
    }
    return satClass([c]);
  }

  export const lower_chars = 'abcdefghijklmnopqrstuvwxyz'.split('');

  export const upper_chars = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');

  /**
   * letter returns a parser that consumes a single alphabetic
   * character, from a-z, regardless of case.
   */
  export const letter: IParser<CharStream> = satClass(lower_chars.concat(upper_chars));

  /**
   * digit returns a parser that consumes a single numeric
   * character, from 0-9.  Note that the type of the result
   * is a string, not a number.
   */
  export const digit: IParser<CharStream> = satClass(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

  /**
   * An integer parser.
   */
  export const integer: IParser<number> = appfun<CharStream[], number>(many1(digit))(arr => {
    const s = CharStream.concat(arr).toString();
    return parseFloat(s);
  });

  /**
   * A floating point parser, with optional fraction.
   */
  export const float: IParser<number> = choice(
    pipe2<number, number, number>(integer)(right<CharStream, number>(char('.'))(integer))((a, b) =>
      parseFloat(a.toString() + '.' + b.toString())
    )
  )(integer);

  /**
   * upper returns a parser that consumes a single character
   * if that character is uppercase.
   */
  export const upper: IParser<CharStream> = satClass(upper_chars);

  /**
   * lower returns a parser that consumes a single character
   * if that character is lowercase.
   */
  export const lower: IParser<CharStream> = satClass(lower_chars);

  /**
   * choice specifies an ordered choice between two parsers,
   * p1 and p2. The returned parser will first apply
   * parser p1.  If p1 succeeds, p1's Outcome is returned.
   * If p1 fails, p2 is applied and the Outcome of p2 is returned.
   *
   * An exception is when an outcome is a critical failure,
   * that outcome is immediately returned.
   *
   * @param p1 A parser.
   */
  export function choice<T>(p1: IParser<T>): (p2: IParser<T>) => IParser<T> {
    return (p2: IParser<T>) => {
      return function* (istream: CharStream) {
        const o = yield* p1(istream);
        switch (o.tag) {
          case 'success':
            return o;
          case 'failure':
            if (o.is_critical) {
              return o;
            }
            const o2 = yield* p2(istream);
            switch (o2.tag) {
              case 'success':
                break;
              case 'failure':
                return o2.is_critical || o2.error_pos >= o.error_pos ? o2 : o;
            }
            return o2;
        }
      };
    };
  }

  /**
   * Like choice, but chooses from multiple possible parsers
   * The parser will be tried in the order of the input, and the result of
   * the first parser to succeed is returned
   * Example usage: choices(p1, p2, p3)
   *
   * @param parsers An array of parsers to try
   */
  export function choices<T>(...parsers: IParser<T>[]): IParser<T> {
    if (parsers.length == 0) {
      throw new Error('Error: choices must have a non-empty array.');
    }
    return function* (istream: CharStream) {
      let i = 0;
      while (true && i < parsers.length) {
        const o = yield* parsers[i](istream);
        if (o.tag === 'success') {
          return o;
        } else if (o.is_critical) {
          return o;
        }
        i++;
      }
      return new Failure(istream, istream.startpos);
    };
  }

  /**
   * `prefix` is a prefix-optimized `choice` combinator.  If `pre`
   * succeeds, `p` is called, and `prefix`'s and `p`'s results
   * are returned by calling the reducer `f`.  If `p` fails,
   * just `p`'s result is returned. Use this whereever you would
   * write choice(p)(pipe2(p)(q)(f)).
   * @param pre A prefix parser that should always succeed.
   * @param p A suffix parser that may succeed.
   * @param f A function that is called only if `p` succeeds.
   */
  export function prefix<T, U>(pre: IParser<T>) {
    return (p: IParser<U>) => {
      return (f: (t: T, u: U) => T) => {
        return function* (istream: CharStream) {
          const output1 = yield* pre(istream);
          switch (output1.tag) {
            case 'success':
              const output2 = yield* p(output1.inputstream);
              switch (output2.tag) {
                case 'success':
                  return new Success(output2.inputstream, f(output1.result, output2.result));
                case 'failure':
                  return output1;
              }
            case 'failure':
              return output1;
          }
        };
      };
    };
  }

  /**
   * appfun allows the user to apply a function f to
   * the result of a parser p, assuming that p is successful.
   * This is the same as the `|>>`
   * function from FParsec and is an alias for `pipe`.
   * @param p A parser.
   */
  export function appfun<T, U>(p: IParser<T>) {
    return (f: (t: T) => U) => {
      return function* (istream: CharStream) {
        const o = yield* p(istream);
        switch (o.tag) {
          case 'success':
            return new Success<U>(o.inputstream, f(o.result));
          case 'failure':
            return o;
        }
      };
    };
  }

  /**
   * `pipe` allows the user to apply a function f to
   * the result of a parser p, assuming that p is successful.
   * This is the same as the `|>>`
   * function from FParsec and is an alias for `appfun`
   * @param p A parser.
   */
  export const pipe = appfun;

  /**
   * `pipe2(p1)(p2)(f)` applies the parsers `p1` and `p2` in sequence.
   * It returns the result of the function application `f(t,u)`, where
   * `t` and `u` are the results returned by `p1` and `p2`.
   * @param p1 A parser.
   * @param p2 Another parser.
   * @param f A function that takes the result of `p1` and `p2`.
   */
  export function pipe2<T, U, V>(p: IParser<T>) {
    return (q: IParser<U>) => {
      return (f: (t: T, u: U) => V) => {
        return bind<T, V>(p)(t => {
          return bind<U, V>(q)(u => {
            return result<V>(f(t, u));
          });
        });
      };
    };
  }

  /**
   * `pipe3(p1)(p2)(p3)(f)` applies the parsers `p1`, `p2`, and `p3` in
   * sequence. It returns the result of the function application `f(a,b,c)`,
   * where `a`, `b`, and `c` are the results returned by `p1`, `p2`, and
   * `p3`, respectively.
   * @param p1 A parser.
   * @param p2 A parser.
   * @param p3 A parser.
   * @param f A function that takes the results of `p1`, `p2`, and `p3`.
   */
  export function pipe3<A, B, C, D>(p1: IParser<A>) {
    return (p2: IParser<B>) => {
      return (p3: IParser<C>) => {
        return (f: (a: A, b: B, c: C) => D) => {
          return pipe2<A, [B, C], D>(
            // parse p1
            p1
          )(
            pipe2<B, C, [B, C]>(
              // then parse p2
              p2
            )(
              // then parse p3
              p3
            )(
              // then return a tuple (b,c)
              (b, c) => [b, c]
            )
          )(
            // then apply f to all of a, b, c
            (a, [b, c]) => f(a, b, c)
          );
        };
      };
    };
  }

  /**
   * many repeatedly applies the parser p until p fails. many always
   * succeeds, even if it matches nothing or if an outcome is critical.
   * many tries to guard against an infinite loop by raising an exception
   * if p succeeds without changing the parser state.
   * @param p The parser to try
   */
  export function many<T>(p: IParser<T>): IParser<T[]> {
    return function* (istream: CharStream) {
      let istream2 = istream;
      const outputs: T[] = [];
      let succeeds = true;
      while (!istream2.isEmpty() && succeeds) {
        const o = yield* p(istream2);
        switch (o.tag) {
          case 'success':
            if (istream2 == o.inputstream) {
              throw new Error('Parser loops infinitely.');
            }
            istream2 = o.inputstream;
            outputs.push(o.result);
            break;
          case 'failure':
            succeeds = false;
            break;
        }
      }
      return new Success(istream2, outputs);
    };
  }

  /**
   * many1 repeatedly applies the parser p until p fails. many1 must
   * succeed at least once.  many1 tries to guard against an infinite
   * loop by raising an exception if p succeeds without changing the
   * parser state.
   * @param p The parser to try
   */
  export function many1<T>(p: IParser<T>) {
    return (istream: CharStream) => {
      return pipe2<T, T[], T[]>(p)(many<T>(p))((hd, tl) => {
        tl.unshift(hd);
        return tl;
      })(istream);
    };
  }

  /**
   * `str` yields a parser for the given string.
   * @param s A string
   */
  export function str(s: string): IParser<CharStream> {
    return function* (istream: CharStream) {
      if (istream.peekMatches(s)) {
        return new Success(istream.seek(s.length), new CharStream(s));
      } else {
        return new Failure(istream, istream.startpos);
      }
    };
  }

  /**
   * Returns a parser that succeeds only if the end of the
   * input has been reached.
   */
  export const eof: IParser<EOFMark> = function* (istream: CharStream) {
    return istream.isEOF() ? new Success(istream, EOF) : new Failure(istream, istream.startpos);
  };

  /**
   * fresult returns a parser that applies the parser p,
   * and if p succeeds, returns the value x.
   * @param p a parser
   */
  export function fresult<T, U>(p: IParser<T>) {
    return (x: U) => {
      return (istream: CharStream) => {
        return bind<T, U>(p)((_t: T) => result(x))(istream);
      };
    };
  }

  /**
   * left returns a parser that applies the parser p,
   * then the parser q, and if both are successful,
   * returns the result of p.
   * @param p a parser
   */
  export function left<T, U>(p: IParser<T>) {
    return (q: IParser<U>) => {
      return (istream: CharStream) => {
        return bind<T, T>(p)((t: T) => fresult<U, T>(q)(t))(istream);
      };
    };
  }

  /**
   * right returns a parser that applies the parser p,
   * then the parser q, and if both are successful,
   * returns the result of q.
   * @param p a parser
   */
  export function right<T, U>(p: IParser<T>) {
    return (q: IParser<U>) => {
      return (istream: CharStream) => {
        return bind<T, U>(p)(_ => q)(istream);
      };
    };
  }

  /**
   * between returns a parser that applies the parser
   * popen, p, and pclose in sequence, and if all are
   * successful, returns the result of p.
   * @param popen the first parser
   */
  export function between<T, U, V>(popen: IParser<T>): (pclose: IParser<U>) => (p: IParser<V>) => IParser<V> {
    return (pclose: IParser<U>) => {
      return (p: IParser<V>) => {
        const l: IParser<V> = left<V, U>(p)(pclose);
        const r: IParser<V> = right<T, V>(popen)(l);
        return r;
      };
    };
  }

  /**
   * The debug parser takes a parser p and a debug string,
   * printing the debug string as a side-effect before
   * applying p to the input.
   * @param p a parser
   */
  export function debug<T>(p: IParser<T>) {
    return (label: string) => {
      return function* (istream: CharStream) {
        console.log('apply: ' + label + ', startpos: ' + istream.startpos + ', endpos: ' + istream.endpos);
        const o = yield* p(istream);
        switch (o.tag) {
          case 'success':
            console.log('success: ' + label + ', startpos: ' + istream.startpos + ', endpos: ' + istream.endpos);
            break;
          case 'failure':
            const PAD = 10;
            console.log(
              'failure: ' +
                label +
                ', startpos: ' +
                istream.startpos +
                ', endpos: ' +
                istream.endpos +
                '\n' +
                diagnosticMessage(PAD, o.error_pos, o.inputstream.toString(), o.error_msg)
            );
            break;
        }
        return o;
      };
    };
  }

  /**
   * Get the index of the left side of the input stream error window.
   * @param windowSz The size of the error window.
   * @param failurePos The position of the error in the input stream.
   * @returns An index.
   */
  function windowLeftIndex(windowSz: number, failurePos: number): number {
    return failurePos - windowSz < 0 ? 0 : failurePos - windowSz;
  }

  /**
   * Get the index of the right side of the input stream error window.
   * @param windowSz The size of the error window.
   * @param failurePos The position of the error in the input stream.
   * @param bufferLen The total length of the input stream.
   * @returns An index.
   */
  function windowRightIndex(windowSz: number, failurePos: number, bufferLen: number): number {
    return failurePos + windowSz >= bufferLen ? bufferLen - 1 : failurePos + windowSz;
  }

  /**
   * Finds the index of the newline closest to the failure position in the left side of the input window.
   * @param leftIndex The left bound of the input window.
   * @param failurePos The position of the error in the input stream.
   * @param buffer The input.
   * @returns An index.
   */
  function indexOfLastNewlineLeftWindow(leftIndex: number, failurePos: number, buffer: string): number {
    function searchBackward(pos: number): number {
      if (pos <= leftIndex) {
        return -1;
      } else if (buffer[pos] === '\n') {
        return pos;
      } else {
        return searchBackward(pos - 1);
      }
    }

    const idx = searchBackward(failurePos - 1);
    return idx === -1 ? leftIndex : idx;
  }

  /**
   * Pads a string `s` with `padStr` `num` times.
   * @param s
   * @param padStr
   * @param num
   * @returns
   */
  function leftPad(s: string, padStr: string, num: number): string {
    return num > 0 ? leftPad(padStr + s, padStr, num - 1) : s;
  }

  /**
   * Produce a diagnostic message for a parser failure.
   * @param windowSz The amount of context (in chars) to show to the left and right of the failure position.
   * @param failurePos Where the parse failed.
   * @param buffer The input stream.
   * @param err The error message.
   */
  export function diagnosticMessage(windowSz: number, failurePos: number, buffer: string, err: string): string {
    // compute window
    const leftIdx = windowLeftIndex(windowSz, failurePos);
    const rightIdx = windowRightIndex(windowSz, failurePos, buffer.length);
    const lastNLLeft = indexOfLastNewlineLeftWindow(leftIdx, failurePos, buffer);

    // find caret position in last line
    const caretPos = failurePos - lastNLLeft;

    // create window string
    const window = buffer.substr(leftIdx, failurePos - leftIdx + 1 + rightIdx - failurePos);

    // augment with diagnostic information
    const diag =
      leftPad('', '=', rightIdx - leftIdx) +
      '\n' +
      err +
      '\n' +
      window +
      '\n' +
      leftPad('^', ' ', caretPos - 1) +
      '\n' +
      leftPad('', '=', rightIdx - leftIdx) +
      '\n';

    return diag;
  }

  /**
   * nl matches and returns a newline.
   */
  export const nl: IParser<CharStream> = Primitives.choice(Primitives.str('\n'))(Primitives.str('\r\n'));

  /**
   * wschars matches any whitespace char, namely
   * ' ', '\t', '\n', or '\r\n'.
   */
  const wschars: IParser<CharStream> = choice(satClass([' ', '\t']))(nl);

  /**
   * ws matches zero or more of the following whitespace characters:
   * ' ', '\t', '\n', or '\r\n'
   * ws returns matched whitespace in a single CharStream result.
   * Note: ws NEVER fails
   */
  export const ws: IParser<CharStream> = function* (istream: CharStream) {
    const o = yield* many(wschars)(istream);
    switch (o.tag) {
      case 'success':
        return new Success(o.inputstream, CharStream.concat(o.result));
      case 'failure':
        return o;
    }
  };

  /**
   * ws1 matches one or more of the following whitespace characters:
   * ' ', '\t', '\n', or '\r\n'
   * ws1 returns matched whitespace in a single CharStream result.
   */
  export const ws1: IParser<CharStream> = function* (istream: CharStream) {
    const o = yield* many1(wschars)(istream);
    switch (o.tag) {
      case 'success':
        return new Success(o.inputstream, CharStream.concat(o.result));
      case 'failure':
        return o;
    }
  };

  function groupBy<T, U>(list: T[], keyGetter: (e: T) => U): Map<U, T[]> {
    const m: Map<U, T[]> = new Map<U, T[]>();
    list.forEach(elem => {
      const key = keyGetter(elem);
      if (!m.has(key)) {
        m.set(key, []);
      }
      const collection = m.get(key)!;
      collection.push(elem);
    });
    return m;
  }

  /**
   * Match any of given alternatives in the given array of strings. Matches
   * longest-first and, where length is the same, lexicographically first.
   * @param strs An array of acceptable strings.
   */
  export function strSat(strs: string[]): IParser<CharStream> {
    // sort strings first by length, and then lexicograpically;
    // slice() called here so as not to modify original array
    const smap = groupBy(strs, s => s.length);
    const sizes: number[] = [];
    // find size classes;
    // also sort each set of equivalent-length values
    smap.forEach((vals: string[], key: number, _m: Map<number, string[]>) => {
      sizes.push(key);
      vals.sort();
    });
    sizes.sort().reverse();

    return function* (istream: CharStream) {
      // start with the smallest size class
      for (let peekIndex = 0; peekIndex < sizes.length; peekIndex++) {
        // for each size class, try matching all of
        // the strings; if one is found, return the
        // appropriate CharStream; if not, fail.
        const peek = istream.peek(sizes[peekIndex]);
        const tail = istream.seek(sizes[peekIndex]);
        const candidates = smap.get(sizes[peekIndex])!;
        for (let cIndex = 0; cIndex < candidates.length; cIndex++) {
          if (candidates[cIndex] === peek.toString()) {
            return new Success(tail, peek);
          }
        }
      }
      return new Failure(istream, istream.startpos);
    };
  }

  /**
   * An optimized parser that seeks the input until the given predicate does not
   * return true.  On success, it returns the matching CharStream.
   * @param pred A function that returns true if the given character should be accepted.
   */
  export function matchWhile(pred: (char: string) => boolean): IParser<CharStream> {
    return function* (istream: CharStream) {
      const rem = istream.seekWhile(pred);
      const diff = rem.startpos - istream.startpos;
      if (diff == 0) {
        // no input consumed
        return new Failure(istream, istream.startpos);
      } else {
        const match = istream.peek(diff);
        return yield* result(match)(rem);
      }
    };
  }

  /**
   * An optimized parser that seeks the input until the given predicate does not
   * return true.  On success, it returns the matching CharStream.
   * @param pred A function that returns true if the given character code should be accepted.
   */
  export function matchWhileCharCode(pred: (char: number) => boolean): IParser<CharStream> {
    return function* (istream: CharStream) {
      const [match, rem] = istream.seekWhileCharCode(pred);
      if (match.startpos == match.endpos) {
        // no input consumed
        return new Failure(istream, istream.startpos);
      }
      return yield* result(match)(rem);
    };
  }
}
