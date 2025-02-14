import { GeometryType } from '../../../../src/domain/geometryTypes';
import { $injector } from '../../../../src/injection';
import { Icon } from '../../../../src/modules/commons/components/icon/Icon';
import { EMPTY_GEOMETRY_STATISTIC, GeometryInfo } from '../../../../src/modules/info/components/geometryInfo/GeometryInfo';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(GeometryInfo.tag, GeometryInfo);

describe('GeometryInfo', () => {
	const coordinateServiceMock = {
		stringify() {},
		toLonLat() {}
	};

	const shareServiceMock = {
		copyToClipboard() {}
	};
	let store;
	const setup = () => {
		const state = {
			notifications: {
				notification: null
			}
		};

		store = TestUtils.setupStoreAndDi(state, { notifications: notificationReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('UnitsService', {
				formatDistance: (distance) => {
					return { value: distance, localizedValue: distance, unit: 'm' };
				},

				formatArea: (area) => {
					return { value: area, localizedValue: area, unit: ' m²' };
				},
				formatAngle: (angle) => {
					return { value: angle, localizedValue: angle, unit: '°' };
				}
			});
		return TestUtils.render(GeometryInfo.tag);
	};

	describe('class', () => {
		it('inherits from MvuElement', async () => {
			const element = await setup();

			expect(element instanceof MvuElement).toBeTrue();
		});
	});

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new GeometryInfo().getModel();

			expect(model).toEqual({
				statistic: {
					geometryType: null,
					coordinate: null,
					azimuth: null,
					length: null,
					area: null
				}
			});
		});
	});

	describe('when initialized', () => {
		it('renders nothing for default stats (empty)', async () => {
			const emptyStatistic = EMPTY_GEOMETRY_STATISTIC;

			const element = await setup();
			element.statistic = emptyStatistic;

			expect(element.shadowRoot.querySelector('.stats-container')).toBeFalsy();
		});

		it('renders point stats', async () => {
			const pointStatistic = { geometryType: GeometryType.POINT, coordinate: [21, 42], azimuth: null, length: null, area: null };

			const element = await setup();
			element.statistic = pointStatistic;

			expect(element.shadowRoot.querySelector('.stats-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-point')).toBeTruthy();
			expect(element.shadowRoot.querySelector('ba-coordinate-info')).toBeTruthy();
		});

		it('renders the items with line stats', async () => {
			const element = await setup();
			element.statistic = { geometryType: GeometryType.LINE, coordinate: null, azimuth: null, length: 42, area: null };

			expect(element.shadowRoot.querySelector('.stats-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-line-azimuth')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.stats-line-length')).toBeTruthy();

			element.statistic = { geometryType: GeometryType.LINE, coordinate: null, azimuth: 42, length: 42, area: null };

			expect(element.shadowRoot.querySelector('.stats-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-line-azimuth')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-line-length')).toBeTruthy();
		});

		it('renders the items with polygon stats', async () => {
			const element = await setup();
			element.statistic = { geometryType: GeometryType.POLYGON, coordinate: null, azimuth: null, length: 42, area: 42 };

			expect(element.shadowRoot.querySelector('.stats-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-polygon-length')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-polygon-area')).toBeTruthy();
		});

		it('renders the items with smallest polygon stats', async () => {
			const element = await setup();
			element.statistic = { geometryType: GeometryType.POLYGON, coordinate: null, azimuth: null, length: 0.001, area: 0 };

			expect(element.shadowRoot.querySelector('.stats-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-polygon-length')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-polygon-area')).toBeTruthy();
		});

		it('copies a line azimuth to the clipboard', async () => {
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			const element = await setup();
			element.statistic = { geometryType: GeometryType.LINE, coordinate: null, azimuth: 84, length: 42, area: 0 };

			const copyIcon = element.shadowRoot.querySelector(`.stats-line-azimuth ${Icon.tag}`);
			copyIcon.click();

			expect(copyToClipboardMock).toHaveBeenCalledWith(84);
			await TestUtils.timeout();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(`"${84}" info_coordinateInfo_clipboard_success`);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('copies a line length to the clipboard', async () => {
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			const element = await setup();
			element.statistic = { geometryType: GeometryType.LINE, coordinate: null, azimuth: null, length: 42, area: 0 };

			const copyIcon = element.shadowRoot.querySelector(`.stats-line-length ${Icon.tag}`);
			copyIcon.click();

			expect(copyToClipboardMock).toHaveBeenCalledWith(42);
			await TestUtils.timeout();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(`"${42}" info_coordinateInfo_clipboard_success`);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('copies a polygon length to the clipboard', async () => {
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			const element = await setup();
			element.statistic = { geometryType: GeometryType.POLYGON, coordinate: null, azimuth: null, length: 42, area: 21 };

			const copyIcon = element.shadowRoot.querySelector(`.stats-polygon-length ${Icon.tag}`);
			copyIcon.click();

			expect(copyToClipboardMock).toHaveBeenCalledWith(42);
			await TestUtils.timeout();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(`"${42}" info_coordinateInfo_clipboard_success`);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('copies a polygon area to the clipboard', async () => {
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			const element = await setup();
			element.statistic = { geometryType: GeometryType.POLYGON, coordinate: null, azimuth: null, length: 42, area: 21 };

			const copyIcon = element.shadowRoot.querySelector(`.stats-polygon-area ${Icon.tag}`);
			copyIcon.click();

			expect(copyToClipboardMock).toHaveBeenCalledWith(21);
			await TestUtils.timeout();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(`"${21}" info_coordinateInfo_clipboard_success`);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('fires a notification and logs a warn statement when Clipboard API is not available and disables all copyToClipboard buttons', async () => {
			spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.reject(new Error('something got wrong')));
			const warnSpy = spyOn(console, 'warn');
			const element = await setup();
			element.statistic = { geometryType: GeometryType.POLYGON, coordinate: null, azimuth: null, length: 42, area: 21 };

			const copyIcon = element.shadowRoot.querySelector(`.stats-polygon-area ${Icon.tag}`);
			copyIcon.click();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('info_coordinateInfo_clipboard_error');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
		});
	});
});
