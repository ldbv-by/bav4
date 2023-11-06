/**
 * @module modules/menu/components/mainMenu/content/AbstractMvuContentPanel
 */
import { html } from 'lit-html';
import { MvuElement } from '../../../../MvuElement';
import contentPanelCss from './abstractContentPanel.css';

const Update_Active = 'update_disabled';

/**
 * Base class for all content panels of the main menu.
 * @property {boolean} active - `true` when the content panel is currently active
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

	set active(active) {
		this.signal(Update_Active, active);
	}

	get active() {
		return this.getModel().active;
	}

	setActive(active) {
		this.signal(Update_Active, active);
	}
}
