/**
 * @module modules/search/components/menu/AbstractResultItem
 */
import { MvuElement } from '../../../MvuElement';

export const Highlight_Item_Class = 'ba-key-nav-item_highlight';
export const Selected_Item_Class = 'ba-mouse-nav-item_select';

/**
 * @abstract
 * @class
 * @author thiloSchlemmer
 */
export class AbstractResultItem extends MvuElement {
	constructor(model) {
		super(model);
		if (this.constructor === AbstractResultItem) {
			// Abstract class can not be constructed.
			throw new TypeError('Can not construct abstract class.');
		}
	}

	/**
	 * Selects the result
	 * @abstract
	 */
	selectResult() {
		// The child has not implemented this method.
		throw new TypeError('Please implement abstract method selectResult or do not call super.selectResult from child.');
	}

	/**
	 * Highlights the result
	 * @abstract
	 * @property {boolean} highlighted whether or not the result is highlighted
	 */
	highlightResult(/*eslint-disable no-unused-vars*/ highlighted) {
		// The child has not implemented this method.
		throw new TypeError('Please implement abstract method highlightResult or do not call super.highlightResult from child.');
	}
}
