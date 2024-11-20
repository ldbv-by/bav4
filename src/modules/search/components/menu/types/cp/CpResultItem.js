/**
 * @module modules/search/components/menu/types/cp/CpResultItem
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import css from './cpResultItem.css';
import { close as closeMainMenu } from '../../../../../../store/mainMenu/mainMenu.action';
import { fit } from '../../../../../../store/position/position.action';
import {
	addHighlightFeatures,
	HighlightFeatureType,
	HighlightGeometryType,
	removeHighlightFeaturesById
} from '../../../../../../store/highlight/highlight.action';
import { SEARCH_RESULT_HIGHLIGHT_FEATURE_ID, SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID } from '../../../../../../plugins/HighlightPlugin';
import { MvuElement } from '../../../../../MvuElement';
import { SourceTypeName } from '../../../../../../domain/sourceType';

const Update_IsPortrait = 'update_isPortrait';
const Update_CpSearchResult = 'update_cpSearchResult';

/**
 * Renders an search result item for a cadastral parcel.
 *
 * Properties:
 * - `data`
 *
 * @class
 * @author costa_gi
 */
export class CpResultItem extends MvuElement {
	constructor() {
		super({
			cpSearchResult: null,
			isPortrait: false
		});
	}

	static get _maxZoomLevel() {
		return 19;
	}

	update(type, data, model) {
		switch (type) {
			case Update_CpSearchResult:
				return { ...model, cpSearchResult: data };
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

	set data(cpSearchResult) {
		this.signal(Update_CpSearchResult, cpSearchResult);
	}

	_throwError(message) {
		throw message;
	}

	createView(model) {
		const { isPortrait, cpSearchResult } = model;
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
			fit(extent, { maxZoom: CpResultItem._maxZoomLevel });
			if (result.data) {
				const matchGeomType = (sourceType) => {
					switch (sourceType.name) {
						case SourceTypeName.EWKT:
							return HighlightGeometryType.EWKT;
						case SourceTypeName.GEOJSON:
							return HighlightGeometryType.GEOJSON;
					}
					this._throwError(`SourceType ${sourceType.name} is currently not supported`);
				};
				addHighlightFeatures({
					id: SEARCH_RESULT_HIGHLIGHT_FEATURE_ID,
					type: HighlightFeatureType.DEFAULT,
					data: { geometry: result.data.geometry, geometryType: matchGeomType(result.data.geometryType) }
				});
			} else if (!result.extent) {
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

		if (cpSearchResult) {
			return html`
				<style>
					${css}
				</style>
				<li
					class="ba-list-item"
					tabindex="0"
					@click=${() => onClick(cpSearchResult)}
					@mouseenter=${() => onMouseEnter(cpSearchResult)}
					@mouseleave=${() => onMouseLeave(cpSearchResult)}
				>
					<span class="ba-list-item__pre ">
						<span class="ba-list-item__icon"> </span>
					</span>
					<span class="ba-list-item__text "> ${unsafeHTML(cpSearchResult.labelFormatted)} </span>
				</li>
			`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-search-content-panel-cp-item';
	}
}
