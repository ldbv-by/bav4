import { $injector } from '../../../src/injection';
import { loadBvvTopics } from '../../../src/services/provider/topics.provider';

describe('Topics provider', () => {

	const configService = {
		getValueAsPath: () => { }
	};

	const httpService = {
		get: async () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService);
	});

	it('loads topics', async () => {

		const backendUrl = 'https://backend.url';
		const topicMock1 = {
			defaultBaseGeoR: 'mockBaseLayer',
			selectedGeoRs: [
				'mockSelectedLayer'
			],
			baseGeoRs: [
				'mockBgLayer1',
				'mockBgLayer2'
			],
			activatedGeoRs: [
				'mockActivatedLayer'
			],
			id: 'Ref42',
			label: 'LDBV',
			description: 'A mocked description',
			notNeeded: 'Value',
			style: {
				hue: 42,
				icon: 'svg'
			}
		};
		const topicMock2 = {
			defaultBaseGeoR: 'mockBaseLayer2',
			selectedGeoRs: [
				'mockSelectedLayer2'
			],
			baseGeoRs: [
				'mockBgLayer12',
				'mockBgLayer22'
			],
			activatedGeoRs: [
				'mockActivatedLayer2'
			],
			id: 'Ref422',
			label: 'LDBV2',
			description: 'A 2nd mocked description',
			notNeeded: 'Value'
		};
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
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
		expect(topic1.defaultBaseGeoR).toEqual(topicMock1.defaultBaseGeoR);
		expect(topic1.baseGeoRs).toEqual(topicMock1.baseGeoRs);
		expect(topic1.activatedGeoRs).toEqual(topicMock1.activatedGeoRs);
		expect(topic1.selectedGeoRs).toEqual(topicMock1.selectedGeoRs);
		expect(topic1.notNeeded).toBeUndefined();
		expect(topic1.style.hue).toBe(42);
		expect(topic1.style.icon).toBe('svg');

		const topic2 = topics[1];
		expect(topic2.id).toBe(topicMock2.id);
		expect(topic2.label).toBe(topicMock2.label);
		expect(topic2.description).toBe(topicMock2.description);
		expect(topic2.defaultBaseGeoR).toEqual(topicMock2.defaultBaseGeoR);
		expect(topic2.baseGeoRs).toEqual(topicMock2.baseGeoRs);
		expect(topic2.activatedGeoRs).toEqual(topicMock2.activatedGeoRs);
		expect(topic2.selectedGeoRs).toEqual(topicMock2.selectedGeoRs);
		expect(topic2.notNeeded).toBeUndefined();
		expect(topic2.style.hue).toBeNull();
		expect(topic2.style.icon).toBeNull();

	});

	it('logs a warn statement when Topics type cannot be resolved', async () => {

		const warnSpy = spyOn(console, 'warn');
		const backendUrl = 'https://backend.url';
		spyOn(configService, 'getValueAsPath').and.returnValue(backendUrl);
		spyOn(httpService, 'get').and.returnValue(Promise.resolve(
			new Response(
				JSON.stringify([
					{ baseGeoRs: ['mockBgLayer12'] }
				])
			)
		));


		await loadBvvTopics();

		expect(warnSpy).toHaveBeenCalledWith('Could not create topic');
	});

	it('rejects when backend request cannot be fulfilled', async () => {

		const backendUrl = 'https://backend.url';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
			new Response(null, { status: 404 })
		));

		try {
			await loadBvvTopics();
			throw new Error('Promise should not be resolved');
		}
		catch (error) {
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(error.message).toBe('Topics could not be retrieved');
		}
	});
});
