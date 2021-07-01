type ComparatorType<T> = (arg1: T, arg2: T) => number;

/**
 * A simple, generic, default comparator.
 * @param a value of type T
 * @param b another value of type T
 */
function defaultBinSearchComparator<T>(a: T, b: T): number {
  if (a === b) {
    return 0;
  }
  if (a < b) {
    return -1;
  }
  return 1;
}

// Find the index of the earliest occurrence of v in arr using binary search.
// Return -1 if not found.
export function binsearch<T>(arr: Array<T>, v: T, comparator: ComparatorType<T> = defaultBinSearchComparator): number {
  const n = arr.length;
  let L = 0;
  let R = n;
  while (L < R) {
    const m = Math.floor((L + R) / 2);
    if (comparator(arr[m], v) < 0) {
      L = m + 1;
    } else {
      R = m;
    }
  }
  return L;
}

// Find the index of the earliest occurrence of v in arr using binary search.
// Return -1 if not found.
export function strict_binsearch<T>(
  arr: Array<T>,
  v: T,
  comparator: ComparatorType<T> = defaultBinSearchComparator
): number {
  const ind = binsearch(arr, v, comparator);
  if (ind === arr.length) {
    return -1;
  }
  if (comparator(arr[ind], v) !== 0) {
    return -1;
  }
  return ind;
}

export function test_binsearch() {
  // Random testing that checks if binary search is working properly.
  const iterations = 10000;
  const maxTestArrayLength = 400;
  let failures = 0;
  for (let i = 0; i < iterations; i++) {
    const arr = [];
    const len = Math.floor(Math.random() * maxTestArrayLength);
    for (let j = 0; j < len; j++) {
      arr.push(j);
      while (j < len && Math.random() < 0.5) {
        arr.push(j);
        j++;
      }
    }
    arr.sort((a, b) => a - b);
    //	console.log(arr);
    // Search for items in the array.
    for (let j = 0; j < len; j++) {
      const ind = binsearch(arr, arr[j]);
      if (ind === -1 || arr[ind] !== arr[j] || ind > j) {
        // Check to make sure this is the earliest.
        if (arr[ind - 1] === arr[j]) {
          failures++;
          console.log('Failure: ' + JSON.stringify(arr) + ', ind = ' + ind + ', j = ' + j);
        }
      }
    }
    // Search for items NOT in the array (with exceedingly high probability).
    for (let j = 0; j < len; j++) {
      const val = Math.random() * len;
      const ind = binsearch(arr, val);
      if ((ind > 0 && ind < arr.length && arr[ind - 1] > val) || (ind === 0 && arr[ind] < val)) {
        failures++;
        console.log('Found an item which should almost certainly not be there: ' + val + ' at position ' + ind);
        console.log(JSON.stringify(arr));
      }
    }
  }
  const passPercentage = 100.0 * ((2 * iterations - failures) / (2 * iterations));
  console.log('Passed = ' + passPercentage + ' percent.');
  return passPercentage;
}
