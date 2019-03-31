type rectangle = [[number, number], [number, number]];

export class RectangleUtils {

    public static is_adjacent(A : rectangle, B: rectangle) : boolean {
	let [[ax1, ay1], [ax2, ay2]] = A;
	let [[bx1, by1], [bx2, by2]] = B;

	const tolerance = 1;
	let adj = ! (((ax1 - bx2) > tolerance)
		     || ((bx1 - ax2) > tolerance)
		     || ((ay1 - by2) > tolerance)
		     || ((by1 - ay2) > tolerance));
	return adj;
    }

    public static bounding_box(A: rectangle, B: rectangle) : rectangle {
	let [[ax1, ay1], [ax2, ay2]] = A;
	let [[bx1, by1], [bx2, by2]] = B;
	return [[Math.min(ax1, bx1), Math.min(ay1, by1)],
		[Math.max(ax2, bx2), Math.max(ay2, by2)]];
    }

    public static area(A: rectangle) : number {
	let [[ax1, ay1], [ax2, ay2]] = A;
	let length = ax2 - ax1 + 1;
	let width = ay2 - ay1 + 1;
	return length * width;
    }

    public static mergeable(A: rectangle, B: rectangle) : boolean {
	return RectangleUtils.is_adjacent(A, B)
	    && (RectangleUtils.area(A) + RectangleUtils.area(B) == RectangleUtils.area(RectangleUtils.bounding_box(A, B)));
    }

    public static testme() {
	console.assert(RectangleUtils.mergeable([ [ 1, 1 ], [ 1, 1 ] ], [ [ 2, 1 ], [ 2, 1 ] ]), "nope1");
	console.assert(RectangleUtils.mergeable([ [ 1, 1 ], [ 1, 10 ] ], [ [ 2, 1 ], [ 2, 10 ] ]), "nope2");
	console.assert(RectangleUtils.mergeable([ [ 2, 2 ], [ 4, 4 ] ], [ [ 5, 2 ], [ 8, 4 ] ]), "nope3");
	console.assert(!RectangleUtils.mergeable([ [ 2, 2 ], [ 4, 4 ] ], [ [ 4, 2 ], [ 8, 5 ] ]), "nope4");
	console.assert(!RectangleUtils.mergeable([ [ 1, 1 ], [ 1, 10 ] ], [ [ 2, 1 ], [ 2, 11 ] ]), "nope5");
	console.assert(!RectangleUtils.mergeable([ [ 1, 1 ], [ 1, 10 ] ], [ [ 3, 1 ], [ 3, 10 ] ]), "nope6");
    }

}

