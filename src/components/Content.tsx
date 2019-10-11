import * as React from 'react';
import { Button, ButtonType } from 'office-ui-fabric-react';
import { Slider } from 'office-ui-fabric-react/lib/Slider';
import { ExcelUtils } from './excelutils';
import { Colorize } from './colorize';

const barWidth = 100;

export interface ContentProps {
    message1: string;
    buttonLabel1: string;
    click1: any;
    message2: string;
    buttonLabel2: string;
    click2: any;
    sheetName : string;
    currentFix : number;
    totalFixes : number;
    themFixes : Array<[number, [[number, number], [number, number]], [[number, number], [number, number]]]>;
    suspiciousCells : Array<[number, number, number]>;
    currentSuspiciousCell : number;
    numFixes : number;
    selector : any;
    cellSelector : any;
}

const divStyle : any = {
    height: '100px',
    overflowY: 'auto',
    overflowX: 'hidden'
};

const lineStyle : any = {
    color: 'blue',
    textAlign: 'left',
    verticalAlign: 'middle'
};

const notSuspiciousStyle : any = {
    color : 'red'
};

function makeTable(sheetName: string, arr, selector, current: number, numFixes : number) : any {
    if (numFixes === 0) {
	numFixes = 1;
    }
    let counter = 0;
    if (arr.length > 0) {
	let children = [];
	for (let i = 0; i < arr.length; i++) {
//	    console.log("makeTable: arr[" + i + "] = " + JSON.stringify(arr[i]));
	    let r = ExcelUtils.get_rectangle(arr, i);
	    if (r) {
		let [ col0, row0, col1, row1 ] = r;
		// Sort from largest to smallest (by making negative).
//		console.log(JSON.stringify(r));
//		console.log("original score = " + arr[i][0]);
		let score = -arr[i][0] * barWidth; // Math.round((arr[i][0])/numFixes*barWidth*100)/(100); //  * numFixes);
//		let score = Math.round((-arr[i][0])/numFixes*barWidth*100)/(100); //  * numFixes);
//		console.log("score = " + score);
		if (score > barWidth) {
		    score = barWidth;
		}
//		score = barWidth - score; // Invert the ranking.
		// Skip really low scores.
//		if (score < Colorize.getReportingThreshold()) {
//		    continue;
//		}
		counter += 1;
		//		console.log("score is now = " + score);
		let rangeDisplay = <b></b>;
		if (current === i) {
		    rangeDisplay = <td style={{width:100}}><b>{col0}{row0}:{col1}{row1}</b></td>;
		} else {
		    rangeDisplay = <td style={{width:100}}>{col0}{row0}:{col1}{row1}</td>;
		}
		const scoreStr = Math.round(score).toString() + "% suspicious";
		let barColor = 'red';
		if (Math.round(score) < 50) {
		    barColor = 'yellow';
		}
		children.push(<tr style={lineStyle} onClick={(ev) => { ev.preventDefault(); selector(i); }}>{rangeDisplay}<td title={scoreStr} style={{width: Math.round(score), backgroundColor: barColor, display:'inline-block'}}>&nbsp;</td><td title={scoreStr} style={{width: barWidth-Math.round(score), backgroundColor: 'lightgray', display:'inline-block'}}>&nbsp;</td></tr>);
	    }
	}
	if (counter > 0) {
	    let table = [];
	    let header = <tr><th align="left">Range</th><th align="left">Suspiciousness</th></tr>;
	    table.push(<div style={notSuspiciousStyle}>Click to jump to suspicious formulas in {sheetName}:<br /><div style={divStyle}><table style={{width:'300px'}}><tbody>{header}{children}</tbody></table></div></div>);
	    return table;
	}
    }
    return <div style={notSuspiciousStyle}>No suspicious formulas found in {sheetName}.</div>;
//    return <div></div>; //  style={notSuspiciousStyle}>No suspicious formulas found in {sheetName}.<br /><br /></div>;
}


function makeTableSuspiciousCells(sheetName: string, arr, selector, current: number, numFixes : number) : any {
    if (numFixes === 0) {
	numFixes = 1;
    }
    let counter = 0;
    if (arr.length > 0) {
	let children = [];
	for (let i = 0; i < arr.length; i++) {
//	    console.log("makeTable: arr[" + i + "] = " + JSON.stringify(arr[i]));
	    //	    let r = ExcelUtils.get_rectangle(arr, i);
	    let r = arr[i];
	    if (r) {
		let [ col, row, val ] = r;
//		console.log("value = " + val);
		let score = (1.0 - val) * barWidth;
		// Sort from largest to smallest (by making negative).
		if (score > barWidth) {
		    score = barWidth;
		}
		// Skip really low scores.
		if (score < Colorize.suspiciousCellsReportingThreshold) {
		    continue;
		}
		counter += 1;
		//		console.log("score is now = " + score);
		let rangeDisplay = <b></b>;
		let colName = ExcelUtils.column_index_to_name(col);
		if (current === i) {
		    rangeDisplay = <td style={{width:100}}><b>{colName}{row}</b></td>;
		} else {
		    rangeDisplay = <td style={{width:100}}>{colName}{row}</td>;
		}
		const scoreStr = Math.round(score).toString() + "% suspicious";
		let barColor = 'red';
		if (Math.round(score) < 50) {
		    barColor = 'yellow';
		}
//		const scoreStr = "mildly suspicious";
		children.push(<tr style={lineStyle} onClick={(ev) => { ev.preventDefault(); selector(i); }}>{rangeDisplay}<td title={scoreStr} style={{width: Math.round(score), backgroundColor: barColor, display:'inline-block'}}>&nbsp;</td><td title={scoreStr} style={{width: barWidth-Math.round(score), backgroundColor: 'lightgray', display:'inline-block'}}>&nbsp;</td></tr>);
//		children.push(<tr style={lineStyle} onClick={(ev) => { ev.preventDefault(); selector(i); }}>{rangeDisplay}<td title={scoreStr} style={{width: Math.round(score), backgroundColor: 'yellow', display:'inline-block'}}>&nbsp;</td><td style={{width: barWidth-Math.round(score), backgroundColor: 'lightgray', display:'inline-block'}}>&nbsp;</td></tr>);
	    }
	}
	if (counter > 0) {
	    let table = [];
	    let header = <tr><th align="left">Cell</th><th align="left">Suspiciousness</th></tr>;
	    table.push(<div style={notSuspiciousStyle}>Click to jump to suspicious cells in {sheetName} (<b>EXPERIMENTAL!</b>):<br /><div style={divStyle}><table style={{width:'300px'}}><tbody>{header}{children}</tbody></table></div><br /></div>);
	    return table;
	}
    }
    // return <div></div>;
    return <div style={notSuspiciousStyle}>No suspicious cells found in {sheetName}.<br /><br /></div>;
}


function DisplayFixes(props) {
//    console.log("DisplayFixes: " + props.totalFixes + ", " + props.suspiciousCells.length);
    let result1 = <div></div>;
    let str = "";
    if ((props.totalFixes === 0) && (props.suspiciousCells.length === 0)) {
	return <div style={notSuspiciousStyle}>Nothing suspicious found in {props.sheetName}.<br /><br /></div>;
    }
    if (props.totalFixes < 0) {
	return <div></div>;
    }
    // OK, if we got here, we did some analysis.
    if ((props.themFixes.length === 0) && (props.suspiciousCells.length === 0)) {
	// We got nothing.
	return <div style={notSuspiciousStyle}><br />Nothing suspicious found in {props.sheetName}.</div>;
    }
    // Filter out fixes whose score is below the threshold.
    let filteredFixes = props.themFixes.filter((c) => {
	console.log("c = " + JSON.stringify(c));
	let score = -c[0];
	return (score >= Colorize.getReportingThreshold() / 100);
    });
    
    const table1 = makeTable(props.sheetName, filteredFixes, props.selector, props.currentFix, filteredFixes.length);
    result1 = <div><br /><br />{table1}</div>;
    let result2 = <div></div>;
    const table2 = makeTableSuspiciousCells(props.sheetName, props.suspiciousCells, props.cellSelector, props.currentSuspiciousCell, props.suspiciousCells.length);
    result2 = <div>{table2}</div>;
    // Temporarily disable display of suspicious cells while feature remains in development.
    return <div>{result1}</div>;
    // return <div>{result1}{result2}</div>;
}



export class Content extends React.Component<ContentProps, any> {
	constructor(props, context) {
	    super(props, context);
	    this.state = { sheetName: props.sheetName,
			   currentFix: props.currentFix,
			   totalFixes: props.totalFixes,
			   themFixes : props.themFixes,
			   numFixes : props.numFixes,
			   suspiciousCells : props.suspiciousCells,
			   currentSuspiciousCell : props.currentSuspiciousCell };
	}
	// <p>{this.props.message}</p>


    private static colorPalette() : any {
	return <div><svg width="300" height="20">
	    <rect x="0" y="0" width="50" height="20" fill="lightblue" />
	    <text x="55" y="13">formulas (pastel colors)</text>
	    </svg></div>;
    }
    
    
    render() {
	let instructions = <div></div>;
	if ((this.state.themFixes.length === 0) && (this.state.suspiciousCells.length === 0)) {
	    instructions = <div><br />
				Click on <a onClick={this.props.click1}><b>Reveal Structure</b></a> to reveal the underlying structure of the spreadsheet.
		Different formulas are assigned different colors, making it easy to spot inconsistencies or to audit a spreadsheet for correctness.
		<br /><br />
		</div>;
	}

		return (
			<div id='content-main'>
			<div className='padding'>
			<Button className='ms-button' buttonType={ButtonType.primary} onClick={this.props.click1}>{this.props.buttonLabel1}</Button>&nbsp;
			<Button className='ms-button' buttonType={ButtonType.primary} onClick={this.props.click2}>{this.props.buttonLabel2}</Button>
			<DisplayFixes sheetName={this.state.sheetName} currentFix={this.state.currentFix} totalFixes={this.state.totalFixes} themFixes={this.state.themFixes} selector={this.props.selector} numFixes={this.state.numFixes} suspiciousCells={this.state.suspiciousCells} cellSelector={this.props.cellSelector} currentSuspiciousCell={this.state.currentSuspiciousCell} />
			{instructions}

		    		    <Slider
		    label="Suspiciousness threshold (%)"
		    min={0}
		    max={100}
		    step={1}
		    defaultValue={Colorize.getReportingThreshold()}
		    showValue={true}
		    onChange={(value: number) => { Colorize.setReportingThreshold(value); this.forceUpdate(); }}
			/>
			<br />

<svg width="300" height="20">
<rect x="0" y="0" width="3.5714285714285716" height="20" fill="#ecaaae" />
<rect x="3.5714285714285716" y="0" width="3.5714285714285716" height="20" fill="#74aff3" />
<rect x="7.142857142857143" y="0" width="3.5714285714285716" height="20" fill="#d8e9b2" />
<rect x="10.714285714285715" y="0" width="3.5714285714285716" height="20" fill="#deb1e0" />
<rect x="14.285714285714286" y="0" width="3.5714285714285716" height="20" fill="#9ec991" />
<rect x="17.857142857142858" y="0" width="3.5714285714285716" height="20" fill="#adbce9" />
<rect x="21.42857142857143" y="0" width="3.5714285714285716" height="20" fill="#e9c59a" />
<rect x="25.000000000000004" y="0" width="3.5714285714285716" height="20" fill="#71cdeb" />
<rect x="28.571428571428577" y="0" width="3.5714285714285716" height="20" fill="#bfbb8a" />
<rect x="32.142857142857146" y="0" width="3.5714285714285716" height="20" fill="#94d9df" />
<rect x="35.714285714285715" y="0" width="3.5714285714285716" height="20" fill="#91c7a8" />
<rect x="39.285714285714285" y="0" width="3.5714285714285716" height="20" fill="#b4efd3" />
<rect x="42.857142857142854" y="0" width="3.5714285714285716" height="20" fill="#80b6aa" />
<rect x="46.42857142857142" y="0" width="3.5714285714285716" height="20" fill="#9bd1c6" />
<text x="55" y="13">formulas (pastel colors)</text></svg>

			<svg width="300" height="20">
					<rect x="0" y="0" width="50" height="20" fill="#d3d3d3" />
			<text x="55" y="13">data used by some formula (gray)</text>
				</svg>
				<br />
				<svg width="300" height="20">
					<rect x="0" y="0" width="50" height="20" fill="#eed202" />
			<text x="55" y="13">data not used by ANY formula (yellow)</text>
				</svg>
				<br />
			<br />
			<div className='ExceLint-scrollbar'>
			</div>

			<br />
			<small>
			<a target="_blank" href="https://github.com/plasma-umass/ExceLint-addin/issues/new?assignees=dbarowy%2C+emeryberger%2C+bzorn&labels=enhancement&template=feature_request.md&title=">Send feedback</a> | <a target="_blank" href="https://github.com/plasma-umass/ExceLint-addin/issues/new?assignees=dbarowy%2C+emeryberger%2C+bzorn&labels=bug&template=bug_report.md&title=">Report bugs</a><br />
			For more information, see <a href="https://excelint.org">excelint.org</a>.
			</small>
			<br />
			</div>
			</div>
		);
    }
}
