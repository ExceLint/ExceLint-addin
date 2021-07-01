/**
 * An implementation of the longest common subsequence algorithm.  Ported from
 * https://github.com/plasma-umass/DataDebug/blob/master/LongestCommonSubsequence/LCS.fs
 *
 * by D. Barowy (2021-02-12)
 */

import { CSet, CArray } from './ExceLintTypes';
import { IComparable } from './option';

/**
 * Throws an error if the condition is false.
 * @param pred A boolean (usually the result of a conditional expr).
 * @param msg The error message to throw.
 */
function assert(pred: boolean, msg?: string): void {
  if (!pred) {
    throw new Error(msg);
  }
}

export class NumPair implements IComparable<NumPair> {
  private fst: number;
  private snd: number;

  constructor(first: number, second: number) {
    this.fst = first;
    this.snd = second;
  }

  public equals(v: NumPair): boolean {
    return this.first === v.first && this.second === v.second;
  }

  public get first(): number {
    return this.fst;
  }

  public get second(): number {
    return this.snd;
  }

  public toString(): string {
    return '(' + this.fst + ',' + this.snd + ')';
  }
}

/**
 * Initialize a 2D array and fill it with a value;
 * @param value A value of type T.
 * @param m The size of the first array dimension.
 * @param n The size of the second array dimension.
 */
function fill2D<T>(value: T, m: number, n: number): T[][] {
  const arr: T[][] = [];
  for (let i = 0; i < m; i++) {
    arr[i] = [];
    for (let j = 0; j < n; j++) {
      arr[i][j] = value;
    }
  }
  return arr;
}

/**
 * Computes the set of longest subsequences.
 * @param x One string.
 * @param y Another string.
 */
export function lcs(x: string, y: string): string[] {
  const m = x.length;
  const n = y.length;
  const C = makeTable(x, m, y, n);
  return backtrackAll(C, x, m, y, n);
}

/**
 * Computes the set of longest subsequences in the form of string alignments, where
 * an alignment is a sequence of pairs of matching character indices.  The first element
 * in the pair is an index into x and the second element is an index into y.
 * @param x One string.
 * @param y Another string.
 */
export function lcs_alignments(x: string, y: string): CSet<CArray<NumPair>> {
  const m = x.length;
  const n = y.length;
  const C = makeTable(x, m, y, n);
  return getCharPairs(C, x, m, y, n);
}

export class LCSInsert {
  tag: 'insert';
  ch: string;
  aln: NumPair;
  constructor(ch: string, alignment: NumPair) {
    this.ch = ch;
    this.aln = alignment;
    this.tag = 'insert';
  }
  public toString(): string {
    return '[+' + this.ch + ']';
  }
}
export class LCSDelete {
  tag: 'delete';
  ch: string;
  aln: NumPair;
  constructor(ch: string, alignment: NumPair) {
    this.ch = ch;
    this.aln = alignment;
    this.tag = 'delete';
  }
  public toString(): string {
    return '[-' + this.ch + ']';
  }
}
export class LCSReplace {
  tag: 'replace';
  was: string;
  nowis: string;
  aln: NumPair;
  constructor(was: string, nowis: string, alignment: NumPair) {
    this.was = was;
    this.nowis = nowis;
    this.aln = alignment;
    this.tag = 'replace';
  }
  public toString(): string {
    return '[' + this.was + '/' + this.nowis + ']';
  }
}
export class LCSKeep {
  tag: 'keep';
  is: string;
  aln: NumPair;
  constructor(is: string, alignment: NumPair) {
    this.is = is;
    this.aln = alignment;
    this.tag = 'keep';
  }
  public toString(): string {
    return this.is;
  }
}
export type LCSEdit = LCSInsert | LCSDelete | LCSReplace | LCSKeep;

/**
 * Computes the sequence of edits to transform string x into string y.
 * @param x String x.
 * @param y String y.
 */
export function findEdits(x: string, y: string): LCSEdit[][] {
  const R = lcs_alignments(x, y);
  const editSet: LCSEdit[][] = [];
  for (let n = 0; n < R.values.length; n++) {
    const sub = R.values[n]; // the nth LCS
    editSet[n] = []; // initialize this LCS's edit sequence
    let i = 0; // index into x
    let j = 0; // index into y
    let k = 0; // index into R
    while (i < x.length || j < y.length) {
      // have we processed all of the alignments?
      const al = new NumPair(i, j);

      // yes, now handle the remainder of the string
      if (i >= x.length) {
        // characters remain in y-- these are inserts
        editSet[n].push(new LCSInsert(y.charAt(j), al));
        j++;
        continue;
      } else if (j >= y.length) {
        // characters remain in x-- these are keeps
        editSet[n].push(new LCSInsert(x.charAt(i), al));
        i++;
        continue;
      } else if (k >= sub.size) {
        // out of alignments, but i and j are not at
        // the end of x and y, respectively.
        // i < x.length && j < y.length, so these are replacements
        editSet[n].push(new LCSReplace(x.charAt(i), y.charAt(j), al));
        i++;
        j++;
        continue;
      }

      // no, process alignments and things between alignments
      // is the next character alignment in the subsequence (i,j)?
      const next = sub.valueAt(k);
      if (al.equals(next)) {
        // we don't need to edit anything
        editSet[n].push(new LCSKeep(x.charAt(i), al));
        i++;
        j++;
        k++;
      } else {
        // which index in the pair matches?
        if (al.first === next.first) {
          // this represents an insertion;
          // insert the character from y[j].
          editSet[n].push(new LCSInsert(y.charAt(j), al));
          j++;
        } else if (al.second === next.second) {
          // this represents a deletion;
          // delete the character from x[i].
          editSet[n].push(new LCSDelete(x.charAt(i), al));
          i++;
        } else {
          // this is both an insertion and a deletion;
          // delete the character from x[i] and
          // insert the character from y[j].
          editSet[n].push(new LCSReplace(x.charAt(i), y.charAt(j), al));
          i++;
          j++;
        }
      }
    }
  }

  return editSet;
}

/**
 * Computes the minimum sequence of edits to transform string x into
 * string y. On length ties, returns the "most consistent" edit, where
 * one edit is more consistent than another if it switches edit
 * operations the least. If two or more edits are "most consistent", the
 * algorithm chooses arbitrarily.
 * @param x String x.
 * @param y String y.
 */
export function findMinEdit(x: string, y: string): LCSEdit[] {
  const editSet = findEdits(x, y);
  assert(editSet.length > 0);

  // find the shortest edit sequence
  let min = 0;
  for (let i = 0; i < editSet.length; i++) {
    if (editSet[i].length < editSet[min].length) {
      min = i;
    }
  }

  // find all of the edits of length min
  const candidateEdits = editSet.filter(ed => ed.length === editSet[min].length);

  // sort by edit consistency
  candidateEdits.sort((e1, e2) => editConsistency(e1) - editConsistency(e2));

  // return the first candidate
  return candidateEdits[0];
}

/**
 * Finds the suffix corresponding to the shortest and most consistent
 * update from string x to string y.  Returns a tuple representing the
 * start index of the edit, along with the replacement string.
 * @param x String x
 * @param y String y
 */
export function suffixUpdate(x: string, y: string): [number, string] {
  // find the "most consistent" short edit
  const edit = findMinEdit(x, y);

  // compute the replacement string
  let s = '';
  let found_start = false;
  let start_idx = 0;
  for (let i = 0; i < edit.length; i++) {
    const editOp = edit[i];
    switch (editOp.tag) {
      case 'keep':
        // only add keeps to string if we've
        // alreay found the end of the prefix
        if (found_start) {
          s += editOp.is;
        }
        break;
      case 'insert':
        s += editOp.ch;
        if (!found_start) {
          start_idx = editOp.aln.second;
          found_start = true;
        }
        break;
      case 'replace':
        s += editOp.nowis;
        if (!found_start) {
          start_idx = editOp.aln.first;
          found_start = true;
        }
        break;
      case 'delete':
        if (!found_start) {
          start_idx = editOp.aln.first;
          found_start = true;
        }
        break;
      default:
        throw new Error('Unknown edit type.');
    }
  }

  return [start_idx, s];
}

/**
 * Counts the number of times an edit changes operations.
 * @param edit A sequence of edit operations.
 */
function editConsistency(edit: LCSEdit[]): number {
  assert(edit.length > 0);
  let count = 0;
  let last = edit[0];
  for (let i = 0; i < edit.length; i++) {
    // did the type of edit change?
    if (edit[i].tag !== last.tag) {
      last = edit[i];
      count++;
    }
  }
  return count;
}

/**
 * Returns a dynamic programming table of longest matches between x and y.
 * @param x String x.
 * @param m The length of string x.
 * @param y String y.
 * @param n The length of string y.
 */
function makeTable(x: string, m: number, y: string, n: number): number[][] {
  const C = fill2D(0, m + 1, n + 1);
  for (let i = 1; i < m + 1; i++) {
    for (let j = 1; j < n + 1; j++) {
      // are the characters the same at this position?
      if (x.charAt(i - 1) === y.charAt(j - 1)) {
        // then the length of this edit is the length of
        // the previous edits up to this point, plus one.
        C[i][j] = C[i - 1][j - 1] + 1;
      } else {
        // otherwise, the length is the longest edit of
        // either x or y
        C[i][j] = Math.max(C[i][j - 1], C[i - 1][j]);
      }
    }
  }
  return C;
}

/**
 * Computes the set union of sets a and b, returning an array of strings.
 * @param a Set of strings a.
 * @param b Set of strings b.
 */
function union(a: string[], b: string[]): string[] {
  const uniq = new Set<string>();
  for (let i = 0; i < a.length; i++) {
    uniq.add(a[i]);
  }
  for (let i = 0; i < a.length; i++) {
    uniq.add(b[i]);
  }
  return Array.from(uniq);
}

/**
 * Returns the set of all longest subsequences.
 * @param C A dynamic programming table representing matches between x and y.
 * @param x String x.
 * @param i Length of string x.
 * @param y String y.
 * @param j Length of string y.
 */
function backtrackAll(C: number[][], x: string, i: number, y: string, j: number): string[] {
  if (i === 0 || j === 0) {
    // if both indices are zero, we're just starting
    return [''];
  } else if (x.charAt(i - 1) === y.charAt(j - 1)) {
    // otherwise, if the characters are the same at this position,
    // backtrack and append the matching character to the end of
    // each string in the set.
    const Z = backtrackAll(C, x, i - 1, y, j - 1);
    return Z.map((z: string) => z + x.charAt(i - 1));
  } else {
    // if they're not the same...
    let R: string[] = [];
    // find which subsequence is the longest
    // note: both possibilities can be the longest
    if (C[i][j - 1] >= C[i - 1][j]) {
      // if C[i][j-1] is the longer subsequence
      R = backtrackAll(C, x, i, y, j - 1);
    }
    if (C[i - 1][j] >= C[i][j - 1]) {
      // if C[i-1][j] is the longer subsequence
      R = union(R, backtrackAll(C, x, i - 1, y, j));
    }
    return R;
  }
}

/**
 * A LCS can be represented as a sequence of pairs of string indices.  Each pair represents an alignment
 * between the two strings.  Since there can be more than one LCS for two strings, the function
 * returns the set of such sequences.
 * @param C The dynamic programming table representing the LCS.
 * @param x A string x.
 * @param i The length of x.
 * @param y A string y.
 * @param j The length of y.
 */
function getCharPairs(C: number[][], x: string, i: number, y: string, j: number): CSet<CArray<NumPair>> {
  if (i === 0 || j === 0) {
    // base case: if both strings are empty, then clearly the LCS
    //   is the empty string, so return the set containing the empty
    //   sequence.  THIS IS NOT THE SAME AS RETURNING THE EMPTY SET!
    return new CSet<CArray<NumPair>>([new CArray([])]);
  } else if (x.charAt(i - 1) === y.charAt(j - 1)) {
    // case 1: the last two characters are the same, so recursively
    //         obtain the LCS(es) of the two strings without the last char
    const Z = getCharPairs(C, x, i - 1, y, j - 1);
    //         and then concatenate the last char to the result.
    const singleton = new CArray([new NumPair(i - 1, j - 1)]);
    let ZS = Z.map((arr: CArray<NumPair>) => arr.concat(singleton));
    // I can't remember why this is here
    if (C[i][j] === C[i][j - 1]) {
      const W = getCharPairs(C, x, i, y, j - 1);
      ZS = ZS.union(W);
    }
    return ZS;
  } else {
    // case 2: the last two characters are not the same, so choose the
    //         longer of the two sub-LCSes (or possibly both if there are
    //         equally long but difference LCSes).
    let R = CSet.empty<CArray<NumPair>>();
    if (C[i][j - 1] >= C[i - 1][i]) {
      R = getCharPairs(C, x, i, y, j - 1);
    }
    if (C[i - 1][j] >= C[i][j - 1]) {
      R = R.union(getCharPairs(C, x, i - 1, y, j));
    }
    return R;
  }
}

/**
 * An edit pretty-printer.  Returns a formatted string.
 * @param edit A sequence of LCSEdit objects.
 */
export function editFormatter(edit: LCSEdit[]): string {
  const strs = edit.map(e => e.toString());
  const s = strs.join('');
  return s;
}

const x = '=SUM(A1';
const y = '=SUM(A1:A34, B3:BX10) + 1';
// const x = "dowager";
// const y = "doctored";
console.log("input x: '" + x + "'");
console.log("input y: '" + y + "'");
const edits = findEdits(x, y);
for (let i = 0; i < edits.length; i++) {
  const s = editFormatter(edits[i]);
  console.log('\t' + s);
}
const minEdit = findMinEdit(x, y);
console.log('Min edit: ' + editFormatter(minEdit));
const [start_idx, suffix] = suffixUpdate(x, y);
const prefix = x.slice(0, start_idx);
console.log("common prefix: '" + prefix + "'");
console.log("edit starts at idx: '" + start_idx + "'");
console.log("suffix: '" + suffix + "'");
