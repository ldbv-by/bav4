import { html, nothing } from 'lit-html';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { $injector } from '../../../../../injection';
import { renderTagOf } from '../../../../BaElement';
import { Spinner } from '../../../../commons/components/spinner/Spinner';
import { AbstractContentPanel } from '../../../../menu/components/mainMenu/content/AbstractContentPanel';
import { setIndex } from '../../../store/topicsContentPanel.action';
import { TopicsContentPanelIndex } from '../TopicsContentPanel';
import css from './catalogContentPanel.css';


/**
 * Renders a catalog definition for a specific topicId.
 * The rendering strategy of this component avoids unnecessary calls of #render() as much as possible.
 * Therefore #render is called one times after catalog data are loaded.
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

		const updateView = async (currentTopicId) => {
			// try {
			if (this._topicId && currentTopicId === this._topicId) {

				//we cache the catalog
				if (!this._catalog) {

					//we render the spinner
					this.render();

					//if we use "await" the first call of #render seems to be blocked until await is resolved (!?)
					this._catalogService.byId(this._topicId)
						.then(catalog => {
							this._catalog = catalog;
							//we render the catalog
							this.render();

						}, (e) => {
							console.warn(e.message);
						});
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
                				${renderTagOf(Spinner)}
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
			<button class="ba-list-item" @click=${changeIndex}>
				<span class="ba-list-item__text">${translate('topics_catalog_panel_change_topic')}</span>			
				<span class="ba-list-item__after">
				<span class="arrow arrow-left"></span>
				</span>
			</button>
			<span class="topic ba-list-item ba-list-inline ba-list-item__header">
				<span class="ba-list-item__pre">
					<span class="ba-list-item__icon">						
					${renderTopicIcon(topic)}
					</span>				
				</span>
				<span class="ba-list-item__text verticla-center">
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
