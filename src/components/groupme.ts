import { binsearch } from './binsearch';
import { Colorize } from './colorize';

type excelintVector = [number, number, number];

function fix(n) {
    return n.toString().padStart(10, '0');
}

function fix_array(arr) {
    return arr.map((x,_1,_2) => { return fix(x); });
}

function fix_pair(p) {
    const [p1, p2] = p;
    return [fix_array(p1), fix_array(p2)];
}

function sort_x_coord(a,b) {
    const [a1, a2] = a;
    const [b1, b2] = b;
    if (a1[0] != b1[0]) {
	return (a1[0] - b1[0]);
    } else {
	return (a1[1] - b1[1]);
    }
}

function sort_y_coord(a,b) {
    const [a1, a2] = a;
    const [b1, b2] = b;
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
	    newG[i] = newG[i].map((x,_1,_2) => { return [x[0].map((a,_1,_2) => Number(a)),
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

function numComparator(a_val : excelintVector, b_val: excelintVector) {
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

function matching_rectangles(rect_ul: excelintVector,
			     rect_lr: excelintVector,
			     rect_uls: Array<excelintVector>,
			     rect_lrs : Array<excelintVector>) : Array<[excelintVector, excelintVector]>
    {
	// Assumes uls and lrs are already sorted and the same length.
	const x1 = rect_ul[0];
	const y1 = rect_ul[1];
	const x2 = rect_lr[0];
	const y2 = rect_lr[1];
	
	// Try to find something adjacent to A = [[x1, y1, 0], [x2, y2, 0]]
	// options are:
	//   [x1-1, y2] left (lower-right)   [ ] [A] --> [ (?, y1) ... (x1-1, y2) ]
	//   [x2, y1-1] up (lower-right)     [ ]
	//                                   [A] --> [ (x1, ?) ... (x2, y1-1) ]
	//   [x2+1, y1] right (upper-left)   [A] [ ] --> [ (x2 + 1, y1) ... (?, y2) ]
	//   [x1, y2+1] down (upper-left)    [A]
	//                                   [ ] --> [ (x1, y2+1) ... (x2, ?) ]
	
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
	    if (rect_uls[ind][1] === y1) {
		const candidate = [rect_uls[ind], rect_lrs[ind]];
		matches.push(candidate);
	    }
	}
	ind = binsearch(rect_lrs, up, numComparator);
//	console.log("up = " + ind);
	if (ind != -1) {
	    if (rect_uls[ind][0] === x1) {
		const candidate = [rect_uls[ind], rect_lrs[ind]];
		matches.push(candidate);
	    }
	}
	ind = binsearch(rect_uls, right, numComparator);
//	console.log("right = " + ind);
	if (ind != -1) {
	    if (rect_lrs[ind][1] === y2) {
		const candidate = [rect_uls[ind], rect_lrs[ind]];
		matches.push(candidate);
	    }
	}
	ind = binsearch(rect_uls, down, numComparator);
//	console.log("down = " + ind);
	if (ind != -1) {
	    if (rect_lrs[ind][0] === x2) {
		const candidate = [rect_uls[ind], rect_lrs[ind]];
		matches.push(candidate);
	    }
	}
	return matches;
    }



function find_all_matching_rectangles(thisKey: string,
				      rect: [excelintVector, excelintVector],
				      grouped_formulas: { [val: string]: Array<[excelintVector, excelintVector]> }) : Array<[number, [excelintVector, excelintVector]]>
    {
	const [base_ul, base_lr] = rect;
	//    console.log("Looking for matches of " + JSON.stringify(base_ul) + ", " + JSON.stringify(base_lr));
	let match_list = [];
	let a = grouped_formulas;
	for (let key of Object.keys(a)) {
	    if (key === thisKey) {
		continue;
	    }
	    const x_ul = a[key].map((i,_1,_2) => { let [p1,p2] = i; return p1;});
	    const x_lr = a[key].map((i,_1,_2) => { let [p1,p2] = i; return p2;});
	    const matches = matching_rectangles(base_ul, base_lr, x_ul, x_lr);
	    if (matches.length > 0) {
		//	    console.log("found matches for key "+key+" --> " + JSON.stringify(matches));
	    }
	    match_list = match_list.concat(matches.map((item,_1,_2) => {
		let metric = Colorize.fix_metric(parseFloat(thisKey), rect, parseFloat(key), item);
		return [metric, rect, item];
	    }));
	}
//	console.log("match_list = " + JSON.stringify(match_list));
	return match_list;
    }

function dedup(arr) {
    let t = {};
    return arr.filter(e=>!(t[e]=e in t));
}

export function find_all_proposed_fixes(grouped_formulas : { [val: string]: Array<[excelintVector, excelintVector]> }) : Array<[number, [excelintVector, excelintVector], [excelintVector, excelintVector]]> {
    let all_matches = [];
    for (let key of Object.keys(grouped_formulas)) {
	let a = {};
	fix_grouped_formulas(grouped_formulas, a); // , b);
	for (let i = 0; i < a[key].length; i++) {
	    const matches = find_all_matching_rectangles(key, a[key][i], a);
	    all_matches = all_matches.concat(matches);
	}
    }
    if (false) {
	all_matches = all_matches.map((x,_1,_2) => { return [x[0].map((a,_1,_2) => Number(a)),
							     x[1].map((a,_1,_2) => Number(a))]; });
    }
//    console.log("before: " + JSON.stringify(all_matches));
    all_matches = all_matches.map((x, _1, _2) => {
	if (numComparator(x[1], x[2]) < 0) {
	    return [x[0], x[2], x[1]];
	} else {
	    return [x[0], x[1], x[2]];
	}
    });
    all_matches = dedup(all_matches);
 //   console.log("after: " + JSON.stringify(all_matches));
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

//let r = require('./grouped_formulas.js');
//test_find_all_proposed_fixes(r.grouped_formulas);


