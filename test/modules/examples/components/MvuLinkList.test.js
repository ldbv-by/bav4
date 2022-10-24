/* eslint-disable no-console */ // ToDo NK - remove

import { TestUtils } from '../../../test-utils.js';
import { MvuLinkList } from '../../../../src/modules/examples/components/MvuLinkList';
import { exampleReducer } from '../../../../src/store/example/example.reducer.js';

window.customElements.define(MvuLinkList.tag, MvuLinkList);

// eslint-disable-next-line no-unused-vars
let store;

const initialName = 'Google Maps';
const initialLink = 'https://maps.google.com';

describe('MvuLinkList', () => {
	const newName = 'BayernAtlas v4';
	const newLink = 'https://atlas.bayern.de';

	const fillInputFields = (mvuLinkList, newName, newLink) => {
		const nameElement = mvuLinkList.shadowRoot.querySelector('#newname');
		nameElement.value = newName;
		nameElement.dispatchEvent(new Event('input'));

		const linkElement = mvuLinkList.shadowRoot.querySelector('#newlink');
		linkElement.value = newLink;
		linkElement.dispatchEvent(new Event('input'));
		return { nameElement, linkElement };
	};

	const setup = (state = {}) => {
		const initialState = {
			example: {
				linkList: [
					{ name: initialName, link: initialLink, initial: true }
				]
			},
			...state
		};
		store = TestUtils.setupStoreAndDi(initialState, {
			example: exampleReducer
		});

		return TestUtils.render(MvuLinkList.tag);
	};

	it('expect initial values to be set as expected', async () => {
		const mvuLinkList = await setup();
		const initialModel = mvuLinkList.getModel();
		expect(initialModel.linkList.length).toBe(1);
		expect(initialModel.linkList[0].name).toBe(initialName);
		expect(initialModel.linkList[0].link).toBe(initialLink);
	});

	it('should render Title of the component', async () => {
		const expectedTitle = 'Training Link - List';
		const element = await setup();
		expect(element.shadowRoot.querySelector('#llTitle').textContent).toBe(expectedTitle);
	});

	it('initially, name and link input fields should be empty', async () => {
		const expectedName = '';
		const expectedLink = '';

		const element = await setup();
		expect(element.shadowRoot.querySelector('#newname').textContent).toBe(expectedName);
		expect(element.shadowRoot.querySelector('#newlink').textContent).toBe(expectedLink);
	});

	it('check that add button works as expected', async () => {
		const mvuLinkList = await setup();
		const initialModel = mvuLinkList.getModel();
		expect(initialModel.linkList.length).toBe(1);

		const { nameElement, linkElement } = fillInputFields(mvuLinkList, newName, newLink);

		expect(nameElement.value).toBe(newName);
		expect(linkElement.value).toBe(newLink);

		const addLinkToListButton = mvuLinkList.shadowRoot.querySelector('#addLinkToListBtn');
		addLinkToListButton.click();

		expect(nameElement.value).toBe('');
		expect(linkElement.value).toBe('');

		const modelAfterAdd = mvuLinkList.getModel();
		expect(modelAfterAdd.linkList.length).toBe(2);
		expect(modelAfterAdd.linkList[1].name).toBe(newName);
		expect(modelAfterAdd.linkList[1].link).toBe(newLink);
	});

	it('check that UpdateStore button writes the store ', async () => {
		const mvuLinkList = await setup();

		fillInputFields(mvuLinkList, newName, newLink);

		const addLinkToListButton = mvuLinkList.shadowRoot.querySelector('#addLinkToListBtn');
		addLinkToListButton.click();
		const updateStoreButton = mvuLinkList.shadowRoot.querySelector('#updateStoreBtn');
		updateStoreButton.click();

		const storeAfterUpdateStore = store.getState().example;
		expect(storeAfterUpdateStore.linkList.length).toBe(2);
		expect(storeAfterUpdateStore.linkList[1].name).toBe(newName);
		expect(storeAfterUpdateStore.linkList[1].link).toBe(newLink);
	});
});


