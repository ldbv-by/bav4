/**
 * @module modules/examples/components/MvuCounter
 */
import { html } from 'lit-html';
import { setCurrent } from './../../../store/topics/topics.action';
import { MvuElement } from './../../MvuElement';

const Update_Counter = 'update_counter';
const Update_Topic = 'update_topic';
const Update_Feedback = 'update_feedback';

/**
 * Example implementation of {@link MvuElement}.
 *
 * @class
 * @author taulinger
 */
export class MvuCounter extends MvuElement {
	constructor() {
		super({
			counter: 5,
			current: null,
			message: null
		});
	}

	onInitialize() {
		//we synchronize the global "topics.current" property with our model
		this.observe(
			(state) => state.topics.current,
			(current) => this.signal(Update_Topic, current)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Counter:
				return { ...model, counter: data, message: null };

			case Update_Topic:
				return { ...model, current: data };

			case Update_Feedback:
				return { ...model, message: data };
		}
	}

	createView(model) {
		const { counter, current, message } = model;

		const decrement = () => {
			if (counter <= 0) {
				this.signal(Update_Feedback, '-> Counter must not be less than zero');
			} else {
				this.signal(Update_Counter, counter - 1);
			}
		};

		return html`
			<h2 id="counterTitle">Model-View-Update</h2>
			<div id="currentTopic">${current}</div>
			<div id="counterValue">${counter}</div>
			<button id="incrementBtn" @click=${() => this.signal(Update_Counter, model.counter + 1)}>+1</button>
			<button id="decrementBtn" @click=${decrement}>-1</button>
			<button id="resetBtn" @click=${() => this.signal(Update_Counter, 0)}>Reset</button>
			<button id="updateTopicBtn" @click=${() => setCurrent(`topic${model.counter}`)}>Update Topic</button>
			<div id="errorMessageId">${message}</div>
			<details>
				<summary>Overview</summary>

				<div><img src="https://cloud.githubusercontent.com/assets/194400/25773775/b6a4b850-327b-11e7-9857-79b6972b49c3.png" width="500" /></div>
				<div><img src="https://elmprogramming.com/images/chapter-5/5.2-model-view-update-part-1/model-view-update.svg" width="500" /></div>
				<div>
					<img src="https://elmprogramming.com/images/chapter-5/5.2-model-view-update-part-1/model-view-update-interaction-1.svg" width="500" />
				</div>
			</details>
		`;
	}

	static get tag() {
		return 'ba-mvu-counter';
	}
}
