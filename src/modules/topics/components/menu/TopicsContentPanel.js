import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection';
import { setCurrent } from '../../../../store/topics/topics.action';
import { renderTagOf } from '../../../BaElement';
import { AbstractContentPanel } from '../../../menu/components/mainMenu/content/AbstractContentPanel';
import { setIndex } from '../../store/topicsContentPanel.action';
import { CatalogContentPanel } from './catalog/CatalogContentPanel';
import css from './topicsContentPanel.css';


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
				//set global theme color
				const style = document.createElement('style');
				// TODO replace with topic.hue
				style.innerHTML = `	*{--topic-hue: ${ id.length * 40};}`;
				document.head.appendChild(style);	
			};

			//render color css
			const style = document.createElement('style');
			style.innerHTML = `	
				*{								
					--topic-theme: hsl( var(--topic-hue) var(--topic-saturation) var(--topic-lightness));
				}
				.light-theme {			
					--topic-saturation: 60%;
					--topic-lightness: 40%; 	
				}				
				.dark-theme {				
					--topic-saturation: 70%;
					--topic-lightness: 70%; 	
				}
				`;
			document.head.appendChild(style);	
			// TODO replace with topic.hue
			const themeColor = (id) => {
				return `
				.topic-${id}{		
					--topic-theme: hsl( ${id.length * 40} var(--topic-saturation) var(--topic-lightness));			
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
					<button  tabindex='${getTabIndex()}' class="topic topic-${topic.id} ba-list-item  ${getActiveClass(topic.id)}" @click=${() => changeTopic(topic.id)}>
						<span class="ba-list-item__pre">
							<span class="ba-list-item__icon icon-${topic.id}">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16">
  								<circle cx="8" cy="8" r="8"/>
								</svg>
							</span>											
						</span>
						</span>
						<span class="ba-list-item__text ">
							<span class="ba-list-item__primary-text">${topic.label}</span>
							<span class="ba-list-item__secondary-text">${topic.description}</span>
						</span>
						<span class="ba-list-item__after verticla-center">
							<span class="arrow arrow-right"></span>
						</span>
					</button>
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

	initialize() {
		this.observe(['topicsReady', 'contentIndex'], () => this.render());
	}

	onStateChanged() {
		//nothing to do here, we only render after data changes, topicsStore is ready or contentIndex changed
	}

	extractState(globalState) {

		const { topics: { current: currentTopicId, ready: topicsReady }, topicsContentPanel: { index: contentIndex } } = globalState;
		return { currentTopicId, topicsReady, contentIndex };
	}

	static get tag() {
		return 'ba-topics-content-panel';
	}
}
