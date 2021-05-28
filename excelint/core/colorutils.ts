// colorutils

export function padStart(s: string, len: number, padWith: string): string {
  let delta = len - s.length;
  if (delta % padWith.length !== 0) {
    throw new Error('len is not evenly divisible by the length of padWidth, so this function will never succeed!');
  }
  // if the string is already long enough, just return it
  if (delta <= 0) {
    return s;
  }
  while (delta > 0) {
    s = padWith + s;
    delta -= padWith.length;
  }
  return s;
}

export class ColorUtils {
  /**
   * Converts an RGB color value to HSV. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
   * Assumes r, g, and b are contained in the set [0, 255] and
   * returns h, s, and v in the set [0, 1].
   *
   * @param   Number  r       The red color value
   * @param   Number  g       The green color value
   * @param   Number  b       The blue color value
   * @return  Array           The HSV representation
   */
  public static RGBtoHSV(r: number, g: number, b: number): [number, number, number] {
    (r /= 255), (g /= 255), (b /= 255);

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          throw new Error('Impossible case in RGBtoHSV conversion.');
      }

      h /= 6;
    }

    return [h, s, v];
  }

  /**
   * Converts an HSV color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
   * Assumes h, s, and v are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   *
   * @param   Number  h       The hue
   * @param   Number  s       The saturation
   * @param   Number  v       The value
   * @return  Array           The RGB representation
   */
  public static HSVtoRGB(h: number, s: number, v: number): [number, number, number] {
    let r, g, b;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        (r = v), (g = t), (b = p);
        break;
      case 1:
        (r = q), (g = v), (b = p);
        break;
      case 2:
        (r = p), (g = v), (b = t);
        break;
      case 3:
        (r = p), (g = q), (b = v);
        break;
      case 4:
        (r = t), (g = p), (b = v);
        break;
      case 5:
        (r = v), (g = p), (b = q);
        break;
      default:
        throw new Error('Impossible case in HSVtoRGB conversion.');
    }

    return [r * 255, g * 255, b * 255];
  }

  private static rgb_ex = new RegExp('#([A-Za-z0-9][A-Za-z0-9])([A-Za-z0-9][A-Za-z0-9])([A-Za-z0-9][A-Za-z0-9])');

  public static adjust_brightness(color: string, multiplier: number): string {
    const c = ColorUtils.rgb_ex.exec(color);
    if (!c) throw new Error('Unable to adjust brightness.');
    const [r, g, b] = [parseInt(c[1], 16), parseInt(c[2], 16), parseInt(c[3], 16)];
    let [h, s, v] = ColorUtils.RGBtoHSV(r, g, b);
    v = multiplier * v;
    if (v <= 0.0) {
      v = 0.0;
    }
    if (v >= 1.0) {
      v = 0.99;
    }
    const rgb = ColorUtils.HSVtoRGB(h, s, v);
    const [rs, gs, bs] = rgb.map(x => {
      return padStart(Math.round(x).toString(16), 2, '0');
    });
    let str = '#' + rs + gs + bs;
    str = str.toUpperCase();
    return str;
  }
}
