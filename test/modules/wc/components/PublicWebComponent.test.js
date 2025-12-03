import { PublicWebComponent } from '../../../../src/modules/wc/components/PublicWebComponent';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { QueryParameters } from '../../../../src/domain/queryParameters';
import { positionReducer } from '../../../../src/store/position/position.reducer.js';
import { WcEvents } from '../../../../src/domain/wcEvents.js';

window.customElements.define(PublicWebComponent.tag, PublicWebComponent);

describe('PublicWebComponent', () => {
	const configService = {
		getValueAsPath: () => 'http://localhost:1234/'
	};
	const environmentService = {
		getWindow: () => window
	};
	const mapService = {
		getLocalProjectedSrid: () => 25832,
		getSrid: () => 3857
	};

	const setup = (state = {}, attributes = {}) => {
		const initialState = { ...state };

		TestUtils.setupStoreAndDi(initialState, { position: positionReducer });

		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('MapService', mapService);
		return TestUtils.render(PublicWebComponent.tag, {}, attributes);
	};

	const newMockWindow = () => {
		const eventListener = [];
		const mockWindow = {
			parent: {
				postMessage: (payload) => eventListener.forEach((fn) => fn({ data: payload })),
				addEventListener: (eventName, fn) => {
					if (eventName === 'message') {
						eventListener.push(fn);
					}
				}
			}
		};
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		return mockWindow;
	};

	describe('tag', () => {
		it('uses the correct tag', () => {
			expect(PublicWebComponent.tag).toBe('bayern-atlas');
		});
	});

	describe('class', () => {
		describe('ShadowRoot', () => {
			it('uses the correct tag', () => {
				expect(PublicWebComponent.tag).toBe('bayern-atlas');
			});
		});

		it('defines constant values', async () => {
			expect(PublicWebComponent.BROADCAST_THROTTLE_DELAY_MS).toBe(100);
		});

		describe('tag', () => {
			it('sets the mode to closed', () => {
				setup();
				expect(new PublicWebComponent().isShadowRootOpen()).toBeFalse();
			});
		});

		describe('constructor', () => {
			it('sets a default model', () => {
				setup();
				const element = new PublicWebComponent();

				expect(element.getModel()).toEqual({});
			});
		});
	});

	describe('properties', () => {
		it(`has a getter for ${QueryParameters.CENTER}`, async () => {
			const attributes = {};
			attributes[QueryParameters.CENTER] = '11,22';
			const element = await setup({}, attributes);
			expect(element.center).toEqual([11, 22]);
		});
		it(`has a getter for ${QueryParameters.ZOOM}`, async () => {
			const attributes = {};
			attributes[QueryParameters.ZOOM] = '10';
			const element = await setup({}, attributes);
			expect(element.zoom).toBe(10);
		});
		it(`has a getter for ${QueryParameters.ROTATION}`, async () => {
			const attributes = {};
			attributes[QueryParameters.ROTATION] = '1';
			const element = await setup({}, attributes);
			expect(element.rotation).toBe(1);
		});
		it(`has a getter for ${QueryParameters.LAYER}`, async () => {
			const attributes = {};
			attributes[QueryParameters.LAYER] = 'a,b';
			const element = await setup({}, attributes);
			expect(element.layers).toEqual(['a', 'b']);
		});
	});

	describe('when initialized', () => {
		it('renders an `iframe` and appends valid attribute as query parameters to its src-URL', async () => {
			const attributes = {
				foo: 'bar'
			};
			attributes[QueryParameters.TOPIC] = 'topic';
			const element = await setup({}, attributes);

			const iframeElement = element._root.querySelector('iframe');

			expect(iframeElement.src).toBe('http://localhost:1234/embed.html?t=topic');
			expect(iframeElement.width).toBe('100%');
			expect(iframeElement.height).toBe('100%');
			expect(iframeElement.loading).toBe('lazy');
			expect(iframeElement.getAttribute('frameborder')).toBe('0');
			expect(iframeElement.getAttribute('style')).toBe('border:0');
			expect(iframeElement.role).toBe('application');
			expect(iframeElement.name.startsWith('ba_')).toBeTrue();
		});

		it('checks the initial given attributes', async () => {
			const attributes = {
				foo: 'bar'
			};
			attributes[QueryParameters.TOPIC] = 'topic';
			const element = await setup({}, attributes);
			const checkAttributeValueSpy = spyOn(element, '_validateAttributeValue');

			element.onInitialize(); /**explicit call of  onInitialize() */

			expect(checkAttributeValueSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('synchronization with PublicWebComponentPlugin', () => {
		describe('methods', () => {
			describe('modifyView', () => {
				it('validates all input values', async () => {
					const element = await setup();

					expect(() => element.modifyView({ zoom: '8' })).toThrowError('"View.zoom" must be a number');
					expect(() => element.modifyView({ center: [123] })).toThrowError('"View.center" must be a coordinate');
					expect(() => element.modifyView({ rotation: '0.5' })).toThrowError('"View.rotation" must be a number');
				});

				it('broadcasts valid changes throttled via Window: postMessage()', async () => {
					const postMessageSpy = jasmine.createSpy();
					const mockWindow = {
						parent: {
							postMessage: postMessageSpy,
							addEventListener: () => {}
						}
					};
					spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
					const expectedPayload0 = {
						source: jasmine.stringMatching(/^ba_/),
						v: '1',
						modifyView: { zoom: 5, center: [11, 22], rotation: 0.42 }
					};
					const expectedPayload1 = {
						source: jasmine.stringMatching(/^ba_/),
						v: '1',
						modifyView: {}
					};
					const element = await setup();

					element.modifyView({ zoom: 5, center: [11, 22], rotation: 0.42 });
					element.modifyView();

					expect(postMessageSpy).toHaveBeenCalledTimes(2);
					expect(postMessageSpy).toHaveBeenCalledWith(expectedPayload0, '*');
					expect(postMessageSpy).toHaveBeenCalledWith(expectedPayload1, '*');
				});
			});

			describe('modifyLayer', () => {
				it('validates all input values', async () => {
					const element = await setup();

					expect(() => element.modifyLayer(123)).toThrowError('"layerId" must be a string');
					expect(() => element.modifyLayer('l', { opacity: '1' })).toThrowError('"AddLayerOptions.opacity" must be a number between 0 and 1');
					expect(() => element.modifyLayer('l', { opacity: 1.1 })).toThrowError('"AddLayerOptions.opacity" must be a number between 0 and 1');
					expect(() => element.modifyLayer('l', { opacity: -0.1 })).toThrowError('"AddLayerOptions.opacity" must be a number between 0 and 1');
					expect(() => element.modifyLayer('l', { visible: 'false' })).toThrowError('"AddLayerOptions.visible" must be a boolean');
					expect(() => element.modifyLayer('l', { zIndex: '1' })).toThrowError('"AddLayerOptions.zIndex" must be a number');
					expect(() => element.modifyLayer('l', { displayFeatureLabels: 'false' })).toThrowError(
						'"AddLayerOptions.displayFeatureLabels" must be a boolean'
					);
					expect(() => element.modifyLayer('l', { style: {} })).toThrowError(
						'"AddLayerOptions.style.baseColor" must be a valid hex color representation'
					);
					expect(() => element.modifyLayer('l', { style: {} })).toThrowError(
						'"AddLayerOptions.style.baseColor" must be a valid hex color representation'
					);
					expect(() => element.modifyLayer('l', { style: { baseColor: 'red' } })).toThrowError(
						'"AddLayerOptions.style.baseColor" must be a valid hex color representation'
					);
				});

				it('broadcasts valid changes throttled via Window: postMessage()', async () => {
					const postMessageSpy = jasmine.createSpy();
					const mockWindow = {
						parent: {
							postMessage: postMessageSpy,
							addEventListener: () => {}
						}
					};
					spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
					const expectedPayload0 = { source: jasmine.stringMatching(/^ba_/), v: '1', modifyLayer: { id: 'myLayerId0', options: { opacity: 0.5 } } };
					const expectedPayload1 = { source: jasmine.stringMatching(/^ba_/), v: '1', modifyLayer: { id: 'myLayerId1', options: {} } };
					const element = await setup();

					element.modifyLayer('myLayerId0', { opacity: 0.5 });
					element.modifyLayer('myLayerId1');

					expect(postMessageSpy).toHaveBeenCalledTimes(2);
					expect(postMessageSpy).toHaveBeenCalledWith(expectedPayload0, '*');
					expect(postMessageSpy).toHaveBeenCalledWith(expectedPayload1, '*');
				});
			});

			describe('addLayer', () => {
				it('validates all input values', async () => {
					const element = await setup();

					expect(() => element.addLayer(123)).toThrowError('"geoResourceIdOrData" must be a string');
					expect(() => element.addLayer('l', { opacity: '1' })).toThrowError('"AddLayerOptions.opacity" must be a number between 0 and 1');
					expect(() => element.addLayer('l', { opacity: 1.1 })).toThrowError('"AddLayerOptions.opacity" must be a number between 0 and 1');
					expect(() => element.addLayer('l', { opacity: -0.1 })).toThrowError('"AddLayerOptions.opacity" must be a number between 0 and 1');
					expect(() => element.addLayer('l', { visible: 'false' })).toThrowError('"AddLayerOptions.visible" must be a boolean');
					expect(() => element.addLayer('l', { zIndex: '1' })).toThrowError('"AddLayerOptions.zIndex" must be a number');
					expect(() => element.addLayer('l', { displayFeatureLabels: 'false' })).toThrowError(
						'"AddLayerOptions.displayFeatureLabels" must be a boolean'
					);
					expect(() => element.addLayer('l', { style: {} })).toThrowError(
						'"AddLayerOptions.style.baseColor" must be a valid hex color representation'
					);
					expect(() => element.addLayer('l', { style: {} })).toThrowError(
						'"AddLayerOptions.style.baseColor" must be a valid hex color representation'
					);
					expect(() => element.addLayer('l', { style: { baseColor: 'red' } })).toThrowError(
						'"AddLayerOptions.style.baseColor" must be a valid hex color representation'
					);
				});
				it('broadcasts valid changes throttled via Window: postMessage() and returns the layer id', async () => {
					const postMessageSpy = jasmine.createSpy();
					const mockWindow = {
						parent: {
							postMessage: postMessageSpy,
							addEventListener: () => {}
						}
					};
					spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
					const expectedPayload0 = {
						source: jasmine.stringMatching(/^ba_/),
						v: '1',
						addLayer: { id: jasmine.any(String), options: { geoResourceIdOrData: 'myGeoResourceId0', opacity: 0.5 } }
					};
					const expectedPayload1 = {
						source: jasmine.stringMatching(/^ba_/),
						v: '1',
						addLayer: { id: jasmine.any(String), options: { geoResourceIdOrData: 'myGeoResourceId1' } }
					};
					const element = await setup();

					const result0 = element.addLayer('myGeoResourceId0', { opacity: 0.5 });
					const result1 = element.addLayer('myGeoResourceId1');

					expect(postMessageSpy).toHaveBeenCalledTimes(2);
					expect(postMessageSpy).toHaveBeenCalledWith(expectedPayload0, '*');
					expect(postMessageSpy).toHaveBeenCalledWith(expectedPayload1, '*');
					expect(result0.startsWith('l_')).toBeTrue();
					expect(result1.startsWith('l_')).toBeTrue();
				});
			});

			describe('removeLayer', () => {
				it('broadcasts valid changes throttled via Window: postMessage()', async () => {
					const postMessageSpy = jasmine.createSpy();
					const mockWindow = {
						parent: {
							postMessage: postMessageSpy,
							addEventListener: () => {}
						}
					};
					spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
					const expectedPayload = { source: jasmine.stringMatching(/^ba_/), v: '1', removeLayer: { id: 'myLayerId' } };
					const element = await setup();

					element.removeLayer('myLayerId');

					expect(postMessageSpy).toHaveBeenCalledOnceWith(expectedPayload, '*');
				});
			});
		});

		describe('when message received', () => {
			describe('and target matches', () => {
				describe('and data addresses QueryParameters', () => {
					it('updates its attribute and fires an `ba-change` change', async () => {
						const mockWindow = newMockWindow();
						const attributes = {};
						attributes[QueryParameters.ZOOM] = 1;
						const element = await setup({}, attributes);
						const payload = {};
						payload[QueryParameters.ZOOM] = 2;
						const spy = jasmine.createSpy();
						element.addEventListener(WcEvents.CHANGE, spy);

						mockWindow.parent.postMessage({ target: element._iFrameId, v: '1', ...payload }, '*');

						expect(element.getAttribute(QueryParameters.ZOOM)).toBe(`${payload[QueryParameters.ZOOM]}`);
						expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ target: element, detail: { z: 2 } }));
					});
					describe('and data contains `silent` flag', () => {
						it('updates only its attribute but does NOT fire a `ba-change` change', async () => {
							const mockWindow = newMockWindow();
							const attributes = {};
							attributes[QueryParameters.ZOOM] = 1;
							const element = await setup({}, attributes);
							const payload = {};
							payload[QueryParameters.ZOOM] = 2;
							const spy = jasmine.createSpy();
							element.addEventListener(WcEvents.CHANGE, spy);

							mockWindow.parent.postMessage({ target: element._iFrameId, v: '1', ...payload, silent: true }, '*');

							expect(element.getAttribute(QueryParameters.ZOOM)).toBe(`${payload[QueryParameters.ZOOM]}`);
							expect(spy).not.toHaveBeenCalled();
						});
					});
				});

				describe('and data addresses WcEvents', () => {
					it('fires the specific `WcEvent` containing the correct payload', async () => {
						const mockWindow = newMockWindow();
						const element = await setup({});
						const payload = {};
						payload[WcEvents.FEATURE_SELECT] = { foo: 'bar' };
						const spy = jasmine.createSpy();
						element.addEventListener(WcEvents.FEATURE_SELECT, spy);

						mockWindow.parent.postMessage({ target: element._iFrameId, v: '1', ...payload }, '*');

						expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ target: element, detail: { foo: 'bar' }, bubbles: false }));
					});

					it('fires a `ba-load` event', async () => {
						const mockWindow = newMockWindow();
						const payload = {};
						payload[WcEvents.LOAD] = true;
						const spy = jasmine.createSpy();
						document.addEventListener(WcEvents.LOAD, spy);
						const element = await setup();

						mockWindow.parent.postMessage({ target: element._iFrameId, v: '1', ...payload }, '*');

						expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ bubbles: true }));
					});
				});
			});

			describe('and version does NOT match', () => {
				it('logs an error', async () => {
					const mockWindow = newMockWindow();
					const attributes = {};
					attributes[QueryParameters.ZOOM] = 1;
					const element = await setup({}, attributes);
					const payload = {};
					payload[QueryParameters.ZOOM] = 2;
					const errorSpy = spyOn(console, 'error');

					mockWindow.parent.postMessage({ target: element._iFrameId, v: '2', ...payload }, '*');

					expect(element.getAttribute(QueryParameters.ZOOM)).toBe(`${attributes[QueryParameters.ZOOM]}`);
					expect(errorSpy).toHaveBeenCalledOnceWith('Version 2 is not supported');
				});
			});

			describe('and target does NOT match', () => {
				it('does nothing', async () => {
					const mockWindow = newMockWindow();
					const attributes = {};
					attributes[QueryParameters.ZOOM] = 1;
					const element = await setup({}, attributes);
					const payload = {};
					payload[QueryParameters.ZOOM] = 2;

					mockWindow.parent.postMessage({ target: 'someOtherId', v: '1', ...payload }, '*');

					expect(element.getAttribute(QueryParameters.ZOOM)).toBe(`${attributes[QueryParameters.ZOOM]}`);
				});
			});
		});
	});

	describe('_validateAttributeValue', () => {
		it(`validates attribute "${QueryParameters.ZOOM}"`, async () => {
			const element = await setup({});

			expect(element._validateAttributeValue({ name: QueryParameters.ZOOM, value: '10' })).toBeTrue();
			expect(() => element._validateAttributeValue({ name: QueryParameters.ZOOM, value: 'foo' })).toThrowError('Attribute "z" must be a number');
		});
		it(`validates attribute "${QueryParameters.CENTER}"`, async () => {
			const element = await setup({});

			expect(element._validateAttributeValue({ name: QueryParameters.CENTER, value: '1,2' })).toBeTrue();
			expect(() => element._validateAttributeValue({ name: QueryParameters.CENTER, value: 'foo' })).toThrowError(
				'Attribute "c" must represent a coordinate (easting, northing)'
			);
		});
		it(`validates attribute "${QueryParameters.ROTATION}"`, async () => {
			const element = await setup({});

			expect(element._validateAttributeValue({ name: QueryParameters.ROTATION, value: '0.2' })).toBeTrue();
			expect(() => element._validateAttributeValue({ name: QueryParameters.ROTATION, value: '1,2' })).toThrowError('Attribute "r" must be a number');
		});
		it(`does NOT validates attribute "${QueryParameters.LAYER}"`, async () => {
			const element = await setup({});

			expect(element._validateAttributeValue({ name: QueryParameters.LAYER, value: 'some,thing' })).toBeTrue();
		});

		it(`validates attribute "${QueryParameters.EC_SRID}"`, async () => {
			const element = await setup({});

			expect(element._validateAttributeValue({ name: QueryParameters.EC_SRID, value: '3857' })).toBeTrue();
			expect(() => element._validateAttributeValue({ name: QueryParameters.EC_SRID, value: '1111' })).toThrowError(
				'Attribute "ec_srid" must be one of [4326,3857,25832]'
			);
		});
		it(`validates attribute "${QueryParameters.EC_GEOMETRY_FORMAT}"`, async () => {
			const element = await setup({});

			expect(element._validateAttributeValue({ name: QueryParameters.EC_GEOMETRY_FORMAT, value: 'kml' })).toBeTrue();
			expect(() => element._validateAttributeValue({ name: QueryParameters.EC_GEOMETRY_FORMAT, value: 'myFoo' })).toThrowError(
				'Attribute "ec_geometry_format" must be one of [ewkt,geojson,kml,gpx]'
			);
		});
	});
});
