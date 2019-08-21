type ComparatorType<T> = (arg1: T, arg2: T) => number;


function binsearch_helper<Type>(A : Array<Type>,
				T : Type,
				comparator: ComparatorType<Type>)
{
    const n = A.length;
    let L = 0;
    let R = n;
    while (L < R) {
        const m = Math.floor((L + R) / 2);
	//        if (A[m] < T) {
        if (comparator(A[m], T) < 0) {
            L = m + 1;
	} else {
            R = m;
	}
    }
    return L;
}

function old_binsearch_helper<T>(arr: Array<T>,
			     start: number,
			     end: number,
			     v: T,
			     comparator: ComparatorType<T>) : number {
//    console.log("binsearch_helper: " + start + ", " + end + ", comparing against " + v);
    if (start >= end) {
	return -1; // not found
    }
    let midpoint = Math.floor((start + end) / 2);
//    console.log("midpoint = " + midpoint);
    // Find the earliest matching index.
    let comparison = comparator(arr[midpoint], v);
    //    if ((arr[midpoint] === v) && ((midpoint === 0) || (arr[midpoint-1] != v))) {
    if (comparison === 0) {
//	console.log("A");
	// Found it. Is it the earliest one?
	if ((midpoint === 0) || (comparator(arr[midpoint-1], v) != 0)) {
	    return midpoint;
	}
    }
    if (comparison < 0) {
//	console.log("B");
	return old_binsearch_helper(arr, midpoint+1, end, v, comparator);
    } else {
//	console.log("C");
	return old_binsearch_helper(arr, start, midpoint-1, v, comparator);
    }
}

// Find the index of the earliest occurrence of v in arr using binary search.
// Return -1 if not found.
export function binsearch<T>(arr: Array<T>, v: T, comparator : ComparatorType<T> = undefined) {
    if (typeof comparator === "undefined") {
//	console.log("undefined");
	comparator = ((a, b) => {
//	    console.log("Comparing " + JSON.stringify(a) + " to " + JSON.stringify(b));
	    if (a === b) {
		return 0;
	    }
	    if (a < b) {
		return -1;
	    }
	    return 1;
	});
    }
    return binsearch_helper(arr, v, comparator);
}

// Find the index of the earliest occurrence of v in arr using binary search.
// Return -1 if not found.
export function strict_binsearch<T>(arr: Array<T>, v: T, comparator : ComparatorType<T> = undefined) {
    const ind = binsearch_helper(arr, v, comparator);
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
    let iterations = 10000;
    let maxTestArrayLength = 400;
    let failures = 0;
    for (let i = 0; i < iterations; i++) {
	let arr = [];
	let len = Math.floor(Math.random() * maxTestArrayLength);
	for (let j = 0; j < len; j++) {
	    arr.push(j);
	    while ((j < len) && (Math.random() < 0.5)) {
		arr.push(j);
		j++;
	    }
	}
	arr.sort((a,b) => a-b);
	//	console.log(arr);
	// Search for items in the array.
	for (let j = 0; j < len; j++) {
	    let ind = binsearch(arr, arr[j]);
	    if ((ind === -1) ||
		(arr[ind] != arr[j]) ||
		(ind > j)) {
		// Check to make sure this is the earliest.
		if (arr[ind-1] === arr[j]) {
		    failures++;
		    console.log("Failure: " + JSON.stringify(arr) + ", ind = " + ind + ", j = " + j);
		}
	    }
	}
	// Search for items NOT in the array (with exceedingly high probability).
	for (let j = 0; j < len; j++) {
	    let val = Math.random() * len;
	    let ind = binsearch(arr, val);
	    if (((ind > 0) && (ind < arr.length) && (arr[ind-1] > val)) ||
		((ind === 0) && (arr[ind] < val)))
	    {
		failures++;
		console.log("Found an item which should almost certainly not be there: " + val + " at position " + ind);
		console.log(JSON.stringify(arr));
	    }
	}
    }
    let passPercentage = 100.0 * ((2 * iterations - failures) / (2 * iterations));
    console.log("Passed = " + passPercentage + " percent.");
    return passPercentage;
}
