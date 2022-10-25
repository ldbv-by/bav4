import { html } from 'lit-html';
import { setLinkList as updateStore } from '../../../store/example/example.action';
import { MvuElement } from '../../MvuElement';
import css from './MvuLinkList.css';

const Add_New_Link = 'add_new_link';
const Update_LinkList = 'update_linklist';
const Update_Coordinates = 'update_coordinates';

export class MvuLinkList extends MvuElement {

	constructor() {
		super({
			linkList: [],
			currentCoordinates: []
		});
	}

	onInitialize() {
		this.observe(state => state.example.linkList, linkList => this.signal(Update_LinkList, linkList));
		this.observe(state => state.example.currentCoordinates, currentCoordinates => this.signal(Update_Coordinates, currentCoordinates));
	}

	update(type, data, model) {
		switch (type) {

			case Update_Coordinates:
				return { ...model, currentCoordinates: [...data] };

			case Update_LinkList:
				return { ...model, linkList: [...data] };

			case Add_New_Link:
				return { ...model, linkList: [...model.linkList, data] };
		}
	}

	createView(model) {
		const { linkList, currentCoordinates } = model;

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
				<h2 id='llTitle'>Training Link - List -- ${currentCoordinates[0]} / ${currentCoordinates[1]}</h2>
				<input id="newname" placeholder="Enter new name">
				<input id="newlink" placeholder="Enter new URL">
				<ul>
					${linkList.map((item) => html`<li><a href="${item.link}" target=”_blank”>${item.name}</a></li>`)}
				</ul>
				<ba-button id='addLinkToListBtn' @click=${() => addLinkToList()}       .label=${'Add'}></ba-button>
				<ba-button id='updateStoreBtn'   @click=${() => updateStore(linkList)} .label=${'Update Store'}></ba-button>
			</div>
	    `;
	}

	static get tag() {
		return 'ba-mvu-linklist';
	}
}


