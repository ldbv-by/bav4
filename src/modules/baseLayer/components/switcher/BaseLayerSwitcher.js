import { html, nothing } from 'lit';
import { $injector } from '../../../../injection';
import { BaElement } from '../../../BaElement';
import { addLayer, removeLayer } from '../../../../store/layers/layers.action';
import css from './baseLayerSwitcher.css';

/**
 * Component for managing base layers.
 * @class
 * @author taulinger
 */
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
	createView(state) {
		const { currentTopicId, activeLayers, layersStoreReady } = state;

		if (layersStoreReady) {

			const { baseGeoRs: baseGeoRIds } = this._topicsService.byId(currentTopicId);
			const currentBaseLayerId = activeLayers[0] ? activeLayers[0].geoResourceId : null;


			const geoRs = baseGeoRIds
				.map(grId => this._geoResourceService.byId(grId))
				.filter(geoR => !!geoR);


			const onClick = (geoR) => {

				const add = () => {
					addLayer(geoR.id, { label: geoR.label, zIndex: 0 });
				};

				if (activeLayers.length > 0) {
					if (activeLayers[0].geoResourceId !== geoR.id) {
						//Remove existing
						geoRs.forEach(geoR => {
							removeLayer(geoR.id);
						});
						//add selected layer
						add();
					}
				}
				else {
					//add selected layer
					add();
				}
			};

			const getType = (geoR) => {
				return (geoR.id === currentBaseLayerId) ? 'primary' : 'secondary';
			};

			return html`
				<style>${css}</style>
				<div class="title">
					Basiskarte
				</div>
				<div class="baselayer__container">
					${geoRs.map((geoR) => html`
							<button class="baselayer__button  ${geoR.id}"  @click=${() => onClick(geoR)}  type=${getType(geoR)}  >
								<div class="baselayer__label">${geoR.label}</div>
							</button>`)}
				</div>
			`;
		}
		//Todo: in this case we should render a placeholder
		return nothing;
	}

	/**
	 * @override
	 */
	extractState(globalState) {
		const { topics: { current: currentTopicId }, layers: { active: activeLayers, ready: layersStoreReady } } = globalState;
		return { currentTopicId, activeLayers, layersStoreReady };
	}

	static get tag() {
		return 'ba-base-layer-switcher';
	}
}
