import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import toolContentCss from './abstractToolContent.css';

/**
 * Base class for all ToolContent panels.
 * Just prepends common CSS classes.
 * @class
 * @author taulinger
 * @abstract
 */
export class AbstractToolContent extends MvuElement {

	constructor(model = {}) {
		super(model);
		if (this.constructor === AbstractToolContent) {
			// Abstract class can not be constructed.
			throw new TypeError('Can not construct abstract class.');
		}
	}

	/**
	* @override
	*/
	defaultCss() {
		return html`
		${super.defaultCss()}
		<style>
		    ${toolContentCss}
		</style>
		`;
	}
}
