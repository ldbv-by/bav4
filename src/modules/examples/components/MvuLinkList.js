import { html } from 'lit-html';
import { setLinkList } from '../../../store/example/example.action';
import { MvuElement } from '../../MvuElement';

const Add_New_Link = 'add_new_link';
const Update_LinkList = 'update_linklist';

export class MvuLinkList extends MvuElement {

	constructor() {
		super({
			linkList: null
		});
	}

	onInitialize() {
		this.observe(state => state.example.linkList, linkList => this.signal(Update_LinkList, linkList));
	}

	update(type, data, model) {

		switch (type) {

			case Update_LinkList:
				return { ...model, linkList: data };

			case Add_New_Link:
				return { ...model, linkList: [...model.linkList, data] };
		}
	}

	createView(model) {
		const { linkList } = model;

		const addToDo = () => {
			const getInputNameElement = () => {
				return this.shadowRoot.querySelector('#newname');
			};
			const getInpuLinkElement = () => {
				return this.shadowRoot.querySelector('#newlink');
			};
			const inputName = getInputNameElement();
			const inpuLink = getInpuLinkElement();

			this.signal(Add_New_Link, { name: inputName.value, link: inpuLink.value, initial: false });

			inputName.value = '';
			inpuLink.value = '';
		};

		return html`
			<h2 id='counterTitle'>Training Link - List</h2>
			<input id="newname" placeholder="Enter new name">
			<input id="newlink" placeholder="Enter new URL">
			<ul>
         		${linkList.map((item) => html`<li><a href="${item.link}" target=”_blank”>${item.name}</a></li>`)}
      		</ul>
      		<input id="newitem" aria-label="New item">
      		<button @click=${() => addToDo()}>Add</button>
			<button id='updateTopicBtn' @click=${() => setLinkList(linkList)}>Update Store</button>

	    `;
	}

	static get tag() {
		return 'ba-mvu-linklist';
	}
}


