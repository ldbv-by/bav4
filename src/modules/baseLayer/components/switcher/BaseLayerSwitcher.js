import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection';
import { BaElement } from '../../../BaElement';
import { addLayer, removeLayer } from '../../../map/store/layers.action';
import css from './baseLayerSwitcher.css';

export class BaseLayerSwitcher extends BaElement {

	constructor() {
		super();

		const { TopicsService: topicsService, GeoResourceService: geoResourceService }
			= $injector.inject('TopicsService', 'GeoResourceService');

		this._topicsService = topicsService;
		this._geoResourceService = geoResourceService;
	}


	/**
	 * @override
	 */
	createView() {
		const { currentTopicId, activeLayers } = this._state;

		if (currentTopicId) {

			const { baseGeoRs: baseGeoRIds } = this._topicsService.byId(currentTopicId);
			const currentBaseLayerId = activeLayers[0] ? activeLayers[0].id : null;

			const geoRs = baseGeoRIds
				.map(grId => this._geoResourceService.byId(grId))
				.filter(geoR => !!geoR);


			const onClick = (geoR) => {
				//Remove existing
				geoRs.forEach(geoR => {
					removeLayer(geoR.id);
				});
				//add current
				addLayer(geoR.id);
			};

			const getType = (geoR) => {
				return (geoR.id === currentBaseLayerId) ? 'primary' : 'secondary';
			};

			return html`
				<style>${css}</style>
				<div>${geoRs.map((geoR) => html`<div class='container'><ba-button label=${geoR.label} @click=${() => onClick(geoR)} type=${getType(geoR)}></ba-button></div>`)}</div>
			`;
		}
		//Todo: in this case we should render a placeholder
		return nothing;
	}

	/**
	 * @override
	 */
	extractState(state) {
		const { topics: { current: currentTopicId }, layers: { active: activeLayers } } = state;
		return { currentTopicId, activeLayers };
	}



	static get tag() {
		return 'ba-base-layer-switcher';
	}
}