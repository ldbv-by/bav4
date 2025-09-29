/**
 * @module modules/admin/components/AdminUI
 */
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

	onAfterRender() {}
	/**
	 * @override
	 */
	createView() {
		const getHostStyle = () => {
			return html` :host { position: fixed; } `;
		};

		return html`
			<style>
				${getHostStyle()}
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
