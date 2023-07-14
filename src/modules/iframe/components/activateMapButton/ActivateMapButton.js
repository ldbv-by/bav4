/**
 * @module modules/iframe/components/activateMapButton/ActivateMapButton
 */
import { html } from 'lit-html';
import { IFrameComponents } from '../../../../domain/iframeComponents';
import { QueryParameters } from '../../../../domain/queryParameters';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import { OlMap } from '../../../olMap/components/OlMap';
import { Footer } from '../../../footer/components/Footer';
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

	onInitialize() {
		if (this._isVisible()) {
			//append common styles
			//ba-footer width transparent scale and higher z-index
			const renderCommonStyle = () => {
				return `
				body *:not(
				${ActivateMapButton.tag},
				${OlMap.tag},
				${Footer.tag}

				) {
					display: none;
				}					
				ba-footer{
					--text3: transparent;
					--secondary-color: transparent;		
					--z-mapbuttons: calc(var(--z-disableall) + 1);			
				}
				
				`;
			};

			if (!document.getElementById(ActivateMapButton.STYLE_ID)) {
				const style = document.createElement('style');
				style.innerHTML = renderCommonStyle();
				style.id = ActivateMapButton.STYLE_ID;
				document.head.appendChild(style);
			}
		}
	}

	createView() {
		const translate = (key) => this._translationService.translate(key);

		const close = () => {
			const commonStyle = document.getElementById(ActivateMapButton.STYLE_ID);
			commonStyle.remove();
			const background = this.shadowRoot.getElementById('background');
			background.classList.add('hide');
		};

		return html`
			<style>
				${css}
			</style>
			<div id="background" class="active-map__background">
				<div class="active-map__button">
					<ba-button .type=${'primary'} .label=${translate('iframe_activate_map_button')} @click=${close}></ba-button>
				</div>
			</div>
		`;
	}

	/**
	 * @override
	 */
	isRenderingSkipped() {
		return !this._isVisible();
	}

	_isVisible() {
		const queryParams = this._environmentService.getQueryParams();
		const showActivateMapButton = () => {
			// check if we have a query parameter overdrive the iframe activateMapButton
			const iframeComponents = queryParams.get(QueryParameters.IFRAME_COMPONENTS);
			return iframeComponents ? iframeComponents.split(',').includes(IFrameComponents.ACTIVATE_MAP_BUTTON) : true;
		};

		return this._environmentService.isEmbedded() && showActivateMapButton();
	}

	static get tag() {
		return 'ba-activate-map-button';
	}

	static get STYLE_ID() {
		return 'activate_map_commons_kkfjrutmfjhwwww';
	}
}
