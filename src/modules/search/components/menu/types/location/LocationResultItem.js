import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { $injector } from '../../../../../../injection';
import { BaElement } from '../../../../../BaElement';
import itemCss from '../item.css';
import css from './locationResultItem.css';
import { close as closeMainMenu } from '../../../../../menu/store/mainMenu.action';
import { setFit } from '../../../../../../store/position/position.action';
import { removeHighlightFeature, removeTemporaryHighlightFeature, setHighlightFeature, setTemporaryHighlightFeature } from '../../../../../../store/highlight/highlight.action';



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

	constructor() {
		super();

		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this._environmentService = EnvironmentService;
		this._portrait = false;
	}

	initialize() {

		const _window = this._environmentService.getWindow();
		//MediaQuery for 'orientation'
		const mediaQuery = _window.matchMedia('(orientation: portrait)');
		const handleOrientationChange = (e) => {
			this._portrait = e.matches;
		};
		mediaQuery.addEventListener('change', handleOrientationChange);
		//initial set of local state
		handleOrientationChange(mediaQuery);
	}

	static get _maxZoomLevel() {
		return 19;
	}

	set data(locationSearchResult) {
		this._locationSearchResult = locationSearchResult;
		this.render();
	}


	createView() {
		/**
		 * Uses mouseenter and mouseleave events for adding/removing a temporary highlight feature.
		 * These events are not fired on touch devices, so there's no extra handling needed.
		 */
		const onMouseEnter = (result) => {
			setTemporaryHighlightFeature({ data: [...result.center] });
		};
		const onMouseLeave = () => {
			removeTemporaryHighlightFeature();
		};
		const onClick = (result) => {

			const extent = result.extent ? [...result.extent] : [...result.center, ...result.center];
			removeTemporaryHighlightFeature();
			setFit(extent, { maxZoom: LocationResultItem._maxZoomLevel });
			if (!result.extent) {
				setHighlightFeature({ data: [...result.center] });
			}
			else {
				removeHighlightFeature();
			}

			if (this._portrait) {
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