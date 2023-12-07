/**
 * @module modules/search/components/menu/types/location/LocationResultItem
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import css from './locationResultItem.css';
import { close as closeMainMenu } from '../../../../../../store/mainMenu/mainMenu.action';
import { fit } from '../../../../../../store/position/position.action';
import { addHighlightFeatures, HighlightFeatureType, removeHighlightFeaturesById } from '../../../../../../store/highlight/highlight.action';
import { SEARCH_RESULT_HIGHLIGHT_FEATURE_ID, SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID } from '../../../../../../plugins/HighlightPlugin';
import { MvuElement } from '../../../../../MvuElement';

const Update_IsPortrait = 'update_isPortrait';
const Update_LocationSearchResult = 'update_locationSearchResult';

/**
 * Renders an search result item for a location.
 *
 * Properties:
 * - `data`
 *
 * @class
 * @author taulinger
 */
export class LocationResultItem extends MvuElement {
	constructor() {
		super({
			locationSearchResult: null,
			isPortrait: false
		});
	}

	static get _maxZoomLevel() {
		return 19;
	}

	update(type, data, model) {
		switch (type) {
			case Update_LocationSearchResult:
				return { ...model, locationSearchResult: data };
			case Update_IsPortrait:
				return { ...model, isPortrait: data };
		}
	}

	onInitialize() {
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_IsPortrait, media.portrait)
		);
	}

	set data(locationSearchResult) {
		this.signal(Update_LocationSearchResult, locationSearchResult);
	}

	createView(model) {
		const { isPortrait, locationSearchResult } = model;
		/**
		 * Uses mouseenter and mouseleave events for adding/removing a temporary highlight feature.
		 * These events are not fired on touch devices, so there's no extra handling needed.
		 */
		const onMouseEnter = (result) => {
			addHighlightFeatures({
				id: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID,
				type: HighlightFeatureType.MARKER_TMP,
				data: { coordinate: [...result.center] }
			});
		};
		const onMouseLeave = () => {
			removeHighlightFeaturesById(SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID);
		};
		const onClick = (result) => {
			const extent = result.extent ? [...result.extent] : [...result.center, ...result.center];
			removeHighlightFeaturesById([SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID, SEARCH_RESULT_HIGHLIGHT_FEATURE_ID]);
			fit(extent, { maxZoom: LocationResultItem._maxZoomLevel });
			if (!result.extent) {
				addHighlightFeatures({
					id: SEARCH_RESULT_HIGHLIGHT_FEATURE_ID,
					type: HighlightFeatureType.MARKER,
					data: { coordinate: [...result.center] }
				});
			} else {
				removeHighlightFeaturesById(SEARCH_RESULT_HIGHLIGHT_FEATURE_ID);
			}

			if (isPortrait) {
				//close the main menu
				closeMainMenu();
			}
		};

		if (locationSearchResult) {
			return html`
				<style>
					${css}
				</style>
				<li
					class="ba-list-item"
					tabindex="0"
					@click=${() => onClick(locationSearchResult)}
					@mouseenter=${() => onMouseEnter(locationSearchResult)}
					@mouseleave=${() => onMouseLeave(locationSearchResult)}
				>
					<span class="ba-list-item__pre ">
						<span class="ba-list-item__icon"> </span>
					</span>
					<span class="ba-list-item__text "> ${unsafeHTML(locationSearchResult.labelFormatted)} </span>
				</li>
			`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-search-content-panel-location-item';
	}
}
