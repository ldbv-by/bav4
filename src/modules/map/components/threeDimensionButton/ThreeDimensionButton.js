/**
 * @module modules/map/components/threeDimensionButton/ThreeDimensionButton
 */
import { html } from 'lit-html';

import { $injector } from '../../../../injection';
import css from './threeDimensionButton.css';
import { MvuElement } from '../../../MvuElement';
import { QueryParameters } from '../../../../domain/queryParameters';
import { GlobalCoordinateRepresentations } from '../../../../domain/coordinateRepresentation';

/**
 * Button that opens the 3D view.
 * @class
 * @author alsturm
 * @author taulinger
 */

export class ThreeDimensionButton extends MvuElement {
	#translationService;
	#environmentService;
	#shareService;
	#coordinateService;
	#storeService;
	#mapService;
	constructor() {
		super();

		const {
			TranslationService: translationService,
			EnvironmentService: environmentService,
			ShareService: shareService,
			CoordinateService: coordinateService,
			StoreService: storeService,
			MapService: mapService
		} = $injector.inject('TranslationService', 'EnvironmentService', 'ShareService', 'CoordinateService', 'StoreService', 'MapService');
		this.#translationService = translationService;
		this.#environmentService = environmentService;
		this.#shareService = shareService;
		this.#coordinateService = coordinateService;
		this.#storeService = storeService;
		this.#mapService = mapService;
	}

	createView() {
		const translate = (key) => this.#translationService.translate(key);

		const onClick = () => {
			const queryParameters = Object.fromEntries(this.#shareService.getParameters());
			const transformedCenter = this.#coordinateService
				.toLonLat(this.#storeService.getStore().getState().position.center)
				.map((n) => n.toFixed(GlobalCoordinateRepresentations.WGS84.digits));
			queryParameters[QueryParameters.CENTER] = transformedCenter;
			queryParameters['res'] = this.#mapService
				.calcResolution(this.#storeService.getStore().getState().position.zoom, this.#storeService.getStore().getState().position.center)
				.toFixed(1);

			const url = `https://geodaten.bayern.de/bayernatlas_3d_preview?${decodeURIComponent(new URLSearchParams(queryParameters).toString())}`;
			this.#environmentService.getWindow().open(url);
		};
		return html`
			<style>
				${css}
			</style>
			<div>
				<button @click="${onClick}" class="three-dimension-button" title=${translate('map_threeDimensionButton_title')}>
					<i class="icon three-dimension-icon"></i>
				</button>
			</div>
		`;
	}
	static get tag() {
		return 'ba-three-dimension-button';
	}
}
