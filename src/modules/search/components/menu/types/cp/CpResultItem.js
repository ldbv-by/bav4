/**
 * @module modules/search/components/menu/types/cp/CpResultItem
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import css from './cpResultItem.css';
import { close as closeMainMenu } from '../../../../../../store/mainMenu/mainMenu.action';
import { fit } from '../../../../../../store/position/position.action';
import { addHighlightFeatures, removeHighlightFeaturesByCategory } from '../../../../../../store/highlight/highlight.action';
import {
	SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY,
	SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY
} from '../../../../../../plugins/HighlightPlugin';
import { HighlightFeatureType } from '../../../../../../domain/highlightFeature';
import { addFeatures, removeFeaturesById } from '../../../../../../store/featureCollection/featureCollection.action';
import { emitNotification, LevelTypes } from '../../../../../../store/notifications/notifications.action';
import { BaFeature } from '../../../../../../domain/feature';
import { $injector } from '../../../../../../injection/index';
import { AbstractResultItem, Highlight_Item_Class, Selected_Item_Class } from '../../AbstractResultItem';
import { StyleHint } from '../../../../../../domain/styles';

const Update_IsPortrait = 'update_isPortrait';
const Update_CpSearchResult = 'update_cpSearchResult';
const Update_FeatureIds = 'update_featureIds';

/**
 * Renders an search result item for a cadastral parcel.
 *
 * Properties:
 * - `data`
 *
 * @class
 * @author costa_gi
 * @author taulinger
 * @author thiloSchlemmer
 */
export class CpResultItem extends AbstractResultItem {
	#translationService;
	constructor() {
		super({
			cpSearchResult: null,
			isPortrait: false,
			featureIds: []
		});

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this.#translationService = translationService;
	}

	static get _maxZoomLevel() {
		return 19;
	}

	update(type, data, model) {
		switch (type) {
			case Update_CpSearchResult:
				return { ...model, cpSearchResult: data };
			case Update_FeatureIds:
				return { ...model, featureIds: [...data] };
			case Update_IsPortrait:
				return { ...model, isPortrait: data };
		}
	}

	onInitialize() {
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_IsPortrait, media.portrait)
		);

		this.observe(
			(state) => state.featureCollection.entries,
			(entries) =>
				this.signal(
					Update_FeatureIds,
					entries.map((e) => e.id)
				)
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
	highlightResult(highlighted) {
		const { cpSearchResult } = this.getModel();
		if (highlighted) {
			this.classList.add(Highlight_Item_Class);
			if (cpSearchResult.geometry) {
				addHighlightFeatures({
					category: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY,
					type: HighlightFeatureType.DEFAULT_TMP,
					data: cpSearchResult.geometry
				});
			} else {
				addHighlightFeatures({
					category: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY,
					type: HighlightFeatureType.MARKER_TMP,
					data: [...cpSearchResult.center]
				});
			}
		} else {
			this.classList.remove(Highlight_Item_Class);
			this.classList.remove(Selected_Item_Class);
			removeHighlightFeaturesByCategory(SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY);
		}
	}

	/**
	 * @override
	 */
	selectResult() {
		const { isPortrait, cpSearchResult } = this.getModel();
		const extent = cpSearchResult.extent ? [...cpSearchResult.extent] : [...cpSearchResult.center, ...cpSearchResult.center];
		this.classList.add(Selected_Item_Class);
		removeHighlightFeaturesByCategory([SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY, SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY]);
		fit(extent, { maxZoom: CpResultItem._maxZoomLevel });
		if (cpSearchResult.geometry) {
			addHighlightFeatures({
				id: cpSearchResult.id,
				category: SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY,
				type: HighlightFeatureType.DEFAULT,
				data: cpSearchResult.geometry,
				label: cpSearchResult.label
			});
		} else if (!cpSearchResult.extent) {
			addHighlightFeatures({
				id: cpSearchResult.id,
				category: SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY,
				type: HighlightFeatureType.MARKER,
				data: [...cpSearchResult.center],
				label: cpSearchResult.label
			});
		}

		if (isPortrait) {
			//close the main menu
			closeMainMenu();
		}
	}

	createView(model) {
		const { cpSearchResult, featureIds } = model;

		const translate = (key) => this.#translationService.translate(key);

		const removeFeature = (result) => {
			removeHighlightFeaturesByCategory([SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY, SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY]);
			removeFeaturesById(result.id);
			emitNotification(translate('global_featureCollection_remove_feature_notification'), LevelTypes.INFO);
		};

		const addFeature = (result) => {
			const feature = new BaFeature(result.geometry, result.id).setStyleHint(StyleHint.HIGHLIGHT).set('name', result.label);
			removeHighlightFeaturesByCategory([SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY, SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY]);
			addFeatures(feature);
			emitNotification(translate('global_featureCollection_add_feature_notification'), LevelTypes.INFO);
		};

		const getFeatureCollectionActionButton = (result) => {
			if (result.geometry) {
				if (featureIds.includes(result.id)) {
					return html`<button
						class="chips__button remove"
						title=${translate('global_featureCollection_remove_feature_title')}
						@click=${(e) => {
							e.preventDefault();
							e.stopPropagation();
							removeFeature(result);
						}}
					>
						<span class="chips__icon"></span>
					</button>`;
				}
				return html`<button
					class="chips__button add"
					title=${translate('global_featureCollection_add_feature_title')}
					@click=${(e) => {
						e.preventDefault();
						e.stopPropagation();
						addFeature(result);
					}}
				>
					<span class="chips__icon"></span>
				</button>`;
			}

			return nothing;
		};

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
					part="background"
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
					${getFeatureCollectionActionButton(cpSearchResult)}
				</li>
			`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-search-content-panel-cp-item';
	}
}
