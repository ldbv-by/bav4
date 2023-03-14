import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import { OlMap } from '../../../olMap/components/OlMap';
import css from './activateMapButton.css';

/**
 * @class
 * @author alsturm
 */
export class ActivateMapButton extends MvuElement {
	constructor() {
		super();

		const { EnvironmentService: environmentService, TranslationService: translationService } = $injector.inject(
			'EnvironmentService',
			'TranslationService'
		);
		this._environmentService = environmentService;
		this._translationService = translationService;
	}

	onWindowLoad() {
		//append common styles
		const renderCommonStyle = () => {
			return `
			body *:not(
				${ActivateMapButton.tag},
				${OlMap.tag}
				 ) {
				display: none;
			}				
			`;
		};

		if (!document.getElementById(ActivateMapButton.ACTIVATE_MAP_COMMON_Style_Id)) {
			const style = document.createElement('style');
			style.innerHTML = renderCommonStyle();
			style.id = ActivateMapButton.ACTIVATE_MAP_COMMON_Style_Id;
			document.head.appendChild(style);
		}
	}

	createView() {
		const translate = (key) => this._translationService.translate(key);

		const close = () => {
			const commonStyle = document.getElementById(ActivateMapButton.ACTIVATE_MAP_COMMON_Style_Id);
			commonStyle.remove();
			const background = this.shadowRoot.getElementById('background');
			background.classList.add('hide');
		};

		const isTouch = {
			istouch: this._environmentService.isTouch()
		};

		return html`
			<style>
				${css}
			</style>
			<div id="background" class="active-map__background">
				<div class="active-map__button ${classMap(isTouch)}"">
					<ba-button .type=${'primary'} .label=${translate('iframe_activate_map_button')} @click=${close}></ba-button>
				</div>
				<ba-attribution-info></ba-attribution-info>
			</div>
		`;
	}

	/**
	 * @override
	 */
	isRenderingSkipped() {
		return !this._environmentService.isEmbedded();
	}

	static get tag() {
		return 'ba-activate-map-button';
	}

	static get ACTIVATE_MAP_COMMON_Style_Id() {
		return 'activate_map_commons_kkfjrutmfjhwwww';
	}
}
