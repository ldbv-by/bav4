import { $injector } from '../../../src/injection';
import { loadBvvTopics } from '../../../src/services/provider/topics.provider';

describe('Topics provider', () => {

	const configService = {
		getValueAsPath: () => { }
	};

	const httpService = {
		fetch: async () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService);
	});

	it('loads topics', async () => {

		const backendUrl = 'https://backend.url';
		const topicMock1 = {
			defaultBaseLayer: 'mockBaseLayer',
			selectedLayers: [
				'mockSelectedLayer'
			],
			baseLayers: [
				'mockBgLayer1',
				'mockBgLayer2'
			],
			activatedLayers: [
				'mockActivatedLayer'
			],
			id: 'Ref42',
			label: 'LDBV',
			description: 'A mocked description',
			notNeeded: 'Value'
		};
		const topicMock2 = {
			defaultBaseLayer: 'mockBaseLayer2',
			selectedLayers: [
				'mockSelectedLayer2'
			],
			baseLayers: [
				'mockBgLayer12',
				'mockBgLayer22'
			],
			activatedLayers: [
				'mockActivatedLayer2'
			],
			id: 'Ref422',
			label: 'LDBV2',
			description: 'A 2nd mocked description',
			notNeeded: 'Value'
		};
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve(
			new Response(
				JSON.stringify([
					topicMock1, topicMock2
				])
			)
		));

		const topics = await loadBvvTopics();

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(topics.length).toBe(2);

		const topic1 = topics[0];
		expect(topic1.id).toBe(topicMock1.id);
		expect(topic1.label).toBe(topicMock1.label); 
		expect(topic1.description).toBe(topicMock1.description); 
		expect(topic1.defaultBaseLayer).toEqual(topicMock1.defaultBaseLayer); 
		expect(topic1.baseLayers).toEqual(topicMock1.baseLayers); 
		expect(topic1.activatedLayers).toEqual(topicMock1.activatedLayers); 
		expect(topic1.selectedLayers).toEqual(topicMock1.selectedLayers);
		expect(topic1.notNeeded).toBeUndefined();
        
		const topic2 = topics[1];
		expect(topic2.id).toBe(topicMock2.id);
		expect(topic2.label).toBe(topicMock2.label); 
		expect(topic2.description).toBe(topicMock2.description); 
		expect(topic2.defaultBaseLayer).toEqual(topicMock2.defaultBaseLayer); 
		expect(topic2.baseLayers).toEqual(topicMock2.baseLayers); 
		expect(topic2.activatedLayers).toEqual(topicMock2.activatedLayers); 
		expect(topic2.selectedLayers).toEqual(topicMock2.selectedLayers);
		expect(topic2.notNeeded).toBeUndefined();

	});

	it('logs a warn statement when Topics type cannot be resolved', async () => {

		const warnSpy = spyOn(console, 'warn');
		const backendUrl = 'https://backend.url';
		spyOn(configService, 'getValueAsPath').and.returnValue(backendUrl);
		spyOn(httpService, 'fetch').and.returnValue(Promise.resolve(
			new Response(
				JSON.stringify([
					{ baseLayers: ['mockBgLayer12'] }
				])
			)
		));


		await loadBvvTopics();

		expect(warnSpy).toHaveBeenCalledWith('Could not create topic');
	});

	it('rejects when backend request cannot be fulfilled', (done) => {

		const backendUrl = 'https://backend.url';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'fetch').and.returnValue(Promise.resolve(
			new Response(null, { status: 404 })
		));


		loadBvvTopics().then(() => {
			done(new Error('Promise should not be resolved'));
		}, (reason) => {
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(reason.message).toBe('Topics could not be retrieved');
			done();
		});

	});
});