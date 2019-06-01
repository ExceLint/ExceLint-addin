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
		<div className='padding'>
		<img src='assets/ExceLint.png' height='90' />
		</div>
        );
    }
}
