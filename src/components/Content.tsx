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

    render() {
        return (
            <div id='content-main'>
                <div className='padding'>
                    <p>{this.props.message}</p>
                    <br />
                    <h3>Try it out</h3>
                    <br/>
                    <Button className='normal-button' buttonType={ButtonType.hero} onClick={this.props.click}>{this.props.buttonLabel}</Button>
                </div>
            </div>
        );
    }
}
