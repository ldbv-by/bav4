import { LegendContent } from '../../../../../src/modules/legend/components/content/LegendContent';
import { $injector } from '../../../../../src/injection';
import { createMediaReducer } from '../../../../../src/store/media/media.reducer';
import { positionReducer } from '../../../../../src/store/position/position.reducer';
import { TestUtils } from '../../../../test-utils';
import { layersReducer } from '../../../../../src/store/layers/layers.reducer';
import { addLayer } from '../../../../../src/store/layers/layers.action';
import { legendReducer } from '../../../../../src/store/legend/legend.reducer';
import { activateLegend, setLegendItems, setMapResolution } from '../../../../../src/store/legend/legend.action';

window.customElements.define(LegendContent.tag, LegendContent);

describe('LegendContent', () => {
	const setup = async (state = {}) => {
		TestUtils.setupStoreAndDi(state, {
			legend: legendReducer,
			position: positionReducer,
			layers: layersReducer,
			media: createMediaReducer()
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('EnvironmentService', { portrait: false });

		setMapResolution(50);
		return await TestUtils.render(LegendContent.tag);
	};

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

	describe('when initialized', () => {
		it('renders nothing when module.legendActive is false', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders legend items, ', async () => {
			const element = await setup();
			activateLegend();

			setLegendItems([layerItem1, layerItem2, layerItem3]);

			element.render();

			const itemTitles = element.shadowRoot.querySelectorAll('.ea-legend-item__title');
			const itemImages = element.shadowRoot.querySelectorAll('img');

			expect(itemTitles.length).toBe(3);
			expect(itemImages.length).toBe(3);

			expect(itemTitles[0].innerText).toEqual(layerItem1.title);
			expect(itemTitles[1].innerText).toEqual(layerItem2.title);
			expect(itemTitles[2].innerText).toEqual(layerItem3.title);
			expect(itemImages[0].src).toEqual(layerItem1.legendUrl);
			expect(itemImages[1].src).toEqual(layerItem2.legendUrl);
			expect(itemImages[2].src).toEqual(layerItem3.legendUrl);
		});

		it('filters layers by current resolution on zoomLevel change', async () => {
			const element = await setup();
			activateLegend();

			setLegendItems([layerItem1, layerItem2, layerItem3]);

			setMapResolution(50);
			expect(element.shadowRoot.querySelectorAll('img').length).toBe(3);

			setMapResolution(20);
			expect(element.shadowRoot.querySelectorAll('img').length).toBe(2);

			setMapResolution(10);
			expect(element.shadowRoot.querySelectorAll('img').length).toBe(1);
		});

		it('removes duplicate legend items', async () => {
			const element = await setup();
			activateLegend();

			setLegendItems([layerItem1, layerItem1]);

			expect(element.shadowRoot.querySelectorAll('img').length).toBe(1);
		});

		it('shows subtitle whenever a layer with opacity < 1 is active', async () => {
			const element = await setup();
			addLayer('id1', { opacity: 0.5 });
			activateLegend();

			setLegendItems([layerItem1, layerItem1]);

			expect(element.shadowRoot.querySelector('.ea-legend__subtitle').innerText).toEqual('ea_legend_subtitle');
		});

		it('does not show subtitle when there is no layer with opacity < 1 active', async () => {
			const element = await setup();
			addLayer('id1');
			activateLegend();

			setLegendItems([layerItem1, layerItem1]);

			expect(element.shadowRoot.querySelector('.ea-legend__subtitle').innerText).toEqual('');
		});

		it('does not show subtitle when there is no visible layer with opacity < 1', async () => {
			const element = await setup();
			addLayer('id1', { opacity: 0.5, visible: false });
			activateLegend();

			setLegendItems([layerItem1, layerItem1]);

			expect(element.shadowRoot.querySelector('.ea-legend__subtitle').innerText).toEqual('');
		});
	});
});
