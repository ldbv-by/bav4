/**
 * @module modules/admin/components/AdminUI
 */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import css from './adminUI.css';

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
			<div>
				<ba-admin-catalog></ba-admin-catalog>
			</div>
		`;
	}

	static get tag() {
		return 'ba-admin-ui';
	}
}
