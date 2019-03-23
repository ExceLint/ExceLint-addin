import * as React from 'react';
import { Button, ButtonType } from 'office-ui-fabric-react';
// Checkbox

export interface ContentProps {
    message1: string;
    buttonLabel1: string;
    message2: string;
    buttonLabel2: string;
    click1: any;
    click2: any;
}

export class Content extends React.Component<ContentProps, any> {
    constructor(props, context) {
        super(props, context);
    }
    // <p>{this.props.message}</p>

    render() {
        return (
            <div id='content-main'>
                <div className='padding'>
                    <Button className='normal-button' buttonType={ButtonType.hero} onClick={this.props.click1}>{this.props.buttonLabel1}</Button>
                    <Button className='ms-button' buttonType={ButtonType.hero} onClick={this.props.click2}>{this.props.buttonLabel2}</Button>
                </div>
		<br />
		<svg width="300" height="20">
		<rect x="0" y="0" width="50" height="20" fill="darkgreen" stroke-width="3" stroke="black" />
		<text x="55" y="13">formulas (dark colors, solid borders)</text>
		</svg>
		<svg width="300" height="20">
		<rect x="0" y="0" width="50" height="20" fill="lightgreen" stroke-width="1" stroke="black" stroke-dasharray="3,3" />
		<text x="55" y="13">data (light colors, dashed borders)</text>
		</svg>
		<svg width="300" height="20">
		<rect x="0" y="0" width="50" height="20" fill="yellow" stroke-width="1" stroke="black" stroke-dasharray="3,3" />
		<text x="55" y="13">unreferenced data</text>
		</svg>
		<br />
		<br />
		<br />
                <small>For more information, see <a href="https://excelint.org">excelint.org</a>.
                </small>
		<br/>
            </div>
        );
    }
}
