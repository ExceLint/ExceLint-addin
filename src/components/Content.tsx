import * as React from 'react';
import { Button, ButtonType } from 'office-ui-fabric-react';
import { ExcelUtils } from './excelutils';

// Checkbox

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
    numFixes : number;
    selector : any;
}

function makeTable(sheetName: string, arr, selector, current: number, numFixes : number) : any {
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
    const barWidth = 80;
    if (arr.length > 0) {
	let children = [];
	for (let i = 0; i < arr.length; i++) {
	    let r = ExcelUtils.get_rectangle(arr, i);
	    if (r) {
		let [ col0, row0, col1, row1 ] = r;
		// Sort from largest to smallest (by making negative).
		if (numFixes === 0) {
		    numFixes = 1;
		}
		console.log("original score = " + arr[i][0]);
		let score = Math.round((1.0-arr[i][0])*barWidth*100)/(100 * Math.log2(numFixes));
//		let score = Math.round(-arr[i][0]*barWidth*100)/100; // /(100 * Math.log2(numFixes));
		console.log("score = " + score);
		if (score > barWidth) {
		    score = barWidth;
		}
		// Always put up *something*.
		if (score < 0) {
		    score = -score;
//		    score = 1;
		}
		if (score < 1) {
//		    break;
		    score = 1;
		}
		if (current === i) {
		    children.push(<tr style={lineStyle} onClick={(ev) => { ev.preventDefault(); selector(i); }}><td><b>{col0}{row0}:{col1}{row1}</b></td><td style={{width: Math.round(score), backgroundColor: 'red', display:'inline-block'}}>&nbsp;</td><td style={{width: barWidth-Math.round(score), backgroundColor: 'white', display:'inline-block'}}>&nbsp;</td></tr>);
		} else {
		    children.push(<tr style={lineStyle} onClick={(ev) => { ev.preventDefault(); selector(i); }}><td>{col0}{row0}:{col1}{row1}</td><td style={{width: Math.round(score), backgroundColor: 'red', display:'inline-block'}}>&nbsp;</td><td style={{width: barWidth-Math.round(score), backgroundColor: 'white', display:'inline-block'}}>&nbsp;</td></tr>);
		}
	    }
	}
	let table = [];
	let header = <tr><th align="left">Range</th><th align="left">Suspiciousness</th></tr>;
	table.push(<div style={notSuspiciousStyle}>Click to jump to suspicious formulas in {sheetName}:<br /><br /><div style={divStyle}><table style={{width:'300px'}}>{header}{children}</table></div></div>);
	return table;
    } else {
	return <div style={notSuspiciousStyle}>No suspicious formulas found in {sheetName}.<br /><br /></div>;
    }
}

function DisplayFixes(props) {
//    console.log("DisplayFixes: " + props.totalFixes + ", " + props.currentFix + ", " + JSON.stringify(props.themFixes));
    if (props.totalFixes > 0) {
	const table = makeTable(props.sheetName, props.themFixes, props.selector, props.currentFix, props.numFixes);
	return <div>{table}</div>;
    } else {
	return <div></div>;
    }
}



export class Content extends React.Component<ContentProps, any> {
	constructor(props, context) {
	    super(props, context);
	    this.state = { sheetName: props.sheetName,
			   currentFix: props.currentFix,
			   totalFixes: props.totalFixes,
			   themFixes : props.themFixes,
			   numFixes : props.numFixes };
	}
	// <p>{this.props.message}</p>

    
    
    render() {
		return (
			<div id='content-main'>
			<div className='padding'>
			<Button className='ms-button' buttonType={ButtonType.primary} onClick={this.props.click1}>{this.props.buttonLabel1}</Button>&nbsp;
			<Button className='ms-button' buttonType={ButtonType.primary} onClick={this.props.click2}>{this.props.buttonLabel2}</Button>
			<br />
			<br />
			<DisplayFixes sheetName={this.state.sheetName} currentFix={this.state.currentFix} totalFixes={this.state.totalFixes} themFixes={this.state.themFixes} selector={this.props.selector} numFixes={this.state.numFixes} />
			<br />
				Click on <a onClick={this.props.click1}><b>Reveal Structure</b></a> to reveal the underlying structure of the spreadsheet.
				Different formulas are assigned different colors, making it easy to spot inconsistencies or to audit a spreadsheet for correctness.
		<br />
				<br />

				<svg width="300" height="20">
					<rect x="0" y="0" width="50" height="20" fill="lightblue" />
					<text x="55" y="13">formulas (pastel colors)</text>
			</svg>
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
