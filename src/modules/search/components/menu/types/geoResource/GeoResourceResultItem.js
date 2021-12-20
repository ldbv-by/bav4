import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { addLayer, removeLayer } from '../../../../../../store/layers/layers.action';
import { close as closeMainMenu, setTab, TabKey } from '../../../../../../store/mainMenu/mainMenu.action';
import css from './geoResourceResultItem.css';
import { MvuElement } from '../../../../../MvuElement';

const Update_IsPortrait = 'update_isPortrait';
const Update_GeoResourceSearchResult = 'update_geoResourceSearchResult';

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
			addLayer(GeoResourceResultItem._tmpLayerId(result.id),
				{ label: result.label, geoResourceId: result.id, constraints: { hidden: true, alwaysTop: true } });
		};
		const onMouseLeave = (result) => {
			//remove the preview layer
			removeLayer(GeoResourceResultItem._tmpLayerId(result.id));
		};
		const onClick = (result) => {
			//remove the preview layer
			removeLayer(GeoResourceResultItem._tmpLayerId(result.id));
			//add the "real" layer
			addLayer(result.id, { label: result.label });

			if (isPortrait) {
				//close the main menu
				closeMainMenu();
			}
			else {
				//switch to "maps" tab in main menu
				setTab(TabKey.MAPS);
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
