import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { MeasureToolContent } from '../../../../../src/modules/toolbox/components/measureToolContent/MeasureToolContent';
import { Checkbox } from '../../../../../src/modules/commons/components/checkbox/Checkbox';
import { EventLike } from '../../../../../src/utils/storeUtils';
import { Icon } from '../../../../../src/modules/commons/components/icon/Icon';
import { AbstractToolContent } from '../../../../../src/modules/toolbox/components/toolContainer/AbstractToolContent';
import { modalReducer } from '../../../../../src/store/modal/modal.reducer';
import { sharedReducer } from '../../../../../src/store/shared/shared.reducer';
import { measurementReducer } from '../../../../../src/store/measurement/measurement.reducer';
import { ShareButton } from '../../../../../src/modules/toolbox/components/shareButton/ShareButton';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { isString } from '../../../../../src/utils/checks';

window.customElements.define(ShareButton.tag, ShareButton);
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
			statistic: { length: null, area: null },
			fileSaveResult: null,
			reset: null,
			remove: null
		},
		shared: {
			termsOfUseAcknowledged: false,
			fileSaveResult: null
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
				if (isString(distance)) {
					return distance;
				}
				return new Intl.NumberFormat('de-DE', { maximumSignificantDigits: decimals }).format(distance) + ' m';
			}

			formatArea(area, decimals) {
				return new Intl.NumberFormat('de-DE', { maximumSignificantDigits: decimals }).format(area) + ' m²';
			}
		}

		store = TestUtils.setupStoreAndDi(state, { measurement: measurementReducer, modal: modalReducer, shared: sharedReducer, notifications: notificationReducer });
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

			expect(element.shadowRoot.querySelector('#finish')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish').label).toBe('toolbox_drawTool_finish');
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
					mode: 'draw',
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const resetButton = element.shadowRoot.querySelector('#startnew');

			resetButton.click();
			expect(resetButton.label).toBe('toolbox_measureTool_start_new');
			expect(store.getState().measurement.reset).toBeInstanceOf(EventLike);
		});

		it('removes the selected measurement', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null,
					mode: 'modify'
				}
			};
			const element = await setup(state);
			const removeButton = element.shadowRoot.querySelector('#remove');

			removeButton.click();
			expect(removeButton.label).toBe('toolbox_measureTool_delete_measure');
			expect(store.getState().measurement.remove).toBeInstanceOf(EventLike);
		});

		it('deletes the last drawn point of measurement', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: 3 },
					mode: 'draw',
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const removeButton = element.shadowRoot.querySelector('#remove');

			removeButton.click();
			expect(removeButton.label).toBe('toolbox_measureTool_delete_point');
			expect(store.getState().measurement.remove).toBeInstanceOf(EventLike);
		});

		it('shows the measurement statistics', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const valueSpans = element.shadowRoot.querySelectorAll('.prime-text-value');
			const unitSpans = element.shadowRoot.querySelectorAll('.prime-text-unit');

			expect(valueSpans.length).toBe(2);
			expect(unitSpans.length).toBe(2);
			expect(valueSpans[0].textContent).toBe('42');
			expect(unitSpans[0].textContent).toBe('m');
			expect(valueSpans[1].textContent).toBe('0');
			expect(unitSpans[1].textContent).toBe('m²');
		});

		it('shows only the lenght measurement statistics', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: null },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const valueSpans = element.shadowRoot.querySelectorAll('.prime-text-value');
			const unitSpans = element.shadowRoot.querySelectorAll('.prime-text-unit');
			const areaElement = element.shadowRoot.querySelector('.is-area');

			expect(valueSpans.length).toBe(2);
			expect(unitSpans.length).toBe(2);
			expect(valueSpans[0].textContent).toBe('42');
			expect(unitSpans[0].textContent).toBe('m');
			expect(areaElement).toBeFalsy();
		});

		it('shows question mark on ambigues unit-strings', async () => {
			const state = {
				measurement: {
					statistic: { length: '42 m m', area: null },
					reset: null,
					remove: null
				}
			};

			const element = await setup(state);
			const valueSpans = element.shadowRoot.querySelectorAll('.prime-text-value');
			const unitSpans = element.shadowRoot.querySelectorAll('.prime-text-unit');

			expect(valueSpans.length).toBe(2);
			expect(unitSpans.length).toBe(2);
			expect(valueSpans[0].textContent).toBe('42');
			expect(unitSpans[0].textContent).toBe('?');
		});

		it('copies the measurement length value to the clipboard', async (done) => {
			const length = '42 m';
			const state = {
				measurement: {
					statistic: { length: 42, area: 2 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').withArgs(length).and.returnValue(Promise.resolve());

			const copyDistanceElement = element.shadowRoot.querySelector('.tool-container__text-item .close');
			copyDistanceElement.click();

			setTimeout(() => {
				expect(copyDistanceElement).toBeTruthy();
				expect(copyToClipboardMock).toHaveBeenCalledWith(length);
				//check notification
				expect(store.getState().notifications.latest.payload.content).toBe('toolbox_measureTool_clipboard_measure_distance_notification_text toolbox_clipboard_success');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
				done();
			});
		});

		it('copies the measurement area value to the clipboard', async (done) => {
			const area = '2 m²';
			const state = {
				measurement: {
					statistic: { length: 42, area: 2 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').withArgs(area).and.returnValue(Promise.resolve());

			const copyAreaElement = element.shadowRoot.querySelector('.tool-container__text-item.area.is-area .close');
			copyAreaElement.click();

			setTimeout(() => {
				expect(copyAreaElement).toBeTruthy();
				expect(copyToClipboardMock).toHaveBeenCalledWith(area);
				//check notification
				expect(store.getState().notifications.latest.payload.content).toBe('toolbox_measureTool_clipboard_measure_area_notification_text toolbox_clipboard_success');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
				done();
			});
		});

		it('logs a warning when copyToClipboard fails', async (done) => {
			const state = {
				measurement: {
					statistic: { length: 42, area: 2 },
					reset: null,
					remove: null
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
				//check notification
				expect(store.getState().notifications.latest.payload.content).toBe('toolbox_clipboard_error');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
				done();
			});

		});


		it('shows the measurement sub-text', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const subTextElement = element.shadowRoot.querySelector('.sub-text');


			expect(subTextElement).toBeTruthy();
			expect(subTextElement.textContent).toBe('');
		});

		it('shows the measurement share-button', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: 0 },
					fileSaveResult: { adminId: 'a_fooBar', fileId: 'f_fooBar' },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const shareButton = element.shadowRoot.querySelector('ba-share-button');

			expect(shareButton).toBeTruthy();
		});

		describe('with touch-device', () => {
			const touchConfig = {
				embed: false,
				isTouch: true
			};
			const defaultMeasurementState = {
				mode: null,
				statistic: { length: 42, area: 0 },
				reset: null,
				remove: null
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
