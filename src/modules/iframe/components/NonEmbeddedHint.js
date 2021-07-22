import { BaElement } from '../../BaElement';
import { $injector } from '../../../injection';

/**
 * Displays a hint if the app is in embedded mode, but not used within an iframe
 * @class
 * @author taulinger
 */
export class NonEmbeddedHint extends BaElement {

	constructor() {
		super();
		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this._environmentService = EnvironmentService;
	}

	onWindowLoad() {
		if (this._environmentService.isEmbedded()
            && this._environmentService.getWindow().location === this._environmentService.getWindow().parent.location) {
			document.body.innerHTML = '<div style="text-align: center; color:#099dda; padding: 20px">The embedded version must be used in an iframe.</div>';
		}
	}

	isRenderingSkipped() {
		return true;
	}

	static get tag() {
		return 'ba-nonembedded-hint';
	}
}