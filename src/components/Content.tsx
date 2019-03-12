import * as React from 'react';
import { Button, ButtonType } from 'office-ui-fabric-react';
// Checkbox

export interface ContentProps {
    message: string;
    buttonLabel: string;
    click: any;
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
                    <Button className='normal-button' buttonType={ButtonType.hero} onClick={this.props.click}>{this.props.buttonLabel}</Button>
                </div>
                    <br />
		    <br />
                    For more information, see <a href="https://excelint.org">excelint.org</a>.
                    <br/>
            </div>
        );
    }
}
