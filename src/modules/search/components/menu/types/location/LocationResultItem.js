/**
 * @module modules/search/components/menu/types/location/LocationResultItem
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import css from './locationResultItem.css?inline';
import { close as closeMainMenu } from '../../../../../../store/mainMenu/mainMenu.action';
import { fit } from '../../../../../../store/position/position.action';
import { addHighlightFeatures, removeHighlightFeaturesByCategory } from '../../../../../../store/highlight/highlight.action';
import clipboardSvg from '../../../../../../assets/icons/clipboard.svg';
import { $injector } from '../../../../../../injection';
import { emitNotification, LevelTypes } from '../../../../../../store/notifications/notifications.action';
import {
	HighlightFeatureType,
	SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY,
	SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY
} from '../../../../../../domain/highlightFeature';
import { AbstractResultItem, Highlight_Item_Class, Selected_Item_Class } from '../../AbstractResultItem';

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
 * @author thiloSchlemmer
 */
export class LocationResultItem extends AbstractResultItem {
	#translationService;
	#shareService;
	constructor() {
		super({
			locationSearchResult: null,
			isPortrait: false
		});

		const { TranslationService: translationService, ShareService: shareService } = $injector.inject('TranslationService', 'ShareService');

		this.#translationService = translationService;
		this.#shareService = shareService;
	}

	static get _maxZoomLevel() {
		return 17;
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

	/**
	 * @override
	 */
	highlightResult(highlighted) {
		const { locationSearchResult } = this.getModel();
		if (highlighted) {
			this.classList.add(Highlight_Item_Class);
			addHighlightFeatures({
				id: locationSearchResult.id,
				category: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY,
				type: HighlightFeatureType.MARKER_TMP,
				data: [...locationSearchResult.center]
			});
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
		const { isPortrait, locationSearchResult } = this.getModel();
		const extent = locationSearchResult.extent ? [...locationSearchResult.extent] : [...locationSearchResult.center, ...locationSearchResult.center];
		removeHighlightFeaturesByCategory([SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY, SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY]);
		this.classList.add(Selected_Item_Class);
		fit(extent, { maxZoom: LocationResultItem._maxZoomLevel });
		if (!locationSearchResult.extent) {
			addHighlightFeatures({
				id: locationSearchResult.id,
				category: SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY,
				type: HighlightFeatureType.MARKER,
				data: [...locationSearchResult.center],
				label: locationSearchResult.label
			});
		}

		if (isPortrait) {
			//close the main menu
			closeMainMenu();
		}
	}

	createView(model) {
		const { locationSearchResult } = model;
		const translate = (key) => this.#translationService.translate(key);

		const onCopyClick = async (e) => {
			e.preventDefault();
			e.stopPropagation();
			try {
				await this.#shareService.copyToClipboard(locationSearchResult.label);
				emitNotification(
					`"${locationSearchResult.label}" ${this.#translationService.translate('search_result_item_clipboard_success')}`,
					LevelTypes.INFO
				);
			} catch {
				const message = this.#translationService.translate('search_result_item_clipboard_error');
				emitNotification(message, LevelTypes.WARN);
				console.warn('Clipboard API not available');
			}
		};

		if (locationSearchResult) {
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
					<span class="ba-list-item__pre">
						<span
							class="ba-list-item__icon ${locationSearchResult.category ?? ''}"
							title=${locationSearchResult.category
								? translate(`search_result_item_category_title_${locationSearchResult.category}`)
								: translate(`search_result_item_category_title_default`)}
						>
						</span>
					</span>
					<span class="ba-list-item__text ">${unsafeHTML(locationSearchResult.labelFormatted)}</span>
					<div class="ba-list-item__after separator">
						<ba-icon
							class="copy-button"
							.icon=${clipboardSvg}
							.color=${'var(--primary-color)'}
							.color_hover=${'var(--text3)'}
							.size=${2}
							.title=${translate('search_result_item_copy')}
							@click=${onCopyClick}
						>
						</ba-icon>
					</div>
				</li>
			`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-search-content-panel-location-item';
	}
}
