import { FALLBACK_TOPICS_IDS, TopicsService } from '../../src/services/TopicsService';
import { Topic } from '../../src/domain/topic';
import { loadBvvTopics } from '../../src/services/provider/topics.provider';
import { $injector } from '../../src/injection';

describe('FALLBACK_TOPICS_IDS', () => {
	it('provides two fallback ids', () => {
		const [fallbackId0, fallbackId1] = FALLBACK_TOPICS_IDS;

		expect(fallbackId0).toBe('fallback0');
		expect(fallbackId1).toBe('fallback1');
	});
});

describe('TopicService', () => {
	const configService = {
		getValue: () => {}
	};
	const environmentService = {
		isStandalone: () => {}
	};

	beforeAll(() => {
		$injector.registerSingleton('ConfigService', configService).registerSingleton('EnvironmentService', environmentService);
	});

	const topic0 = new Topic('topic0', 'Topic 0', 'This is Topic 0...');
	const topic1 = new Topic('topic1', 'Topic 1', 'This is Topic 1...');

	const loadMockTopics = async () => {
		return [topic0, topic1];
	};

	const setup = (provider = loadMockTopics) => {
		return new TopicsService(provider);
	};

	describe('init', () => {
		it('initializes the service', async () => {
			const instanceUnderTest = setup();
			expect(instanceUnderTest._topics).toBeNull();

			const topics = await instanceUnderTest.init();

			expect(topics.length).toBe(2);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = new TopicsService();
			expect(instanceUnderTest._provider).toEqual(loadBvvTopics);
		});

		it('just provides the topics when already initialized', async () => {
			const instanceUnderTest = setup();
			instanceUnderTest._topics = [topic0];

			const topic = await instanceUnderTest.init();

			expect(topic.length).toBe(1);
		});

		describe('provider cannot fulfill', () => {
			it('loads two fallback topics when we are in standalone mode', async () => {
				spyOn(environmentService, 'isStandalone').and.returnValue(true);
				const [fallbackId0, fallbackId1] = FALLBACK_TOPICS_IDS;
				const instanceUnderTest = setup(async () => {
					throw new Error('Topics could not be loaded');
				});
				const warnSpy = spyOn(console, 'warn');

				const topics = await instanceUnderTest.init();

				expect(topics.length).toBe(2);
				expect(topics[0].id).toBe(fallbackId0);
				expect(topics[0].baseGeoRs.raster[0]).toBe('tpo');
				expect(topics[0].baseGeoRs.raster[1]).toBe('tpo_mono');
				expect(topics[0].baseGeoRs.vector[0]).toBe('bmde_vector');
				expect(topics[0].baseGeoRs.vector[1]).toBe('bmde_vector_relief');
				expect(topics[1].id).toBe(fallbackId1);
				expect(topics[1].baseGeoRs.raster[0]).toBe('tpo');
				expect(topics[1].baseGeoRs.raster[1]).toBe('tpo_mono');
				expect(warnSpy).toHaveBeenCalledWith('Topics could not be fetched from backend. Using fallback topics ...');
			});

			it('throws an error when we are NOT in standalone mode', async () => {
				spyOn(environmentService, 'isStandalone').and.returnValue(false);
				const error = new Error('Topics could not be loaded');
				const instanceUnderTest = setup(async () => {
					throw error;
				});

				await expectAsync(instanceUnderTest.init()).toBeRejectedWith(jasmine.objectContaining({ message: 'No topics available', cause: error }));
			});
		});
	});

	describe('all', () => {
		it('provides all topics', () => {
			const instanceUnderTest = setup();
			instanceUnderTest._topics = [topic0];

			const Topics = instanceUnderTest.all();

			expect(Topics.length).toBe(1);
		});

		it('logs a warn statement when service hat not been initialized', () => {
			const instanceUnderTest = setup();
			const warnSpy = spyOn(console, 'warn');

			expect(instanceUnderTest.all()).toEqual([]);
			expect(warnSpy).toHaveBeenCalledWith('TopicsService not yet initialized');
		});
	});

	describe('byId', () => {
		it('provides a topic by id', () => {
			const instanceUnderTest = setup();
			instanceUnderTest._topics = [topic0];

			const topic = instanceUnderTest.byId('topic0');

			expect(topic).toBeTruthy();
			expect(topic.id).toBe('topic0');
		});

		it('provides null if for an unknown id', () => {
			const instanceUnderTest = setup();
			instanceUnderTest._topics = [topic0];

			const topic = instanceUnderTest.byId('something');

			expect(topic).toBeNull();
		});

		it('logs a warn statement when when service hat not been initialized', () => {
			const instanceUnderTest = setup();
			const warnSpy = spyOn(console, 'warn');

			expect(instanceUnderTest.byId('unknownId')).toBeNull();
			expect(warnSpy).toHaveBeenCalledWith('TopicsService not yet initialized');
		});
	});

	describe('default', () => {
		it('provides the configured default topic', () => {
			const instanceUnderTest = setup();
			instanceUnderTest._topics = [topic0, topic1];
			spyOn(configService, 'getValue').and.returnValue(topic1.id);

			const topic = instanceUnderTest.default();

			expect(topic).toBeTruthy();
			expect(topic.id).toBe('topic1');
		});

		it('provides the first available topic', () => {
			const instanceUnderTest = setup();
			instanceUnderTest._topics = [topic0, topic1];
			spyOn(configService, 'getValue').and.returnValue('unkwown');

			const topic = instanceUnderTest.default();

			expect(topic).toBeTruthy();
			expect(topic.id).toBe('topic0');
		});

		it('logs a warn statement when when service hat not been initialized', () => {
			const instanceUnderTest = setup();
			const warnSpy = spyOn(console, 'warn');

			expect(instanceUnderTest.default()).toBeNull();
			expect(warnSpy).toHaveBeenCalledWith('TopicsService not yet initialized');
		});
	});
});
