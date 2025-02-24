/**
 * @module modules/chips/components/assistChips/AbstractAssistChip
 */
import { html, nothing } from 'lit-html';
import css from './abstractAssistChip.css';
import { MvuElement } from '../../../MvuElement';

const Update_Title = 'update_title';

/**
 *
 * @abstract
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 * @author alsturm
 */
export class AbstractAssistChip extends MvuElement {
	/**
	 * @param {object} model initial Model of this component
	 */
	constructor(model = {}) {
		super({ ...model, title: null });

		if (this.constructor === AbstractAssistChip) {
			// Abstract class can not be constructed.
			throw new Error('Can not construct abstract class.');
		}
	}

	update(type, data, model) {
		switch (type) {
			case Update_Title:
				return { ...model, title: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { title } = model;
		const icon = this.getIcon();
		const iconClass = `.chips__icon {
			height: 1.5em;
			width: 1.5em;
			position: relative;
			top: -.1em;		
			mask-size:cover;
			mask : url("${icon}");			
			-webkit-mask-image : url("${icon}");			
			-webkit-mask-size:cover;
			background: var(--text4);
		}`;

		return this.isVisible()
			? html` <style>
						${iconClass}
							${css}
					</style>
					<button class="chips__button" title=${title} aria-label=${title} @click=${() => this.onClick()}>
						<span class="chips__icon"></span>
						<span class="chips__button-text">${this.getLabel()}</span>
					</button>`
			: nothing;
	}

	/**
	 * returns the graphic resource for the assist chip to be rendered
	 * @abstract
	 * @protected
	 * @returns {string} the icon as encoded (base64) graphic resource or string (svg)
	 */
	getIcon() {
		// The child has not implemented this method.
		throw new Error('Please implement abstract method #getIcon or do not call super.getIcon from child.');
	}

	/**
	 * returns the label for the assist chip to be rendered
	 * @abstract
	 * @protected
	 * @returns {string} the label
	 */
	getLabel() {
		// The child has not implemented this method.
		throw new Error('Please implement abstract method #getLabel or do not call super.getLabel from child.');
	}

	/**
	 * Whether or not the chip is visible
	 * @abstract
	 * @protected
	 * @returns {boolean} true if visible, otherwise false
	 */
	isVisible() {
		// The child has not implemented this method.
		throw new Error('Please implement abstract method #isVisible or do not call super.isVisible from child.');
	}

	/**
	 * onClick-handling method, called, when the user clicks the chip
	 * @abstract
	 * @protected
	 */
	onClick() {
		// The child has not implemented this method.
		throw new Error('Please implement abstract method #onClick or do not call super.onClick from child.');
	}

	/**
	 * @property {string} title='' - Title of the Chip
	 */
	set title(value) {
		this.signal(Update_Title, value);
	}
}
