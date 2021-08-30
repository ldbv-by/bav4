import { html, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html';
import { BaElement } from '../../../../../BaElement';
import itemCss from '../item.css';
import css from './locationResultItem.css';
import { close as closeMainMenu } from '../../../../../menu/store/mainMenu.action';
import { setFit } from '../../../../../../store/position/position.action';
import { HightlightFeatureTypes, removeHighlightFeature, removeTemporaryHighlightFeature, setHighlightFeature, setTemporaryHighlightFeature } from '../../../../../../store/highlight/highlight.action';



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
			setTemporaryHighlightFeature({ type: HightlightFeatureTypes.DEFAULT, data: { coordinate: [...result.center] } });
		};
		const onMouseLeave = () => {
			removeTemporaryHighlightFeature();
		};
		const onClick = (result) => {

			const extent = result.extent ? [...result.extent] : [...result.center, ...result.center];
			removeTemporaryHighlightFeature();
			setFit(extent, { maxZoom: LocationResultItem._maxZoomLevel });
			if (!result.extent) {
				setHighlightFeature({ type: HightlightFeatureTypes.DEFAULT, data: { coordinate: [...result.center] } });
			}
			else {
				removeHighlightFeature();
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
