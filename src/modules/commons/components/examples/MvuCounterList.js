import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';

const TOPIC_SORT = 'TOPIC_SORT';
const TOPIC_REVERSE = 'TOPIC_REVERSE';
const TOPIC_UPDATE = 'TOPIC_UPDATE';

export class MvuCounterList extends MvuElement {

	constructor() {
		super({ topics: ['topic3', 'topic2', 'topic5', 'topic4'] });
	}

	onInitialize() {
		this.observe(state => state.topics.current, current => {
			if (current) {
				this.signal(TOPIC_UPDATE, current);
			}
		});
	}

	update(type, data, model) {
		switch (type) {
			case TOPIC_SORT:
				return { ...model,
					topics: [...model.topics].sort()
				};
			case TOPIC_REVERSE:
				return { ...model,
					topics: [...model.topics].reverse()
				};
			case TOPIC_UPDATE:
				return { ...model,
					topics: [...model.topics, data]
				};
		}
	}

	createView(model) {

		return html`
			<br>
			<div>----------------------</div>
			<h2>List of Topics</h2>
			<div>------------------------</div>
			<ul>
				${model.topics.map((topic) => html`
				<li>${topic}</li>
				`)}
			</ul>
			<br>
			<button class='btnSort' @click=${() => this.signal(TOPIC_SORT)}>sort</button>
			<button class='btnReverse' @click=${() => this.signal(TOPIC_REVERSE)}>reverse</button>
	        `;
	}

	static get tag() {
		return 'ba-mvu-counter-list';
	}
}
