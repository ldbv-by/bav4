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

			const changeTopic = (id) => {
				setCurrent(id);
			};

			return html`
        	<style>${css}</style>
			<div class="topics-content-panel">
				${topics.map(topic => html`
					<div class="topic ${getActiveClass(topic.id)}" @click=${() => changeTopic(topic.id)}>
						<h1>${topic.label}</h1>
						<p>${topic.description}</p>
						<div>
					</div>
				`)}
				<div>
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
