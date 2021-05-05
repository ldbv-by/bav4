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
		this._portrait = false;
	}


	initialize() {

		const _window = this._environmentService.getWindow();
		//MediaQuery for 'orientation'
		const mediaQuery = _window.matchMedia('(orientation: portrait)');
		const handleOrientationChange = (e) => {
			this._portrait = e.matches;
			//trigger a re-render
			this.render();
		};
		mediaQuery.addEventListener('change',  handleOrientationChange);
		//initial set of local state
		handleOrientationChange(mediaQuery);
	}

	onWindowLoad() {
		if (!this.isRenderingSkipped()) {
			this._root.querySelector('.preload').classList.remove('preload');
		}
	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	createView() {

		const { open } = this._state;

		const getOverlayClass = () => {
			return (open && !this._portrait) ? 'is-open' : '';
		};
		
		const getOrientationClass = () => {
			return this._portrait ? 'is-portrait' : 'is-landscape';
		};


		return html`
			<style>${css}</style>
			<div class="preload ${getOrientationClass()}">
			<div class="footer ${getOverlayClass()}">
				<ba-attribution-info></ba-attribution-info>
					<div class="content">	
						${this.createChildrenView()}
					</div>
				</div>
			</div>
		`;
	}

	createChildrenView() {
		return html`<ba-map-info></ba-map-info>`;
	}

	/**
	 * @override
	 * @param {Object} state 
	 */
	extractState(state) {
		const { mainMenu: { open } } = state;
		return { open };
	}


	static get tag() {
		return 'ba-footer';
	}
}
