import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { measurementReducer } from '../../../../../src/modules/map/store/measurement.reducer';
import { MeasureToolContent } from '../../../../../src/modules/toolbox/components/measureToolContent/MeasureToolContent';
import { Checkbox } from '../../../../../src/modules/commons/components/checkbox/Checkbox';
import { EventLike } from '../../../../../src/utils/storeUtils';
import { Icon } from '../../../../../src/modules/commons/components/icon/Icon';
import { modalReducer } from '../../../../../src/modules/modal/store/modal.reducer';
import { AbstractToolContent } from '../../../../../src/modules/toolbox/components/toolContainer/AbstractToolContent';

window.customElements.define(MeasureToolContent.tag, MeasureToolContent);
window.customElements.define(Checkbox.tag, Checkbox);
window.customElements.define(Icon.tag, Icon);

describe('MeasureToolContent', () => {
	let store;
	const windowMock = {
		matchMedia() { }
	};

	const defaultState = {
		measurement: {
			active: true,
			statistic: { length: 0, area: 0 },
			fileSaveResult: null,
			reset: null,
			remove: null,
		}
	};
	const shareServiceMock = {
		copyToClipboard() {
			return Promise.resolve();
		},
		encodeState() {
			return 'http://this.is.a.url?forTestCase';
		}
	};
	const urlServiceMock = {
		shorten() {
			return Promise.resolve('http://foo');
		}
	};
	const setup = async (state = defaultState, config = {}) => {

		const { embed = false, isTouch = false } = config;


		class MockClass {
			constructor() {
				this.get = 'I\'m a UnitsService.';
			}

			formatDistance(distance, decimals) {
				return new Intl.NumberFormat('de-DE', { maximumSignificantDigits: decimals }).format(distance) + ' m';
			}

			formatArea(area, decimals) {
				return new Intl.NumberFormat('de-DE', { maximumSignificantDigits: decimals }).format(area) + ' m²';
			}
		}

		store = TestUtils.setupStoreAndDi(state, { measurement: measurementReducer, modal: modalReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock,
				isTouch: () => isTouch

			}).registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('UrlService', urlServiceMock)
			.register('UnitsService', MockClass);
		return TestUtils.render(MeasureToolContent.tag);
	};

	describe('class', () => {

		it('inherits from AbstractToolContent', async () => {

			const element = await setup();

			expect(element instanceof AbstractToolContent).toBeTrue();
		});
	});

	describe('when initialized', () => {

		it('builds the tool', async () => {
			const element = await setup();
			expect(element._tool).toBeTruthy();
		});

		it('displays the finish-button', async () => {
			const state = {
				measurement: {
					active: true,
					mode: 'draw',
					statistic: { length: 42, area: 21 },
					reset: null,
					remove: null,
					finish: null
				}
			};
			const element = await setup(state);

			expect(element._tool).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish')).toBeTruthy();
		});

		it('finishes the measurement', async () => {
			const state = {
				measurement: {
					active: true,
					mode: 'draw',
					statistic: { length: 42, area: 21 },
					reset: null,
					remove: null,
					finish: null
				}
			};
			const element = await setup(state);
			const finishButton = element.shadowRoot.querySelector('#finish');

			finishButton.click();

			expect(store.getState().measurement.finish).toBeInstanceOf(EventLike);
		});


		it('resets the measurement', async () => {
			const state = {
				measurement: {
					active: true,
					mode: 'draw',
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null,
				}
			};
			const element = await setup(state);
			const resetButton = element.shadowRoot.querySelector('#startnew');

			resetButton.click();

			expect(store.getState().measurement.reset).toBeInstanceOf(EventLike);
		});

		it('removes the selected measurement', async () => {
			const state = {
				measurement: {
					active: true,
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null,
				}
			};
			const element = await setup(state);
			const removeButton = element.shadowRoot.querySelector('#remove');

			removeButton.click();

			expect(store.getState().measurement.remove).toBeInstanceOf(EventLike);
		});

		it('shows the measurement statistics', async () => {
			const state = {
				measurement: {
					active: true,
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null,
				}
			};
			const element = await setup(state);
			const valueSpan = element.shadowRoot.querySelector('.prime-text-value');
			const unitSpan = element.shadowRoot.querySelector('.prime-text-unit');

			expect(valueSpan).toBeTruthy();
			expect(unitSpan).toBeTruthy();
			expect(valueSpan.textContent).toBe('42');
			expect(unitSpan.textContent).toBe('m');
		});

		it('copies the measurement values to the clipboard', async (done) => {
			const state = {
				measurement: {
					active: true,
					statistic: { length: 42, area: 2 },
					reset: null,
					remove: null,
				}
			};
			const element = await setup(state);
			const copySpy = spyOn(shareServiceMock, 'copyToClipboard').and.callFake(() => Promise.resolve());

			const copyDistanceElement = element.shadowRoot.querySelector('.tool-container__text-item .close');
			const copyAreaElement = element.shadowRoot.querySelector('.tool-container__text-item.area.is-area .close');

			copyDistanceElement.click();
			copyAreaElement.click();

			setTimeout(() => {
				expect(copyDistanceElement).toBeTruthy();
				expect(copyAreaElement).toBeTruthy();
				expect(copySpy).toHaveBeenCalledTimes(2);
				expect(copySpy).toHaveBeenCalledWith('42 m');
				expect(copySpy).toHaveBeenCalledWith('2 m²');
				done();
			});

		});

		it('logs a warning when copyToClipboard fails', async (done) => {
			const state = {
				measurement: {
					active: true,
					statistic: { length: 42, area: 2 },
					reset: null,
					remove: null,
				}
			};
			const copySpy = spyOn(shareServiceMock, 'copyToClipboard').and.callFake(() => Promise.reject());
			const warnSpy = spyOn(console, 'warn');
			const element = await setup(state);
			element._shareUrls = { adminId: 'foobar', fileId: 'barbaz' };
			element.render();
			const copyToClipboardButton = element.shadowRoot.querySelector('.tool-container__text-item .close');
			copyToClipboardButton.click();

			setTimeout(() => {
				expect(copySpy).toHaveBeenCalledWith('42 m');
				expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
				done();
			});

		});


		it('shows the measurement sub-text', async () => {
			const state = {
				measurement: {
					active: true,
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null,
				}
			};
			const element = await setup(state);
			const subTextElement = element.shadowRoot.querySelector('.sub-text');


			expect(subTextElement).toBeTruthy();
			expect(subTextElement.textContent).toBe('toolbox_drawTool_info');
		});

		it('shows the measurement button', async () => {
			const state = {
				measurement: {
					active: true,
					statistic: { length: 42, area: 0 },
					fileSaveResult: { adminId: 'a_fooBar', fileId: 'f_fooBar' },
					reset: null,
					remove: null,
				}
			};
			const element = await setup(state);
			const shareButton = element.shadowRoot.querySelector('#share');

			expect(shareButton).toBeTruthy();
		});

		it('shows NOT the measurement share-container for invalid fileSaveResult', async () => {
			const state = {
				measurement: {
					active: true,
					statistic: { length: 42, area: 0 },
					fileSaveResult: { adminId: 'a_fooBar', fileId: null },
					reset: null,
					remove: null,
				}
			};
			const element = await setup(state);
			const shareButton = element.shadowRoot.querySelector('#share');

			expect(shareButton).toBeFalsy();
		});

		it('opens the modal with shortened share-urls on click', async (done) => {
			const state = {
				measurement: {
					active: true,
					statistic: { length: 42, area: 0 },
					fileSaveResult: { adminId: 'a_fooBar', fileId: 'f_fooBar' },
					reset: null,
					remove: null,
				}
			};
			const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.resolve('http://shorten.foo'));
			const element = await setup(state);

			const shareButton = element.shadowRoot.querySelector('#share');
			shareButton.click();

			setTimeout(() => {
				expect(shareButton).toBeTruthy();
				expect(shortenerSpy).toHaveBeenCalledTimes(2);
				expect(store.getState().modal.title).toBe('toolbox_measureTool_share');
				done();
			});

		});

		it('logs a warning, when shortener fails', async (done) => {
			const state = {
				measurement: {
					active: true,
					statistic: { length: 42, area: 0 },
					fileSaveResult: { adminId: 'a_fooBar', fileId: 'f_fooBar' },
					reset: null,
					remove: null,
				}
			};
			const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.reject('not available'));
			const warnSpy = spyOn(console, 'warn');
			const element = await setup(state);

			const shareButton = element.shadowRoot.querySelector('#share');
			shareButton.click();

			setTimeout(() => {
				expect(shareButton).toBeTruthy();
				expect(shortenerSpy).toHaveBeenCalledTimes(2);
				expect(warnSpy).toHaveBeenCalledTimes(2);
				expect(warnSpy).toHaveBeenCalledWith('Could shortener-service is not working:', 'not available');
				done();
			});

		});

		describe('with touch-device', () => {
			const touchConfig = {
				embed: false,
				isTouch: true
			};
			const defaultMeasurementState = {
				active: true,
				mode: null,
				statistic: { length: 42, area: 0 },
				reset: null,
				remove: null,
			};

			it('shows the measurement sub-text for mode:active', async () => {
				const state = {
					measurement: { ...defaultMeasurementState, mode: 'active' }
				};
				const element = await setup(state, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('toolbox_measureTool_measure_active');
			});

			it('shows the measurement sub-text for mode:draw', async () => {
				const state = {
					measurement: { ...defaultMeasurementState, mode: 'draw' }
				};
				const element = await setup(state, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('toolbox_measureTool_measure_draw');
			});

			it('shows the measurement sub-text for mode:modify', async () => {
				const state = {
					measurement: { ...defaultMeasurementState, mode: 'modify' }
				};
				const element = await setup(state, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('toolbox_measureTool_measure_modify');
			});

			it('shows the measurement sub-text for mode:select', async () => {
				const state = {
					measurement: { ...defaultMeasurementState, mode: 'select' }
				};
				const element = await setup(state, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('toolbox_measureTool_measure_select');
			});
		});
	});
});