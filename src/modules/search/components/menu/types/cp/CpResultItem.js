/**
 * @module modules/search/components/menu/types/cp/CpResultItem
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import css from './cpResultItem.css';
import { close as closeMainMenu } from '../../../../../../store/mainMenu/mainMenu.action';
import { fit } from '../../../../../../store/position/position.action';
import { addHighlightFeatures, removeHighlightFeaturesById } from '../../../../../../store/highlight/highlight.action';
import { SEARCH_RESULT_HIGHLIGHT_FEATURE_ID, SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID } from '../../../../../../plugins/HighlightPlugin';
import { HighlightFeatureType } from '../../../../../../domain/highlightFeature';
import { AbstractResultItem } from '../../AbstractSearchResultItem';

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
export class CpResultItem extends AbstractResultItem {
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

	/**
	 * @override
	 */
	selectResult() {
		const { isPortrait, cpSearchResult } = this.getModel();
		const extent = cpSearchResult.extent ? [...cpSearchResult.extent] : [...cpSearchResult.center, ...cpSearchResult.center];
		removeHighlightFeaturesById([SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID, SEARCH_RESULT_HIGHLIGHT_FEATURE_ID]);
		fit(extent, { maxZoom: CpResultItem._maxZoomLevel });
		if (cpSearchResult.geometry) {
			addHighlightFeatures({
				id: SEARCH_RESULT_HIGHLIGHT_FEATURE_ID,
				type: HighlightFeatureType.DEFAULT,
				data: cpSearchResult.geometry,
				label: cpSearchResult.label
			});
		} else if (!cpSearchResult.extent) {
			addHighlightFeatures({
				id: SEARCH_RESULT_HIGHLIGHT_FEATURE_ID,
				type: HighlightFeatureType.MARKER,
				data: [...cpSearchResult.center],
				label: cpSearchResult.label
			});
		} else {
			removeHighlightFeaturesById(SEARCH_RESULT_HIGHLIGHT_FEATURE_ID);
		}

		if (isPortrait) {
			//close the main menu
			closeMainMenu();
		}
	}

	/**
	 * @override
	 */
	highlightResult(highlighted) {
		const { cpSearchResult } = this.getModel();
		if (highlighted) {
			this.shadowRoot.querySelector('.ba-list-item')?.focus();
			if (cpSearchResult.geometry) {
				addHighlightFeatures({
					id: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID,
					type: HighlightFeatureType.DEFAULT_TMP,
					data: cpSearchResult.geometry
				});
			} else {
				addHighlightFeatures({
					id: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID,
					type: HighlightFeatureType.MARKER_TMP,
					data: [...cpSearchResult.center],
					label: cpSearchResult.label
				});
			}
		} else {
			this.shadowRoot.querySelector('.ba-list-item')?.blur();
			removeHighlightFeaturesById(SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID);
		}
	}

	createView(model) {
		const { cpSearchResult } = model;

		if (cpSearchResult) {
			/**
			 * Uses mouseenter and mouseleave events for adding/removing a temporary highlight feature.
			 * These events are not fired on touch devices, so there's no extra handling needed.
			 */
			return html`
				<style>
					${css}
				</style>
				<li
					class="ba-list-item"
					tabindex="0"
					@click=${() => this.selectResult()}
					@mouseenter=${() => this.highlightResult(true)}
					@mouseleave=${() => this.highlightResult(false)}
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
