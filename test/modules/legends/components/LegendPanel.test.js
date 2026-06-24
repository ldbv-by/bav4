import { LegendPanel } from '@src/modules/legends/components/LegendPanel';
import { TestUtils } from '@test/test-utils';
import { $injector } from '@src/injection';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { positionReducer } from '@src/store/position/position.reducer';
import { legendsReducer } from '@src/store/legends/legends.reducer';
import { GeoResource } from '@src/domain/geoResources';
import { Legend, LegendEntry, LegendEntryType } from '@src/services/GeoResourceLegendService';
import { addLayer } from '@src/store/layers/layers.action';
import { changeZoom } from '@src/store/position/position.action';
import { expect } from 'vitest';

window.customElements.define(LegendPanel.tag, LegendPanel);

describe('LegendPanel', () => {
	class GeoResourceImpl extends GeoResource {}

	const translationServiceMock = { translate: (key) => key };
	const geoResourceServiceLegendMock = {
		available: () => [],
		getLegendById: async (id) => new Legend(id, id, [[]])
	};
	const geoResourceServiceMock = {
		byId: (id) => {
			return new GeoResourceImpl(id, `label-${id}`);
		}
	};
	const mapServiceMock = {
		getMinZoomLevel: () => 0,
		getMaxZoomLevel: () => 20
	};

	const setup = (state = {}) => {
		TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			position: positionReducer,
			legends: legendsReducer
		});
		$injector
			.registerSingleton('TranslationService', translationServiceMock)
			.registerSingleton('GeoResourceLegendService', geoResourceServiceLegendMock)
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('MapService', mapServiceMock);

		return TestUtils.render(LegendPanel.tag);
	};

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new LegendPanel().getModel();
			expect(model).toEqual({ active: false, availableGeoResources: [], activeLegends: [], zoomLevel: 0 });
		});
	});

	describe('when initialized', () => {
		it('loads panel with available legends', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'bar', 'faz']);
			const panel = await setup();
			const availableDOMResources = panel.shadowRoot?.querySelectorAll('#legend-select option');
			const availableResources = panel.getModel().availableGeoResources;

			expect(availableResources.length).toBe(3);
			expect(availableResources[0].id).toBe('foo');
			expect(availableResources[1].id).toBe('bar');
			expect(availableResources[2].id).toBe('faz');

			expect(availableDOMResources?.length).toBe(4);
			expect(availableDOMResources[0].textContent).toBe('legends_choose_option');
			expect(availableDOMResources[0].id).toBe('');
			expect(availableDOMResources[1].id).toBe('foo');
			expect(availableDOMResources[2].id).toBe('bar');
			expect(availableDOMResources[3].id).toBe('faz');
		});

		it('shows active legend', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'bar', 'faz']);
			const panel = await setup({ legends: { active: ['bar'] } });
			const availableDOMResources = panel.shadowRoot?.querySelectorAll('#legend-select option');

			expect(panel.shadowRoot?.querySelector('#legend-bar')).not.toBe(null);
			expect(availableDOMResources?.length).toBe(3);
			expect(availableDOMResources[0].id).toBe('');
			expect(availableDOMResources[1].id).toBe('foo');
			expect(availableDOMResources[2].id).toBe('faz');
		});

		it('shows active legend with pdf legend entry', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo']);
			vi.spyOn(geoResourceServiceLegendMock, 'getLegendById').mockResolvedValue(
				new Legend('foo', 'foo-label', [[new LegendEntry(LegendEntryType.PDF_URL, 'pdf-url-data')]])
			);

			const panel = await setup({ legends: { active: ['foo'] } });
			expect(panel.shadowRoot?.querySelector('#legend-foo .legend-entry iframe')).not.toBe(null);
		});

		it('shows active legend with image legend entry', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo']);
			vi.spyOn(geoResourceServiceLegendMock, 'getLegendById').mockResolvedValue(
				new Legend('foo', 'foo-label', [
					[new LegendEntry(LegendEntryType.IMAGE_BASE64, 'image-base64-data')],
					[new LegendEntry(LegendEntryType.IMAGE_URL, 'image-url-data')]
				])
			);

			const panel = await setup({ legends: { active: ['foo'] } });
			expect(panel.shadowRoot?.querySelector('#legend-foo .legend-entry:nth-child(1) img').src.includes('image-base64-data')).toBe(true);
			expect(panel.shadowRoot?.querySelector('#legend-foo .legend-entry:nth-child(2) img').src.includes('image-url-data')).toBe(true);
		});

		it('shows active legend with zoom-level dependent entry', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo']);
			vi.spyOn(geoResourceServiceLegendMock, 'getLegendById').mockResolvedValue(
				new Legend('foo', 'foo-label', [
					[
						new LegendEntry(LegendEntryType.IMAGE_BASE64, null),
						new LegendEntry(LegendEntryType.IMAGE_BASE64, 'image-base64-data'),
						new LegendEntry(LegendEntryType.IMAGE_URL, 'image-url-data'),
						new LegendEntry('unknown', 'some unknown data')
					]
				])
			);

			const panel = await setup({ legends: { active: ['foo'] } });

			changeZoom(0);
			await TestUtils.timeout();
			expect(panel.shadowRoot?.querySelector('#legend-foo .legend-entry span')?.textContent).toBe('legends_at_zoomlevel_not_available');

			changeZoom(1);
			await TestUtils.timeout();
			expect(panel.shadowRoot?.querySelector('#legend-foo .legend-entry img').src.includes('image-base64-data')).toBe(true);

			changeZoom(2);
			await TestUtils.timeout();
			expect(panel.shadowRoot?.querySelector('#legend-foo .legend-entry img').src.includes('image-url-data')).toBe(true);

			changeZoom(3);
			await TestUtils.timeout();
			expect(panel.shadowRoot?.querySelector('#legend-foo .legend-entry span')?.textContent).toBe('legends_at_zoomlevel_not_available');
		});
	});

	describe('when store changes', async () => {
		it('updates panel and removes inactive legends on layer change', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'faz']);
			const panel = await setup({ legends: { active: ['bar'] } });

			addLayer('any layer');
			await TestUtils.timeout();

			expect(panel.shadowRoot?.querySelector('#legend-bar')).toBe(null);
		});
	});

	describe('ui events', () => {
		it('adds a legend on select', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'bar', 'faz']);
			const panel = await setup();
			const panelSelect = panel.shadowRoot?.querySelector('#legend-select');

			panelSelect.selectedIndex = 2;
			panelSelect.dispatchEvent(new Event('change'));
			await TestUtils.timeout();

			const availableDOMResources = panel.shadowRoot?.querySelectorAll('#legend-select option');
			const activeLegends = panel.getModel().activeLegends;
			expect(activeLegends.length).toBe(1);
			expect(activeLegends[0].geoResourceId).toBe('bar');
			expect(panel.shadowRoot?.querySelector('#legend-bar')).not.toBe(null);
			expect(availableDOMResources?.length).toBe(3);
			expect(availableDOMResources[0].id).toBe('');
			expect(availableDOMResources[1].id).toBe('foo');
			expect(availableDOMResources[2].id).toBe('faz');
		});

		it('adds no legend when initial select option is pressed', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'bar', 'faz']);
			const panel = await setup();
			const panelSelect = panel.shadowRoot?.querySelector('#legend-select');

			panelSelect.selectedIndex = 0; // Is predefined as "Select Legend Option"
			panelSelect.dispatchEvent(new Event('change'));
			await TestUtils.timeout();

			const activeLegends = panel.getModel().activeLegends;
			expect(activeLegends.length).toBe(0);
		});

		it('removes an active legend on button press', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'bar', 'faz']);
			const panel = await setup({ legends: { active: ['bar'] } });
			const removeBtn = panel.shadowRoot?.querySelector('#legend-bar .legend-entry-close-button');

			removeBtn.dispatchEvent(new Event('click'));
			await TestUtils.timeout();

			const availableDOMResources = panel.shadowRoot?.querySelectorAll('#legend-select option');
			expect(panel.shadowRoot?.querySelector('#legend-bar')).toBe(null);
			expect(availableDOMResources?.length).toBe(4);
			expect(availableDOMResources[1].id).toBe('foo');
			expect(availableDOMResources[2].id).toBe('bar');
			expect(availableDOMResources[3].id).toBe('faz');
		});

		it('calls _resizeLegendIframes to change iframe width', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo']);
			vi.spyOn(geoResourceServiceLegendMock, 'getLegendById').mockResolvedValue(
				new Legend('foo', 'foo-label', [[new LegendEntry(LegendEntryType.PDF_URL, 'pdf-url-data')]])
			);
			const panel = await setup({ legends: { active: ['foo'] } });
			const iframe = panel.shadowRoot.querySelector('#legend-foo .legend-entry iframe');

			iframe.width = '200';
			panel._resizeLegendIframes({ width: 400 });

			expect(iframe.width).toBe('400');
		});

		it('changes the width of iframe legends on resize', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo']);
			vi.spyOn(geoResourceServiceLegendMock, 'getLegendById').mockResolvedValue(
				new Legend('foo', 'foo-label', [[new LegendEntry(LegendEntryType.PDF_URL, 'pdf-url-data')]])
			);
			const panel = await setup({ legends: { active: ['foo'] } });
			const iframe = panel.shadowRoot.querySelector('#legend-foo .legend-entry iframe');
			const viewer = panel.shadowRoot.getElementById('legend-viewer');
			const resizeSpy = vi.spyOn(panel, '_resizeLegendIframes').mockImplementation(() => {
				// Using a mocked result because the computed value of the legend-viewer differs slightly.
				iframe.width = 400;
			});

			iframe.width = '200';
			viewer.style.width = 300; // triggers ResizeObserver

			await vi.waitUntil(() => iframe.width !== '200');
			expect(resizeSpy).toHaveBeenCalledOnce();
			expect(iframe.width).toBe('400');
		});

		it('toggles legend content', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo']);
			vi.spyOn(geoResourceServiceLegendMock, 'getLegendById').mockResolvedValue(
				new Legend('foo', 'foo-label', [[new LegendEntry(LegendEntryType.PDF_URL, 'pdf-url-data')]])
			);
			const panel = await setup({ legends: { active: ['foo'] } });
			const legendEntry = panel.shadowRoot.querySelector('#legend-foo ');
			const entryContent = legendEntry.querySelector('.legend-entries-container');
			const collapseButton = legendEntry.querySelector('.legend-entry-collapse-button');

			collapseButton.dispatchEvent(new Event('click'));
			expect(entryContent.classList.contains('hidden')).toBe(true);
			expect(collapseButton.querySelector('i.iconexpand')).toBe(null);

			collapseButton.dispatchEvent(new Event('click'));
			expect(entryContent.classList.contains('hidden')).toBe(false);
			expect(collapseButton.querySelector('i.iconexpand')).not.toBe(null);
		});
	});

	describe('when disconnected', () => {
		it('removes all observers', async () => {
			const element = await setup();
			expect(element._resizeObserver).toEqual(expect.any(ResizeObserver));
			element.onDisconnect(); // we call onDisconnect manually
			expect(element._resizeObserver).toBeNull();
		});
	});
});
