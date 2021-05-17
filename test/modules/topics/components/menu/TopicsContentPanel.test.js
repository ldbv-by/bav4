import { $injector } from '../../../../../src/injection';
import { TopicsContentPanel } from '../../../../../src/modules/topics/components/menu/TopicsContentPanel';
import { Topic } from '../../../../../src/services/domain/topic';
import { topicsReducer } from '../../../../../src/store/topics/topics.reducer';
import { TestUtils } from '../../../../test-utils.js';

window.customElements.define(TopicsContentPanel.tag, TopicsContentPanel);

describe('TopicsContentPanel', () => {

	const topic0 = new Topic('topic0', 'Topic 0', 'This is Topic 0...', ['bg0']);
	const topic1 = new Topic('topic1', 'Topic 1', 'This is Topic 1...', ['bg1']);


	let store;

	const topicsServiceMock = {
		all() { },
	};

	const setup = (state) => {

		store = TestUtils.setupStoreAndDi(state, { topics: topicsReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('TopicsService', topicsServiceMock);
		return TestUtils.render(TopicsContentPanel.tag);
	};

	describe('when initialized', () => {

		describe('and no topics are available', () => {

			it('renders the nothing', async () => {

				const element = await setup();

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});

		describe('and topics state is not ready', () => {
			it('renders the nothing', async () => {
				spyOn(topicsServiceMock, 'all').and.returnValue([
					topic0,
					topic1
				]);

				const element = await setup();

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});

		describe('and all set', () => {

			it('renders a list of topic elements', async () => {
				spyOn(topicsServiceMock, 'all').and.returnValue([
					topic0,
					topic1
				]);

				const element = await setup({
					topics: {
						ready: true,
						current: topic0.id
					}
				});

				expect(element.shadowRoot.querySelectorAll('.topics-content-panel')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('.topic')).toHaveSize(2);
				expect(element.shadowRoot.querySelectorAll('.topic')[0].classList.contains('active')).toBeTrue();
				expect(element.shadowRoot.querySelectorAll('.topic')[1].classList.contains('active')).toBeFalse();
			});
		});
	});

	describe('when topic element clicked', () => {
		it('changes the current topic', async () => {
			spyOn(topicsServiceMock, 'all').and.returnValue([
				topic0,
				topic1
			]);

			const element = await setup({
				topics: {
					ready: true,
					current: topic0.id
				}
			});

			//click on the second topics element
			element.shadowRoot.querySelectorAll('.topic')[1].click();

			expect(store.getState().topics.current).toBe(topic1.id);
		});
	});
});
