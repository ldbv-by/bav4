import { TopicsObserver } from '../../../../src/modules/topics/store/TopicsObserver';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { Topic } from '../../../../src/services/domain/topic';
import { topicsReducer } from '../../../../src/modules/topics/store/topics.reducer';


describe('TopicsObserver', () => {

	const topicsServiceMock = {
		async init() { },
		default() {}
	};

	const setup = (state) => {

		const store = TestUtils.setupStoreAndDi(state, {
			topics: topicsReducer
		});
		$injector
			.registerSingleton('TopicsService', topicsServiceMock);

		return store;
	};

	describe('register', () => {

		it('calls #_init and awaits its completion', async () => {
			const store = setup();
			const instanceUnderTest = new TopicsObserver();
			const spy = spyOn(instanceUnderTest, '_init').and.returnValue(Promise.resolve(true));

			const result = await instanceUnderTest.register(store);

			expect(result).toBeTrue();
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('_init', () => {

		it('initializes the topics service and update the store', async () => {
			const store = setup();
			const topicId = 'someId';
			const topic = new Topic(topicId, 'label', 'description', ['someLayerId']);
			const instanceUnderTest = new TopicsObserver();
			const topicServiceSpy = spyOn(topicsServiceMock, 'init').and.returnValue(Promise.resolve([
				topic
			]));
			spyOn(topicsServiceMock, 'default').and.returnValue(topic);


			await instanceUnderTest._init();

			expect(topicServiceSpy).toHaveBeenCalledTimes(1);
			expect(store.getState().topics.current).toBe(topicId);
		});
	});
});