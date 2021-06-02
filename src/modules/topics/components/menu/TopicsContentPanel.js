import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection';
import { setCurrent } from '../../../../store/topics/topics.action';
import { renderTagOf } from '../../../BaElement';
import { AbstractContentPanel } from '../../../menu/components/mainMenu/content/AbstractContentPanel';
import { setIndex } from '../../store/topicsContentPanel.action';
import { CatalogContentPanel } from './catalog/CatalogContentPanel';
import css from './topicsContentPanel.css';
import tempSvg from '../assets/temp.svg';


/**
 * @enum
 */
export const TopicsContentPanelIndex = Object.freeze({
	TOPICS: 0,
	CATALOG_0: 1,
	CATALOG_1: 2
});

/**
 * @class
 * @author taulinger
 * @author alsturm
 */
export class TopicsContentPanel extends AbstractContentPanel {

	constructor() {
		super();
		const { TopicsService: topicsService, TranslationService: translationService }
			= $injector.inject('TopicsService', 'TranslationService');
		this._topicsService = topicsService;
		this._translationService = translationService;
	}

	/**
	 * @override
	 */
	createView(state) {

		const { currentTopicId, topicsReady, contentIndex } = state;

		if (topicsReady) {

			const topics = this._topicsService.all();

			const getActiveClass = (id) => {
				return (currentTopicId === id) ? 'active' : '';
			};

			const getTabIndex = () => {
				return (contentIndex === TopicsContentPanelIndex.TOPICS) ? 0 : -1;
			};

			const getVisibilityClass = () => {
				return (contentIndex === TopicsContentPanelIndex.TOPICS) ? '' : 'invisible';
			};

			const changeTopic = (id) => {
				setCurrent(id);
				setIndex(TopicsContentPanelIndex.CATALOG_0);
			};

			const themeColor = (id) => {
				return `
					.topic-${id}{
						--secondary-color: var(--topic-theme-${id});			  
					}	
					`;
			};

			return html`
        	<style>${css}</style>
			<div class="topics-content-panel ${getVisibilityClass()}">
				<div class="col">
				${topics.map(topic => html`
					<style>
					${themeColor(topic.id)}
					</style>
					<a href='#' tabindex='${getTabIndex()}' class="topic topic-${topic.id} ba-list-item  ${getActiveClass(topic.id)}" @click=${() => changeTopic(topic.id)}>
						<span class="ba-list-item__pre">
							<span class="ba-list-item__icon icon-${topic.id}">
								<ba-icon id='info' icon='${tempSvg}'  color=var(--primary-bg-color) color_hover=var(--primary-bg-color)  size=2.6 ></ba-icon>
							</span>											
						</span>
						</span>
						<span class="ba-list-item__text ">
							<span class="ba-list-item__primary-text">${topic.label}</span>
							<span class="ba-list-item__secondary-text">${topic.description}</span>
						</span>
						<span class="ba-list-item__after">
							<span class="arrow arrow-right"></span>
						</span>
					<a>
				`)}
				</div>
				<div class="col">
					${renderTagOf(CatalogContentPanel)}
				</div>
			</div>
			`;
		}
		return nothing;
	}

	extractState(globalState) {

		const { topics: { current: currentTopicId, ready: topicsReady }, topicsContentPanel: { index: contentIndex } } = globalState;
		return { currentTopicId, topicsReady, contentIndex };
	}

	static get tag() {
		return 'ba-topics-content-panel';
	}
}
