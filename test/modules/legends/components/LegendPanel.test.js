import { $injector } from '@src/injection';
import { LegendPanel } from '@src/modules/legends/components/LegendPanel';
import { TestUtils } from '@test/test-utils';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { legendsReducer } from '@src/store/legends/legends.reducer';
import { addLegend, removeLegend } from '@src/store/legends/legends.action';
import { Legend, LegendEntry } from '@src/services/GeoResourceLegendService';

window.customElements.define(LegendPanel.tag, LegendPanel);

let store;

const geoResourceLegendServiceMock = {
	available: () => {
		return [{ geoResourceId: 'tk' }, { geoResourceId: 'atkis' }];
	},
	getLegendById: (id) => {
		return new Legend(id);
	}
};

const setup = (state = {}) => {
	store = TestUtils.setupStoreAndDi(state, {
		layers: layersReducer,
		legends: legendsReducer
	});

	$injector
		.registerSingleton('TranslationService', { translate: (key) => key })
		.registerSingleton('GeoResourceLegendService', geoResourceLegendServiceMock);
	return TestUtils.render(LegendPanel.tag);
};

describe('LegendPanel', () => {
	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new LegendPanel();
			expect(element.getModel()).toEqual({ active: false, availableLayers: [], activeLegends: [] });
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			const panel = await setup();

			expect(panel.shadowRoot.querySelector('.legend-title')).toBeNull();
			expect(panel.shadowRoot.querySelector('.legend-content')).toBeNull();
			expect(panel.shadowRoot.querySelector('#legend-searchable-select')?.options).toHaveLength(2); // s. geoResourceLegendMock
		});

		it('renders the view with legends', async () => {
			const panel = await setup();

			addLegend('tk');
			await TestUtils.timeout();

			expect(panel.shadowRoot.querySelector('.legend-title')).not.toBeNull();
			expect(panel.shadowRoot.querySelector('.legend-content')).not.toBeNull();
		});
	});

	describe('store and actions', async () => {
		it('legend-select only has geoResources that are not active in legends store', async () => {
			const panel = await setup();

			addLegend('tk');
			await TestUtils.timeout();

			const select = panel.shadowRoot.querySelector('#legend-searchable-select');
			expect(select.options).toHaveLength(1);
			expect(select.options[0]).toBe('atkis');
		});

		it('removes a legend', async () => {
			const panel = await setup();
			addLegend('tk');
			await TestUtils.timeout();

			const closeBtn = panel.shadowRoot?.querySelector('.close-legend');
			closeBtn.dispatchEvent(new Event('click'));
			await TestUtils.timeout();

			expect(panel.shadowRoot.querySelector('#legend-searchable-select')?.options).toHaveLength(2);
			expect(panel.shadowRoot.querySelector('.legend-title')).toBeNull();
			expect(panel.shadowRoot.querySelector('.legend-content')).toBeNull();
		});
	});
});
