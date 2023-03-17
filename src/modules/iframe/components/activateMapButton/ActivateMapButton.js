import { html } from 'lit-html';
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

	onInitialize() {
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

		if (!document.getElementById(ActivateMapButton.STYLE_ID)) {
			const style = document.createElement('style');
			style.innerHTML = renderCommonStyle();
			style.id = ActivateMapButton.STYLE_ID;
			document.head.appendChild(style);
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

	static get STYLE_ID() {
		return 'activate_map_commons_kkfjrutmfjhwwww';
	}
}
