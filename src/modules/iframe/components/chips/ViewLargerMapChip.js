/**
 * @module modules/iframe/components/chips/ViewLargerMapChip
 */
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import baSvg from './assets/ba-filled.svg';
import { html, nothing } from 'lit-html';
import css from './viewLargerMapChip.css';
import { QueryParameters } from '../../../../domain/queryParameters';

const Update_State_For_Encoding = 'update_state_for_encoding';

/**
 *
 * @class
 * @author alsturm
 */
export class ViewLargerMapChip extends MvuElement {
	#visible;
	constructor() {
		super({
			href: ''
		});
		const {
			EnvironmentService: environmentService,
			TranslationService: translationService,
			ShareService: shareService
		} = $injector.inject('EnvironmentService', 'TranslationService', 'ShareService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._shareService = shareService;
	}

	onInitialize() {
		/**
		 * The visibility of this component is determined once at initialization time when EC_LINK_TO_APP param is available
		 */
		this.#visible =
			this._environmentService.getQueryParams().get(QueryParameters.EC_LINK_TO_APP) &&
			this._environmentService.getQueryParams().get(QueryParameters.EC_LINK_TO_APP) !== 'false';
		this.observe(
			(state) => state.stateForEncoding.changed,
			() => {
				const encodedState = this._shareService.encodeState();
				this.signal(Update_State_For_Encoding, encodedState);
			}
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_State_For_Encoding:
				return { ...model, href: data };
		}
	}

	createView(model) {
		if (this.#visible && this._environmentService.isEmbedded()) {
			const { href } = model;

			const translate = (key) => this._translationService.translate(key);

			const iconClass = `.chips__icon {	
				mask-size:cover;
				mask : url("${baSvg}");			
				-webkit-mask-image : url("${baSvg}");			
				-webkit-mask-size:cover;			
			}`;

			return html` <style>
					${iconClass}
						${css}
				</style>
				<a class="chips__button" aria-label="${translate('iframe_view_larger_map_chip')}" href=${href} target="_blank">
					<span class="chips__icon"></span>
					<span class="chips__button-text">${translate('iframe_view_larger_map_chip')}</span>
				</a>`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-view-larger-map-chip';
	}
}
