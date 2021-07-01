export namespace CharUtil {
  export class CharStream {
    public readonly input: String;
    public readonly startpos: number; // start index into input (inclusive)
    public readonly endpos: number; // end index into input (exclusive)
    public readonly hasEOF: boolean = true;

    constructor(s: String, startpos?: number, endpos?: number, hasEOF?: boolean) {
      this.input = s;

      if (startpos == undefined) {
        this.startpos = 0; // not specified; set default
      } else if (startpos > s.length) {
        this.startpos = s.length; // seek too far; set EOF
      } else {
        this.startpos = startpos; // specified and in bounds
      }

      if (endpos == undefined) {
        this.endpos = s.length; // not specified; set default
      } else if (endpos > s.length) {
        this.endpos = s.length; // seek too far; set EOF
      } else {
        this.endpos = endpos; // specified and in bounds
      }

      if (this.startpos > this.endpos) {
        this.startpos = this.endpos; // if the user flipped positions
      }

      if (hasEOF != undefined) {
        this.hasEOF = hasEOF;
      }
    }

    /**
     * Returns true of the end of the input has been reached.
     */
    public isEOF(): boolean {
      return this.hasEOF && this.startpos == this.input.length;
    }

    /**
     * Returns a Javscript primitive string of the slice of input
     * represented by this CharStream.
     */
    public toString(): string {
      return this.input.substring(this.startpos, this.endpos);
    }

    /**
     * Returns a new CharStream representing the input from the
     * current start position to an end position num chars from
     * the current start position.  If startpos + num > endpos,
     * the current CharStream is returned.
     * @param num
     */
    public peek(num: number): CharStream {
      if (this.startpos + num >= this.endpos) {
        return this;
      } else {
        const newHasEOF = this.startpos + num == this.endpos && this.hasEOF;
        return new CharStream(this.input, this.startpos, this.startpos + num, newHasEOF);
      }
    }

    /**
     * Returns true if the next s.length characters match s.
     * @param s A string.
     */
    public peekMatches(s: string): boolean {
      if (this.startpos + s.length > this.endpos) {
        return false;
      } else {
        return this.input.substring(this.startpos, this.startpos + s.length) === s;
      }
    }

    /**
     * Returns a new CharStream created by repeatedly applying the given
     * predicate until it no longer matches.
     * @param pred A predicate over valid characters.
     */
    public seekWhile(pred: (char: string) => boolean): CharStream {
      let pos = this.startpos;
      let end = this.endpos;
      while (pos < end && pred(this.input.charAt(pos))) {
        pos++;
      }
      return new CharStream(this.input, pos, end, pos == end);
    }

    /**
     * A highly optimized seek that advances the stream while the given
     * predicate returns true.  Returns a pair of CharStreams [a,b] where
     * a is the matching string and b is the remainder of the stream.
     * @param okCodes A predicate over valid ASCII character codes.
     */
    public seekWhileCharCode(okCodes: (n: number) => boolean): [CharStream, CharStream] {
      let pos = this.startpos;
      let end = this.endpos;
      while (pos < end && okCodes(this.input.charCodeAt(pos))) {
        pos++;
      }
      return [
        new CharStream(this.input, this.startpos, pos, pos == end),
        new CharStream(this.input, pos, end, this.hasEOF),
      ];
    }

    /**
     * Returns a new CharStream representing the string after
     * seeking num characters from the current position.
     * @param num
     */
    public seek(num: number): CharStream {
      if (this.startpos + num > this.endpos) {
        return new CharStream(this.input, this.endpos, this.endpos, this.hasEOF);
      } else {
        return new CharStream(this.input, this.startpos + num, this.endpos, this.hasEOF);
      }
    }

    /**
     * Returns a new CharStream representing the head of the input at
     * the current position.  Throws an exception if the CharStream is
     * empty.
     */
    public head(): CharStream {
      if (!this.isEmpty()) {
        const newHasEOF = this.startpos + 1 == this.endpos && this.hasEOF;
        return new CharStream(this.input, this.startpos, this.startpos + 1, newHasEOF);
      } else {
        throw new Error('Cannot get the head of an empty string.');
      }
    }

    /**
     * Returns a new CharStream representing the tail of the input at
     * the current position.  Throws an exception if the CharStream is
     * empty.
     */
    public tail(): CharStream {
      if (!this.isEmpty()) {
        return new CharStream(this.input, this.startpos + 1, this.endpos, this.hasEOF);
      } else {
        throw new Error('Cannot get the tail of an empty string.');
      }
    }

    /**
     * Returns true if the input at the current position is empty. Note
     * that a CharStream at the end of the input contains an empty
     * string but that an empty string may not be the end-of-file (i.e.,
     * isEOF is false).
     */
    public isEmpty(): boolean {
      return this.startpos == this.endpos;
    }

    /**
     * Returns the number of characters remaining at
     * the current position.
     */
    public length(): number {
      return this.endpos - this.startpos;
    }

    /**
     * Returns the substring between start and end at the
     * current position.
     * @param start the start index of the substring, inclusive
     * @param end the end index of the substring, exclusive
     */
    public substring(start: number, end: number): CharStream {
      const start2 = this.startpos + start;
      const end2 = this.startpos + end;
      const newHasEOF = this.endpos == end2 && this.hasEOF;
      return new CharStream(this.input, start2, end2, newHasEOF);
    }

    /**
     * Returns the concatenation of the current CharStream with
     * the given CharStream. Note: returned object does not
     * reuse original input string, and startpos and endpos
     * are reset. If the given CharStream contains EOF, the
     * concatenated CharStream will also contain EOF.
     * @param cs the CharStream to concat to this CharStream
     */
    public concat(cs: CharStream): CharStream {
      const s = this.toString() + cs.toString();
      return new CharStream(s, 0, s.length, cs.hasEOF);
    }

    /**
     * Concatenate an array of CharStream objects into a single
     * CharStream object.
     * @param css a CharStream[]
     */
    static concat(css: CharStream[]): CharStream {
      if (css.length == 0) {
        return new CharStream('', 0, 0, false);
      } else {
        let cs = css[0];
        for (let i = 1; i < css.length; i++) {
          cs = cs.concat(css[i]);
        }
        return cs;
      }
    }
  }
}
