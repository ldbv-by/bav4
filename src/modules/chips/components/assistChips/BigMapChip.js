import { $injector } from '../../../../injection';
import { AbstractAssistChip } from './AbstractAssistChip';
import baSvg from './assets/basolo.svg';
import { html, nothing } from 'lit-html';
import css from './bigMapChip.css';

/**
 *
 * @class
 * @author alsturm
 */
export class BigMapChip extends AbstractAssistChip {
	constructor() {
		super({});
		const {
			EnvironmentService: environmentService,
			TranslationService: translationService,
			ShareService: shareService
		} = $injector.inject('EnvironmentService', 'TranslationService', 'ShareService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._shareService = shareService;
	}

	/**
	 * @override
	 */
	getIcon() {
		return baSvg;
	}

	/**
	 * @override
	 */
	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('chips_assist_big_map');
	}

	/**
	 * @override
	 */
	isVisible() {
		return this._environmentService.isEmbedded();
	}

	/**
	 * @override
	 */
	createView(/*eslint-disable no-unused-vars */ model) {
		const icon = this.getIcon();
		const iconClass = `.chips__icon {
			height: 1.5em;
			width: 1.5em;
			position: relative;
			top: -.1em;		
			mask-size:cover;
			mask : url("${icon}");			
			-webkit-mask-image : url("${icon}");			
			-webkit-mask-size:cover;
			background: var(--secondary-color);
		}`;

		const getHref = () => {
			return this._shareService.encodeState();
		};

		return this.isVisible()
			? html` <style>
						${iconClass}
							${css}
					</style>
					<a class="chips__button" href=${getHref()} target="_blank">
						<span class="chips__icon"></span>
						<span class="chips__button-text">${this.getLabel()}</span>
					</a>`
			: nothing;
	}

	static get tag() {
		return 'big-map-chip-chip';
	}
}
