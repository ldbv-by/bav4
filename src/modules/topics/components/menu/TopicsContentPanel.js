import { html, nothing, svg } from 'lit-html';
import { $injector } from '../../../../injection';
import { setCurrent } from '../../../../store/topics/topics.action';
import { renderTagOf } from '../../../BaElement';
import { AbstractContentPanel } from '../../../menu/components/mainMenu/content/AbstractContentPanel';
import { setIndex } from '../../store/topicsContentPanel.action';
import { CatalogContentPanel } from './catalog/CatalogContentPanel';
import css from './topicsContentPanel.css';
import cssGlobal from './assets/topics.css';


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

			const changeTopic = (topic) => {
				setCurrent(topic.id);
				setIndex(TopicsContentPanelIndex.CATALOG_0);
				//set global theme color
				const style = document.createElement('style');
				// TODO replace with topic.hue
				style.innerHTML = `	*{--topic-hue:${topic.style.hue};}`;
				document.head.appendChild(style);

				//scroll top
				const element = document.getElementsByTagName('ba-main-menu')[0];
				const container = element.shadowRoot.getElementById('mainMenuContainer');
				container.scrollTop = 0;
			};

			//temp mock color and icon
			topics.map( (topic, index) => {
				topic.style.hue = topic.style.hue = index * 5 + 170;
				topic.style.svg = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>`;
			});


			//render color css
			const style = document.createElement('style');
			style.innerHTML = cssGlobal;
			document.head.appendChild(style);
			const themeColor = (topic) => {
				return `
				.topic-${topic.id}{		
					--topic-theme: hsl( ${topic.style.hue} var(--topic-saturation) var(--topic-lightness));			
					}	
					`;
			};

			return html`
        	<style>${css}</style>
			<div class="topics-content-panel ${getVisibilityClass()}">
				<div class="col">
				${topics.map(topic => html`
					<style>
					${themeColor(topic)}
					</style>
					<button  tabindex='${getTabIndex()}' class="topic topic-${topic.id} ba-list-item  ${getActiveClass(topic.id)}" @click=${() => changeTopic(topic)}>
						<span class="ba-list-item__pre">
							<span class="ba-list-item__icon icon-${topic.id}">
							${topic.style.svg}
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
