import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection';
import { setCurrent } from '../../../../store/topics/topics.action';
import { BaElement, renderTagOf } from '../../../BaElement';
import { CatalogContentPanel } from './catalog/CatalogContentPanel';
import css from './topicsContentPanel.css';


/**
 * @class
 * @author taulinger
 * @author alsturm
 */
export class TopicsContentPanel extends BaElement {

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

		const { currentTopicId, topicsReady } = state;

		if (topicsReady) {

			const topics = this._topicsService.all();

			const getActiveClass = (id) => {
				return (currentTopicId === id) ? 'active' : '';
			};

			const getThemeActiveClass = () => {
				return currentTopicId ? 'is-active' : '';
			};

			const changeTopic = (id) => {
				setCurrent(id);
			};

			return html`
        	<style>${css}</style>
			<div class="topics-content-panel ${getThemeActiveClass()}">
				<div class="col">
				${topics.map(topic => html`
					<div class="topic ba-list-item ba-list-inline ${getActiveClass(topic.id)}" @click=${() => changeTopic(topic.id)}>
						<span class="ba-list-item__pre">
							<span class="ba-list-item__icon">
							</span>
						</span>
						<span class="ba-list-item__text ">
							<span class="ba-list-item__primary-text">${topic.label}</span>
							<span class="ba-list-item__secondary-text">${topic.description}</span>
						</span>
						<span class="ba-list-item__after">
							<span class="arrow"></span>
						</span>
					<div>
					</span>
					</div>
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

		const { topics: { current: currentTopicId, ready: topicsReady } } = globalState;
		return { currentTopicId, topicsReady };
	}

	static get tag() {
		return 'ba-topics-content-panel';
	}
}
