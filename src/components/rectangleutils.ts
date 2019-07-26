type rectangle = [[number, number, number], [number, number, number]];

export class RectangleUtils {

    public static is_adjacent(A : rectangle, B: rectangle) : boolean {
	const [[ax1, ay1, az1], [ax2, ay2, az2]] = A;
	const [[bx1, by1, bz1], [bx2, by2, bz2]] = B;

	const tolerance = 1;
	const adj = ! (((ax1 - bx2) > tolerance)
		     || ((bx1 - ax2) > tolerance)
		     || ((ay1 - by2) > tolerance)
		     || ((by1 - ay2) > tolerance));
	return adj;
    }

    public static bounding_box(A: rectangle, B: rectangle) : rectangle {
	const [[ax1, ay1, az1], [ax2, ay2, az2]] = A;
	const [[bx1, by1, bz1], [bx2, by2, bz2]] = B;
	return [[Math.min(ax1, bx1), Math.min(ay1, by1), 0],
		[Math.max(ax2, bx2), Math.max(ay2, by2), 0]];
    }

    public static area(A: rectangle) : number {
	const [[ax1, ay1, az1], [ax2, ay2, az2]] = A;
	const length = ax2 - ax1 + 1;
	const width = ay2 - ay1 + 1;
	return length * width;
    }

    public static diagonal(A: rectangle) : number {
	const [[ax1, ay1, az1], [ax2, ay2, az2]] = A;
	const length = ax2 - ax1 + 1;
	const width = ay2 - ay1 + 1;
	return Math.sqrt(length * length + width * width);
    }

    public static overlap(A: rectangle, B: rectangle) : number {
	const [[ax1, ay1, az1], [ax2, ay2, az2]] = A;
	const [[bx1, by1, bz1], [bx2, by2, bz2]] = B;
	let width = 0, height = 0;
	if (ax2 > bx2) {
	    width = bx2 - ax1 + 1;
	} else {
	    width = ax2 - bx1 + 1;
	}
	if (ay2 > by2) {
	    height = by2 - ay1 + 1;
	} else {
	    height = ay2 - by1 + 1;
	}
	return width * height; // Math.max(0, Math.min(ax2, bx2) - Math.max(ax1, bx1)) * Math.max(0, Math.min(ay2, by2) - Math.max(ay1, by1));
    }
    
    public static is_mergeable(A: rectangle, B: rectangle) : boolean {
	return RectangleUtils.is_adjacent(A, B)
	    && (RectangleUtils.area(A) + RectangleUtils.area(B) - RectangleUtils.overlap(A, B) === RectangleUtils.area(RectangleUtils.bounding_box(A, B)));
    }

/*
    public static testme() {
	console.assert(RectangleUtils.is_mergeable([ [ 1, 1 ], [ 1, 1 ] ], [ [ 2, 1 ], [ 2, 1 ] ]), "nope1");
	console.assert(RectangleUtils.is_mergeable([ [ 1, 1 ], [ 1, 10 ] ], [ [ 2, 1 ], [ 2, 10 ] ]), "nope2");
	console.assert(RectangleUtils.is_mergeable([ [ 2, 2 ], [ 4, 4 ] ], [ [ 5, 2 ], [ 8, 4 ] ]), "nope3");
	console.assert(!RectangleUtils.is_mergeable([ [ 2, 2 ], [ 4, 4 ] ], [ [ 4, 2 ], [ 8, 5 ] ]), "nope4");
	console.assert(!RectangleUtils.is_mergeable([ [ 1, 1 ], [ 1, 10 ] ], [ [ 2, 1 ], [ 2, 11 ] ]), "nope5");
	console.assert(!RectangleUtils.is_mergeable([ [ 1, 1 ], [ 1, 10 ] ], [ [ 3, 1 ], [ 3, 10 ] ]), "nope6");
	console.assert(RectangleUtils.is_mergeable([ [ 2, 7 ], [ 3, 11 ] ], [ [ 3, 7 ], [ 4, 11 ] ]), "nope7");
    }
*/
    
}

