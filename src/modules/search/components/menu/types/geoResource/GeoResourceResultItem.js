import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { BaElement } from '../../../../../BaElement';
import { addLayer, removeLayer } from '../../../../../../store/layers/layers.action';
import { close as closeMainMenu, setTabIndex, TabIndex } from '../../../../../menu/store/mainMenu.action';
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

	set data(geoResourceSearchResult) {
		this._georesourceSearchResult = geoResourceSearchResult;
		this.render();
	}

	static _tmpLayerId(id) {
		return `tmp_${GeoResourceResultItem.name}_${id}`;
	}

	onStateChanged() {
		//nothing to do here, we only render when geoResourceSearchResult changes
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

			if (portrait) {
				//close the main menu
				closeMainMenu();
			}
			else {
				//switch to "maps" tab in main menu
				setTabIndex(TabIndex.MAPS);
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
