import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { BaElement } from '../../../../../BaElement';
import { addLayer, removeLayer } from '../../../../../map/store/layers.action';
import { MainMenuTabIndex } from '../../../../../menu/components/mainMenu/MainMenu';
import { setTabIndex } from '../../../../../menu/store/mainMenu.action';
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

	_tmpLayerId(id) {
		return `tmp_${this.constructor.name}_${id}`;
	}

	createView() {
	
		const onClick = (result) => {
			//remove the preview layer
			removeLayer(this._tmpLayerId(result.id));
			//add the "real" layer 
			addLayer(result.id, { label: result.label });
			//switch to "maps" tab in main menu
			setTabIndex(MainMenuTabIndex.MAPS);
		};
		const onMouseEnter = (result) => {
			//add a preview layer
			addLayer(this._tmpLayerId(result.id), { label: result.label, geoResourceId:result.id, constraints: { hidden: true, alwaysTop: true } });
		};
		const onMouseLeave = (result) => {
			//remove the preview layer
			removeLayer(this._tmpLayerId(result.id));
		};

		if (this._georesourceSearchResult) {

			return html`
				<style>${itemCss}</style>
				<style>${css}</style>
                <li 
					@click=${() => onClick(this._georesourceSearchResult)} 
					@mouseenter=${() => onMouseEnter(this._georesourceSearchResult)} 
					@mouseleave=${() => onMouseLeave(this._georesourceSearchResult)}>
						${unsafeHTML(this._georesourceSearchResult.labelFormated)}
				</li>
            `;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-search-content-panel-georesource-item';
	}
}