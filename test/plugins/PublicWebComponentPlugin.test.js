import { QueryParameters } from '../../src/domain/queryParameters.js';
import { $injector } from '../../src/injection/index.js';
import { PublicWebComponentPlugin } from '../../src/plugins/PublicWebComponentPlugin';
import { changeZoom } from '../../src/store/position/position.action.js';
import { positionReducer } from '../../src/store/position/position.reducer.js';
import { TestUtils } from '../test-utils.js';

describe('PublicWebComponentPlugin', () => {
	const environmentService = {
		isEmbeddedAsWC: () => true,
		getWindow: () => window
	};

	const mapServiceMock = {
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {}
	};

	const setup = (initialState = {}) => {
		const store = TestUtils.setupStoreAndDi(initialState, {
			position: positionReducer
		});
		$injector.registerSingleton('EnvironmentService', environmentService).registerSingleton('MapService', mapServiceMock);

		return store;
	};

	describe('when observed s-o-s changes', () => {
		const runTest = async (store, payload, action, expectExecution = true, disabledBroadcasting = false) => {
			const postMessageSpy = jasmine.createSpy();
			const mockWindow = {
				parent: {
					postMessage: postMessageSpy,
					addEventListener: () => {}
				}
			};
			const iframeId = 'iframeId';
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			const instanceUnderTest = new PublicWebComponentPlugin();
			await instanceUnderTest.register(store);
			instanceUnderTest._disabledBroadcasting = disabledBroadcasting;
			spyOn(instanceUnderTest, '_getIframeId').and.returnValue(iframeId);

			action();

			const expectedPayload = { target: iframeId, v: '1', ...payload };

			expectExecution ? expect(postMessageSpy).toHaveBeenCalledOnceWith(expectedPayload, '*') : expect(postMessageSpy).not.toHaveBeenCalled();
		};

		describe('and the App is NOT embedded as web component', () => {
			it('does nothing', async () => {
				const store = setup();
				spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(false);
				const payload = {};
				payload[QueryParameters.ZOOM] = 2;

				runTest(store, payload, () => changeZoom(2), false);
			});
		});

		describe('and the broadcasting is disabled', () => {
			it('does nothing', async () => {
				const store = setup({
					positionReducer: {
						zoom: 1
					}
				});
				const payload = {};
				payload[QueryParameters.ZOOM] = 2;

				runTest(store, payload, () => changeZoom(2), false, true);
			});
		});

		describe('> `position.zoom`', () => {
			it('broadcasts new new value via window: postMessage()', async () => {
				const store = setup({
					positionReducer: {
						zoom: 1
					}
				});
				const payload = {};
				payload[QueryParameters.ZOOM] = 2;

				runTest(store, payload, () => changeZoom(2));
			});
		});
	});

	describe('when message received', () => {
		describe('and source matches', () => {
			const runTest = async (store, payload) => {
				const iframeId = 'iframeId';
				const instanceUnderTest = new PublicWebComponentPlugin();
				await instanceUnderTest.register(store);
				spyOn(instanceUnderTest, '_getIframeId').and.returnValue(iframeId);

				window.parent.postMessage({ source: iframeId, v: '1', ...payload }, '*');

				await TestUtils.timeout();
			};

			describe('> `position.zoom`', () => {
				it('updates the correct s-o-s property', async () => {
					const store = setup();
					const payload = {};
					payload[QueryParameters.ZOOM] = 2;

					await runTest(store, payload);

					expect(store.getState().position.zoom).toBe(2);
				});
			});
		});

		describe('and version does NOT match', () => {
			it('logs an error', async () => {
				const store = setup();
				const payload = {};
				payload[QueryParameters.ZOOM] = 2;
				const errorSpy = spyOn(console, 'error');
				const iframeId = 'iframeId';
				spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(true);
				const instanceUnderTest = new PublicWebComponentPlugin();
				await instanceUnderTest.register(store);
				spyOn(instanceUnderTest, '_getIframeId').and.returnValue(iframeId);

				window.parent.postMessage({ source: iframeId, v: '2', ...payload }, '*');

				await TestUtils.timeout();

				expect(store.getState().position.zoom).not.toBe(2);
				expect(errorSpy).toHaveBeenCalledWith('Version 2 is not supported');
			});
		});
	});
});
