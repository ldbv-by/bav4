/* eslint-disable no-console */ // ToDo NK - remove

import { TestUtils } from '../../../test-utils.js';
import { MvuLinkList } from '../../../../src/modules/examples/components/MvuLinkList';
import { exampleReducer } from '../../../../src/store/example/example.reducer.js';

window.customElements.define(MvuLinkList.tag, MvuLinkList);

// eslint-disable-next-line no-unused-vars
let store;

describe('MvuLinkList', () => {

	const setup = (state = {}) => {
		const initialState = {
			example: {
				linkList: [
					{ name: 'Google Maps', link: 'https://maps.google.com', initial: true }
				]
			},
			...state
		};
		store = TestUtils.setupStoreAndDi(initialState, {
			example: exampleReducer
		});

		return TestUtils.render(MvuLinkList.tag);
	};


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

	fit('xxxxx', async () => {
		const mvuLinkList = await setup();
		let model = mvuLinkList.getModel();
		console.log('🚀🚀 ~ file: MvuLinkList.test.js ~ line 51 ~ it ~ model');
		console.log('🚀🚀 ~ ', model);

		expect(model.linkList.length).toBe(1);

		const newName = 'maps';
		const newLink = 'https://maps.google.com';

		const element = await setup();

		const nameElement = element.shadowRoot.querySelector('#newname');
		nameElement.value = newName;
		nameElement.dispatchEvent(new Event('input'));

		const linkElement = element.shadowRoot.querySelector('#newlink');
		linkElement.value = newLink;
		linkElement.dispatchEvent(new Event('input'));

		expect(nameElement.value).toBe(newName);
		expect(linkElement.value).toBe(newLink);

		const addLinkToListButton = element.shadowRoot.querySelector('#addLinkToListBtn');
		addLinkToListButton.click();

		expect(nameElement.value).toBe('');
		expect(linkElement.value).toBe('');

		model = mvuLinkList.getModel();
		console.log('🚀🚀🚀 ~ file: MvuLinkList.test.js ~ line 78 ~ fit ~ model');
		console.log('🚀🚀🚀 ~ ', model);
		expect(model.linkList.length).toBe(2);

		// expect(model.linkList.length).toEqual({

		// });
	});

	// it('should render counter = 6 by clicking the increment button', async () => {

	// 	const element = await setup(state);

	// 	const incrementBtn = element.shadowRoot.querySelector('#incrementBtn');
	// 	incrementBtn.dispatchEvent(new MouseEvent('click'));

	// 	expect(element.shadowRoot.querySelector('#currentTopic').textContent).toBe('ba');
	// 	expect(element.shadowRoot.querySelector('#counterValue').textContent).toBe('6');
	// });

	// it('should render topic6 when incrementing intial counter', async () => {

	// 	const element = await setup(state);

	// 	const incrementBtn = element.shadowRoot.querySelector('#incrementBtn');
	// 	incrementBtn.dispatchEvent(new MouseEvent('click'));

	// 	const updateTopicBtn = element.shadowRoot.querySelector('#updateTopicBtn');
	// 	updateTopicBtn.click();

	// 	expect(store.getState().topics.current).toBe('topic6');
	// 	expect(element.shadowRoot.querySelector('#currentTopic').textContent).toBe('topic6');
	// 	expect(element.shadowRoot.querySelector('#counterValue').textContent).toBe('6');
	// });

	// it('should render error message when counter < 0', async () => {

	// 	const element = await setup(state);

	// 	const decrementBtn = element.shadowRoot.querySelector('#decrementBtn');
	// 	decrementBtn.dispatchEvent(new MouseEvent('click'));
	// 	decrementBtn.dispatchEvent(new MouseEvent('click'));
	// 	decrementBtn.dispatchEvent(new MouseEvent('click'));
	// 	decrementBtn.dispatchEvent(new MouseEvent('click'));
	// 	decrementBtn.dispatchEvent(new MouseEvent('click'));
	// 	decrementBtn.dispatchEvent(new MouseEvent('click'));

	// 	const updateTopicBtn = element.shadowRoot.querySelector('#updateTopicBtn');
	// 	updateTopicBtn.click();

	// 	expect(element.shadowRoot.querySelector('#currentTopic').textContent).toBe('topic0');
	// 	expect(element.shadowRoot.querySelector('#errorMessageId').textContent).toEqual('-> Counter must not be less than zero');
	// });

	// it('should reset the counter to 0', async () => {

	// 	const element = await setup(state);

	// 	const resetBtn = element.shadowRoot.querySelector('#resetBtn');
	// 	resetBtn.dispatchEvent(new MouseEvent('click'));

	// 	expect(element.shadowRoot.querySelector('#currentTopic').textContent).toBe('ba');
	// 	expect(element.shadowRoot.querySelector('#counterValue').textContent).toBe('0');
	// });
});
