import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { BaElement } from '../../../../../BaElement';
import itemCss from '../item.css';
import css from './locationResultItem.css';
import { close as closeMainMenu } from '../../../../../../store/mainMenu/mainMenu.action';
import { setFit } from '../../../../../../store/position/position.action';
import { addHighlightFeatures, HighlightFeatureTypes, removeHighlightFeaturesById } from '../../../../../../store/highlight/highlight.action';
import { SEARCH_RERSULT_HIGHLIGHT_FEATURE_ID, SEARCH_RERSULT_TEMPORARY_HIGHLIGHT_FEATURE_ID } from '../../../../../../plugins/HighlightPlugin';



/**
 * Renders an search result item for a location.
 *
 * Configurable Properties:
 * - `data`
 *
 * Observed Properties:
 * - `data`
 *
 * @class
 * @author taulinger
 */
export class LocationResultItem extends BaElement {

	static get _maxZoomLevel() {
		return 19;
	}

	set data(locationSearchResult) {
		this._locationSearchResult = locationSearchResult;
		this.render();
	}

	onStateChanged() {
		//nothing to do here, we only render when locationSearchResult changes
	}

	/**
	  * @override
	  * @param {Object} globalState
	  */
	extractState(globalState) {
		const { media: { portrait } } = globalState;
		return { portrait };
	}

	createView(state) {
		const { portrait } = state;
		/**
		 * Uses mouseenter and mouseleave events for adding/removing a temporary highlight feature.
		 * These events are not fired on touch devices, so there's no extra handling needed.
		 */
		const onMouseEnter = (result) => {
			addHighlightFeatures({ id: SEARCH_RERSULT_TEMPORARY_HIGHLIGHT_FEATURE_ID, type: HighlightFeatureTypes.TEMPORARY, data: { coordinate: [...result.center] } });
		};
		const onMouseLeave = () => {
			removeHighlightFeaturesById(SEARCH_RERSULT_TEMPORARY_HIGHLIGHT_FEATURE_ID);
		};
		const onClick = (result) => {

			const extent = result.extent ? [...result.extent] : [...result.center, ...result.center];
			removeHighlightFeaturesById(SEARCH_RERSULT_TEMPORARY_HIGHLIGHT_FEATURE_ID);
			setFit(extent, { maxZoom: LocationResultItem._maxZoomLevel });
			if (!result.extent) {
				addHighlightFeatures({ id: SEARCH_RERSULT_HIGHLIGHT_FEATURE_ID, type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [...result.center] } });
			}
			else {
				removeHighlightFeaturesById(SEARCH_RERSULT_HIGHLIGHT_FEATURE_ID);
			}

			if (portrait) {
				//close the main menu
				closeMainMenu();
			}
		};

		if (this._locationSearchResult) {

			return html`
				<style>${itemCss}</style>
				<style>${css}</style>
                <li class="ba-list-item"
					@click=${() => onClick(this._locationSearchResult)} 
					@mouseenter=${() => onMouseEnter(this._locationSearchResult)} 
					@mouseleave=${() => onMouseLeave(this._locationSearchResult)}>
					<span class="ba-list-item__pre ">
						<span class="ba-list-item__icon-info">
						</span>
					</span>
					<span class="ba-list-item__text ">
					${unsafeHTML(this._locationSearchResult.labelFormated)}
					</span>
				</li>
            `;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-search-content-panel-location-item';
	}
}
