import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection';
import { addLayer, removeLayer } from '../../../../store/layers/layers.action';
import css from './baseLayerSwitcher.css';
import { MvuElement } from '../../../MvuElement';


const Update_Topic_Id = 'update_topic_id';
const Update_Layers = 'update_layers';
const Update_Is_Layers_Store_Ready = 'update_is_layers_store_ready';
/**
 * Component for managing base layers.
 * @class
 * @author taulinger
 */
export class BaseLayerSwitcher extends MvuElement {

	constructor() {
		super({
			currentTopicId: null,
			activeLayers: [],
			layersStoreReady: false
		});

		const { TopicsService: topicsService, GeoResourceService: geoResourceService }
			= $injector.inject('TopicsService', 'GeoResourceService');

		this._topicsService = topicsService;
		this._geoResourceService = geoResourceService;

		this.observe(store => store.topics.current, topicId => this.signal(Update_Topic_Id, topicId));
		this.observe(store => store.layers.active, layers => this.signal(Update_Layers, [...layers]));
		this.observe(store => store.layers.ready, ready => this.signal(Update_Is_Layers_Store_Ready, ready));
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Topic_Id:
				return { ...model, currentTopicId: data };
			case Update_Layers:
				return { ...model, activeLayers: [...data] };
			case Update_Is_Layers_Store_Ready:
				return { ...model, layersStoreReady: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { currentTopicId, activeLayers, layersStoreReady } = model;

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

	static get tag() {
		return 'ba-base-layer-switcher';
	}
}
