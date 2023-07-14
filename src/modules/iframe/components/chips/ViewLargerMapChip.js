/**
 * @module modules/iframe/components/chips/ViewLargerMapChip
 */
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import baSvg from './assets/ba.svg';
import { html, nothing } from 'lit-html';
import css from './viewLargerMapChip.css';
import { QueryParameters } from '../../../../domain/queryParameters';
import { IFrameComponents } from '../../../../domain/iframeComponents';

const Update_State_For_Encoding = 'update_state_for_encoding';

/**
 *
 * @class
 * @author alsturm
 */
export class ViewLargerMapChip extends MvuElement {
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

	isRenderingSkipped() {
		const queryParams = this._environmentService.getQueryParams();

		// check if we have a query parameter defining the iframe ViewLargerMapChip
		const iframeComponents = queryParams.get(QueryParameters.IFRAME_COMPONENTS);
		return iframeComponents ? !iframeComponents.split(',').includes(IFrameComponents.VIEW_LARGER_MAP_CHIP) : false;
	}

	createView(model) {
		const { href } = model;

		const translate = (key) => this._translationService.translate(key);

		const iconClass = `.chips__icon {	
			mask-size:cover;
			mask : url("${baSvg}");			
			-webkit-mask-image : url("${baSvg}");			
			-webkit-mask-size:cover;			
		}`;

		return this._environmentService.isEmbedded()
			? html` <style>
						${iconClass}
							${css}
					</style>
					<a class="chips__button" href=${href} target="_blank">
						<span class="chips__icon"></span>
						<span class="chips__button-text">${translate('iframe_view_larger_map_chip')}</span>
					</a>`
			: nothing;
	}

	static get tag() {
		return 'ba-view-larger-map-chip';
	}
}
