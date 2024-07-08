import { WcEvents } from '../../../../src/domain/wcEvents';
import { PublicComponent } from '../../../../src/modules/public/components/PublicComponent';
import { TestUtils } from '../../../test-utils';
import { setFileSaveResult } from '../../../../src/store/draw/draw.action';
import { drawReducer } from '../../../../src/store/draw/draw.reducer';
import { featureInfoReducer } from '../../../../src/store/featureInfo/featureInfo.reducer';
import { MediaType } from '../../../../src/domain/mediaTypes';
import { addFeatureInfoItems, registerQuery, resolveQuery, startRequest } from '../../../../src/store/featureInfo/featureInfo.action';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { setIsDarkSchema } from '../../../../src/store/media/media.action';

window.customElements.define(PublicComponent.tag, PublicComponent);

describe('PublicComponent', () => {
	const setup = (state = {}) => {
		const initialState = {
			media: {
				darkSchema: false
			},
			...state
		};

		TestUtils.setupStoreAndDi(initialState, { draw: drawReducer, featureInfo: featureInfoReducer, media: createNoInitialStateMediaReducer() });
		return TestUtils.render(PublicComponent.tag);
	};

	describe('tag', () => {
		it('sets a default model', () => {
			expect(PublicComponent.tag).toBe('bayern-atlas');
		});
	});

	describe('constructor', () => {
		it('sets a default model', () => {
			setup();
			const element = new PublicComponent();

			expect(element.getModel()).toEqual({});
		});
	});

	describe('when initialized', () => {
		it('renders 11 top level ba-components within a closed shadow root', async () => {
			const element = await setup();

			// null as the shadow root is closed
			expect(element.shadowRoot).toBeNull();
			expect(element._root.querySelectorAll('ba-dnd-import-panel')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-ol-map')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-view-larger-map-chip')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-draw-tool')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-map-button-container')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-footer')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-nonembedded-hint')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-theme-provider')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-notification-panel')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-map-context-menu')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-activate-map-button')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-iframe-container')).toHaveSize(1);
		});

		it('adds the correct stylesheets', async () => {
			const element = await setup();

			//element.shadowRoot.styleSheets[0] --> main.css
			//element.shadowRoot.styleSheets[1] --> mvuElement.css
			//element.shadowRoot.styleSheets[2] --> publicComponent.css
			expect(element._root.styleSheets.length).toBe(3);
			expect(element._root.styleSheets[2].cssRules.item(0).cssText).toContain('contain: layout;');
			expect(element._root.styleSheets[2].cssRules.item(0).cssText).toContain('display: block;');
			expect(element._root.styleSheets[2].cssRules.item(0).cssText).toContain('width: 100%');
			expect(element._root.styleSheets[2].cssRules.item(0).cssText).toContain('height: 400px');
		});

		it('adds the correct CSS class', async () => {
			let element = await setup({
				media: {
					darkSchema: true
				}
			});

			expect(element.classList.contains('dark-theme')).toBeTrue();
			expect(element.classList.contains('light-theme')).toBeFalse();

			element = await setup({
				media: {
					darkSchema: false
				}
			});

			expect(element.classList.contains('dark-theme')).toBeFalse();
			expect(element.classList.contains('light-theme')).toBeTrue();
		});
	});

	describe('when schema changes', () => {
		it('adds the correct CSS class', async () => {
			const element = await setup({
				media: {
					darkSchema: true
				}
			});

			expect(element.classList.contains('dark-theme')).toBeTrue();
			expect(element.classList.contains('light-theme')).toBeFalse();

			setIsDarkSchema(false);

			expect(element.classList.contains('dark-theme')).toBeFalse();
			expect(element.classList.contains('light-theme')).toBeTrue();
		});
	});

	describe('when a geometry is created', () => {
		it('fires a GEOMETRY_CHANGE event', async () => {
			const content = 'content';
			const expectedEventDetailConfiguration = {
				detail: { data: content, type: MediaType.KML }
			};

			const elementListener = jasmine.createSpy();
			const windowListener = jasmine.createSpy();
			const element = await setup();
			element.addEventListener(WcEvents.GEOMETRY_CHANGE, elementListener);
			window.addEventListener(WcEvents.GEOMETRY_CHANGE, windowListener);

			setFileSaveResult({ content, fileSaveResult: { adminId: 'adminId', fileId: 'fileId' } });

			expect(elementListener).toHaveBeenCalledOnceWith(jasmine.objectContaining(expectedEventDetailConfiguration));
			expect(windowListener).toHaveBeenCalledOnceWith(jasmine.objectContaining(expectedEventDetailConfiguration));
		});
	});

	describe('when a geometry is null', () => {
		it('fires a GEOMETRY_CHANGE event', async () => {
			const expectedEventDetailConfiguration = {
				detail: null
			};

			const elementListener = jasmine.createSpy();
			const windowListener = jasmine.createSpy();
			const element = await setup();
			element.addEventListener(WcEvents.GEOMETRY_CHANGE, elementListener);
			window.addEventListener(WcEvents.GEOMETRY_CHANGE, windowListener);

			setFileSaveResult(null);

			expect(elementListener).toHaveBeenCalledOnceWith(jasmine.objectContaining(expectedEventDetailConfiguration));
			expect(windowListener).toHaveBeenCalledOnceWith(jasmine.objectContaining(expectedEventDetailConfiguration));
		});
	});

	describe('when a vector feature is selected', () => {
		it('fires a FEATURE_SELECT event', async () => {
			const coordinate = [21, 42];
			const queryId = 'queryId';
			const expectedEventDetailConfiguration = {
				detail: {
					coordinate,
					items: [
						{
							title: 'title0',
							data: 'geometry0',
							type: MediaType.GeoJSON
						},
						{
							title: 'title1',
							data: 'geometry1',
							type: MediaType.GeoJSON
						}
					]
				}
			};
			const elementListener = jasmine.createSpy();
			const windowListener = jasmine.createSpy();
			const element = await setup();
			element.addEventListener(WcEvents.FEATURE_SELECT, elementListener);
			window.addEventListener(WcEvents.FEATURE_SELECT, windowListener);

			startRequest(coordinate);
			registerQuery(queryId);
			addFeatureInfoItems([
				{ title: 'title0', content: 'content0', geometry: 'geometry0' },
				{ title: 'title1', content: 'content1', geometry: 'geometry1' },
				{ title: 'title2', content: 'content2', geometry: null }
			]);
			resolveQuery(queryId);

			expect(elementListener).toHaveBeenCalledOnceWith(jasmine.objectContaining(expectedEventDetailConfiguration));
			expect(windowListener).toHaveBeenCalledOnceWith(jasmine.objectContaining(expectedEventDetailConfiguration));
		});
	});
});
