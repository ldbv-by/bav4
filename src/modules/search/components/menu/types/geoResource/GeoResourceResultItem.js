import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { addLayer, removeLayer } from '../../../../../../store/layers/layers.action';
import { close as closeMainMenu, setTab, TabId } from '../../../../../../store/mainMenu/mainMenu.action';
import css from './geoResourceResultItem.css';
import { MvuElement } from '../../../../../MvuElement';
import { $injector } from '../../../../../../injection';
import { createUniqueId } from '../../../../../../utils/numberUtils';
import { fitLayer } from '../../../../../../store/position/position.action';
import { GeoResourceFuture } from '../../../../../../domain/geoResources';

const Update_IsPortrait = 'update_isPortrait';
const Update_GeoResourceSearchResult = 'update_geoResourceSearchResult';
const Update_LoadingPreviewFlag = 'update_loadingPreviewFlag';

/**
 * Amount of time waiting before adding a layer in ms.
 */
export const LOADING_PREVIEW_DELAY_MS = 500;

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
			isPortrait: false,
			loadingPreview: false
		});

		const { GeoResourceService: geoResourceService }
			= $injector.inject('GeoResourceService');
		this._geoResourceService = geoResourceService;
		this._timeoutId = null;
	}

	update(type, data, model) {
		switch (type) {
			case Update_GeoResourceSearchResult:
				return { ...model, geoResourceSearchResult: data };
			case Update_IsPortrait:
				return { ...model, isPortrait: data };
			case Update_LoadingPreviewFlag:
				return { ...model, loadingPreview: data };
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
		const { isPortrait, geoResourceSearchResult, loadingPreview } = model;
		/**
		 * Uses mouseenter and mouseleave events for adding/removing a preview layer.
		 * These events are not fired on touch devices, so there's no extra handling needed.
		 */
		const onMouseEnter = (result) => {
			const id = GeoResourceResultItem._tmpLayerId(result.geoResourceId);
			//add a preview layer
			this._timeoutId = setTimeout(() => {


				addLayer(id,
					{ geoResourceId: result.geoResourceId, constraints: { hidden: true } });

				const geoRes = this._geoResourceService.byId(result.geoResourceId);

				if (geoRes instanceof GeoResourceFuture) {
					this.signal(Update_LoadingPreviewFlag, true);
					geoRes.onResolve(() => this.signal(Update_LoadingPreviewFlag, false));
				}
				fitLayer(id);
				this._timeoutId = null;
			}, LOADING_PREVIEW_DELAY_MS);
		};
		const onMouseLeave = (result) => {
			//remove the preview layer
			removeLayer(GeoResourceResultItem._tmpLayerId(result.geoResourceId));
			if (this._timeoutId) {
				clearTimeout(this._timeoutId);
				this._timeoutId = null;
			}
			this.signal(Update_LoadingPreviewFlag, false);
		};
		const onClick = (result) => {
			//remove the preview layer
			removeLayer(GeoResourceResultItem._tmpLayerId(result.geoResourceId));
			//add the "real" layer after some delay, which gives the user a better feedback
			const id = `${result.geoResourceId}_${createUniqueId()}`;
			//we ask the GeoResourceService for an optionally updated label
			addLayer(id, { geoResourceId: result.geoResourceId });

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
							<span class="ba-list-item__icon">
							</span>
						</span>
						<span class="ba-list-item__text ">
							${loadingPreview ? html`<ba-spinner .label=${geoResourceSearchResult.labelFormatted}></ba-spinner>` : html`${unsafeHTML(geoResourceSearchResult.labelFormatted)}`}   
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
