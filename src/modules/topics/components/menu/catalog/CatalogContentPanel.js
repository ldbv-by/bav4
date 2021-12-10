import { html, nothing } from 'lit-html';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg.js';
import { $injector } from '../../../../../injection';
import { setIndex } from '../../../../../store/topicsContentPanel/topicsContentPanel.action';
import { AbstractContentPanel } from '../../../../menu/components/mainMenu/content/AbstractContentPanel';
import { TopicsContentPanelIndex } from '../TopicsContentPanel';
import css from './catalogContentPanel.css';
import arrowLeftShort from '../assets/arrowLeftShort.svg';


/**
 * Renders a catalog definition for a specific topicId.
 * The rendering strategy of this component avoids unnecessary calls of #render() as much as possible.
 * While catalog data are fetched a spinner is shown. After catalog is data are available and rendered, no more
 * updates of the view happen.
 *
 * @class
 * @author taulinger
 * @author alsturm
 */
export class CatalogContentPanel extends AbstractContentPanel {

	constructor() {
		super();

		this._topicId = null;
		this._catalog = null;

		const { CatalogService: catalogService, TranslationService: translationService, TopicsService: topicsService }
			= $injector.inject('CatalogService', 'TranslationService', 'TopicsService');
		this._translationService = translationService;
		this._catalogService = catalogService;
		this._topicsService = topicsService;

	}

	set data(topicId) {
		this._topicId = topicId;
	}

	initialize() {

		const updateView = (currentTopicId) => {

			const fetchDataAndRender = async () => {
				try {
					const catalog = await this._catalogService.byId(this._topicId);
					this._catalog = catalog;
					//we render the catalog
					this.render();
				}
				catch (error) {
					//Todo: As soon as we have a message channel we should inform the user here and remove the spinner
					console.warn(error.message);
				}
			};

			if (this._topicId && currentTopicId === this._topicId) {

				//we cache the catalog
				if (!this._catalog) {

					//we render the spinner
					this.render();
					fetchDataAndRender(this._topicId);
				}
				this.style.display = 'inline';
			}
			else {
				this.style.display = 'none';
			}
		};

		this.observe('currentTopicId', currentTopicId => updateView(currentTopicId));
	}

	onStateChanged() {
		//we do nothing here, because we call #render() manually after catalog data are available
	}


	/**
	 * @override
	 */
	createView(state) {

		const { currentTopicId } = state;

		if (this._topicId && currentTopicId === this._topicId) {
			const topic = this._topicsService.byId(currentTopicId);
			const { label } = topic;

			const changeIndex = () => {
				setIndex(TopicsContentPanelIndex.TOPICS);
			};

			const translate = (key) => this._translationService.translate(key);


			const renderChildElements = () => {
				if (!this._catalog) {
					return html`
					<li class="ba-list-item">
            			<span class="ba-list-item__text ">
                			<span class="ba-list-item__primary-text">
                				<ba-spinner></ba-spinner>
                			</span>
            			</span>
        			</li>
					`;
				}

				return this._catalog.map(item => {
					//node
					if (item.children) {
						return html`<ba-catalog-node .data=${item}></ba-catalog-node>`;
					}
					//leaf
					return html`<ba-catalog-leaf .data=${item}></ba-catalog-leaf>`;
				});
			};

			const renderTopicIcon = (topic) => {
				if (topic.style.icon) {

					return html`
					<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
						${unsafeSVG(topic.style.icon)}
					</svg>
					`;
				}
				return nothing;
			};

			return html`
			<style>
			${css}
			</style>
			<div class="catalog-content-panel">
			<span @click=${changeIndex} .title=${translate('topics_catalog_panel_change_topic')} class="topic ba-list-item ba-list-inline ba-list-item__header">
				<span class="ba-list-item__pre back-icon">
					<ba-icon  .icon='${arrowLeftShort}' .color=${'var(--primary-color)'} .size=${4}  ></ba-icon>                    							 
				</span>				
				<span class="ba-list-item__icon topic-icon">						
						${renderTopicIcon(topic)}
				</span>												
				<span class="ba-list-item__text vertical-center">
					<span class="ba-list-item__main-text">${label}</span>					
				</span>
			</span>
			</div>
				${renderChildElements()}
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
