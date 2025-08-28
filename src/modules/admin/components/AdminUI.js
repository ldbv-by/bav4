/**
 * @module modules/admin/components/AdminUI
 */
import css from './adminUI.css';
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';

/**
 * Container element for the administration user-interface.
 * @class
 * @author herrmutig
 */
export class AdminUI extends MvuElement {
	constructor() {
		super({});
	}

	/**
	 * @override
	 */
	createView() {
		return html`
			<style>
				${css}
			</style>

			<ba-catalog></ba-catalog>
		`;
	}

	static get tag() {
		return 'ba-admin-ui';
	}
}
