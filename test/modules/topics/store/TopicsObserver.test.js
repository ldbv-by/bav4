import { TopicsObserver } from '../../../../src/modules/topics/store/TopicsObserver';
import { TestUtils } from '../../../test-utils.js';
import { layersReducer } from '../../../../src/modules/map/store/layers.reducer';
import { $injector } from '../../../../src/injection';
import { Topic } from '../../../../src/services/domain/topic';


describe('TopicsObserver', () => {

	const topicsServiceMock = {
		async init() { },
	};

	const setup = (state) => {

		const store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer
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

		it('initializes the topics service', async () => {
			setup();
			const instanceUnderTest = new TopicsObserver();

			const topicServiceSpy = spyOn(topicsServiceMock, 'init').and.returnValue(Promise.resolve([
				new Topic('someId', 'label', 'description', ['someLayerId'])
			]));

			await instanceUnderTest._init();

			expect(topicServiceSpy).toHaveBeenCalledTimes(1);
		});
	});
});