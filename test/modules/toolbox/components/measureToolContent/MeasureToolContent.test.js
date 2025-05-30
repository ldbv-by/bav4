import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { MeasureToolContent } from '../../../../../src/modules/toolbox/components/measureToolContent/MeasureToolContent';
import { EventLike } from '../../../../../src/utils/storeUtils';
import { AbstractToolContent } from '../../../../../src/modules/toolbox/components/toolContainer/AbstractToolContent';
import { modalReducer } from '../../../../../src/store/modal/modal.reducer';
import { measurementReducer } from '../../../../../src/store/measurement/measurement.reducer';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { isString } from '../../../../../src/utils/checks';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../../src/utils/markup';
import { elevationProfileReducer } from '../../../../../src/store/elevationProfile/elevationProfile.reducer';
import { fileStorageReducer } from '../../../../../src/store/fileStorage/fileStorage.reducer.js';
import { setData } from '../../../../../src/store/fileStorage/fileStorage.action.js';
import { Switch } from '../../../../../src/modules/commons/components/switch/Switch';

window.customElements.define(MeasureToolContent.tag, MeasureToolContent);
window.customElements.define(Switch.tag, Switch);

describe('MeasureToolContent', () => {
	let store;
	const windowMock = {
		matchMedia() {}
	};

	const defaultState = {
		measurement: {
			active: true,
			statistic: { length: null, area: null },
			displayRuler: true,
			mode: null,
			reset: null,
			remove: null
		},
		shared: {
			termsOfUseAcknowledged: false
		}
	};

	const geoResourceServiceMock = {
		async init() {},
		all() {},
		byId() {}
	};
	const shareServiceMock = {
		copyToClipboard() {
			return Promise.resolve();
		},
		encodeState() {
			return 'http://this.is.a.url?forTestCase';
		}
	};
	const setup = async (state = defaultState, config = {}) => {
		const { embed = false, isTouch = false } = config;

		class MockClass {
			constructor() {
				this.get = "I'm a UnitsService.";
			}

			formatDistance(distance, decimals) {
				if (isString(distance)) {
					return { value: distance, localizedValue: `localized_${distance}`, unit: '?' };
				}
				return {
					value: distance,
					localizedValue: `localized_${new Intl.NumberFormat('de-DE', { maximumSignificantDigits: decimals }).format(distance)}`,
					unit: 'm'
				};
			}

			formatArea(area, decimals) {
				return {
					value: area,
					localizedValue: `localized_${new Intl.NumberFormat('de-DE', { maximumSignificantDigits: decimals }).format(area)}`,
					unit: 'm²'
				};
			}

			formatAngle(angle, decimals) {
				return {
					value: angle,
					localizedValue: `localized_${new Intl.NumberFormat('de-DE', { maximumSignificantDigits: decimals }).format(angle)}`,
					unit: '°'
				};
			}
		}

		store = TestUtils.setupStoreAndDi(state, {
			measurement: measurementReducer,
			modal: modalReducer,
			notifications: notificationReducer,
			elevationProfile: elevationProfileReducer,
			fileStorage: fileStorageReducer
		});
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock,
				isTouch: () => isTouch
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
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
		it('has a model with default values', async () => {
			await setup();
			const model = new MeasureToolContent().getModel();

			expect(model).toEqual({ statistic: { length: null, area: null }, displayRuler: null, mode: null, storedContent: null });
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

			expect(element.shadowRoot.querySelector('#finish')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish').label).toBe('toolbox_measureTool_finish');
			expect(element.shadowRoot.querySelector('#finish').title).toBe('toolbox_measureTool_finish_title');
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
			expect(resetButton.title).toBe('toolbox_measureTool_start_new_title');
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
			expect(removeButton.title).toBe('');
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
			expect(removeButton.title).toBe('');
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
			const labelWithUnitSpans = element.shadowRoot.querySelectorAll('.prime-text-label');

			expect(valueSpans.length).toBe(2);
			expect(valueSpans[0].textContent).toBe('localized_42');
			expect(labelWithUnitSpans[0].textContent.trim()).toBe('toolbox_measureTool_stats_length (m):');
			expect(valueSpans[1].textContent).toBe('localized_0');
			expect(labelWithUnitSpans[1].textContent.trim()).toBe('toolbox_measureTool_stats_area (m²):');
		});

		it('shows the empty measurement statistics', async () => {
			const state = {
				measurement: {
					statistic: null,
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const valueSpans = element.shadowRoot.querySelectorAll('.prime-text-value');
			const labelWithUnitSpans = element.shadowRoot.querySelectorAll('.prime-text-label');
			const areaElement = element.shadowRoot.querySelector('.is-area');

			expect(valueSpans.length).toBe(2);
			expect(labelWithUnitSpans.length).toBe(2);
			expect(valueSpans[0].textContent).toBe('localized_0');
			expect(labelWithUnitSpans[0].textContent.trim()).toBe('toolbox_measureTool_stats_length (m):');
			expect(valueSpans[1].textContent).toBe('localized_0');
			expect(labelWithUnitSpans[1].textContent.trim()).toBe('toolbox_measureTool_stats_area (m²):');
			expect(areaElement).toBeFalsy();
		});

		it('shows selectable measurement values', async () => {
			// HINT: the existence of the behavior (user select text) is driven by css-classes specified in main.css and mvuElement.css.
			// All elements are not selectable by default, but can be activated with the 'selectable' class.
			const cssClass = 'selectable';
			const state = {
				measurement: {
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const valueSpans = element.shadowRoot.querySelectorAll('.prime-text-value');

			expect([...valueSpans].every((span) => span.classList.contains(cssClass))).toBeTrue();
		});

		it('contains test-id attributes', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelector('#span-distance-value').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#span-area-value').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#remove').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('contains the elevation profile chip', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('ba-profile-chip')).toHaveSize(1);
		});

		it('contains the share data chip', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('ba-share-data-chip')).toHaveSize(1);
		});

		it('contains the export vector data chip', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('ba-export-vector-data-chip')).toHaveSize(1);
		});

		it('shows the export vector data chip with exportData', async () => {
			const exportData = '<kml/>';
			const state = {
				measurement: {
					statistic: { length: 42, area: 0 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			setData(exportData);
			const chipElement = element.shadowRoot.querySelector('ba-export-vector-data-chip');

			expect(chipElement.exportData).toBe(exportData);
		});

		it('shows only the length measurement statistics', async () => {
			const state = {
				measurement: {
					statistic: { length: 42, area: null },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const valueSpans = element.shadowRoot.querySelectorAll('.prime-text-value');
			const labelWithUnitSpans = element.shadowRoot.querySelectorAll('.prime-text-label');
			const areaElement = element.shadowRoot.querySelector('.is-area');

			expect(valueSpans.length).toBe(2);
			expect(labelWithUnitSpans.length).toBe(2);
			expect(valueSpans[0].textContent).toBe('localized_42');
			expect(labelWithUnitSpans[0].textContent.trim()).toBe('toolbox_measureTool_stats_length (m):');
			expect(areaElement).toBeFalsy();
		});

		it('copies the measurement length value to the clipboard', async () => {
			const localizedLength = 'localized_42';
			const state = {
				measurement: {
					statistic: { length: 42, area: 2 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').withArgs(localizedLength).and.returnValue(Promise.resolve());

			const copyDistanceElement = element.shadowRoot.querySelector('.tool-container__text-item .close');
			copyDistanceElement.click();

			await TestUtils.timeout();
			expect(copyDistanceElement).toBeTruthy();
			expect(copyToClipboardMock).toHaveBeenCalledWith(localizedLength);
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(
				'toolbox_measureTool_clipboard_measure_distance_notification_text toolbox_clipboard_success'
			);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('copies the measurement area value to the clipboard', async () => {
			const localizedArea = 'localized_2';
			const state = {
				measurement: {
					statistic: { length: 42, area: 2 },
					reset: null,
					remove: null
				}
			};
			const element = await setup(state);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').withArgs(localizedArea).and.returnValue(Promise.resolve());

			const copyAreaElement = element.shadowRoot.querySelector('.tool-container__text-item.area.is-area .close');
			copyAreaElement.click();

			await TestUtils.timeout();
			expect(copyAreaElement).toBeTruthy();
			expect(copyToClipboardMock).toHaveBeenCalledWith(localizedArea);
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(
				'toolbox_measureTool_clipboard_measure_area_notification_text toolbox_clipboard_success'
			);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('toggles the ruler style', async () => {
			const element = await setup();

			expect(store.getState().measurement.displayRuler).toBeTrue();

			const toggleElement = element.shadowRoot.querySelector('.display-ruler-toggle ba-switch');
			toggleElement.click();

			expect(store.getState().measurement.displayRuler).toBeFalse();
		});

		it('logs a warning when copyToClipboard fails', async () => {
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

			await TestUtils.timeout();
			expect(copySpy).toHaveBeenCalledWith('localized_42');
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe('toolbox_clipboard_error');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
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

			it('shows no measurement sub-text for mode:[null]', async () => {
				const state = {
					measurement: { ...defaultMeasurementState, mode: null }
				};
				const element = await setup(state, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('');
			});
		});
	});
});
