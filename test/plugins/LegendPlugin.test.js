import { LegendPlugin } from '../../src/plugins/LegendPlugin.js';
import { $injector } from '../../src/injection/index.js';
import { addLayer, modifyLayer, removeLayer } from '../../src/store/layers/layers.action.js';
import { layersReducer } from '../../src/store/layers/layers.reducer.js';
import { TestUtils } from '../test-utils.js';
import { legendReducer } from '../../src/store/legend/legend.reducer.js';
import { activateLegend, deactivateLegend, setPreviewGeoresourceId } from '../../src/store/legend/legend.action.js';

describe('LegendPlugin', () => {
	const wmsCapabilitiesServiceMock = { getWmsLayers: () => [] };

	const storeActions = [];

	const layerItem1 = {
		title: 'title1',
		minResolution: 100,
		maxResolution: 0,
		legendUrl: 'https://url1/img'
	};

	const layerItem2 = {
		title: 'title2',
		minResolution: 90,
		maxResolution: 10,
		legendUrl: 'https://url2/img'
	};

	const layerItem3 = {
		title: 'title3',
		minResolution: 80,
		maxResolution: 20,
		legendUrl: 'https://url2/img'
	};

	const setup = async (state) => {
		storeActions.length = 0;

		spyOn(wmsCapabilitiesServiceMock, 'getWmsLayers')
			.withArgs('id1')
			.and.returnValue([layerItem1])
			.withArgs('id2')
			.and.returnValue([layerItem2])
			.withArgs('id3')
			.and.returnValue([layerItem3]);

		const store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			legend: legendReducer
		});

		$injector.registerSingleton('WmsCapabilitiesService', wmsCapabilitiesServiceMock);

		const instanceUnderTest = new LegendPlugin();
		await instanceUnderTest.register(store);

		return store;
	};

	describe('when legendActive is true, ', () => {
		it('creates legend items on active layer change', async () => {
			const store = await setup();
			activateLegend();

			addLayer('id1');
			addLayer('id2');

			await TestUtils.timeout();
			expect(store.getState().legend.legendItems).toEqual([layerItem1, layerItem2]);
		});

		it('creates legend items on plugin load', async () => {
			const store = await setup({
				layers: {
					active: [
						{ geoResourceId: 'id1', visible: true },
						{ geoResourceId: 'id2', visible: true }
					]
				}
			});

			activateLegend();

			await TestUtils.timeout();
			expect(store.getState().legend.legendItems).toEqual([layerItem1, layerItem2]);
		});

		it('shows legend only for visible layers', async () => {
			const store = await setup();
			activateLegend();

			addLayer('id1');
			addLayer('id2');
			addLayer('id3');
			modifyLayer('id2', { visible: false });

			await TestUtils.timeout();
			expect(store.getState().legend.legendItems).toEqual([layerItem1, layerItem3]);
		});

		it('creates preview layers items first', async () => {
			const store = await setup();
			activateLegend();

			addLayer('id3');
			setPreviewGeoresourceId('id2');
			addLayer('id1');

			await TestUtils.timeout();
			expect(store.getState().legend.legendItems).toEqual([layerItem2, layerItem1, layerItem3]);
		});

		it('sorts active layers alphabetically', async () => {
			const store = await setup();
			activateLegend();

			addLayer('id2');
			addLayer('id3');
			addLayer('id1');

			await TestUtils.timeout();
			expect(store.getState().legend.legendItems).toEqual([layerItem1, layerItem2, layerItem3]);
		});

		it('shows preview layer only once if already active', async () => {
			const store = await setup();
			activateLegend();

			addLayer('id1');
			setPreviewGeoresourceId('id1');

			await TestUtils.timeout();
			expect(store.getState().legend.legendItems).toEqual([layerItem1]);
		});

		it('clears preview layer if it is added to active layers', async () => {
			const store = await setup();
			activateLegend();

			setPreviewGeoresourceId('id1');
			addLayer('id1');

			await TestUtils.timeout();
			expect(store.getState().legend.legendItems).toEqual([layerItem1]);
		});

		it('always shows preview layer first', async () => {
			const store = await setup();
			activateLegend();

			addLayer('id1');
			addLayer('id2');
			addLayer('id3');
			setPreviewGeoresourceId('id2');

			await TestUtils.timeout();
			expect(store.getState().legend.legendItems).toEqual([layerItem2, layerItem1, layerItem3]);
		});

		it('handles several incoming preview events correctly', async () => {
			const store = await setup();
			activateLegend();

			setPreviewGeoresourceId('id1');
			setPreviewGeoresourceId('id2');
			setPreviewGeoresourceId('id3');
			setPreviewGeoresourceId(null);

			await TestUtils.timeout();
			expect(store.getState().legend.legendItems).toEqual([]);
		});

		it('handles several incoming active layers changes correctly', async () => {
			const store = await setup();
			activateLegend();

			addLayer('id1');
			addLayer('id2');
			addLayer('id3');
			removeLayer('id1');
			removeLayer('id2');
			removeLayer('id3');

			await TestUtils.timeout();
			expect(store.getState().legend.legendItems).toEqual([]);
		});
	});

	describe('when legendActive is false, ', () => {
		it('updates active layers even if legendActive is false', async () => {
			const store = await setup();
			deactivateLegend();

			addLayer('id1');

			await TestUtils.timeout();
			expect(store.getState().legend.legendItems).toEqual([layerItem1]);
		});

		it('does not show legend on preview id change when legend disabled', async () => {
			const store = await setup();
			deactivateLegend();

			setPreviewGeoresourceId('id1');

			await TestUtils.timeout();
			expect(store.getState().legend.legendItems).toEqual([]);
		});
	});
});
