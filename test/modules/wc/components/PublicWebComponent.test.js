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

	describe('on window load', () => {
		it('fires a `ba-load` event', async () => {
			const spy = jasmine.createSpy();
			document.addEventListener(WcEvents.LOAD, spy);

			const element = await setup();
			// we 'manually' fire the load event of the iframe
			element._root.querySelector('iframe').dispatchEvent(new CustomEvent('load'));

			expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ bubbles: true }));
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
		// describe('when attribute changes', () => {
		// 	it('broadcasts valid changes throttles via Window: postMessage()', async () => {
		// 		const attributes = {
		// 			foo: 'bar'
		// 		};
		// 		attributes[QueryParameters.TOPIC] = 'topic';
		// 		const postMessageSpy = jasmine.createSpy();
		// 		const mockWindow = {
		// 			parent: {
		// 				postMessage: postMessageSpy,
		// 				addEventListener: () => {}
		// 			}
		// 		};
		// 		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		// 		const newTopic = 'topic42';
		// 		const expectedPayload = { source: jasmine.stringMatching(/^ba_/), v: '1', t: newTopic };
		// 		const element = await setup({}, attributes);
		// 		spyOn(element, '_validateAttributeValue').and.returnValue(true);

		// 		// await MutationObserver registration
		// 		await TestUtils.timeout();

		// 		element.setAttribute(QueryParameters.TOPIC, newTopic);
		// 		element.setAttribute(QueryParameters.TOPIC, newTopic);
		// 		element.setAttribute(QueryParameters.TOPIC, newTopic);

		// 		await TestUtils.timeout();

		// 		expect(postMessageSpy).toHaveBeenCalledOnceWith(expectedPayload, '*');
		// 	});

		// 	it('does NOT broadcasts when attribute check failed', async () => {
		// 		const attributes = {
		// 			foo: 'bar'
		// 		};
		// 		attributes[QueryParameters.TOPIC] = 'topic';
		// 		const postMessageSpy = jasmine.createSpy();
		// 		const mockWindow = {
		// 			parent: {
		// 				postMessage: postMessageSpy,
		// 				addEventListener: () => {}
		// 			}
		// 		};
		// 		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		// 		const newTopic = 'topic42';
		// 		const element = await setup({});
		// 		spyOn(element, '_validateAttributeValue').and.throwError('check failed');
		// 		const onErrorSpy = spyOn(global, 'onerror');

		// 		// await MutationObserver registration
		// 		await TestUtils.timeout();

		// 		element.setAttribute(QueryParameters.TOPIC, newTopic);
		// 		await TestUtils.timeout();

		// 		expect(onErrorSpy).toHaveBeenCalledTimes(1);
		// 		expect(postMessageSpy).not.toHaveBeenCalled();
		// 	});

		// 	it('does NOT broadcast when nothing was changed', async () => {
		// 		const attributes = {
		// 			foo: 'bar'
		// 		};
		// 		attributes[QueryParameters.TOPIC] = 'topic';
		// 		const postMessageSpy = jasmine.createSpy();
		// 		const mockWindow = {
		// 			parent: {
		// 				postMessage: postMessageSpy,
		// 				addEventListener: () => {}
		// 			}
		// 		};
		// 		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		// 		const element = await setup({}, attributes);

		// 		// await MutationObserver registration
		// 		await TestUtils.timeout();

		// 		element.setAttribute(QueryParameters.TOPIC, 'topic');

		// 		await TestUtils.timeout();

		// 		expect(postMessageSpy).not.toHaveBeenCalled();
		// 	});

		// 	it('does NOT broadcast invalid changes', async () => {
		// 		const attributes = {
		// 			foo: 'bar'
		// 		};
		// 		attributes[QueryParameters.TOPIC] = 'topic';
		// 		const postMessageSpy = jasmine.createSpy();
		// 		const mockWindow = {
		// 			parent: {
		// 				postMessage: postMessageSpy,
		// 				addEventListener: () => {}
		// 			}
		// 		};
		// 		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		// 		const element = await setup({}, attributes);

		// 		// await MutationObserver registration
		// 		await TestUtils.timeout();

		// 		element.setAttribute('foo', 'bar42');

		// 		await TestUtils.timeout();

		// 		expect(postMessageSpy).not.toHaveBeenCalled();
		// 	});
		// });

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

						await TestUtils.timeout();
						await TestUtils.timeout();

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

							await TestUtils.timeout();
							await TestUtils.timeout();

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

						await TestUtils.timeout();
						await TestUtils.timeout();

						expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ target: element, detail: { foo: 'bar' } }));
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

					await TestUtils.timeout();
					await TestUtils.timeout();

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

					await TestUtils.timeout();
					await TestUtils.timeout();

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
