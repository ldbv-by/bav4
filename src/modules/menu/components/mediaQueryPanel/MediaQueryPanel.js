/**
 * @module modules/menu/components/mediaQueryPanel/MediaQueryPanel
 */
import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import cssmain from '../../../../main.css';
import css from './mediaQueryPanel.css';
import { $injector } from '../../../../injection';
import { close } from '../../../../store/mainMenu/mainMenu.action';

/**
 *  Example for using and testing media queries
 * @class
 * @deprecated
 */
export class MediaQueryPanel extends BaElement {
	constructor() {
		super();

		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;

		this._portrait = false;
		this._minWidth = false;
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
		mediaQuery.addEventListener('change', handleOrientationChange);
		//initial set of local state
		handleOrientationChange(mediaQuery);

		//MediaQuery for 'min-width'
		const mediaQueryMinWidth = _window.matchMedia('(min-width: 600px)');
		const handleMinWidthChange = (e) => {
			this._minWidth = e.matches;
			//trigger a re-render
			this.render();
		};
		mediaQueryMinWidth.addEventListener('change', handleMinWidthChange);
		//initial set of local state
		handleMinWidthChange(mediaQueryMinWidth);
	}

	/**
	 * @override
	 */
	createView(state) {
		const { open } = state;

		const getOrientationClass = () => {
			return this._portrait ? 'is-portrait' : 'is-landscape';
		};
		const getMinWidthClass = () => {
			return this._minWidth ? 'only-greater-600' : '';
		};

		const getOverlayClass = () => {
			return open ? 'is-open' : '';
		};

		return html`
			<style>
				${cssmain}
			</style>
			<style>
				${css}
			</style>
			<div class="${getOrientationClass()}">
				<div class="content-panel ${getOverlayClass()} ${getMinWidthClass()}">
					<button @click="${close}" class="content-panel__close-button">
						<span class="arrow"></span>
					</button>
				</div>
			</div>
		`;
	}

	/**
	 * @override
	 * @param {Object} globalState
	 */
	extractState(globalState) {
		const {
			mainMenu: { open }
		} = globalState;
		return { open };
	}

	static get tag() {
		return 'ba-media-query-panel';
	}
}
