import { html } from 'lit-html'; 
import { BaElement } from '../../../BaElement';
import css from './scaleLine.css'; 


export class ScaleLine extends BaElement {

	constructor() {
		super();
	} 


	/**
     * @override 
     */
	createView() {

		return html`
            <style>${css}</style>
            <div><p class='scale-line'>Scale Line in progress</p></div>
        `;
	} 

	static get tag() {
		return 'ba-scale-line';
	} 

} 