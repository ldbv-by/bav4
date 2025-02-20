import {
	activateLegend,
	clearPreviewGeoresourceId,
	deactivateLegend,
	setLegendItems,
	setMapResolution,
	setPreviewGeoresourceId
} from '../../../src/store/legend/legend.action';
import { legendReducer } from '../../../src/store/legend/legend.reducer';
import { TestUtils } from '../../test-utils';

describe('ea.reducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			ea: legendReducer
		});
	};

	it('has correct initial values', () => {
		const store = setup();
		expect(store.getState().ea.legendActive).toEqual(false);
		expect(store.getState().ea.legendGeoresourceId).toBeNull();
		expect(store.getState().ea.legendItems).toEqual([]);
		expect(store.getState().ea.mapResolution).toEqual(0.0);
	});

	it('activates/deactivates the legend', () => {
		const store = setup();

		activateLegend();

		expect(store.getState().ea.legendActive).toEqual(true);

		deactivateLegend();

		expect(store.getState().ea.legendActive).toEqual(false);
	});

	it('sets the georesource id for the legend', () => {
		const store = setup();

		setPreviewGeoresourceId('id42');

		expect(store.getState().ea.legendGeoresourceId).toEqual('id42');
	});

	it('clears the georesource id for the legend', () => {
		const store = setup();

		setPreviewGeoresourceId('id42');

		clearPreviewGeoresourceId();

		expect(store.getState().ea.legendGeoresourceId).toBeNull();
	});

	it('sets the legend items', () => {
		const store = setup();

		const legendItems1 = { title: 'title1', maxResolution: 100, minResolution: 0, legendUrl: 'url1' };
		const legendItems2 = { title: 'title2', maxResolution: 100, minResolution: 0, legendUrl: 'url2' };
		setLegendItems([legendItems1, legendItems2]);

		expect(store.getState().ea.legendItems).toEqual([legendItems1, legendItems2]);
	});

	it('sets the map resolution', () => {
		const store = setup();

		setMapResolution(42.24);

		expect(store.getState().ea.mapResolution).toEqual(42.24);
	});
});
