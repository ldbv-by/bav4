/**
 * @module modules/admin/components/AdminUI
 */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import { $injector } from '../../../injection';

/**
 * Container element for the administration user-interface.
 * @class
 * @author herrmutig
 */
export class AdminUI extends MvuElement {
	#environmentService;

	constructor() {
		super({});

		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this.#environmentService = EnvironmentService;
	}

	onInitialize() {
		this.#updateCss(true);
	}

	/**
	 * @override
	 */
	createView() {
		return html`
			<div>
				<ba-catalog></ba-catalog>
			</div>
		`;
	}

	static get tag() {
		return 'ba-admin-ui';
	}

	#updateCss(darkSchema) {
		const cssClassToAdd = darkSchema ? 'dark-theme' : 'light-theme';
		const cssClassToRemove = darkSchema ? 'light-theme' : 'dark-theme';
		this.#environmentService.getWindow().document.body.classList.add(cssClassToAdd);
		this.#environmentService.getWindow().document.body.classList.remove(cssClassToRemove);
	}
}
