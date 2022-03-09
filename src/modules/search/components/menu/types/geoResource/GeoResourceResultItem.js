import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { addLayer, removeLayer } from '../../../../../../store/layers/layers.action';
import { close as closeMainMenu, setTab, TabId } from '../../../../../../store/mainMenu/mainMenu.action';
import css from './geoResourceResultItem.css';
import { MvuElement } from '../../../../../MvuElement';
import { $injector } from '../../../../../../injection';

const Update_IsPortrait = 'update_isPortrait';
const Update_GeoResourceSearchResult = 'update_geoResourceSearchResult';

/**
 * Amount of time waiting before adding a layer in ms.
 */
export const LAYER_ADDING_DELAY_MS = 500;

/**
 * Renders a search result item for a geoResource.
 *
 * Properties:
 * - `data`
 *
 * @class
 * @author taulinger
 */
export class GeoResourceResultItem extends MvuElement {

	constructor() {
		super({
			geoResourceSearchResult: null,
			isPortrait: false
		});

		const { GeoResourceService: geoResourceService }
			= $injector.inject('GeoResourceService');
		this._geoResourceService = geoResourceService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_GeoResourceSearchResult:
				return { ...model, geoResourceSearchResult: data };
			case Update_IsPortrait:
				return { ...model, isPortrait: data };
		}
	}

	onInitialize() {
		this.observe(state => state.media, media => this.signal(Update_IsPortrait, media.portrait));
	}

	set data(geoResourceSearchResult) {
		this.signal(Update_GeoResourceSearchResult, geoResourceSearchResult);
	}

	static _tmpLayerId(id) {
		return `tmp_${GeoResourceResultItem.name}_${id}`;
	}

	createView(model) {
		const { isPortrait, geoResourceSearchResult } = model;
		/**
		 * Uses mouseenter and mouseleave events for adding/removing a preview layer.
		 * These events are not fired on touch devices, so there's no extra handling needed.
		 */
		const onMouseEnter = (result) => {
			//add a preview layer
			addLayer(GeoResourceResultItem._tmpLayerId(result.layerId),
				{ label: result.label, geoResourceId: result.id, constraints: { hidden: true, alwaysTop: true } });
		};
		const onMouseLeave = (result) => {
			//remove the preview layer
			removeLayer(GeoResourceResultItem._tmpLayerId(result.layerId));
		};
		const onClick = (result) => {
			//remove the preview layer
			removeLayer(GeoResourceResultItem._tmpLayerId(result.layerId));
			//add the "real" layer after some delay, which gives the user a better feedback
			setTimeout(() => {
				//we ask the GeoResourceService for an optionally updated label
				addLayer(result.layerId, { geoResourceId: result.id, label: this._geoResourceService.byId(result.id)?.label ?? result.label });
			}, LAYER_ADDING_DELAY_MS);

			if (isPortrait) {
				//close the main menu
				closeMainMenu();
			}
			else {
				//switch to "maps" tab in main menu
				setTab(TabId.MAPS);
			}
		};

		if (geoResourceSearchResult) {

			return html`
				<style>${css}</style>
                <li class="ba-list-item"  tabindex="0"
					@click=${() => onClick(geoResourceSearchResult)} 
					@mouseenter=${() => onMouseEnter(geoResourceSearchResult)} 
					@mouseleave=${() => onMouseLeave(geoResourceSearchResult)}>
						<span class="ba-list-item__pre ">
							<span class="ba-list-item__icon-info">
							</span>
						</span>
						<span class="ba-list-item__text ">
						${unsafeHTML(geoResourceSearchResult.labelFormated)}
						</span>
				</li>				
            `;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-search-content-panel-georesource-item';
	}
}
