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

	const setup = (state = {}, attributes = {}) => {
		const initialState = { ...state };

		TestUtils.setupStoreAndDi(initialState, { position: positionReducer });

		$injector.registerSingleton('ConfigService', configService).registerSingleton('EnvironmentService', environmentService);
		return TestUtils.render(PublicWebComponent.tag, {}, attributes);
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
	});

	describe('synchronization with PublicWebComponentPlugin', () => {
		describe('when attribute changes', () => {
			it('broadcasts valid changes throttles via Window: postMessage()', async () => {
				const attributes = {
					foo: 'bar'
				};
				attributes[QueryParameters.TOPIC] = 'topic';
				const postMessageSpy = jasmine.createSpy();
				const mockWindow = {
					parent: {
						postMessage: postMessageSpy,
						addEventListener: () => {}
					}
				};
				spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
				const newTopic = 'topic42';
				const expectedPayload = { source: jasmine.stringMatching(/^ba_/), v: '1', t: newTopic };
				const element = await setup({}, attributes);

				// await MutationObserver registration
				await TestUtils.timeout();

				element.setAttribute(QueryParameters.TOPIC, newTopic);
				element.setAttribute(QueryParameters.TOPIC, newTopic);
				element.setAttribute(QueryParameters.TOPIC, newTopic);

				await TestUtils.timeout();

				expect(postMessageSpy).toHaveBeenCalledOnceWith(expectedPayload, '*');
			});

			it('does NOT broadcast when nothing was changed', async () => {
				const attributes = {
					foo: 'bar'
				};
				attributes[QueryParameters.TOPIC] = 'topic';
				const postMessageSpy = jasmine.createSpy();
				const mockWindow = {
					parent: {
						postMessage: postMessageSpy,
						addEventListener: () => {}
					}
				};
				spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
				const element = await setup({}, attributes);

				// await MutationObserver registration
				await TestUtils.timeout();

				element.setAttribute(QueryParameters.TOPIC, 'topic');

				await TestUtils.timeout();

				expect(postMessageSpy).not.toHaveBeenCalled();
			});

			it('does NOT broadcast invalid changes', async () => {
				const attributes = {
					foo: 'bar'
				};
				attributes[QueryParameters.TOPIC] = 'topic';
				const postMessageSpy = jasmine.createSpy();
				const mockWindow = {
					parent: {
						postMessage: postMessageSpy,
						addEventListener: () => {}
					}
				};
				spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
				const element = await setup({}, attributes);

				// await MutationObserver registration
				await TestUtils.timeout();

				element.setAttribute('foo', 'bar42');

				await TestUtils.timeout();

				expect(postMessageSpy).not.toHaveBeenCalled();
			});
		});

		describe('when message received', () => {
			describe('and target matches', () => {
				it('updates its attribute and fires an `ba-change` change', async () => {
					const attributes = {};
					attributes[QueryParameters.ZOOM] = 1;
					const element = await setup({}, attributes);
					const payload = {};
					payload[QueryParameters.ZOOM] = 2;
					const spy = jasmine.createSpy();
					element.addEventListener(WcEvents.CHANGE, spy);

					window.parent.postMessage({ target: element._iFrameId, v: '1', ...payload }, '*');

					await TestUtils.timeout();
					await TestUtils.timeout();

					expect(element.getAttribute(QueryParameters.ZOOM)).toBe(`${payload[QueryParameters.ZOOM]}`);
					expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ target: element, detail: { z: 2 } }));
				});
			});

			describe('and version does NOT match', () => {
				it('logs an error', async () => {
					const attributes = {};
					attributes[QueryParameters.ZOOM] = 1;
					const element = await setup({}, attributes);
					const payload = {};
					payload[QueryParameters.ZOOM] = 2;
					const errorSpy = spyOn(console, 'error');

					window.parent.postMessage({ target: element._iFrameId, v: '2', ...payload }, '*');

					await TestUtils.timeout();
					await TestUtils.timeout();

					expect(element.getAttribute(QueryParameters.ZOOM)).toBe(`${attributes[QueryParameters.ZOOM]}`);
					expect(errorSpy).toHaveBeenCalledOnceWith('Version 2 is not supported');
				});
			});

			describe('and target does NOT match', () => {
				it('does nothing', async () => {
					const attributes = {};
					attributes[QueryParameters.ZOOM] = 1;
					const element = await setup({}, attributes);
					const payload = {};
					payload[QueryParameters.ZOOM] = 2;

					window.parent.postMessage({ target: 'someOtherId', v: '1', ...payload }, '*');

					await TestUtils.timeout();
					await TestUtils.timeout();

					expect(element.getAttribute(QueryParameters.ZOOM)).toBe(`${attributes[QueryParameters.ZOOM]}`);
				});
			});
		});
	});
});
