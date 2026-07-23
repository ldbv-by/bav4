import { LegendPanel } from '@src/modules/legends/components/LegendPanel';
import { SearchableSelect } from '@src/modules/commons/components/searchableSelect/SearchableSelect';
import { TestUtils } from '@test/test-utils';
import { $injector } from '@src/injection';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { positionReducer } from '@src/store/position/position.reducer';
import { legendsReducer } from '@src/store/legends/legends.reducer';
import { createNoInitialStateMainMenuReducer } from '@src/store/mainMenu/mainMenu.reducer';
import { GeoResource } from '@src/domain/geoResources';
import { Legend, LegendEntry, LegendEntryType } from '@src/services/GeoResourceLegendService';
import { addLayer } from '@src/store/layers/layers.action';
import { addLegends, removeLegend } from '@src/store/legends/legends.action';
import { changeZoom } from '@src/store/position/position.action';
import { TabIds } from '@src/domain/mainMenu';
import { describe, expect } from 'vitest';
import { setTab } from '@src/store/mainMenu/mainMenu.action';
import { hashCode } from '@src/utils/hashCode';

window.customElements.define(SearchableSelect.tag, SearchableSelect);
window.customElements.define(LegendPanel.tag, LegendPanel);

describe('LegendPanel', () => {
	class GeoResourceImpl extends GeoResource {}

	let store;
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

	const securityServiceMock = {
		sanitizeHtml: (htmlStr) => {
			return htmlStr;
		}
	};
	const mapServiceMock = {
		getMinZoomLevel: () => 0,
		getMaxZoomLevel: () => 20
	};

	const setup = (state = {}) => {
		store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			position: positionReducer,
			legends: legendsReducer,
			mainMenu: createNoInitialStateMainMenuReducer()
		});
		$injector
			.registerSingleton('TranslationService', translationServiceMock)
			.registerSingleton('GeoResourceLegendService', geoResourceServiceLegendMock)
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('SecurityService', securityServiceMock);

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

			const availableResources = panel.getModel().availableGeoResources;
			const legendSelect = panel.shadowRoot.querySelector('#legend-select');

			expect(availableResources.length).toBe(3);
			expect(availableResources[0].id).toBe('foo');
			expect(availableResources[1].id).toBe('bar');
			expect(availableResources[2].id).toBe('faz');

			expect(legendSelect.options.length).toBe(3);
			expect(legendSelect.placeholder).toBe('legends_choose_option');
			expect(legendSelect.options[0].id).toBe('foo');
			expect(legendSelect.options[1].id).toBe('bar');
			expect(legendSelect.options[2].id).toBe('faz');
		});

		it('shows active legend', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'bar', 'faz']);
			const panel = await setup({ legends: { active: ['bar'] } });
			const legendSelect = panel.shadowRoot.querySelector('#legend-select');

			expect(panel.shadowRoot?.querySelector(`#legend-${hashCode('bar')}`)).not.toBe(null);
			expect(legendSelect.options.length).toBe(2);
			expect(legendSelect.options[0].id).toBe('foo');
			expect(legendSelect.options[1].id).toBe('faz');
		});

		it('shows active legend with pdf legend entry', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo']);
			vi.spyOn(geoResourceServiceLegendMock, 'getLegendById').mockResolvedValue(
				new Legend('foo', 'foo-label', [[new LegendEntry(LegendEntryType.PDF_URL, 'pdf-url-data')]])
			);

			const panel = await setup({ legends: { active: ['foo'] } });
			expect(panel.shadowRoot?.querySelector(`#legend-${hashCode('foo')} .legend-entry iframe`)).not.toBe(null);
		});

		it('shows active legend with html legend entry', async () => {
			const securitySpy = vi.spyOn(securityServiceMock, 'sanitizeHtml').mockImplementation((htmlStr) => htmlStr + '<span>Sanitized</span>');
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo']);
			vi.spyOn(geoResourceServiceLegendMock, 'getLegendById').mockResolvedValue(
				new Legend('foo', 'foo-label', [[new LegendEntry(LegendEntryType.HTML, '<p>html data</p>')]])
			);
			const panel = await setup({ legends: { active: ['foo'] } });

			expect(securitySpy).toHaveBeenCalledExactlyOnceWith('<p>html data</p>');
			expect(panel.shadowRoot?.querySelector(`#legend-${hashCode('foo')} .legend-entry p`).textContent).toBe('html data');
			expect(panel.shadowRoot?.querySelector(`#legend-${hashCode('foo')} .legend-entry span`).textContent).toBe('Sanitized');
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
			expect(panel.shadowRoot?.querySelector(`#legend-${hashCode('foo')} .legend-entry:nth-child(1) img`).src.includes('image-base64-data')).toBe(
				true
			);
			expect(panel.shadowRoot?.querySelector(`#legend-${hashCode('foo')} .legend-entry:nth-child(2) img`).src.includes('image-url-data')).toBe(true);
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
			expect(panel.shadowRoot?.querySelector(`#legend-${hashCode('foo')} .legend-entry span`)?.textContent).toBe(
				'legends_at_zoomlevel_not_available'
			);

			changeZoom(1);
			await TestUtils.timeout();
			expect(panel.shadowRoot?.querySelector(`#legend-${hashCode('foo')} .legend-entry img`).src.includes('image-base64-data')).toBe(true);

			changeZoom(2);
			await TestUtils.timeout();
			expect(panel.shadowRoot?.querySelector(`#legend-${hashCode('foo')} .legend-entry img`).src.includes('image-url-data')).toBe(true);

			changeZoom(3);
			await TestUtils.timeout();
			expect(panel.shadowRoot?.querySelector(`#legend-${hashCode('foo')} .legend-entry span`).textContent).toBe('legends_at_zoomlevel_not_available');
		});
	});

	describe('when store changes', async () => {
		it('updates panel and removes inactive legends on layer change', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'faz']);
			const panel = await setup({ legends: { active: ['bar'] } });

			addLayer('any layer');
			await TestUtils.timeout();

			expect(panel.shadowRoot.querySelector(`#legend-${hashCode('bar')}`)).toBe(null);
		});
	});

	describe('ui events', () => {
		it('adds a legend on select', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'bar', 'faz']);
			const panel = await setup();
			const legendSelect = panel.shadowRoot.querySelector('#legend-select');

			legendSelect.selected = legendSelect.options[1]; // select bar resource
			await TestUtils.timeout();
			const activeLegends = panel.getModel().activeLegends;

			expect(activeLegends.length).toBe(1);
			expect(activeLegends[0].geoResourceId).toBe('bar');
			expect(panel.shadowRoot.querySelector(`#legend-${hashCode('bar')}`)).not.toBe(null);
			expect(legendSelect.options.length).toBe(2);
			expect(legendSelect.options[0].id).toBe('foo');
			expect(legendSelect.options[1].id).toBe('faz');
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
			const removeBtn = panel.shadowRoot?.querySelector(`#legend-${hashCode('bar')} .legend-entry-close-button`);

			removeBtn.dispatchEvent(new Event('click'));
			await TestUtils.timeout();

			const legendSelect = panel.shadowRoot.querySelector('#legend-select');

			expect(panel.shadowRoot.querySelector(`#legend-${hashCode('bar')}`)).toBe(null);
			expect(legendSelect.options.length).toBe(3);
			expect(legendSelect.options[0].id).toBe('foo');
			expect(legendSelect.options[1].id).toBe('bar');
			expect(legendSelect.options[2].id).toBe('faz');
		});

		it('calls _resizeLegendIframes to change iframe width', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo']);
			vi.spyOn(geoResourceServiceLegendMock, 'getLegendById').mockResolvedValue(
				new Legend('foo', 'foo-label', [[new LegendEntry(LegendEntryType.PDF_URL, 'pdf-url-data')]])
			);
			const panel = await setup({ legends: { active: ['foo'] } });
			const iframe = panel.shadowRoot.querySelector(`#legend-${hashCode('foo')} .legend-entry iframe`);

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
			const iframe = panel.shadowRoot.querySelector(`#legend-${hashCode('foo')} .legend-entry iframe`);
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
			const legendEntry = panel.shadowRoot.querySelector(`#legend-${hashCode('foo')}`);
			const entryContent = legendEntry.querySelector('.legend-entries-container');
			const collapseButton = legendEntry.querySelector('.legend-entry-collapse-button');

			collapseButton.dispatchEvent(new Event('click'));
			expect(entryContent.classList.contains('hidden')).toBe(true);
			expect(collapseButton.querySelector('i.iconexpand')).toBe(null);
			expect(collapseButton.title).toBe('legends_collapse_legend_entry');

			collapseButton.dispatchEvent(new Event('click'));
			expect(entryContent.classList.contains('hidden')).toBe(false);
			expect(collapseButton.querySelector('i.iconexpand')).not.toBe(null);
			expect(collapseButton.title).toBe('legends_collapse_legend_entry');
		});

		it('toggles legend content when clicked on legend header', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo']);
			vi.spyOn(geoResourceServiceLegendMock, 'getLegendById').mockResolvedValue(
				new Legend('foo', 'foo-label', [[new LegendEntry(LegendEntryType.PDF_URL, 'pdf-url-data')]])
			);
			const panel = await setup({ legends: { active: ['foo'] } });
			const legendEntry = panel.shadowRoot.querySelector(`#legend-${hashCode('foo')}`);
			const entryContent = legendEntry.querySelector('.legend-entries-container');
			const collapseButton = legendEntry.querySelector('.legend-entry-collapse-button');
			const legendHeader = legendEntry.querySelector('.legend-content-header');

			legendHeader.dispatchEvent(new Event('click'));
			expect(entryContent.classList.contains('hidden')).toBe(true);
			expect(collapseButton.querySelector('i.iconexpand')).toBe(null);
			expect(collapseButton.title).toBe('legends_collapse_legend_entry');

			legendHeader.dispatchEvent(new Event('click'));
			expect(entryContent.classList.contains('hidden')).toBe(false);
			expect(collapseButton.querySelector('i.iconexpand')).not.toBe(null);
			expect(collapseButton.title).toBe('legends_collapse_legend_entry');
		});

		it('closes the legend panel tab', async () => {
			const panel = await setup({ legends: { active: ['foo'] } });
			const closeBtn = panel.shadowRoot.getElementById('close-legend-panel');

			setTab(TabIds.LEGEND);
			closeBtn.dispatchEvent(new Event('click'));

			expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
		});

		it('shows all legends expanded by default', async () => {
			const panel = await setup({ legends: { active: ['foo', 'bar', 'baz'] } });
			const expandOrCollapseBtn = panel.shadowRoot.getElementById('button_expand_or_collapse');

			expect(panel.shadowRoot.querySelectorAll('.legend-entries-container.hidden')).toHaveLength(0);
			expect(panel.shadowRoot.querySelectorAll('.legend-entries-container')).toHaveLength(3);
			expect(expandOrCollapseBtn.title).toBe('legends_panel_button_collapse_title');
			expect(expandOrCollapseBtn.label).toBe('legends_panel_button_collapse_label');
		});

		it('collapses or expands all active legends', async () => {
			const panel = await setup({ legends: { active: ['foo', 'bar', 'baz'] } });
			const expandOrCollapseBtn = panel.shadowRoot.getElementById('button_expand_or_collapse');
			const collapseFooEntryBtn = panel.shadowRoot.querySelector(`#legend-${hashCode('foo')} .legend-entry-collapse-button`);

			// Collapsed
			expandOrCollapseBtn.dispatchEvent(new Event('click'));
			expect(panel.shadowRoot.querySelectorAll('.legend-entries-container.hidden')).toHaveLength(3);
			expect(expandOrCollapseBtn.title).toBe('legends_panel_button_expand_title');
			expect(expandOrCollapseBtn.label).toBe('legends_panel_button_expand_label');

			// Expanded
			expandOrCollapseBtn.dispatchEvent(new Event('click'));
			expect(panel.shadowRoot.querySelectorAll('.legend-entries-container')).toHaveLength(3);
			expect(panel.shadowRoot.querySelectorAll('.legend-entries-container.hidden')).toHaveLength(0);
			expect(expandOrCollapseBtn.title).toBe('legends_panel_button_collapse_title');
			expect(expandOrCollapseBtn.label).toBe('legends_panel_button_collapse_label');

			// Collapsed with one expanded
			expandOrCollapseBtn.dispatchEvent(new Event('click'));
			collapseFooEntryBtn.dispatchEvent(new Event('click'));
			expect(expandOrCollapseBtn.title).toBe('legends_panel_button_expand_title');
			expect(expandOrCollapseBtn.label).toBe('legends_panel_button_expand_label');
			expect(panel.shadowRoot.querySelectorAll('.legend-entries-container.hidden')).toHaveLength(2);

			// Expanded while some entries are hidden
			expandOrCollapseBtn.dispatchEvent(new Event('click'));
			expect(panel.shadowRoot.querySelectorAll('.legend-entries-container')).toHaveLength(3);
			expect(panel.shadowRoot.querySelectorAll('.legend-entries-container.hidden')).toHaveLength(0);
			expect(expandOrCollapseBtn.title).toBe('legends_panel_button_collapse_title');
			expect(expandOrCollapseBtn.label).toBe('legends_panel_button_collapse_label');
		});

		it('clears all active legends', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'bar', 'baz']);
			const panel = await setup({ legends: { active: ['foo', 'bar', 'baz'] } });
			const addButton = panel.shadowRoot.getElementById('button_add_legends');
			const clearButton = panel.shadowRoot.getElementById('button_clear_legends');

			clearButton.dispatchEvent(new Event('click'));
			await TestUtils.timeout(); // Wait for store to update

			expect(clearButton.classList.contains('hidden')).toBe(true);
			expect(addButton.classList.contains('hidden')).toBe(false);
			expect(panel.shadowRoot.querySelectorAll('.legend-entries-container')).toHaveLength(0);
			expect(store.getState().legends.active).toHaveLength(0);
		});

		it('adds all active legends', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'bar', 'baz']);
			const panel = await setup();
			const addButton = panel.shadowRoot.getElementById('button_add_legends');
			const clearButton = panel.shadowRoot.getElementById('button_clear_legends');

			addButton.dispatchEvent(new Event('click'));
			await TestUtils.timeout(); // Wait for store to update

			expect(panel.shadowRoot.querySelectorAll('.legend-entries-container')).toHaveLength(3);
			expect(addButton.classList.contains('hidden')).toBe(true);
			expect(clearButton.classList.contains('hidden')).toBe(false);
			expect(store.getState().legends.active).toHaveLength(3);
		});
	});

	describe('legend menu buttons', async () => {
		it('displays add button when legends are available but not all active', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'bar', 'baz']);
			const panel = await setup({ legends: { active: ['foo', 'bar'] } });
			const addButton = panel.shadowRoot.getElementById('button_add_legends');

			expect(addButton.label).toBe('legends_panel_add_all_legends_label');
			expect(addButton.title).toBe('legends_panel_add_all_legends_title');
			expect(addButton.classList.contains('hidden')).toBe(false);

			addLegends('baz');
			await TestUtils.timeout();

			expect(addButton.classList.contains('hidden')).toBe(true);
		});

		it('displays clear button when legends are available and at least one is active', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'bar', 'baz']);
			const panel = await setup({ legends: { active: ['foo'] } });
			const clearButton = panel.shadowRoot.getElementById('button_clear_legends');

			expect(clearButton.label).toBe('legends_panel_remove_all_legends_label');
			expect(clearButton.title).toBe('legends_panel_remove_all_legends_title');
			expect(clearButton.classList.contains('hidden')).toBe(false);

			removeLegend('foo');
			await TestUtils.timeout();

			expect(clearButton.classList.contains('hidden')).toBe(true);
		});

		it('hides all buttons when no legends are available', async () => {
			const panel = await setup();
			const buttonContainerItems = panel.shadowRoot.querySelectorAll('.main-button-container > *');

			expect(buttonContainerItems).toHaveLength(4);
			expect(panel.shadowRoot.querySelector('.main-button-container #button_add_legends').classList.contains('hidden')).toBe(true);
			expect(panel.shadowRoot.querySelector('.main-button-container #button_clear_legends').classList.contains('hidden')).toBe(true);
			expect(panel.shadowRoot.querySelector('.main-button-container #button_expand_or_collapse').classList.contains('hidden')).toBe(true);
			expect(panel.shadowRoot.querySelector('.main-button-container #legend-select').classList.contains('hidden')).toBe(true);
		});

		it('only display addButton and dropdown select when legends are available', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'bar', 'baz']);
			const panel = await setup();
			const buttonContainerItems = panel.shadowRoot.querySelectorAll('.main-button-container > *');

			expect(buttonContainerItems).toHaveLength(4);
			expect(panel.shadowRoot.querySelector('.main-button-container #button_add_legends').classList.contains('hidden')).toBe(false);
			expect(panel.shadowRoot.querySelector('.main-button-container #legend-select').classList.contains('hidden')).toBe(false);
			expect(panel.shadowRoot.querySelector('.main-button-container #button_clear_legends').classList.contains('hidden')).toBe(true);
			expect(panel.shadowRoot.querySelector('.main-button-container #button_expand_or_collapse').classList.contains('hidden')).toBe(true);
		});

		it('displays collapseOrExpandButton when at least one legend is active', async () => {
			vi.spyOn(geoResourceServiceLegendMock, 'available').mockReturnValue(['foo', 'bar', 'baz']);
			const panel = await setup({ legends: { active: ['foo'] } });
			const collapseOrExpandButton = panel.shadowRoot.getElementById('button_expand_or_collapse');

			expect(collapseOrExpandButton.classList.contains('hidden')).toBe(false);
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
