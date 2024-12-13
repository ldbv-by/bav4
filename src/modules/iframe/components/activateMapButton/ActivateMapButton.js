/**
 * @module modules/iframe/components/activateMapButton/ActivateMapButton
 */
import { html } from 'lit-html';
import { QueryParameters } from '../../../../domain/queryParameters';
import { $injector } from '../../../../injection';
import { Footer } from '../../../footer/components/Footer';
import { MvuElement } from '../../../MvuElement';
import { OlMap } from '../../../olMap/components/OlMap';
import css from './activateMapButton.css';
import { findAllBySelector } from '../../../../utils/markup';

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
				),${Footer.tag}::part(scale) {
					display: none;
				}		
					
				ba-footer{
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
			const olMap = findAllBySelector(document.querySelector(OlMap.tag) ?? this, '#ol-map');
			if (olMap[0]) {
				olMap[0].setAttribute('inert', '');
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
			const olMap = findAllBySelector(document.querySelector(OlMap.tag) ?? this, '#ol-map');
			if (olMap[0]) {
				olMap[0].removeAttribute('inert');
				olMap[0].focus();
			}
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
		return (
			!!this._environmentService.getQueryParams().get(QueryParameters.EC_MAP_ACTIVATION) &&
			this._environmentService.getQueryParams().get(QueryParameters.EC_MAP_ACTIVATION) !== 'false'
		);
	}

	static get tag() {
		return 'ba-activate-map-button';
	}

	static get STYLE_ID() {
		return 'activate_map_commons_kkfjrutmfjhwwww';
	}
}
