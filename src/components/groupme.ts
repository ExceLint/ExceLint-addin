import { binsearch } from './binsearch';

function fix(n) {
    return n.toString().padStart(10, '0');
}

function fix_array(arr) {
    return arr.map((x,_,a) => { return fix(x); });
}

function fix_pair(p) {
    let [p1, p2] = p;
    return [fix_array(p1), fix_array(p2)];
}

function sort_x_coord(a,b) {
    let [a1, a2] = a;
    let [b1, b2] = b;
    if (a1[0] != b1[0]) {
	return (a1[0] - b1[0]);
    } else {
	return (a1[1] - b1[1]);
    }
}

function sort_y_coord(a,b) {
    let [a1, a2] = a;
    let [b1, b2] = b;
    if (a1[1] != b1[1]) {
	return (a1[1] - b1[1]);
    } else {
	return (a1[0] - b1[0]);
    }
}

function fix_grouped_formulas(g, newG) { // , newGy) {
//    console.log("newG = " + JSON.stringify(newG));
//    newG = {};
//    newGy = {};
    for (let i of Object.keys(g)) {
	newG[i] = g[i].map((p, _1, _2) => { return fix_pair(p); });
//	newGy[i] = JSON.parse(JSON.stringify(newG[i])); // deep copy
	newG[i].sort(sort_x_coord);
	//	newGy[i].sort(sort_y_coord);

	if (true) {
	    newG[i] = newG[i].map((x,_,a) => { return [x[0].map((a,_1,_2) => Number(a)),
						       x[1].map((a,_1,_2) => Number(a))]; });
	}
	
//	newGy[i] = newGy[i].map((x,_,a) => { return [x[0].map((a,_1,_2) => Number(a)),
//						     x[1].map((a,_1,_2) => Number(a))]; });
    }
}


function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


//test_binsearch();

let comparisons = 0;

function numComparator(a_val : Array<number>, b_val: Array<number>) {
//    console.log("a_val = " + JSON.stringify(a_val));
    let a = JSON.stringify(fix_array(a_val));
    let b = JSON.stringify(fix_array(b_val));
    comparisons++;
//    console.log("Comparing " + JSON.stringify(a) + " to " + JSON.stringify(b));
    if (a === b) {
	return 0;
    }
    if (a < b) {
	return -1;
    }
    return 1;
}

function matching_rectangles(rect_ul: Array<number>,
			     rect_lr: Array<number>,
			     rect_uls: Array<Array<number>>,
			     rect_lrs : Array<Array<number>>) : Array<[Array<number>, Array<number>]>
    {
	// Assumes uls and lrs are already sorted and the same length.
	const x1 = rect_ul[0];
	const y1 = rect_ul[1];
	const x2 = rect_lr[0];
	const y2 = rect_lr[1];
	
	// Try to find something adjacent to [[x1, y1, 0], [x2, y2, 0]]
	// options are:
	//   [x1-1, y2] left (lower-right)
	//   [x1, y1-1] up (lower-right)
	//   [x2+1, y1] right (upper-left)
	//   [x1, y2+1] down (upper-left)
	
	// left (lr) = ul_x, lr_y
	const left = [x1-1, y2, 0];
	// up (lr) = lr_x, ul_y
	const up = [x2, y1-1, 0];
	// right (ul) = lr_x, ul_y
	const right = [x2+1, y1, 0];
	// down (ul) = ul_x, lr_y
	const down = [x1, y2+1, 0];
	let matches = [];
	let ind = -1;
	ind = binsearch(rect_lrs, left, numComparator);
//	console.log("left = " + ind);
	if (ind != -1) {
	    const candidate = [rect_uls[ind], rect_lrs[ind]];
	    matches.push(candidate);
	}
	ind = binsearch(rect_lrs, up, numComparator);
//	console.log("up = " + ind);
	if (ind != -1) {
	    const candidate = [rect_uls[ind], rect_lrs[ind]];
	    matches.push(candidate);
	}
	ind = binsearch(rect_uls, right, numComparator);
//	console.log("right = " + ind);
	if (ind != -1) {
	    const candidate = [rect_uls[ind], rect_lrs[ind]];
	    matches.push(candidate);
	}
	ind = binsearch(rect_uls, down, numComparator);
//	console.log("down = " + ind);
	if (ind != -1) {
	    const candidate = [rect_uls[ind], rect_lrs[ind]];
	    matches.push(candidate);
	}
	return matches;
    }



function find_all_matching_rectangles(thisKey, rect, grouped_formulas) {
    const [base_ul, base_lr] = rect;
//    console.log("Looking for matches of " + JSON.stringify(base_ul) + ", " + JSON.stringify(base_lr));
    let match_list = [];
    let a = grouped_formulas;
    for (let key of Object.keys(a)) {
	if (key === thisKey) {
	    continue;
	}
	const x_ul = a[key].map((i,_,a) => { let [p1,p2] = i; return p1;});
	const x_lr = a[key].map((i,_,a) => { let [p1,p2] = i; return p2;});
	const matches = matching_rectangles(base_ul, base_lr, x_ul, x_lr);
	if (matches.length > 0) {
//	    console.log("found matches for key "+key+" --> " + JSON.stringify(matches));
	}
	match_list = match_list.concat(matches);
    }
    return match_list;
}

export function find_all_proposed_fixes(grouped_formulas) {
    let all_matches = [];
    for (let key of Object.keys(grouped_formulas)) {
	let a = {};
	let b = {};
	fix_grouped_formulas(grouped_formulas, a); // , b);
	for (let i = 0; i < a[key].length; i++) {
	    const matches = find_all_matching_rectangles(key, a[key][i], a);
	    if (matches.length > 0) {
		const matched_pairs = matches.map((item,_,arr) => { return [a[key][i], item]; });
		all_matches = all_matches.concat(matched_pairs);
		//	    console.log("Matched " + JSON.stringify(matches));
	    }
	}
    }
    if (false) {
	all_matches = all_matches.map((x,_,a) => { return [x[0].map((a,_1,_2) => Number(a)),
							   x[1].map((a,_1,_2) => Number(a))]; });
    }
    return all_matches;
}

export function test_find_all_proposed_fixes(grouped_formulas) {
    comparisons = 0;
    const all_fixes = find_all_proposed_fixes(grouped_formulas);
    console.log("all matches = " + JSON.stringify(all_fixes));
    console.log("comparisons = " + comparisons);
    let theLength = 0;
    for (let k of Object.keys(grouped_formulas)) {
	theLength += grouped_formulas[k].length;
    }
    console.log("total length of grouped_formulas = " + theLength);
}

// test_find_all_proposed_fixes();


