import { html, nothing, svg } from 'lit-html';
import { $injector } from '../../../../../injection';
import { AbstractContentPanel } from '../../../../menu/components/mainMenu/content/AbstractContentPanel';
import { setIndex } from '../../../store/topicsContentPanel.action';
import { TopicsContentPanelIndex } from '../TopicsContentPanel';
import css from './catalogContentPanel.css';


/**
 * Renders a catalog definition
 * @class
 * @author taulinger
 * @author alsturm
 */
export class CatalogContentPanel extends AbstractContentPanel {

	constructor() {
		super();
		const { CatalogService: catalogService, TranslationService: translationService, TopicsService: topicsService }
			= $injector.inject('CatalogService', 'TranslationService', 'TopicsService');
		this._translationService = translationService;
		this._catalogService = catalogService;
		this._topicsService = topicsService;
		this._catalog = null;
	}

	initialize() {

		const requestCatalog = async (topicId) => {
			try {

				this._catalog = await this._catalogService.byId(topicId);
				this._topic = this._topicsService.byId(topicId);
				this.render();
			}
			catch (e) {
				console.warn(e.message);
			}
		};

		this.observe('currentTopicId', currentTopicId => requestCatalog(currentTopicId));
	}

	onStateChanged() {
		//we do nothing here, because we call #render() manually after catalog data are available
	}


	/**
	 * @override
	 */
	createView() {
		
		const changeIndex = () => {
			setIndex(TopicsContentPanelIndex.TOPICS);			
			this.render;
		};
		
		if (this._catalog) {
			const childElements = this._catalog.map(item => {
				//node
				if (item.children) {
					return html`<ba-catalog-node .data=${item}></ba-catalog-node>`;
				}
				//leaf
				return html`<ba-catalog-leaf .data=${item}></ba-catalog-leaf>`;
			});
			const { label, style } = this._topic;	
			const translate = (key) => this._translationService.translate(key);
			//temp mock icon
			style.svg = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>`;

			return html`
			<style>
			${css}
			</style>
			<div class="catalog-content-panel">
			<button class="ba-list-item" @click=${changeIndex}>
				<span class="ba-list-item__text">${translate('topics_catalog_panel_change_topic')}</span>			
				<span class="ba-list-item__after">
				<span class="arrow arrow-left"></span>
				</span>
			</button>
			<span class="topic ba-list-item ba-list-inline ba-list-item__header">
				<span class="ba-list-item__pre">
					<span class="ba-list-item__icon">						
					${style.svg}
					</span>				
				</span>
				<span class="ba-list-item__text verticla-center">
					<span class="ba-list-item__main-text">${label}</span>					
				</span>
			</span>
			</div>
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
