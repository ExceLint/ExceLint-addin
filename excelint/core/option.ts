export interface IComparable<V> {
  equals(v: IComparable<V>): boolean;
}

export class Some<T> {
  private t: T;
  public hasValue: true = true;

  constructor(t: T) {
    this.t = t;
  }

  public get value(): T {
    return this.t;
  }

  public equals(o: Option<T>): boolean {
    if (o.hasValue) {
      return this.t === o.t;
    }
    return false;
  }
  public toString(): string {
    return 'Some(' + this.t + ')';
  }
}
class NoneType {
  public hasValue: false = false;

  public equals(o: Option<any>): boolean {
    return !o.hasValue;
  }

  public toString(): string {
    return 'None';
  }
}
export const None = new NoneType(); // singleton None

export type Option<T> = Some<T> | NoneType;

// Given a list of elements of type U and a function that maps elements to
// Option<T>, return only elements of type T.  In other words, filter out
// all NoneType elements, and unwrap Some<T> elements.
export function flatMap<U, T>(f: (u: U) => Option<T>, us: U[]): T[] {
  const ts: T[] = [];
  for (const i in us) {
    const u = us[i];
    const t = f(u);
    // only keep element if it evaluated to Some<T>
    if (t.hasValue) {
      ts.push((t as Some<T>).value);
    }
  }
  return ts;
}
