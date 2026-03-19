import { MvuList as MvuList } from '../../../../src/modules/examples/components/MvuList.js';
import { MvuListItem } from '../../../../src/modules/examples/components/MvuListItem.js';
import { setCurrent } from '../../../../src/store/topics/topics.action.js';
import { topicsReducer } from '../../../../src/store/topics/topics.reducer';
import { TestUtils } from '../../../test-utils.js';

window.customElements.define(MvuListItem.tag, MvuListItem);
window.customElements.define(MvuList.tag, MvuList);

const state = {
	topics: {
		current: null
	}
};

const setup = (state) => {
	TestUtils.setupStoreAndDi(state, {
		topics: topicsReducer
	});
	return TestUtils.render(MvuList.tag);
};

const TOPIC_UPDATE = 'TOPIC_UPDATE';

describe('MvuList', () => {
	it('should render Title of the component', async () => {
		const expectedTitle = 'List of Topics';

		const element = await setup(state);

		expect(element.shadowRoot.querySelector('h2').innerText).toBe(expectedTitle);
	});

	it('should sort the order of topics', async () => {
		const element = await setup(state);

		setCurrent('ba');
		const btnSort = element.shadowRoot.querySelector('.btnSort');
		btnSort.dispatchEvent(new MouseEvent('click'));

		const topicItems = element.shadowRoot.querySelectorAll('ba-mvu-topic-item');
		const span = topicItems[0].shadowRoot.querySelector('span');

		expect(topicItems.length).toBe(5);
		expect(span.innerText).toBe('ba');
	});

	it('should reverse the order of topics', async () => {
		const element = await setup(state);

		setCurrent('ba');
		const btnReverse = element.shadowRoot.querySelector('.btnReverse');
		btnReverse.dispatchEvent(new MouseEvent('click'));

		const topicItems = element.shadowRoot.querySelectorAll('ba-mvu-topic-item');
		const span = topicItems[0].shadowRoot.querySelector('span');

		expect(topicItems.length).toBe(5);
		expect(span.innerText).toBe('ba');
	});

	it('should update the topics adding ba topic to the list', async () => {
		const element = await setup(state);

		element.signal(TOPIC_UPDATE, 'ba');

		const topicItems = element.shadowRoot.querySelectorAll('ba-mvu-topic-item');
		const span = topicItems[0].shadowRoot.querySelector('span');

		expect(topicItems.length).toBe(5);
		expect(span.innerText).toBe('topic3');
	});

	it('should remove the first topic of the list new first element should be topic2 ', async () => {
		const element = await setup(state);
		setCurrent('ba');

		const topicItem = element.shadowRoot.querySelector('ba-mvu-topic-item');
		topicItem.dispatchEvent(new MouseEvent('remove'));

		const topicItems = element.shadowRoot.querySelectorAll('ba-mvu-topic-item');
		const span = topicItems[0].shadowRoot.querySelector('span');

		expect(topicItems.length).toBe(4);
		expect(span.innerText).toBe('topic2');
	});

	it('should render label of the first topicItem', async () => {
		const element = await setup(state);

		const topicItems = element.shadowRoot.querySelectorAll('ba-mvu-topic-item');

		expect(topicItems[0].label).toBe('topic3');
		expect(topicItems.length).toBe(4);
	});

	it('should call the click event of child component topicitem button', async () => {
		const element = await setup(state);
		const topicItems = element.shadowRoot.querySelectorAll('ba-mvu-topic-item');
		const topic = topicItems[0].shadowRoot.querySelector('button');

		topic.dispatchEvent(new MouseEvent('click'));

		expect(topicItems.length).toBe(4);
	});
});
