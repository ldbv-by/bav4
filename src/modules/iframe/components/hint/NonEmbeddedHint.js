import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';

/**
 * Displays a hint if the app is in embedded mode, but not used within an iframe
 * @class
 * @author taulinger
 */
export class NonEmbeddedHint extends MvuElement {
	constructor() {
		super();
		const { EnvironmentService, TranslationService } = $injector.inject('EnvironmentService', 'TranslationService');
		this._environmentService = EnvironmentService;
		this._translationService = TranslationService;
	}

	onWindowLoad() {
		const translate = (key) => this._translationService.translate(key);

		if (
			this._environmentService.isEmbedded() &&
			this._environmentService.getWindow().location === this._environmentService.getWindow().parent.location
		) {
			document.body.innerHTML = `<div style="text-align: center; color:#099dda; padding: 20px">${translate('iframe_non_embedded_hint')}</div>`;
		}
	}

	isRenderingSkipped() {
		return true;
	}

	static get tag() {
		return 'ba-nonembedded-hint';
	}
}
