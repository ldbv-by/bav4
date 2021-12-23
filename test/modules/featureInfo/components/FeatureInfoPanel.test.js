/* eslint-disable no-undef */
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { FeatureInfoPanel, TEMPORARY_FEATURE_HIGHLIGHT_ID } from '../../../../src/modules/featureInfo/components/FeatureInfoPanel';
import { featureInfoReducer } from '../../../../src/store/featureInfo/featureInfo.reducer';
import { AbstractMvuContentPanel } from '../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel.js';
import { html } from 'lit-html';
import { addFeatureInfoItems, FeatureInfoGeometryTypes } from '../../../../src/store/featureInfo/featureInfo.action.js';
import { highlightReducer } from '../../../../src/store/highlight/highlight.reducer.js';
import { HighlightFeatureTypes, HighlightGeometryTypes } from '../../../../src/store/highlight/highlight.action.js';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';

window.customElements.define(FeatureInfoPanel.tag, FeatureInfoPanel);



describe('FeatureInfoPanel', () => {

	let store;
	const setup = (state) => {

		const initialState = {
			media: {
				portrait: false
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			featureInfo: featureInfoReducer, highlight: highlightReducer,
			media: createNoInitialStateMediaReducer()
		});
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(FeatureInfoPanel.tag);
	};

	describe('class', () => {

		it('inherits from AbstractContentPanel', async () => {

			const element = await setup();

			expect(element instanceof AbstractMvuContentPanel).toBeTrue();
		});
	});


	describe('when instantiated', () => {

		it('has a model containing default values', async () => {
			await setup();
			const model = new FeatureInfoPanel().getModel();

			expect(model).toEqual({
				featureInfoData: [],
				isPortrait: false
			});
		});
	});

	describe('when initialized', () => {

		describe('and no featureInfo items are available', () => {

			it('renders a close icon-button, a container and no items', async () => {

				const element = await setup();
				const button = element.shadowRoot.querySelector('ba-icon');
				const container = element.shadowRoot.querySelectorAll('.container');
				const items = element.shadowRoot.querySelectorAll('.ba-section');

				expect(button.title).toBe('featureInfo_close_button');
				expect(container).toHaveSize(1);
				expect(items).toHaveSize(0);
			});
		});

		describe('and featureInfo items are available', () => {

			it('renders a close icon-button, a container and no items', async () => {

				const element = await setup({
					featureInfo: {
						//content may be a String or a TemplateResult
						current: [{ title: 'title0', content: 'content0' }, { title: 'title1', content: html`content1` }]
					}
				});
				const button = element.shadowRoot.querySelector('ba-icon');
				const container = element.shadowRoot.querySelectorAll('.container');
				const items = element.shadowRoot.querySelectorAll('.ba-section');
				const header = element.shadowRoot.querySelector('.ba-list-item__main-text');

				expect(button.title).toBe('featureInfo_close_button');
				expect(container).toHaveSize(1);
				expect(items).toHaveSize(2);
				expect(items.item(0).querySelector('.ba-list-item__text').innerText).toBe('title0');
				expect(items.item(0).querySelector('.collapse-content').innerText).toBe('content0');
				expect(items.item(1).querySelector('.ba-list-item__text').innerText).toBe('title1');
				expect(items.item(1).querySelector('.collapse-content').innerText).toBe('content1');
				expect(header.innerText).toBe('featureInfo_header');
			});
		});
	});

	describe('responsive layout ', () => {

		it('layouts for landscape', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);
			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
		});

		it('layouts for portrait', async () => {
			const state = {
				media: {
					portrait: true
				}
			};

			const element = await setup(state);
			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
		});

	});

	describe('when initialized', () => {

		describe('and no featureInfo items are available', () => {

			it('renders a close icon-button, a container and no items', async () => {

				const element = await setup();
				const button = element.shadowRoot.querySelector('ba-icon');
				const container = element.shadowRoot.querySelectorAll('.container');
				const items = element.shadowRoot.querySelectorAll('.ba-section');

				expect(button.title).toBe('featureInfo_close_button');
				expect(container).toHaveSize(1);
				expect(items).toHaveSize(0);
			});
		});

		describe('and featureInfo items are available', () => {

			it('renders a close icon-button, a container and no items', async () => {

				const element = await setup({
					featureInfo: {
						current: [{ title: 'title0', content: 'content0' }, { title: 'title1', content: html`content1` }]
					}
				});
				const button = element.shadowRoot.querySelector('ba-icon');
				const container = element.shadowRoot.querySelectorAll('.container');
				const items = element.shadowRoot.querySelectorAll('.ba-section');

				expect(button.title).toBe('featureInfo_close_button');
				expect(container).toHaveSize(1);
				expect(items).toHaveSize(2);
			});
		});
	});

	describe('when featureInfo items are added', () => {

		it('renders renders the items', async () => {

			const element = await setup();

			addFeatureInfoItems({ title: 'title0', content: 'content0' });
			addFeatureInfoItems({ title: 'title1', content: 'content1' });

			const items = element.shadowRoot.querySelectorAll('.ba-section');
			expect(items).toHaveSize(2);
		});
	});

	describe('events', () => {

		describe('on mouse enter', () => {

			it('sets a temporary highlight feature', async () => {
				const geoJson = { 'type': 'Point', 'coordinates': [21, 42, 0] };
				const element = await setup({
					featureInfo: {
						current: [{
							title: 'title0',
							content: 'content0',
							geometry: { data: geoJson, geometryType: FeatureInfoGeometryTypes.GEOJSON }
						}]
					}
				});

				const target = element.shadowRoot.querySelector('button.ba-list-item__header');
				target.dispatchEvent(new Event('mouseenter'));

				expect(store.getState().highlight.features).toHaveSize(1);
				expect(store.getState().highlight.features[0].data.geometry).toBe(geoJson);
				expect(store.getState().highlight.features[0].data.geometryType).toBe(HighlightGeometryTypes.GEOJSON);
				expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureTypes.TEMPORARY);
				expect(store.getState().highlight.features[0].id).toBe(TEMPORARY_FEATURE_HIGHLIGHT_ID);
			});

			it('does nothing when featureInfo contains no geometry', async () => {
				const element = await setup({
					featureInfo: {
						current: [{
							title: 'title0',
							content: 'content0'
						}]
					}
				});

				const target = element.shadowRoot.querySelector('button.ba-list-item__header');
				target.dispatchEvent(new Event('mouseenter'));

				expect(store.getState().highlight.features).toHaveSize(0);
			});
		});

		describe('on mouse leave', () => {

			it('removes a temporary highlight feature', async () => {
				const geoJson = { 'type': 'Point', 'coordinates': [21, 42, 0] };
				const element = await setup({
					featureInfo: {
						current: [{
							title: 'title0',
							content: 'content0',
							geometry: { data: geoJson, geometryType: FeatureInfoGeometryTypes.GEOJSON }
						}]
					},
					highlight: {
						features: [{ id: TEMPORARY_FEATURE_HIGHLIGHT_ID, data: { geometry: geoJson, geometryType: HighlightGeometryTypes.GEOJSON } }]
					}
				});

				const target = element.shadowRoot.querySelector('button.ba-list-item__header');
				target.dispatchEvent(new Event('mouseleave'));

				expect(store.getState().highlight.features).toHaveSize(0);
			});
		});

		describe('when clear button clicked', () => {

			it('clear the featureInfo in store', async () => {

				const element = await setup({
					featureInfo: {
						current: [{ title: 'title0', content: 'content0' }, { title: 'title1', content: html`content1` }]
					}
				});
				const iconButton = element.shadowRoot.querySelector('ba-icon');

				iconButton.click();

				expect(store.getState().featureInfo.current).toEqual([]);
			});
		});
	});
});
