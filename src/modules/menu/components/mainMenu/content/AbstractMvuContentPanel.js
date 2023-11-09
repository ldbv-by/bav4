/**
 * @module modules/menu/components/mainMenu/content/AbstractMvuContentPanel
 */
import { html } from 'lit-html';
import { MvuElement } from '../../../../MvuElement';
import contentPanelCss from './abstractContentPanel.css';

const Update_Active = 'update_disabled';

/**
 * Base class for all content panels of the main menu.
 * The model of this abstract class contains the property `active` which indicates the visibility of the content panel.
 * @class
 * @author taulinger
 * @abstract
 */
export class AbstractMvuContentPanel extends MvuElement {
	constructor(model = {}) {
		super({ ...model, active: false });
		if (this.constructor === AbstractMvuContentPanel) {
			// Abstract class can not be constructed.
			throw new TypeError('Can not construct abstract class.');
		}
	}

	update(type, data, model) {
		switch (type) {
			case Update_Active:
				return { ...model, active: data };
		}
	}

	/**
	 * @override
	 */
	defaultCss() {
		return html`
			${super.defaultCss()}
			<style>
				${contentPanelCss}
			</style>
		`;
	}

	/**
	 * Updates the `active` property of the internal model.
	 * @param {boolean} active
	 */
	setActive(active) {
		this.signal(Update_Active, active);
	}

	/**
	 * @returns {boolean} The current value of the `active` property of the internal model
	 */
	isActive() {
		return this.getModel().active;
	}
}
