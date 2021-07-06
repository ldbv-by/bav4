import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { $injector } from '../../../../../../injection';
import { BaElement } from '../../../../../BaElement';
import { addLayer, removeLayer } from '../../../../../../store/layers/layers.action';
import { MainMenuTabIndex } from '../../../../../menu/components/mainMenu/MainMenu';
import { close as closeMainMenu, setTabIndex } from '../../../../../menu/store/mainMenu.action';
import itemCss from '../item.css';
import css from './geoResourceResultItem.css';



/**
 * Renders an search result item for a geoResource.
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
export class GeoResourceResultItem extends BaElement {
	
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
		mediaQuery.addEventListener('change',  handleOrientationChange);
		//initial set of local state
		handleOrientationChange(mediaQuery);
	}

	set data(geoResourceSearchResult) {
		this._georesourceSearchResult = geoResourceSearchResult;
		this.render();
	}

	static _tmpLayerId(id) {
		return `tmp_${GeoResourceResultItem.name}_${id}`;
	}

	createView() {
		/**
		 * Uses mouseenter and mouseleave events for adding/removing a preview layer.
		 * These events are not fired on touch devices, so there's no extra handling needed.
		 */
		const onMouseEnter = (result) => {
			//add a preview layer
			addLayer(GeoResourceResultItem._tmpLayerId(result.id), { label: result.label, geoResourceId: result.id, constraints: { hidden: true, alwaysTop: true } });
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
			
			if (this._portrait) {
				//close the main menu
				closeMainMenu();
			}
			else {
				//switch to "maps" tab in main menu
				setTabIndex(MainMenuTabIndex.MAPS);
			}
		};

		if (this._georesourceSearchResult) {

			return html`
				<style>${itemCss}</style>
				<style>${css}</style>
                <li class="ba-list-item"
					@click=${() => onClick(this._georesourceSearchResult)} 
					@mouseenter=${() => onMouseEnter(this._georesourceSearchResult)} 
					@mouseleave=${() => onMouseLeave(this._georesourceSearchResult)}>
						<span class="ba-list-item__pre ">
							<span class="ba-list-item__icon-info">
							</span>
						</span>
						<span class="ba-list-item__text ">
						${unsafeHTML(this._georesourceSearchResult.labelFormated)}
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