import { AST } from './ast';
import { Primitives as P, CharUtil as CU } from 'parsecco';
import { Primitives as PP } from './primitives';
import { Address as PA } from './address';
import { ReservedWords as RW } from './reserved_words';

export module Reference {
  /**
   * Parses a quoted worksheet name.
   */
  export const worksheetNameQuoted = (function () {
    const normalChar = P.sat(ch => ch !== "'");
    const escapedChar = P.pipe<CU.CharStream, CU.CharStream>(P.str("''"))(_s => new CU.CharStream("'"));
    const chars = P.choice(normalChar)(escapedChar);
    const many1Chars = P.pipe<CU.CharStream[], CU.CharStream>(P.many1(chars))(cs => CU.CharStream.concat(cs));
    return P.between<CU.CharStream, CU.CharStream, CU.CharStream>(P.str("'"))(P.str("'"))(many1Chars);
  })();

  /**
   * Parses any valid unquoted worksheet char name.
   */
  const isWorksheetChar = P.choices(P.digit, P.letter, P.char('-'), P.char(' '));

  /**
   * Parses an unquoted worksheet name.
   */
  export const worksheetNameUnquoted = P.pipe<CU.CharStream[], CU.CharStream>(P.many1(isWorksheetChar))(
    CU.CharStream.concat
  );

  /**
   * Parses a worksheet name.
   */
  export const worksheetName = P.choice(worksheetNameQuoted)(worksheetNameUnquoted);

  /**
   * Parses a workbook name.
   */
  export const workbookName = P.between<CU.CharStream, CU.CharStream, CU.CharStream>(P.char('['))(P.char(']'))(
    P.pipe<CU.CharStream[], CU.CharStream>(P.many1(P.sat(ch => ch !== '[' && ch !== ']')))(CU.CharStream.concat)
  );

  /**
   * Parses a path, including no path at all.
   */
  export const path = P.pipe<CU.CharStream[], CU.CharStream>(P.many(P.sat(ch => ch !== '[')))(CU.CharStream.concat);

  /**
   * Parses a workbook reference.
   * @returns a tuple of [path, workbookname]
   */
  export const workbook = P.pipe2<CU.CharStream, CU.CharStream, [CU.CharStream, CU.CharStream]>(path)(workbookName)(
    (p, w) => [p, w]
  );

  /**
   * Parses a quoted path-wb-ws prefix to a range.
   */
  export const quotedPrefix = P.between<CU.CharStream, CU.CharStream, [[CU.CharStream, CU.CharStream], CU.CharStream]>(
    P.str("'")
  )(P.str("'"))(
    P.pipe2<[CU.CharStream, CU.CharStream], CU.CharStream, [[CU.CharStream, CU.CharStream], CU.CharStream]>(workbook)(
      worksheetNameUnquoted
    )((w, ws) => [w, ws])
  );

  /**
   * Parses a fully-qualified range reference, i.e., a range that (optionally)
   * includes a path, includes a workbook, and includes a worksheet.
   * @param R A range parser.
   */
  export function rangeReferenceWorkbook(R: P.IParser<AST.Range>) {
    return P.pipe2<[[CU.CharStream, CU.CharStream], CU.CharStream], AST.Range, AST.ReferenceRange>(
      // first parse the path-wb-ws string
      P.left<[[CU.CharStream, CU.CharStream], CU.CharStream], CU.CharStream>(quotedPrefix)(P.char('!'))
    )(
      // then parse the range itself
      R
    )(
      // then stick them together and return a RangeReference object
      ([[p, wb], ws], r) => new AST.ReferenceRange(new AST.Env(p.toString(), wb.toString(), ws.toString()), r)
    );
  }

  /**
   * Parses a range reference that only includes a worksheet.
   * @param R A range parser.
   */
  export function rangeReferenceWorksheet(R: P.IParser<AST.Range>) {
    return P.pipe2<CU.CharStream, AST.Range, AST.ReferenceRange>(
      // first parse the path-wb-ws string
      P.left<CU.CharStream, CU.CharStream>(worksheetName)(P.char('!'))
    )(
      // then parse the range itself
      R
    )(
      // then stick them together and return a RangeReference object
      (ws, r) => new AST.ReferenceRange(new AST.Env(PP.EnvStub.path, PP.EnvStub.workbookName, ws.toString()), r)
    );
  }

  /**
   * Parses a bare range reference.
   * @param R A range parser.
   */
  export function rangeReferenceBare(R: P.IParser<AST.Range>) {
    return P.pipe<AST.Range, AST.ReferenceRange>(
      // parse the range itself
      R
    )(
      // then return a RangeReference object
      r => new AST.ReferenceRange(PP.EnvStub, r)
    );
  }

  /**
   * Parses any range reference.
   * @param R A range parser.
   */
  export function rangeReference(R: P.IParser<AST.Range>) {
    return P.choices(rangeReferenceWorkbook(R), rangeReferenceWorksheet(R), rangeReferenceBare(R));
  }

  /**
   * Parses a fully-qualified address reference, i.e., an address that (optionally)
   * includes a path, includes a workbook, and includes a worksheet.
   */
  export const addressReferenceWorkbook = P.pipe2<
    [[CU.CharStream, CU.CharStream], CU.CharStream],
    AST.Address,
    AST.ReferenceAddress
  >(
    // first parse the path-wb-ws string
    P.left<[[CU.CharStream, CU.CharStream], CU.CharStream], CU.CharStream>(quotedPrefix)(P.char('!'))
  )(
    // then parse the address itself
    PA.addrAny
  )(
    // then stick them together and return a RangeAddress object
    ([[p, wb], ws], a) => new AST.ReferenceAddress(new AST.Env(p.toString(), wb.toString(), ws.toString()), a)
  );

  /**
   * Parses an address reference that only includes a worksheet.
   */
  export const addressReferenceWorksheet = P.pipe2<CU.CharStream, AST.Address, AST.ReferenceAddress>(
    // first parse the path-wb-ws string
    P.left<CU.CharStream, CU.CharStream>(worksheetName)(P.char('!'))
  )(
    // then parse the address itself
    PA.addrAny
  )(
    // then stick them together and return a RangeAddress object
    (ws, a) => new AST.ReferenceAddress(new AST.Env(PP.EnvStub.path, PP.EnvStub.workbookName, ws.toString()), a)
  );

  /**
   * Parses a bare address reference.
   */
  export const addressReferenceBare = P.pipe<AST.Address, AST.ReferenceAddress>(
    // parse the address itself
    PA.addrAny
  )(
    // then return a RangeAddress object
    r => new AST.ReferenceAddress(PP.EnvStub, r)
  );

  /**
   * Parses any range reference.
   */
  export const addressReference = P.choices<AST.Expression>(
    addressReferenceWorkbook,
    addressReferenceWorksheet,
    addressReferenceBare
  );

  /**
   * Parses a named reference prefix.
   */
  export const namedReferenceFirstChar = P.choice(P.sat(ch => ch === '_'))(P.letter);

  /**
   * Parses a named reference suffix.
   */
  export const namedReferenceLastChars = P.pipe<CU.CharStream[], CU.CharStream>(
    P.many1(
      P.choices(
        P.sat(ch => ch === '_'),
        P.letter,
        P.digit
      )
    )
  )(CU.CharStream.concat);

  /**
   * Parses a named reference.
   */
  export const namedReference = P.pipe2<CU.CharStream, CU.CharStream, AST.Expression>(namedReferenceFirstChar)(
    namedReferenceLastChars
  )((c, s) => new AST.ReferenceNamed(c.toString() + s.toString()));

  /**
   * Parses a constant.
   */
  export const constant = P.pipe<number, AST.Number>(P.float)(n => new AST.Number(n));

  /**
   * Parses a string literal.
   */
  export const stringLiteral: P.IParser<AST.Expression> = P.pipe<CU.CharStream, AST.StringLiteral>(
    P.between<CU.CharStream, CU.CharStream, CU.CharStream>(P.char('"'))(P.char('"'))(
      P.pipe<CU.CharStream[], CU.CharStream>(P.many(P.sat(ch => ch !== '"')))(CU.CharStream.concat)
    )
  )(s => new AST.StringLiteral(s.toString()));

  /**
   * Parses a boolean literal.
   */
  export const booleanLiteral: P.IParser<AST.Expression> = P.pipe<CU.CharStream, AST.Boolean>(
    P.choice(P.str('TRUE'))(P.str('FALSE'))
  )(b => new AST.Boolean(b.toString().toLowerCase() === 'true'));

  /**
   * Parses any data.
   * @param R A Range parser.
   */
  export function data(R: P.IParser<AST.Range>) {
    return P.choices<AST.Expression>(
      rangeReference(R),
      addressReference,
      booleanLiteral,
      constant,
      // before continuing, ensure that no reserved words
      // are present; the reservedWord parser is a lookahead parser
      // that succeeds, consuming no input, when no reserved words
      // are present at the start of the input stream
      P.right<undefined, AST.Expression>(RW.reservedWord)(P.choices(stringLiteral, namedReference))
    );
  }
}
