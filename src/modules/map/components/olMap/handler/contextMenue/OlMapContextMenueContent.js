import { html, nothing } from 'lit-html';
import { BaElement } from '../../../../../BaElement';
import css from './olMapContextMenueContent.css';
import { $injector } from '../../../../../../injection';

export class OlMapContextMenueContent extends BaElement {

	constructor() {
		super();
		const {
			MapService: mapService,
			CoordinateService: coordinateService,
		} = $injector.inject('MapService', 'CoordinateService');

		this._mapService = mapService;
		this._coordinateService = coordinateService;
	}

	set coordinate(value) {
		this._coordinate = value;
	}


	createView() {
		if (this._coordinate) {
			const sridDefinitions = this._mapService.getSridDefinitionsForView();
			const stringifiedCoords = sridDefinitions.map(definition => {
				const { label, code } = definition;
				const transformedCoordinate = this._coordinateService.transform(this._coordinate, this._mapService.getSrid(), code);
				return label + ' ' + this._coordinateService.stringify(transformedCoordinate, code);
			});

			return html`
			<style>${css}</style>

			<div class="container">
  				<ul class="content">
				${stringifiedCoords.map((strCoord) => html`<li>${strCoord}</li>`)}
  				</ul>
			</div>
			`;

		}
		
		return nothing;
	}

	static get tag() {
		return 'ba-ol-map-context-menue-content';
	}

}