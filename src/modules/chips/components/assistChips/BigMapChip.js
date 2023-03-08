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
		const { EnvironmentService: environmentService, TranslationService: translationService } = $injector.inject(
			'EnvironmentService',
			'TranslationService'
		);
		this._translationService = translationService;
		this._environmentService = environmentService;
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
	onClick() {
		alert('test');
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

		return this.isVisible()
			? html` <style>
						${iconClass}
							${css}
					</style>
					<button class="chips__button" @click=${() => this.onClick()}>
						<span class="chips__icon"></span>
						<span class="chips__button-text">${this.getLabel()}</span>
					</button>`
			: nothing;
	}

	static get tag() {
		return 'big-map-chip-chip';
	}
}
