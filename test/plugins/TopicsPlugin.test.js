import { TopicsPlugin } from '../../src/plugins/TopicsPlugin';
import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection';
import { Topic } from '../../src/domain/topic';
import { topicsReducer } from '../../src/store/topics/topics.reducer';
import { QueryParameters } from '../../src/domain/queryParameters';

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
		it('initializes the TopicsService and calls #_addTopicFromConfig', async () => {
			const store = setup();
			const instanceUnderTest = new TopicsPlugin();
			const addTopicFromQueryParamsSpy = spyOn(instanceUnderTest, '_addTopicFromQueryParams');
			const addTopicFromConfigSpy = spyOn(instanceUnderTest, '_addTopicFromConfig');
			const topicServiceSpy = spyOn(topicsServiceMock, 'init').and.returnValue(Promise.resolve());

			await instanceUnderTest._init();

			expect(topicServiceSpy).toHaveBeenCalledTimes(1);
			expect(addTopicFromQueryParamsSpy).not.toHaveBeenCalled();
			expect(addTopicFromConfigSpy).toHaveBeenCalledTimes(1);
			expect(store.getState().topics.ready).toBeTrue();
		});

		it('initializes the TopicsService and calls #_addTopicFromQueryParams', async () => {
			const store = setup();
			const queryParam = new URLSearchParams(QueryParameters.TOPIC + '=some');
			const instanceUnderTest = new TopicsPlugin();
			const addTopicFromQueryParamsSpy = spyOn(instanceUnderTest, '_addTopicFromQueryParams');
			const addTopicFromConfigSpy = spyOn(instanceUnderTest, '_addTopicFromConfig');
			const topicServiceSpy = spyOn(topicsServiceMock, 'init').and.returnValue(Promise.resolve());
			spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);

			await instanceUnderTest._init();

			expect(topicServiceSpy).toHaveBeenCalledTimes(1);
			expect(addTopicFromQueryParamsSpy).toHaveBeenCalledOnceWith(new URLSearchParams(queryParam));
			expect(addTopicFromConfigSpy).not.toHaveBeenCalled();
			expect(store.getState().topics.ready).toBeTrue();
		});

		it('throws an error when TopicsService throws', async () => {
			const store = setup();
			const queryParam = new URLSearchParams(QueryParameters.TOPIC + '=some');
			const instanceUnderTest = new TopicsPlugin();
			const error = new Error('something got wrong');
			spyOn(topicsServiceMock, 'init').and.rejectWith(error);
			spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);

			await expectAsync(instanceUnderTest._init()).toBeRejectedWith(
				jasmine.objectContaining({ message: 'No topics found. Is the backend running and properly configured?', cause: error })
			);
			expect(store.getState().topics.ready).toBeFalse();
		});
	});

	describe('_addTopicFromConfig', () => {
		it('initializes the TopicsService and update the store', async () => {
			const store = setup();
			const topicId = 'someId';
			const topic = new Topic(topicId, 'label', 'description');
			const instanceUnderTest = new TopicsPlugin();
			spyOn(topicsServiceMock, 'default').and.returnValue(topic);

			await instanceUnderTest._addTopicFromConfig();

			expect(store.getState().topics.current).toBe(topicId);
		});
	});

	describe('_addTopicFromQueryParams', () => {
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

		it('updates current topic by calling #_addTopicFromConfig as fallback', () => {
			setup();
			const topicId = 'someId';
			const queryParam = `${QueryParameters.TOPIC}=${topicId}`;
			const instanceUnderTest = new TopicsPlugin();
			const topicServiceSpy = spyOn(topicsServiceMock, 'byId').withArgs(topicId).and.returnValue(null);
			const addTopicFromConfigSpy = spyOn(instanceUnderTest, '_addTopicFromConfig');

			instanceUnderTest._addTopicFromQueryParams(new URLSearchParams(queryParam));

			expect(topicServiceSpy).toHaveBeenCalledTimes(1);
			expect(addTopicFromConfigSpy).toHaveBeenCalledTimes(1);
		});
	});
});
