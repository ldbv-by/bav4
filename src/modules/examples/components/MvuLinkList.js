/* eslint-disable no-console */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';

const Add_New_Link = 'add_new_link';

/**
 *
 */
export class MvuLinkList extends MvuElement {

	constructor() {
		super({
			linkList: [{ name: 'lit-html', link: 'https://lit.dev/docs/libraries/standalone-templates/', initial: true },
				{ name: 'taskmarks', link: 'https://github.com/norbertK/taskmarks', initial: true }]
		});
	}

	update(type, data, model) {

		switch (type) {
			case Add_New_Link:
				return { ...model, linkList: [...model.linkList, data] };
		}
	}


	// https://maps.google.com




	createView(model) {
		console.log('createView', model);
		const { linkList } = model;

		const addToDo = () => {
			const inputName = () => {
				return this.shadowRoot.querySelector('#newname');
			};
			const inpuLink = () => {
				return this.shadowRoot.querySelector('#newlink');
			};

			this.signal(Add_New_Link, { name: inputName().value, link: inpuLink().value, initial: false });

			inputName().value = '';
			inpuLink().value = '';
		};

		return html`
			<h2 id='counterTitle'>Training Link - List</h2>
			<input id="newname" placeholder="Enter new name">
			<input id="newlink" placeholder="Enter new URL">
			<ul>
         		${linkList.map((item) => html`<li><a href="${item.link}">${item.name}</a></li>`)}
      		</ul>
      		<input id="newitem" aria-label="New item">
      		<button @click=${() => addToDo()}>Add</button>
	    `;
	}

	static get tag() {
		return 'ba-mvu-linklist';
	}
}


