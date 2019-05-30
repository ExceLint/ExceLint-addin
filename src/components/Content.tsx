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
    currentFix : number;
    totalFixes : number;
    themFixes : any;
    selector : any;
//	message5: string;
//	buttonLabel5: string;
//	click5: any;
}

/*

for testing only:

function hepMe(num: number, event: any) {
    event.preventDefault();
    console.log("HEPME: ", num);
//    alert(event.currentTarget.tagName); // alerts BUTTON
//    console.log("HEPME.");
}
*/

function makeTable(arr, selector, current) : any {
    const divStyle : any = {
	height: '100px',
	overflowY: 'scroll'
    };
    const lineStyle : any = {
	width: '100px',
	color: 'blue',
	textAlign: 'left',
	verticalAlign: 'middle'
    };
    if (arr) {
	let children = [];
	for (let i = 0; i < arr.length; i++) {
	    let r = ExcelUtils.get_rectangle(arr, i);
	    if (r) {
		let [ col0, row0, col1, row1 ] = r;
		let score = Math.round(-arr[i][0]*10*100)/100;
		if (current === i) {
		    children.push(<tr style={lineStyle} onClick={(ev) => { ev.preventDefault(); selector(i); }}><td><b>{col0}{row0}:{col1}{row1}</b></td><td style={{width: Math.round(score), backgroundColor: red}}>(<em>score: {score}</em>)</td></tr>);
		} else {
		    children.push(<tr style={lineStyle} onClick={(ev) => { ev.preventDefault(); selector(i); }}><td>{col0}{row0}:{col1}{row1}</td><td>(<em>score: {score}</em>)</td></tr>);
		}
	    }
	}
	let table = [];
	table.push(<div>Click to jump to suspicious formulas:<br /><div style={divStyle}><table>{children}</table></div></div>);
	return table;
    } else {
	return <div>No suspicious formulas found.</div>;
    }
}

function DisplayFixes(props) {
    if (props.totalFixes > 0) {
	const table = makeTable(props.themFixes, props.selector, props.currentFix);
	return <div>{table}</div>;
    } else {
	return <div></div>;
    }
}



export class Content extends React.Component<ContentProps, any> {
	constructor(props, context) {
	    super(props, context);
	    this.state = { currentFix: props.currentFix,
			   totalFixes: props.totalFixes,
			   themFixes : props.themFixes };
	}
	// <p>{this.props.message}</p>

    
    
	render() {
		return (
			<div id='content-main'>
				<div className='padding'>
					<Button className='normal-button' buttonType={ButtonType.hero} onClick={this.props.click1}>{this.props.buttonLabel1}</Button>
					<Button className='ms-button' buttonType={ButtonType.hero} onClick={this.props.click2}>{this.props.buttonLabel2}</Button>
				</div>
			<DisplayFixes currentFix={this.state.currentFix} totalFixes={this.state.totalFixes} themFixes={this.state.themFixes} selector={this.props.selector} />
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
				<small>For more information, see <a href="https://excelint.org">excelint.org</a>.
                </small>
				<br />
			</div>
		);
	}
}
