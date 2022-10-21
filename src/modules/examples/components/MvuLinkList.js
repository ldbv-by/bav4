import { html } from 'lit-html';
import { setLinkList as updateStore } from '../../../store/example/example.action';
import { MvuElement } from '../../MvuElement';
import css from './MvuLinkList.css';

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
		// console.log('🚀🚀 ~ file: MvuLinkList.js ~ line 22 ~ MvuLinkList ~ update ~ type', type);
		// console.log('🚀🚀 ~ file: MvuLinkList.js ~ line 22 ~ MvuLinkList ~ update ~ data', data);
		// console.log('🚀🚀 ~ file: MvuLinkList.js ~ line 22 ~ MvuLinkList ~ update ~ model', model);

		switch (type) {

			case Update_LinkList:
				return { ...model, linkList: [...data] };

			case Add_New_Link:
				return { ...model, linkList: [...model.linkList, data] };
		}
	}

	createView(model) {
		const { linkList } = model;
		// console.log('🚀 ~ file: MvuLinkList.js ~ line 35 ~ MvuLinkList ~ createView ~ linkList', linkList);

		const addLinkToList = () => {
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
			<style>
			${css}
			</style>
			<div class='ba_mvu_linklist'>					
				<h2 id='llTitle'>Training Link - List</h2>
				<input id="newname" placeholder="Enter new name">
				<input id="newlink" placeholder="Enter new URL">
				<ul>
					${linkList.map((item) => html`<li><a href="${item.link}" target=”_blank”>${item.name}</a></li>`)}
				</ul>
				<input id="newitem" aria-label="New item">
				<ba-button id='addLinkToListBtn' @click=${() => addLinkToList()}       .label=${'Add'}></ba-button>
				<ba-button id='updateStoreBtn'   @click=${() => updateStore(linkList)} .label=${'Update Store'}></ba-button>
			</div>
	    `;
	}

	static get tag() {
		return 'ba-mvu-linklist';
	}
}


