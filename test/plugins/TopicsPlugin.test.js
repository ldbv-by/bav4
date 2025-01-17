import { TopicsPlugin } from '../../src/plugins/TopicsPlugin';
import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection';
import { Topic } from '../../src/domain/topic';
import { topicsReducer } from '../../src/store/topics/topics.reducer';
import { QueryParameters } from '../../src/domain/queryParameters';
import { topicsContentPanelReducer } from '../../src/store/topicsContentPanel/topicsContentPanel.reducer.js';
import { setIndex, TopicsContentPanelIndex } from '../../src/store/topicsContentPanel/topicsContentPanel.action.js';

describe('TopicsPlugin', () => {
	const topicsServiceMock = {
		async init() {},
		default() {},
		byId() {}
	};

	const environmentServiceMock = {
		getQueryParams: () => new URLSearchParams()
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			topicsContentPanel: topicsContentPanelReducer,
			topics: topicsReducer
		});
		$injector.registerSingleton('TopicsService', topicsServiceMock).registerSingleton('EnvironmentService', environmentServiceMock);

		return store;
	};

	describe('register', () => {
		it('calls #_init and awaits its completion', async () => {
			const store = setup();
			const instanceUnderTest = new TopicsPlugin();
			const spy = spyOn(instanceUnderTest, '_init').and.returnValue(Promise.resolve(true));

			const result = await instanceUnderTest.register(store);

			expect(result).toBeTrue();
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('_init', () => {
		it('initializes the TopicsService and calls #_addTopicFromQueryParams', async () => {
			const store = setup();
			const queryParam = new URLSearchParams(QueryParameters.TOPIC + '=some');
			const instanceUnderTest = new TopicsPlugin();
			const addTopicFromQueryParamsSpy = spyOn(instanceUnderTest, '_addTopicFromQueryParams');
			const topicServiceSpy = spyOn(topicsServiceMock, 'init').and.returnValue(Promise.resolve());
			spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);

			await instanceUnderTest._init();

			expect(topicServiceSpy).toHaveBeenCalledTimes(1);
			expect(addTopicFromQueryParamsSpy).toHaveBeenCalledOnceWith(new URLSearchParams(queryParam));
			expect(store.getState().topics.ready).toBeTrue();
		});
	});

	describe('_addTopicFromQueryParams', () => {
		describe('topic id is available', () => {
			it('updates current topic', () => {
				const store = setup();
				const topicId = 'someId';
				const queryParam = `${QueryParameters.TOPIC}=${topicId}`;
				const topic = new Topic(topicId, 'label', 'description');
				const instanceUnderTest = new TopicsPlugin();
				const topicServiceSpy = spyOn(topicsServiceMock, 'byId').withArgs(topicId).and.returnValue(topic);

				instanceUnderTest._addTopicFromQueryParams(new URLSearchParams(queryParam));

				expect(topicServiceSpy).toHaveBeenCalledTimes(1);
				expect(store.getState().topics.current).toBe(topicId);
			});
		});
		describe('topic id is NOT available', () => {
			it('updates current topic', () => {
				const store = setup();
				const instanceUnderTest = new TopicsPlugin();
				const topicServiceSpy = spyOn(topicsServiceMock, 'byId');

				instanceUnderTest._addTopicFromQueryParams(new URLSearchParams());

				expect(topicServiceSpy).not.toHaveBeenCalled();
				expect(store.getState().topics.current).toBeNull();
			});
		});
	});

	describe('topicsContentPanel s-o-s changes', () => {
		describe('index denotes the topic level', () => {
			it('set the current topic to `null`', async () => {
				const store = setup({
					topics: {
						current: 'foo'
					},
					topicsContentPanel: {
						index: TopicsContentPanelIndex.CATALOG_0
					}
				});
				const instanceUnderTest = new TopicsPlugin();

				await instanceUnderTest.register(store);

				setIndex(TopicsContentPanelIndex.TOPICS);
				expect(store.getState().topics.current).toBeNull();
			});
		});

		describe('index does NOT denote the topic level', () => {
			it('does nothing', async () => {
				const topicId = 'topicId';
				const store = setup({
					topics: {
						current: topicId
					},
					topicsContentPanel: {
						index: TopicsContentPanelIndex.CATALOG_0
					}
				});
				const instanceUnderTest = new TopicsPlugin();

				await instanceUnderTest.register(store);

				setIndex(TopicsContentPanelIndex.CATALOG_1);
				expect(store.getState().topics.current).toBe(topicId);
			});
		});
	});
});
