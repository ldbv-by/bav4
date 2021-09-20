import { html } from 'lit-html';
import { setCurrent } from '../../../../store/topics/topics.action';
import { MvpElement } from '../../../MvpElement';

export class MvpCounter extends MvpElement {

	constructor() {
		super({
			counter: 5,
			current: null,
			message: null
		});
	}

	initialize() {
		//we synchronize the global "topics.current" property with our model
		this.observe(state => state.topics.current, current => this.model.current = current);
	}


	createView(model) {
		const { counter, current, message } = model;

		const updateCounter = (diff) => {
			const current = model.counter + diff;

			if (current < 0) {
				model.message = '-> Counter must not be less than zero';
			}
			else {
				this.updateModel({ counter: current, message: null });
			}
		};

		return html`
			<h2>Model-View-Presenter – Supervising Controller</h2>
            <div>${current}</div>
            <div>${counter}</div>
			<button @click=${() => updateCounter(1)}>+1</button>
			<button @click=${() => updateCounter(-1)}>-1</button>
	        <button @click=${() => this.updateModel({ counter: 0, message: null })}>Reset</button>
	        <button @click=${() => setCurrent(`topic${model.counter}`)}>Update Topic</button>
			<div>${message}</div>
			<details>
    			<summary>Overview</summary>
				<img src="https://developingschool.com/photo/78/resized/supervising-controller-mvp.png" width="500"> 
			</details>
        `;
	}

	static get tag() {
		return 'ba-mvp-counter';
	}
}
