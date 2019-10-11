    // Generate an array of proposed fixes (a score and the two ranges to merge).
    public static old_generate_proposed_fixes(groups: { [val: string]: Array<[excelintVector, excelintVector]> }):
    Array<[number, [excelintVector, excelintVector], [excelintVector, excelintVector]]> {
	let t = new Timer("generate_proposed_fixes");
	let proposed_fixes = [];
	let already_proposed_pair = {};

	let s1 = {}; // [];
	let s2 = {}; // [];
	
	if (true)
	{
	    let count = 0;
	    for (let k1 of Object.keys(groups)) {
		s1[k1] = Array(groups[k1].length);
		s2[k1] = Array(groups[k1].length);
		for (let i = 0; i < groups[k1].length; i++) {
		    const r1 : [excelintVector, excelintVector] = groups[k1][i];
		    const sr1 = JSON.stringify(r1);
		    s1[k1][i] = Array(Object.keys(groups).length);
		    s2[k1][i] = Array(Object.keys(groups).length);
		    for (let k2 of Object.keys(groups)) {
			if (k1 === k2) {
			    continue;
			}
			for (let j = 0; j < groups[k2].length; j++) {
			    const r2 : [excelintVector, excelintVector] = groups[k2][j];
			    const sr2 = JSON.stringify(r2);
			    s1[k1][i][j] = sr1;
			    s2[k1][i][j] = sr2;
			    count++;
			}
		    }			    
		}
	    }
	    console.log("generate_proposed_fixes: total to process = " + count);
	}
	
	for (let k1 of Object.keys(groups)) {
	    // Look for possible fixes in OTHER groups.
	    for (let i = 0; i < groups[k1].length; i++) {
		const r1 : [excelintVector, excelintVector] = groups[k1][i];
//		const sr1 = JSON.stringify(r1);
		for (let k2 of Object.keys(groups)) {
		    if ((k1 === k2) ||
			(k1 === Colorize.distinguishedZeroHash) ||
			(k2 === Colorize.distinguishedZeroHash)) {
			// Don't try to create fixes from within the
			// same hash values or using cells with no
			// dependencies.
			continue;
		    }
		    for (let j = 0; j < groups[k2].length; j++) {
			const r2 : [excelintVector, excelintVector] = groups[k2][j];
//			const sr2 = JSON.stringify(r2);
			// Only add these if we have not already added them.
			if (!(s1[k1][i][j] + s2[k1][i][j] in already_proposed_pair)
			    && !(s2[k1][i][j] + s1[k1][i][j] in already_proposed_pair)) {
			    // If both are compatible rectangles AND the regions include more than two cells, propose them as fixes.
//			    console.log("checking " + JSON.stringify(sr1) + " and " + JSON.stringify(sr2));
			    if (RectangleUtils.is_mergeable(r1, r2) && (RectangleUtils.area(r1) + RectangleUtils.area(r2) > 2)) {
				already_proposed_pair[s1[k1][i][j] + s2[k1][i][j]] = true;
				already_proposed_pair[s2[k1][i][j] + s1[k1][i][j]] = true;
				///								console.log("generate_proposed_fixes: could merge (" + k1 + ") " + JSON.stringify(groups[k1][i]) + " and (" + k2 + ") " + JSON.stringify(groups[k2][j]));
				let metric = this.fix_metric(parseFloat(k1), r1, parseFloat(k2), r2);
				// If it's below the threshold, don't include as a proposed fix.
				if (-metric < (Colorize.reportingThreshold / 100)) {
				    continue;
				}
				const new_fix = [metric, r1, r2];
				proposed_fixes.push(new_fix);
			    }
			}
		    }
		}
	    }
	}
	// First attribute is the norm of the vectors. Differencing
	// corresponds to earth-mover distance.  Other attributes are
	// the rectangles themselves. Sort by biggest entropy
	// reduction first.

//	console.log("proposed fixes was = " + JSON.stringify(proposed_fixes));

	// FIXME currently disabled.
// 	proposed_fixes = this.fix_proposed_fixes(proposed_fixes);
	
	proposed_fixes.sort((a, b) => { return a[0] - b[0]; });
	//	console.log("proposed fixes = " + JSON.stringify(proposed_fixes));
	t.split("done.");
	return proposed_fixes;
    }

