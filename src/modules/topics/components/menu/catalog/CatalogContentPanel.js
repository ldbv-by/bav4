/**
 * @module modules/topics/components/menu/catalog/CatalogContentPanel
 */
import { html, nothing } from 'lit-html';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg.js';
import { $injector } from '../../../../../injection';
import { setIndex, TopicsContentPanelIndex } from '../../../../../store/topicsContentPanel/topicsContentPanel.action';
import css from './catalogContentPanel.css';
import arrowLeftShort from '../assets/arrowLeftShort.svg';
import { AbstractMvuContentPanel } from '../../../../menu/components/mainMenu/content/AbstractMvuContentPanel';
import { LevelTypes, emitNotification } from '../../../../../store/notifications/notifications.action';

const Update_Catalog = 'update_catalog';
const Update_Matching_TopicId = 'update_matching_topicId';

/**
 * Renders a catalog definition for a specific topic ID.
 * The rendering strategy of this component avoids unnecessary calls of #render() as much as possible.
 * While catalog data are fetched a spinner is shown. After catalog is data are available and rendered, no more
 * updates of the view happen.
 *
 * @class
 * @property {string} data The topic ID for this CatalogContentPanel
 * @author taulinger
 * @author alsturm
 */
export class CatalogContentPanel extends AbstractMvuContentPanel {
	#topicId;
	#translationService;
	#catalogService;
	#topicsService;

	constructor() {
		super({
			matchingTopicId: false,
			catalog: null
		});

		const {
			CatalogService: catalogService,
			TranslationService: translationService,
			TopicsService: topicsService
		} = $injector.inject('CatalogService', 'TranslationService', 'TopicsService');
		this.#translationService = translationService;
		this.#catalogService = catalogService;
		this.#topicsService = topicsService;
	}

	set data(topicId) {
		this.#topicId = topicId;
	}

	onInitialize() {
		const translate = (key, params) => this.#translationService.translate(key, params);
		const loadCatalog = async () => {
			try {
				const catalog = await this.#catalogService.byId(this.#topicId);
				this.signal(Update_Catalog, catalog);
			} catch (error) {
				//Todo: As soon as we have a message channel we should inform the user here and remove the spinner
				this.signal(Update_Catalog, []);
				console.error(error);
				emitNotification(translate('topics_catalog_contentPanel_topic_could_not_be_loaded', [this.#topicId]), LevelTypes.WARN);
			}
		};

		const updateTopicId = (currentTopicId) => {
			this.signal(Update_Matching_TopicId, this.#topicId && currentTopicId === this.#topicId);
		};

		this.observe(
			(state) => state.topics.current,
			(currentTopicId) => updateTopicId(currentTopicId)
		);
		this.observeModel('matchingTopicId', (matchingTopicId) => {
			if (matchingTopicId) {
				loadCatalog();
			}
		});
	}

	update(type, data, model) {
		switch (type) {
			case Update_Catalog:
				return { ...model, catalog: data };
			case Update_Matching_TopicId:
				return { ...model, matchingTopicId: data };
		}
	}

	createView(model) {
		const { catalog, matchingTopicId } = model;

		if (matchingTopicId) {
			const topic = this.#topicsService.byId(this.#topicId);
			const { label } = topic;

			const changeIndex = () => {
				setIndex(TopicsContentPanelIndex.TOPICS);
			};

			const translate = (key) => this.#translationService.translate(key);

			const renderChildElements = () => {
				if (!catalog) {
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

				return catalog.length > 0
					? catalog.map((item) => {
							//node
							if (item.children) {
								return html`<ba-catalog-node .data=${item}></ba-catalog-node>`;
							}
							//leaf
							return html`<ba-catalog-leaf .data=${item}></ba-catalog-leaf>`;
						})
					: html`
							<li class="ba-list-item">
								<span class="ba-list-item__text_warning">${translate('topics_catalog_contentPanel_topic_not_available')}</span>
							</li>
						`;
			};

			const renderTopicIcon = (topic) => {
				if (topic.style.icon) {
					return html`
						<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">${unsafeSVG(topic.style.icon)}</svg>
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

	static get tag() {
		return 'ba-catalog-content-panel';
	}
}
