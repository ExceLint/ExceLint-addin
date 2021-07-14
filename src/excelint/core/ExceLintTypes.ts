// import { WorkbookOutput, WorksheetOutput } from './exceljson';
import { ExcelUtils } from "./excelutils";
import { Classification } from "./classification";
import { IComparable, Option, Some, None } from "./option";

interface Dict<V> {
  [key: string]: V;
}

/**
 * A true polymorphic fold left, unlike JavaScript's stupid reduce function.
 * @param init The initial value of the fold.
 * @param f A fold function.
 * @param seq The input sequence.
 * @returns The result of folding f across seq.
 */
/* eslint-disable no-unused-vars */
function polyFold<A, B>(init: B, f: (acc: B, elem: A) => B, seq: A[]): B {
  let myAcc = init;
  for (const e of seq) {
    myAcc = f(myAcc, e);
  }
  return myAcc;
}

export class Dictionary<V> {
  private _d: Dict<V> = {};

  public contains(key: string): boolean {
    return this._d[key] !== undefined;
  }
  public get(key: string): V {
    if (this.contains(key)) {
      return this._d[key];
    } else {
      throw new Error("Cannot get unknown key '" + key + "' in dictionary.");
    }
  }
  public put(key: string, value: V): void {
    this._d[key] = value;
  }
  public del(key: string): V {
    if (this.contains(key)) {
      const v = this._d[key];
      delete this._d[key];
      return v;
    } else {
      throw new Error("Cannot delete unknown key '" + key + "' in dictionary.");
    }
  }
  public get keys(): string[] {
    const output: string[] = [];
    for (let key in this._d) {
      output.push(key);
    }
    return output;
  }
  public get values(): V[] {
    const output: V[] = [];
    for (let key in this._d) {
      output.push(this._d[key]);
    }
    return output;
  }
  public get size(): number {
    return this.keys.length;
  }

  /**
   * Performs a shallow copy of the dictionary.
   */
  public clone(): Dictionary<V> {
    const dict = new Dictionary<V>();
    for (const key of this.keys) {
      dict.put(key, this.get(key));
    }
    return dict;
  }

  /**
   * Merges this dictionary with another dictionary.  Throws an exception if there are
   * duplicate keys. Returns a copy.
   * @param o The other dictionary.
   */
  public merge(o: Dictionary<V>): Dictionary<V> {
    const merged = this.clone();
    for (const key of o.keys) {
      if (merged.contains(key)) {
        throw new Error("Cannot merge dictionaries that contain copies of the same key.");
      }
      merged.put(key, o.get(key));
    }
    return merged;
  }

  /**
   * Return the dictionary that contains all of the elements from this
   * dictionary for which f(key) is true.
   * @param f A key predicate.
   * @returns The filtered dictionary.
   */
  /* eslint-disable no-unused-vars */
  public keyFilter(f: (key: string) => boolean): Dictionary<V> {
    const _d = new Dictionary<V>();
    for (const k of this.keys) {
      if (f(k)) {
        _d.put(k, this.get(k));
      }
    }
    return _d;
  }
}

export class CSet<V extends IComparable<V>> implements IComparable<CSet<V>> {
  private _vs: V[] = [];

  constructor(values: V[]) {
    for (let i = 0; i < values.length; i++) {
      this.add(values[i]);
    }
  }

  public add(v: V): boolean {
    let keep = true;
    for (let i = 0; i < this._vs.length; i++) {
      if (v.equals(this._vs[i])) {
        keep = false;
        break;
      }
    }
    if (keep) this._vs.push(v);
    return keep;
  }

  public get size() {
    return this._vs.length;
  }

  public get values() {
    return this._vs;
  }

  private clone(): CSet<V> {
    return new CSet(this.values);
  }

  public equals(vs: CSet<V>) {
    if (this.size !== vs.size) {
      return false;
    }
    const copy = this.clone();
    const values = vs.values;
    for (let i = 0; i < values.length; i++) {
      copy.add(values[i]);
      if (this.size !== copy.size) return false;
    }
    return true;
  }

  /* eslint-disable no-unused-vars */
  public map<X extends IComparable<X>>(f: (v: V) => X): CSet<X> {
    const output = CSet.empty<X>();
    for (let i = 0; i < this._vs.length; i++) {
      const fi = f(this._vs[i]);
      output.add(fi);
    }
    return output;
  }

  /**
   * Returns a new set object which is the union
   * @param set
   */
  public union(set: CSet<V>): CSet<V> {
    const output = this.clone();
    for (let i = 0; i < set.values.length; i++) {
      output.add(set.values[i]);
    }
    return output;
  }

  public static empty<T extends IComparable<T>>(): CSet<T> {
    return new CSet<T>([]);
  }

  public toString(): string {
    return "{" + this._vs.join(",") + "}";
  }
}

// all users of Spreadsheet store their data in row-major format (i.e., indexed by y first, then x).
export type Spreadsheet = string[][];

export class Address implements IComparable<Address> {
  private readonly _sheet: string;
  private readonly _row: number;
  private readonly _column: number;
  constructor(sheet: string, row: number, column: number) {
    this._sheet = sheet;
    this._row = row;
    this._column = column;
  }
  public get row(): number {
    return this._row;
  }
  public get column(): number {
    return this._column;
  }
  public get worksheet(): string {
    return this._sheet;
  }
  public equals(a: Address): boolean {
    return this._sheet === a._sheet && this._row === a._row && this._column === a._column;
  }
  public toR1C1Ref(): string {
    return "R" + this._row + "C" + this._column;
  }
  public toFullyQualifiedR1C1Ref(): string {
    return this._sheet + "!" + this.toR1C1Ref();
  }
  public toA1Ref(): string {
    if (this._column <= 0) {
      throw new Error("Column cannot be zero or negative.");
    }
    return Address.intToColChars(this._column) + this._row.toString();
  }
  public toFullyQualifiedA1Ref(): string {
    return this._sheet + "!" + this.toA1Ref();
  }
  private static intToColChars(dividend: number): string {
    let quot = Math.floor(dividend / 26);
    const rem = dividend % 26;
    if (rem === 0) {
      quot -= 1;
    }
    const ltr = rem === 0 ? "Z" : String.fromCharCode(64 + rem);
    if (quot === 0) {
      return ltr;
    } else {
      return Address.intToColChars(quot) + ltr;
    }
  }
  public toString(): string {
    return this.toFullyQualifiedR1C1Ref();
  }
  public asKey(): string {
    return this.toFullyQualifiedR1C1Ref();
  }
  public static fromKey(k: string): Address {
    return ExcelUtils.addrA1toR1C1(k);
  }
  public asVector(): ExceLintVector {
    return new ExceLintVector(this._column, this._row, 0);
  }
}

export class Range implements IComparable<Range> {
  private readonly start: Address;
  private readonly end: Address;
  constructor(addrStart: Address, addrEnd: Address) {
    this.start = addrStart;
    this.end = addrEnd;
  }
  public get addressStart() {
    return this.start;
  }
  public get addressEnd() {
    return this.end;
  }
  public rectangle() {
    const v1 = new ExceLintVector(this.start.column, this.start.row, 0);
    const v2 = new ExceLintVector(this.end.column, this.end.row, 0);
    return new Rectangle(v1, v2);
  }
  public equals(r: Range): boolean {
    return this.start.equals(r.start) && this.end.equals(r.end);
  }
  public toString(): string {
    return this.toR1C1Ref();
  }
  public toFullyQualifiedR1C1Ref(): string {
    return this.start.worksheet + "!" + this.toR1C1Ref();
  }
  public toR1C1Ref(): string {
    return this.start.toR1C1Ref() + ":" + this.end.toR1C1Ref();
  }
  public toFullyQualifiedA1Ref(): string {
    return this.start.worksheet + "!" + this.toA1Ref();
  }
  public toA1Ref(): string {
    return this.start.toA1Ref() + ":" + this.end.toA1Ref();
  }
  /**
   * Returns the 1-based upper left column coordinate.
   */
  public get upperLeftColumn(): number {
    return this.start.column;
  }
  /**
   * Returns the 1-based upper left row coordinate.
   */
  public get upperLeftRow(): number {
    return this.start.row;
  }
  /**
   * Returns the 1-based bottom right column coordinate.
   */
  public get bottomRightColumn(): number {
    return this.end.column;
  }
  /**
   * Returns the 1-based bottom right row coordinate.
   */
  public get bottomRightRow(): number {
    return this.end.row;
  }

  /**
   * Finds the range in the intersection between this range
   * and another range, r.
   * @param r Another range.
   * @returns The intersecting range.
   */
  public intersectWith(r: Range): Range {
    // intersection is stored here
    const _d = new Dictionary<ExceLintVector>();

    // get addresses in this range
    const myVectors = this.rectangle().expand();

    // get addresses in other range
    const otherVectors = r.rectangle().expand();
    const otherVectorSet = new Set<string>();
    for (const v of otherVectors) {
      otherVectorSet.add(v.asKey());
    }

    // find addresses in both ranges; store in _d
    for (const v of myVectors) {
      const key = v.asKey();
      if (otherVectorSet.has(key)) {
        _d.put(key, v);
      }
    }

    // find the upperleft and bottomright addresses
    const ul_x = polyFold(
      Number.MAX_SAFE_INTEGER,
      (acc: number, k: string) => (_d.get(k).x < acc ? _d.get(k).x : acc),
      _d.keys
    );
    const ul_y = polyFold(
      Number.MAX_SAFE_INTEGER,
      (acc: number, k: string) => (_d.get(k).y < acc ? _d.get(k).y : acc),
      _d.keys
    );
    const br_x = polyFold(
      Number.MIN_SAFE_INTEGER,
      (acc: number, k: string) => (_d.get(k).x > acc ? _d.get(k).x : acc),
      _d.keys
    );
    const br_y = polyFold(
      Number.MIN_SAFE_INTEGER,
      (acc: number, k: string) => (_d.get(k).y > acc ? _d.get(k).y : acc),
      _d.keys
    );

    // the intersection is rectangular, because the orthogonal intersection of two
    // rectangles must be a rectangle, so ul = (ul_x, ul_y) and br = (br_x, br_y)
    return new Range(new Address(this.start.worksheet, ul_y, ul_x), new Address(this.start.worksheet, br_y, br_x));
  }
}

export class Fingerprint implements IComparable<Fingerprint> {
  private readonly _fp: number;

  constructor(fpval: number) {
    this._fp = fpval;
  }

  public equals(f: Fingerprint): boolean {
    return this._fp === f._fp;
  }

  public asKey(): string {
    return this._fp.toString();
  }

  public static fromKey(key: string): Fingerprint {
    return new Fingerprint(parseInt(key));
  }

  /**
   * Returns the fingerprint value (the L1 norm of the resultant vector).
   */
  public get value(): number {
    return this._fp;
  }
}

export type Metric = number;

// a rectangle is defined by its start and end vectors
export class Rectangle implements IComparable<Rectangle> {
  private readonly _tl: ExceLintVector;
  private readonly _br: ExceLintVector;

  constructor(tl: ExceLintVector, br: ExceLintVector) {
    this._tl = tl;
    this._br = br;
  }

  public equals(r: Rectangle): boolean {
    return this._tl.equals(r._tl) && this._br.equals(r._br);
  }

  public get upperleft() {
    return this._tl;
  }

  public get bottomright() {
    return this._br;
  }

  /**
   * Expands a Rectangle into an array of vectors.
   * @returns Array of vectors.
   */
  public expand(): ExceLintVector[] {
    return expand(this._tl, this._br);
  }

  /**
   * Returns true if this rectangle is adjacent and merge-compatible with r.
   * @param r
   */
  public isMergeableWith(r: Rectangle): boolean {
    return this.above(r) || this.below(r) || this.left(r) || this.right(r);
  }

  /**
   * Returns true if this rectangle is immediately above r and
   * is merge-compatible.
   * @param r The other rectangle
   */
  private above(r: Rectangle): boolean {
    return (
      this.upperleft.x === r.upperleft.x &&
      this.bottomright.x === r.bottomright.x &&
      this.bottomright.y + 1 === r.upperleft.y
    );
  }

  /**
   * Returns true if this rectangle is immediately below r and
   * is merge-compatible.
   * @param r The other rectangle
   */
  private below(r: Rectangle): boolean {
    return r.above(this);
  }

  /**
   * Returns true if this rectangle is immediately to the left of r and
   * is merge-compatible.
   * @param r The other rectangle
   */
  private left(r: Rectangle): boolean {
    return (
      this.upperleft.y === r.upperleft.y &&
      this.bottomright.y === r.bottomright.y &&
      this.bottomright.x + 1 === r.upperleft.x
    );
  }

  /**
   * Returns true if this rectangle is immediately to the right of r and
   * is merge-compatible.
   * @param r The other rectangle
   */
  private right(r: Rectangle): boolean {
    return r.left(this);
  }

  /**
   * A function that hashes rectangle dimensions.
   */
  public hash(): string {
    return this._tl.toString() + this._br.toString();
  }

  /**
   * Attempts to merge this rectangle with another rectangle.  If the two
   * rectangles are not merge-compatible, returns None.
   * @param Another rectangle.
   * @returns Some merged rectangle, or None if not mergeable.
   */
  public merge(r: Rectangle): Option<Rectangle> {
    if (this.above(r) || this.left(r)) {
      return new Some(new Rectangle(this.upperleft, r.bottomright));
    }
    if (this.below(r) || this.right(r)) {
      return new Some(new Rectangle(r.upperleft, this.bottomright));
    }
    return None;
  }

  /**
   * Returns true iff the rectangle contains the vector, v.
   * @param v An ExceLint vector.
   */
  public contains(v: ExceLintVector): boolean {
    return v.x >= this.upperleft.x && v.x <= this.bottomright.x && v.y >= this.upperleft.y && v.y <= this.bottomright.y;
  }

  /**
   * Returns true iff the rectangle is a single cell, and the
   * vector, v, is contained within it.
   * @param v
   */
  public is(v: ExceLintVector): boolean {
    return this.contains(v) && this.upperleft.x === this.bottomright.x && this.upperleft.y === this.bottomright.y;
  }
}

export class ProposedFix implements IComparable<ProposedFix> {
  // This comment no longer holds, since there is a data type for ProposedFix,
  // but it is informative, since it explains the meaning of the fields:
  // ## old comment ##
  //   Format of proposed fixes =, e.g., [-3.016844756293869, [[5,7],[5,11]],[[6,7],[6,11]]]
  //   entropy, and two ranges:
  //      upper-left corner of range (column, row), lower-right corner of range (column, row)
  // ## end old comment ##
  private _score: number; // fix distance (entropy)
  private _rect1: Rectangle; // suspected bug
  private _rect2: Rectangle; // merge candidate
  private _sameFormat: boolean = true; // the two rectangles have the same format
  private _analysis: Option<FixAnalysis> = None; // we add this later, after we analyze the fix

  constructor(score: number, rect1: Rectangle, rect2: Rectangle) {
    this._score = score;
    this._rect1 = rect1;
    this._rect2 = rect2;
  }

  public get rectangles(): [Rectangle, Rectangle] {
    return [this._rect1, this.rect2];
  }

  public get score(): number {
    return this._score;
  }

  public set score(s: number) {
    this._score = s;
  }

  public get rect1(): Rectangle {
    return this._rect1;
  }

  public get rect2(): Rectangle {
    return this._rect2;
  }

  public get analysis(): FixAnalysis {
    if (this._analysis.hasValue) {
      return this._analysis.value;
    } else {
      throw new Error("Cannot obtain analysis about unanalyzed fix.");
    }
  }

  public set analysis(fix_analysis: FixAnalysis) {
    this._analysis = new Some(fix_analysis);
  }

  public get sameFormat(): boolean {
    return this._sameFormat;
  }

  public set sameFormat(is_same: boolean) {
    this._sameFormat = is_same;
  }

  public equals(other: ProposedFix): boolean {
    return this._rect1.equals(other._rect1) && this._rect2.equals(other._rect2);
  }

  public includesCellAt(addr: Address): boolean {
    // convert addr to an ExceLintVector
    const v = new ExceLintVector(addr.column, addr.row, 0);

    // check the rectangles
    const first_cells = this.rect1.expand();
    const second_cells = this.rect2.expand();
    const all_cells = first_cells.concat(second_cells);
    for (let i = 0; i < all_cells.length; i++) {
      const cell = all_cells[i];
      if (v.equals(cell)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the rectangle that contains the address, if any
   * rectangle contains it.
   * @param addr An address
   */
  public getRectOf(addr: Address): Option<Rectangle> {
    // convert addr to an ExceLintVector
    const v = new ExceLintVector(addr.column, addr.row, 0);

    // check first rectangle
    if (this.rect1.contains(v)) {
      return new Some(this.rect1);
    }

    // check second rectangle
    if (this.rect2.contains(v)) {
      return new Some(this.rect2);
    }

    return None;
  }
}

export function upperleft(r: Rectangle): ExceLintVector {
  return r.upperleft;
}

export function bottomright(r: Rectangle): ExceLintVector {
  return r.bottomright;
}

// Convert a rectangle into a list of vectors.
export function expand(first: ExceLintVector, second: ExceLintVector): ExceLintVector[] {
  const expanded: ExceLintVector[] = [];
  for (let i = first.x; i <= second.x; i++) {
    for (let j = first.y; j <= second.y; j++) {
      expanded.push(new ExceLintVector(i, j, 0));
    }
  }
  return expanded;
}

export class ExceLintVector {
  public readonly x: number;
  public readonly y: number;
  public readonly c: number;

  constructor(x: number, y: number, c: number) {
    this.x = x;
    this.y = y;
    this.c = c;
  }

  public static baseVector(): ExceLintVector {
    return new ExceLintVector(0, 0, 0);
  }

  public isConstant(): boolean {
    return this.c === 1;
  }

  public static Zero(): ExceLintVector {
    return new ExceLintVector(0, 0, 0);
  }

  // Add other to this vector
  public add(v: ExceLintVector): ExceLintVector {
    return new ExceLintVector(this.x + v.x, this.y + v.y, this.c + v.c);
  }

  // Subtract other from this vector
  public subtract(v: ExceLintVector): ExceLintVector {
    return new ExceLintVector(this.x - v.x, this.y - v.y, this.c - v.c);
  }

  // Turn this vector into a string that can be used as a dictionary key
  public asKey(): string {
    return this.x.toString() + "," + this.y.toString() + "," + this.c.toString();
  }

  // Turn a key into a vector
  public static fromKey(key: string): ExceLintVector {
    const parts = key.split(",");
    const x = parseInt(parts[0]);
    const y = parseInt(parts[1]);
    const c = parseInt(parts[2]);
    return new ExceLintVector(x, y, c);
  }

  // Return true if this vector encodes a reference
  public isReference(): boolean {
    return !(this.x === 0 && this.y === 0 && this.c !== 0);
  }

  // Pretty-print vectors
  public toString(): string {
    return "<" + this.asKey() + ">";
  }

  // performs a deep eqality check
  public equals(other: ExceLintVector): boolean {
    return this.x === other.x && this.y === other.y && this.c === other.c;
  }

  public hash(): number {
    // This computes a weighted L1 norm of the vector
    const v0 = Math.abs(this.x);
    const v1 = Math.abs(this.y);
    const v2 = this.c;
    return ExceLintVector.Multiplier * (v0 + v1 + v2);
  }

  /**
   * Gets the vector of the cell above this one
   */
  public get up(): ExceLintVector {
    return new ExceLintVector(this.x, this.y - 1, this.c);
  }

  /**
   * Gets the vector of the cell below this one
   */
  public get down(): ExceLintVector {
    return new ExceLintVector(this.x, this.y + 1, this.c);
  }

  /**
   * Gets the vector of the cell to the left of this one
   */
  public get left(): ExceLintVector {
    return new ExceLintVector(this.x - 1, this.y, this.c);
  }

  /**
   * Gets the vector of the cell to the right of this one
   */
  public get right(): ExceLintVector {
    return new ExceLintVector(this.x + 1, this.y, this.c);
  }

  // vector sum reduction
  public static readonly VectorSum = (acc: ExceLintVector, curr: ExceLintVector): ExceLintVector =>
    new ExceLintVector(acc.x + curr.x, acc.y + curr.y, acc.c + curr.c);

  public static vectorSetEquals(set1: ExceLintVector[], set2: ExceLintVector[]): boolean {
    // create a hashs et with elements from set1,
    // and then check that set2 induces the same set
    const hset: Set<number> = new Set();
    set1.forEach((v) => hset.add(v.hash()));

    // check hset1 for hashes of elements in set2.
    // if there is a match, remove the element from hset1.
    // if there isn't a match, return early.
    for (let i = 0; i < set2.length; i++) {
      const h = set2[i].hash();
      if (hset.has(h)) {
        hset.delete(h);
      } else {
        // sets are definitely not equal
        return false;
      }
    }

    // sets are equal iff hset has no remaining elements
    return hset.size === 0;
  }

  // A multiplier for the hash function.
  public static readonly Multiplier = 1; // 103037;

  // Given an array of ExceLintVectors, returns an array of unique
  // ExceLintVectors.  This explicitly does not return Javascript's Set
  // datatype, which is inherently dangerous for UDTs, since it curiously
  // provides no mechanism for specifying membership based on user-defined
  // object equality.
  public static toSet(vs: ExceLintVector[]): ExceLintVector[] {
    const out: ExceLintVector[] = [];
    const hset: Set<number> = new Set();
    for (const i in vs) {
      const v = vs[i];
      const h = v.hash();
      if (!hset.has(h)) {
        out.push(v);
        hset.add(h);
      }
    }
    return out;
  }
}

export class Analysis {
  suspicious_cells: ExceLintVector[];
  grouped_formulas: Dictionary<Rectangle[]>;
  grouped_data: Dictionary<Rectangle[]>;
  proposed_fixes: ProposedFix[];
  formula_fingerprints: Dictionary<Fingerprint>;
  data_fingerprints: Dictionary<Fingerprint>;

  constructor(
    suspicious_cells: ExceLintVector[],
    grouped_formulas: Dictionary<Rectangle[]>,
    grouped_data: Dictionary<Rectangle[]>,
    proposed_fixes: ProposedFix[],
    formula_fingerprints: Dictionary<Fingerprint>,
    data_fingerprints: Dictionary<Fingerprint>
  ) {
    this.suspicious_cells = suspicious_cells;
    this.grouped_formulas = grouped_formulas;
    this.grouped_data = grouped_data;
    this.proposed_fixes = proposed_fixes;
    this.formula_fingerprints = formula_fingerprints;
    this.data_fingerprints = data_fingerprints;
  }
}

export function vectorComparator(v1: ExceLintVector, v2: ExceLintVector): number {
  if (v1.x < v2.x) {
    return -1;
  }
  if (v1.x > v2.x) {
    return 1;
  }
  if (v1.y < v2.y) {
    return -1;
  }
  if (v1.y > v2.y) {
    return 1;
  }
  if (v1.c < v2.c) {
    return -1;
  }
  if (v1.c > v2.c) {
    return 1;
  }
  return 0;
}

// A comparator that sorts rectangles by their upper-left and then lower-right
// vectors.
export function rectangleComparator(r1: Rectangle, r2: Rectangle): number {
  const cmp = vectorComparator(r1.upperleft, r2.upperleft);
  if (cmp == 0) {
    return vectorComparator(r1.bottomright, r2.bottomright);
  } else {
    return cmp;
  }
}

export class RectInfo {
  formula: string; // actual formula
  constants: number[] = []; // all the numeric constants in each formula
  sum: number; // the sum of all the numeric constants in each formula
  dependencies: ExceLintVector[] = []; // the set of no-constant dependence vectors in the formula
  dependence_count: number; // the number of dependent cells
  absolute_refcount: number; // the number of absolute references in each formula
  r1c1_formula: string; // formula in R1C1 format
  r1c1_print_formula: string; // as above, but for R1C1 formulas
  print_formula: string; // formula with a preface (the cell name containing each)

  constructor(rect: Rectangle, firstFormula: string) {
    // the coordinates of the cell containing the first formula in the proposed fix range
    const formulaCoord = rect.upperleft;
    const y = formulaCoord.y - 1; // row
    const x = formulaCoord.x - 1; // col
    this.formula = firstFormula; // the formula itself
    this.constants = ExcelUtils.numeric_constants(this.formula); // all numeric constants in the formula
    this.sum = this.constants.reduce((a, b) => a + b, 0); // the sum of all numeric constants
    this.dependencies = ExcelUtils.all_cell_dependencies(this.formula, x + 1, y + 1, false);
    this.dependence_count = this.dependencies.length;
    this.absolute_refcount = (this.formula.match(/\$/g) || []).length;
    this.r1c1_formula = ExcelUtils.formulaToR1C1(this.formula, x + 1, y + 1);
    const preface = ExcelUtils.column_index_to_name(x + 1) + (y + 1) + ":";
    this.r1c1_print_formula = preface + this.r1c1_formula;
    this.print_formula = preface + this.formula;
  }
}

export class FixAnalysis {
  classification: Classification.BinCategory[];
  analysis: RectInfo[];
  direction_is_vert: boolean;

  constructor(classification: Classification.BinCategory[], analysis: RectInfo[], direction_is_vert: boolean) {
    this.classification = classification;
    this.analysis = analysis;
    this.direction_is_vert = direction_is_vert;
  }

  // Compute the difference in constant sums
  public totalNumericDifference(): number {
    return Math.abs(this.analysis[0].sum - this.analysis[1].sum);
  }

  // Compute the magnitude of the difference in constant sums
  public magnitudeNumericDifference(): number {
    const n = this.totalNumericDifference();
    return n === 0 ? 0 : Math.log10(n);
  }
}

/**
 * A generic, comparable array.
 */
export class CArray<V extends IComparable<V>> extends Array<V> implements IComparable<CArray<V>> {
  private data: V[];
  constructor(arr: V[]) {
    super();
    this.data = arr;
  }
  public equals(arr: CArray<V>): boolean {
    if (this.data.length != arr.data.length) {
      return false;
    }
    for (let i = 0; i < this.data.length; i++) {
      if (!this.data[i].equals(arr.data[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns a new CArray formed by concatenating this CArray with
   * the given CArray.  Does not modify given CArrays.
   * @param arr A CArray.
   */
  public concat(arr: CArray<V>): CArray<V> {
    return new CArray(this.data.concat(arr.data));
  }

  public toString(): string {
    return this.data.toString();
  }

  public valueAt(index: number): V {
    return this.data[index];
  }

  public get size(): number {
    return this.data.length;
  }
}

export class Tuple2<T extends IComparable<T>, U extends IComparable<U>> implements IComparable<Tuple2<T, U>> {
  private _elem1: T;
  private _elem2: U;

  constructor(elem1: T, elem2: U) {
    this._elem1 = elem1;
    this._elem2 = elem2;
  }

  public get first(): T {
    return this._elem1;
  }

  public get second(): U {
    return this._elem2;
  }

  public equals(t: Tuple2<T, U>): boolean {
    return this._elem1.equals(t._elem1) && this._elem2.equals(t._elem2);
  }
}

export class Adjacency {
  private _up: Option<Tuple2<Rectangle, Fingerprint>>;
  private _down: Option<Tuple2<Rectangle, Fingerprint>>;
  private _left: Option<Tuple2<Rectangle, Fingerprint>>;
  private _right: Option<Tuple2<Rectangle, Fingerprint>>;

  constructor(
    up: Option<Tuple2<Rectangle, Fingerprint>>,
    down: Option<Tuple2<Rectangle, Fingerprint>>,
    left: Option<Tuple2<Rectangle, Fingerprint>>,
    right: Option<Tuple2<Rectangle, Fingerprint>>
  ) {
    this._up = up;
    this._down = down;
    this._left = left;
    this._right = right;
  }

  public get up() {
    return this._up;
  }

  public get down() {
    return this._down;
  }

  public get left() {
    return this._left;
  }

  public get right() {
    return this._right;
  }
}

export class IncrementalWorkbookAnalysis {}
