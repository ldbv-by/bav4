import { html, nothing } from 'lit-html';
import { $injector } from '../../../../../injection';
import { AbstractContentPanel } from '../../../../menu/components/mainMenu/content/AbstractContentPanel';
import { setIndex } from '../../../store/topicsContentPanel.action';
import { TopicsContentPanelIndex } from '../TopicsContentPanel';
import tempSvg from '../../assets/temp.svg';
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
			const { id, label } = this._topic;
			const themeColor = `
			.topic{
				--secondary-color: var(--topic-theme-${id});			  
			}	
			`;
			const translate = (key) => this._translationService.translate(key);

			return html`
			<style>
			${css}
			${themeColor}
			</style>
			<div class="catalog-content-panel">
			<a href="#" tabindex='0' class="ba-list-item" @click=${changeIndex}>
				<span class="ba-list-item__text">${translate('topics_catalog_panel_change_topic')}</span>			
				<span class="ba-list-item__after">
				<i class='icon icon-secondary close'>
				</i>
				</span>
			</a>
			<span class="topic ba-list-item ba-list-inline ba-list-item__header">
				<span class="ba-list-item__pre">
					<span class="ba-list-item__icon">
						<ba-icon id='info' icon='${tempSvg}' color=var(--primary-bg-color) color_hover=var(--primary-bg-color) size=2.6 ></ba-icon>
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
