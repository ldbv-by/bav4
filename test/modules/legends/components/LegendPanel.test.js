import { LegendPanel } from '@src/modules/legends/components/LegendPanel';
import { TestUtils } from '@test/test-utils';
import { $injector } from '@src/injection';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { positionReducer } from '@src/store/position/position.reducer';
import { legendsReducer } from '@src/store/legends/legends.reducer';

window.customElements.define(LegendPanel.tag, LegendPanel);

describe('LegendPanel', () => {
	const translationServiceMock = { translate: (key) => key };
	const geoResourceServiceLegendMock = {
		available: () => []
	};
	const geoResourceServiceMock = {};

	const setup = (state = {}) => {
		TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			position: positionReducer,
			legends: legendsReducer
		});
		$injector
			.registerSingleton('TranslationService', translationServiceMock)
			.registerSingleton('GeoResourceLegendService', geoResourceServiceLegendMock)
			.registerSingleton('GeoResourceService', geoResourceServiceMock);

		return TestUtils.render(LegendPanel.tag);
	};

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new LegendPanel().getModel();
			expect(model).toEqual({ active: false, availableGeoResources: [], activeLegends: [], zoomLevel: 0 });
		});
	});
});
