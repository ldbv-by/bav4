import { html } from 'lit-html';
import { BaElement } from '../../BaElement';
import { $injector } from '../../../injection';
import css from './footer.css';

/**
 * Container element for footer stuff.
 * @class
 * @author taulinger
 */
export class Footer extends BaElement {

	constructor() {
		super();

		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this._environmentService = EnvironmentService;
	}


	onWindowLoad() {
		if (!this.isRenderingSkipped()) {
			this._root.querySelector('.preload').classList.remove('preload');
		}
	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	createView(state) {

		const { open, portrait, minWidth } = state;

		const getOverlayClass = () => {
			return (open && !portrait) ? 'is-open' : '';
		};

		const getOrientationClass = () => {
			return portrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return minWidth ? 'is-desktop' : 'is-tablet';
		};

		return html`
			<style>${css}</style>
			<div  class="preload">
				<div class="${getOrientationClass()} ${getMinWidthClass()}">
					<div class="footer ${getOverlayClass()}">
						<div class="scale"></div>
						<ba-attribution-info></ba-attribution-info>
						<div class="content">	
							${this.createChildrenView()}
						</div>
					</div>
				</div>
			</div>
		`;
	}

	createChildrenView() {
		return html`		
		<ba-map-info></ba-map-info>
		`;
	}

	/**
	 * @override
	 * @param {Object} globalState
	 */
	extractState(globalState) {
		const { mainMenu: { open }, media: { portrait, minWidth } } = globalState;
		return { open, portrait, minWidth };
	}

	static get tag() {
		return 'ba-footer';
	}
}
