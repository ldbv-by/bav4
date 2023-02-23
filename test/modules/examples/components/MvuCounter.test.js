import { MvuCounter } from '../../../../src/modules/examples/components//MvuCounter.js';
import { topicsReducer } from '../../../../src/store/topics/topics.reducer';
import { TestUtils } from '../../../test-utils.js';

window.customElements.define(MvuCounter.tag, MvuCounter);

const state = {
	topics: {
		current: 'ba'
	}
};

let store;

const setup = (state) => {
	store = TestUtils.setupStoreAndDi(state, {
		topics: topicsReducer
	});
	return TestUtils.render(MvuCounter.tag);
};

describe('MvuCounter', () => {
	it('should render Title of the component', async () => {
		const expectedTitle = 'Model-View-Update';

		const element = await setup(state);

		expect(element.shadowRoot.querySelector('#counterTitle').textContent).toBe(expectedTitle);
	});

	it('should render default counter = 5 and topic = ba', async () => {
		const expectedCouter = '5';
		const expectedTopic = 'ba';

		const element = await setup(state);

		expect(element.shadowRoot.querySelector('#currentTopic').textContent).toBe(expectedTopic);
		expect(element.shadowRoot.querySelector('#counterValue').textContent).toBe(expectedCouter);
	});

	it('should render counter = 6 by clicking the increment button', async () => {
		const element = await setup(state);

		const incrementBtn = element.shadowRoot.querySelector('#incrementBtn');
		incrementBtn.dispatchEvent(new MouseEvent('click'));

		expect(element.shadowRoot.querySelector('#currentTopic').textContent).toBe('ba');
		expect(element.shadowRoot.querySelector('#counterValue').textContent).toBe('6');
	});

	it('should render topic6 when incrementing intial counter', async () => {
		const element = await setup(state);

		const incrementBtn = element.shadowRoot.querySelector('#incrementBtn');
		incrementBtn.dispatchEvent(new MouseEvent('click'));

		const updateTopicBtn = element.shadowRoot.querySelector('#updateTopicBtn');
		updateTopicBtn.click();

		expect(store.getState().topics.current).toBe('topic6');
		expect(element.shadowRoot.querySelector('#currentTopic').textContent).toBe('topic6');
		expect(element.shadowRoot.querySelector('#counterValue').textContent).toBe('6');
	});

	it('should render error message when counter < 0', async () => {
		const element = await setup(state);

		const decrementBtn = element.shadowRoot.querySelector('#decrementBtn');
		decrementBtn.dispatchEvent(new MouseEvent('click'));
		decrementBtn.dispatchEvent(new MouseEvent('click'));
		decrementBtn.dispatchEvent(new MouseEvent('click'));
		decrementBtn.dispatchEvent(new MouseEvent('click'));
		decrementBtn.dispatchEvent(new MouseEvent('click'));
		decrementBtn.dispatchEvent(new MouseEvent('click'));

		const updateTopicBtn = element.shadowRoot.querySelector('#updateTopicBtn');
		updateTopicBtn.click();

		expect(element.shadowRoot.querySelector('#currentTopic').textContent).toBe('topic0');
		expect(element.shadowRoot.querySelector('#errorMessageId').textContent).toEqual('-> Counter must not be less than zero');
	});

	it('should reset the counter to 0', async () => {
		const element = await setup(state);

		const resetBtn = element.shadowRoot.querySelector('#resetBtn');
		resetBtn.dispatchEvent(new MouseEvent('click'));

		expect(element.shadowRoot.querySelector('#currentTopic').textContent).toBe('ba');
		expect(element.shadowRoot.querySelector('#counterValue').textContent).toBe('0');
	});
});
