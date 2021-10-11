import { MvuCounterList } from '../../../../../src/modules/commons/components/examples/MvuCounterList.js';
import { setCurrent } from '../../../../../src/store/topics/topics.action.js';
import { topicsReducer } from '../../../../../src/store/topics/topics.reducer';
import { TestUtils } from '../../../../test-utils.js';

window.customElements.define(MvuCounterList.tag, MvuCounterList);

const state = {
	topics: {
		current: null
	}
};

const setup = (state) => {
	TestUtils.setupStoreAndDi(state, {
		topics: topicsReducer
	});
	return TestUtils.render(MvuCounterList.tag);
};

const TOPIC_UPDATE = 'TOPIC_UPDATE';

describe('MvuCounterList', () => {

	it('should render Title of the component', async () => {

		const expectedTitle = 'List of Topics';

		const element = await setup(state);

		expect(element.shadowRoot.querySelector('h2').textContent).toBe(expectedTitle);
	});

	it('should sort the order of topics', async () => {

		const element = await setup(state);
		setCurrent('ba');

		const btnSort = element.shadowRoot.querySelector('.btnSort');
		btnSort.dispatchEvent(new MouseEvent('click'));

		expect(element.shadowRoot.querySelector('li').textContent).toBe('ba');
	});

	it('should reverse the order of topics', async () => {

		const element = await setup(state);
		setCurrent('ba');

		const btnReverse = element.shadowRoot.querySelector('.btnReverse');
		btnReverse.dispatchEvent(new MouseEvent('click'));

		expect(element.shadowRoot.querySelector('li').textContent).toBe('ba');
	});

	it('should update the topics adding ba topic to the list', async () => {

		const element = await setup(state);
		setCurrent('ba');

		element.signal(TOPIC_UPDATE, 'ba');

		expect(element.shadowRoot.querySelector('li').textContent).toBe('topic3');
	});
});
