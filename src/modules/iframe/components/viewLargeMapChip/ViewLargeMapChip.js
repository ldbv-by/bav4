import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import baSvg from './assets/ba.svg';
import { html, nothing } from 'lit-html';
import css from './viewLargeMapChip.css';
// import { PathParameters } from '../../../../domain/pathParameters';

/**
 *
 * @class
 * @author alsturm
 */
export class ViewLargeMapChip extends MvuElement {
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
	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('iframe_view_large_map_chip');
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
	createView() {
		const iconClass = `.chips__icon {
			height: 1.5em;
			width: 1.5em;
			position: relative;
			top: -.1em;		
			mask-size:cover;
			mask : url("${baSvg}");			
			-webkit-mask-image : url("${baSvg}");			
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
		return 'view-large-map-chip';
	}
}
