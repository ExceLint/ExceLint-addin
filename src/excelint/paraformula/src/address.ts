import { AST } from './ast';
import { Util } from './util';
import { Primitives as P, CharUtil as CU } from 'parsecco';
import { Primitives as PP } from './primitives';

export module Address {
  /**
   * Parses the `R` part of an absolute R1C1 address.
   * @param istream input CharStream.
   */
  export const addrR = P.right<CU.CharStream, number>(P.str('R'))(P.integer);

  /**
   * Parses the `R` part of a relative R1C1 address.
   */
  export const addrRRel = P.between<CU.CharStream, CU.CharStream, number>(P.str('R['))(P.str(']'))(PP.Z);

  /**
   * Parses the `C` part of an absolute R1C1 address.
   * @param istream input CharStream.
   */
  export const addrC = P.right<CU.CharStream, number>(P.str('C'))(P.integer);

  /**
   * Parses the `C` part of a relative R1C1 address.
   * @param istream input CharStream.
   */
  export const addrCRel = P.between<CU.CharStream, CU.CharStream, number>(P.str('C['))(P.str(']'))(PP.Z);

  /**
   * Parses the `R` part of an R1C1 address.
   */
  export const addrRMode = P.choice(P.pipe<number, [number, AST.AddressMode]>(addrRRel)(r => [r, AST.RelativeAddress]))(
    P.pipe<number, [number, AST.AddressMode]>(addrR)(r => [r, AST.AbsoluteAddress])
  );

  /**
   * Parses the `C` part of an R1C1 address.
   */
  export const addrCMode = P.choice(P.pipe<number, [number, AST.AddressMode]>(addrCRel)(c => [c, AST.RelativeAddress]))(
    P.pipe<number, [number, AST.AddressMode]>(addrC)(c => [c, AST.AbsoluteAddress])
  );

  /**
   * Parses an R1C1 address.
   */
  export const addrR1C1 = P.pipe2<[number, AST.AddressMode], [number, AST.AddressMode], AST.Address>(addrRMode)(
    addrCMode
  )(([row, rowMode], [col, colMode]) => {
    return new AST.Address(row, col, rowMode, colMode, PP.EnvStub);
  });

  /**
   * Parses an address mode token.
   */
  export const addrMode = P.choice<AST.AddressMode>(
    P.pipe<CU.CharStream, AST.AddressMode>(P.str('$'))(_cs => AST.AbsoluteAddress)
  )(P.pipe<undefined, AST.AddressMode>(P.ok(undefined))(_cs => AST.RelativeAddress));

  /**
   * Parses the column component of an A1 address.
   */
  export const addrA = P.pipe<CU.CharStream[], CU.CharStream>(P.many1(P.upper))(css => CU.CharStream.concat(css));

  /**
   * Parses the column component of an A1 address, including address mode.
   */
  export const addrAMode = P.pipe2<AST.AddressMode, CU.CharStream, [AST.AddressMode, CU.CharStream]>(addrMode)(addrA)(
    (mode, col) => [mode, col]
  );

  /**
   * Parses the row component of an A1 address.
   */
  export const addr1 = P.integer;

  /**
   * Parses the row component of an A1 address, including address mode.
   */
  export const addr1Mode = P.pipe2<AST.AddressMode, number, [AST.AddressMode, number]>(addrMode)(addr1)((mode, col) => [
    mode,
    col,
  ]);

  /**
   * Parses an A1 address, with address modes.
   */
  export const addrA1 = P.pipe2<[AST.AddressMode, CU.CharStream], [AST.AddressMode, number], AST.Address>(addrAMode)(
    addr1Mode
  )(
    ([colMode, col], [rowMode, row]) =>
      new AST.Address(row, Util.columnToInt(col.toString()), rowMode, colMode, PP.EnvStub)
  );

  /**
   * Parses either an A1 or R1C1 address.
   */
  export const addrAny = P.choice(addrR1C1)(addrA1);
}
