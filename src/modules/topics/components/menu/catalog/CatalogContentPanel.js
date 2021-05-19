import { html, nothing } from 'lit-html';
import { $injector } from '../../../../../injection';
import { BaElement } from '../../../../BaElement';
import css from './catalogContentPanel.css';


/**
 * Renders a catalog definition
 * @class
 * @author taulinger
 * @author alsturm
 */
export class CatalogContentPanel extends BaElement {

	constructor() {
		super();
		const { CatalogService: catalogService, TranslationService: translationService }
			= $injector.inject('CatalogService', 'TranslationService');
		this._translationService = translationService;
		this._catalogService = catalogService;
	}

	initialize() {

		const requestCatalog = async (topicId) => {
			try {

				this._catalog = await this._catalogService.byId(topicId);
				this.render();
			}
			catch (e) {
				console.warn(e.message);
			}
		};

		this.observe('currentTopicId', currentTopicId => requestCatalog(currentTopicId));
	}

	onStateChanged() {
		//we we do nothing here, because we will call #render() manually after search results are available
	}


	/**
	 * @override
	 */
	createView() {

		if (this._catalog) {

			const childElements = this._catalog.map(item => {
				//node
				if (item.children) {
					return html`<ba-catalog-node .data=${item}></ba-catalog-node>`;
				}
				//leaf
				return html`<ba-catalog-leaf .data=${item}></ba-catalog-leaf>`;
			});


			return html`
        	<style>${css}</style>
			<div class="catalog-content-panel">
				${childElements}
			</div>
			`;
		}
		return nothing;
	}



	extractState(globalState) {

		const { topics: { current: currentTopicId, ready: topicsReady } } = globalState;
		return { currentTopicId, topicsReady };
	}

	static get tag() {
		return 'ba-catalog-content-panel';
	}
}
