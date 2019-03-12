import * as React from 'react';

export interface HeaderProps {
    title: string;
}

export class Header extends React.Component<HeaderProps, any> {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <div id='content-header'>
                <div className='padding'>
                    <h1>{this.props.title}</h1>
                </div>
            </div>
        );
    }
}
