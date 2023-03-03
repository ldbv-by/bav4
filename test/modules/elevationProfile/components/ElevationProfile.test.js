import { $injector } from '../../../../src/injection/index.js';
import {
	Default_Selected_Attribute,
	ElevationProfile,
	SlopeType,
	SoterSlopeClasses
} from '../../../../src/modules/elevationProfile/components/ElevationProfile.js';
import { elevationProfileReducer } from '../../../../src/store/elevationProfile/elevationProfile.reducer.js';
import { updateCoordinates } from '../../../../src/store/elevationProfile/elevationProfile.action.js';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer.js';

import { TestUtils } from '../../../test-utils.js';
import { setIsDarkSchema } from '../../../../src/store/media/media.action.js';
import { HighlightFeatureType } from '../../../../src/store/highlight/highlight.action.js';
import { highlightReducer } from '../../../../src/store/highlight/highlight.reducer.js';
import { fromLonLat } from 'ol/proj.js';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer.js';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action.js';

window.customElements.define(ElevationProfile.tag, ElevationProfile);

describe('ElevationProfile', () => {
	const sumUp = 1480.8;
	const sumUpAfterToLocaleStringEn = '1,480.8 m';
	// const sumUpAfterToLocaleStringDe = '1.480,8 m';

	const sumDown = 1668.6;
	const sumDownAfterToLocaleStringEn = '1,668.6 m';
	// const sumDownAfterToLocaleStringDe = '1.668,6 m';

	const verticalHeight = 50;
	const highestPoint = 50;
	const lowestPoint = 0;
	const linearDistance = 5000;
	const linearDistanceAfterUnitsServiceEn = '5.0 km';
	// const linearDistanceAfterUnitsServiceDe = '5,0 km';

	const _profile = {
		elevations: [
			{
				dist: 0,
				z: 0,
				e: 40,
				n: 50
			},
			{
				dist: 1,
				z: 10,
				e: 41,
				n: 51
			},
			{
				dist: 2,
				z: 20,
				e: 42,
				n: 52
			},
			{
				dist: 3,
				z: 30,
				e: 43,
				n: 53
			},
			{
				dist: 4,
				z: 40,
				e: 44,
				n: 54
			},
			{
				dist: 5,
				z: 50,
				e: 45,
				n: 55
			}
		],
		stats: {
			sumUp: sumUp,
			sumDown: sumDown,
			verticalHeight: verticalHeight,
			highestPoint: highestPoint,
			lowestPoint: lowestPoint,
			linearDistance: linearDistance
		},
		attrs: [
			{
				id: 'slope',
				prefix: '~',
				unit: '%',
				values: [
					[0, 1, 1],
					[2, 3, 20],
					[4, 4, 40],
					[5, 5, 1]
				]
			},
			{
				id: 'surface',
				values: [
					[0, 1, 'asphalt'],
					[2, 5, 'gravel']
				]
			}
		]
	};

	const _profileSlopeSteep = {
		elevations: [
			{
				dist: 0,
				z: 0,
				e: 40,
				n: 50
			},
			{
				dist: 1,
				z: 10,
				e: 41,
				n: 51
			},
			{
				dist: 2,
				z: 20,
				e: 42,
				n: 52
			},
			{
				dist: 3,
				z: 30,
				e: 43,
				n: 53
			}
		],
		stats: {
			sumUp: sumUp,
			sumDown: sumDown,
			verticalHeight: verticalHeight,
			highestPoint: highestPoint,
			lowestPoint: lowestPoint,
			linearDistance: linearDistance
		},
		attrs: [
			{
				id: 'slope',
				prefix: '~',
				unit: '%',
				values: [
					[0, 0, 1],
					[1, 3, 20]
				]
			},
			{
				id: 'surface',
				values: [
					[0, 1, 'asphalt'],
					[2, 3, 'gravel']
				]
			}
		]
	};

	const profile = () => {
		const newLocalProfile = JSON.parse(JSON.stringify(_profile));
		return newLocalProfile;
	};

	const profileSlopeSteep = () => {
		const newLocalProfile = JSON.parse(JSON.stringify(_profileSlopeSteep));
		return newLocalProfile;
	};

	const coordinateServiceMock = {
		stringify() {},
		toLonLat() {}
	};

	const elevationServiceMock = {
		getProfile() {}
	};

	const configService = {
		getValueAsPath: () => {}
	};

	const unitsServiceMock = {
		formatDistance: (distance) => {
			return distance > 100 ? (distance / 1000).toFixed(1) + ' km' : distance + ' m';
		}
	};

	const chart = {
		ctx: {
			createLinearGradient: () => {
				return { addColorStop: () => {} };
			}
		},
		chartArea: { left: 0, right: 100, width: 200 }
	};
	const altitudeData = profileSlopeSteep();

	let store;

	const setup = (state = {}) => {
		const initialState = {
			media: {
				darkSchema: false,
				portrait: false,
				minWidth: false
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			highlight: highlightReducer,
			media: createNoInitialStateMediaReducer(),
			elevationProfile: elevationProfileReducer,
			notifications: notificationReducer
		});

		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('ConfigService', configService)
			.registerSingleton('ElevationService', elevationServiceMock)
			.registerSingleton('UnitsService', unitsServiceMock);

		return TestUtils.renderAndLogLifecycle(ElevationProfile.tag);
	};

	describe('when using ElevationService', () => {
		const coordinates = [
			[0, 1],
			[2, 3]
		];
		it('logs an error when getProfile fails', async () => {
			const message = 'error message';
			const getProfileSpy = spyOn(elevationServiceMock, 'getProfile').and.rejectWith(new Error(message));
			const errorSpy = spyOn(console, 'error');
			const element = await setup();

			await element._getElevationProfile(coordinates);

			expect(getProfileSpy).toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledWith(new Error(message));
			expect(store.getState().notifications.latest.payload.content).toBe('elevationProfile_could_not_load');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
		});
	});

	describe('class', () => {
		it('defines constant values', async () => {
			expect(ElevationProfile.SLOPE_STEEP_THRESHOLD).toBe(2);
			expect(ElevationProfile.SLOPE_FLAT_COLOR_DARK).toBe('lime');
			expect(ElevationProfile.SLOPE_FLAT_COLOR_LIGHT).toBe('green');
			expect(ElevationProfile.SLOPE_STEEP_COLOR_DARK).toBe('red');
			expect(ElevationProfile.SLOPE_STEEP_COLOR_LIGHT).toBe('red');
			expect(ElevationProfile.BACKGROUND_COLOR_DARK).toBe('rgb(38, 74, 89)');
			expect(ElevationProfile.BACKGROUND_COLOR_LIGHT).toBe('#e3eef4');
			expect(ElevationProfile.BORDER_COLOR_DARK).toBe('rgb(9, 157, 220)');
			expect(ElevationProfile.BORDER_COLOR_LIGHT).toBe('#2c5a93');
			expect(ElevationProfile.DEFAULT_TEXT_COLOR_DARK).toBe('rgb(240, 243, 244)');
			expect(ElevationProfile.DEFAULT_TEXT_COLOR_LIGHT).toBe('rgb(92, 106, 112)');
			expect(ElevationProfile.HIGHLIGHT_FEATURE_ID).toBe('#elevationProfileHighlightFeatureId');
		});
	});

	describe('when instantiating the component', () => {
		it('expects the initial values of the model to be empty', async () => {
			// arrange
			await setup();
			const altitudeProfile = new ElevationProfile();

			// assert
			const initialModel = altitudeProfile.getModel();
			expect(initialModel).toEqual({
				profile: null,
				labels: null,
				data: null,
				selectedAttribute: Default_Selected_Attribute,
				darkSchema: null,
				distUnit: null,
				portrait: false,
				minWidth: false
			});
		});
	});

	describe('when initialized', () => {
		it('renders empty profile, if no coordinates are provided', async () => {
			// arrange
			const element = await setup();
			const chart = element._chart;
			const config = chart.config;
			const datasetZero = config.data.datasets[0];

			// assert
			expect(element.shadowRoot.children.length).toBe(3);
			expect(datasetZero.data).toEqual([]);
			expect(config.data.labels).toEqual([]);
		});

		it('renders the view when a profile is available', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				media: {
					darkSchema: true
				},
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			const chart = element._chart;
			const config = chart.config;
			const datasetZero = config.data.datasets[0];

			// assert
			expect(chart).not.toBeNull();
			// config
			expect(config.type).toBe('line');
			expect(config.options.responsive).toBe(true);
			expect(config.options.animation.duration).toBe(600);
			expect(config.options.animation.delay).toBe(300);
			expect(config.options.maintainAspectRatio).toBe(false);
			expect(config.options.events).toEqual(['pointermove', 'pointerup', 'mouseout']);
			expect(config.data.labels).toEqual([0, 1, 2, 3, 4, 5]);
			// config.options.scales.x
			expect(config.options.scales.x.type).toBe('linear');
			expect(config.options.scales.x.title.display).toBe(true);
			expect(config.options.scales.x.title.text).toBe('elevationProfile_distance [m]');
			expect(config.options.scales.x.title.color).toBe(ElevationProfile.DEFAULT_TEXT_COLOR);
			expect(config.options.scales.x.ticks.color).toBe(ElevationProfile.DEFAULT_TEXT_COLOR);
			// config.options.scales.y
			expect(config.options.scales.y.type).toBe('linear');
			expect(config.options.scales.y.title.display).toBe(true);
			expect(config.options.scales.y.title.text).toBe('elevationProfile_alt [m]');
			expect(config.options.scales.y.title.color).toBe(ElevationProfile.DEFAULT_TEXT_COLOR);
			expect(config.options.scales.y.ticks.color).toBe(ElevationProfile.DEFAULT_TEXT_COLOR);
			// config.options.plugins.title
			expect(config.options.plugins.title.align).toBe('end');
			expect(config.options.plugins.title.display).toBe(true);
			expect(config.options.plugins.title.text).toBe('elevationProfile_elevation_reference_system');
			expect(config.options.plugins.title.color).toBe(ElevationProfile.DEFAULT_TEXT_COLOR);
			// config.options.plugins.legend
			expect(config.options.plugins.legend.display).toBe(false);
			// config.options.plugins.tooltip
			expect(config.options.plugins.tooltip.displayColors).toBe(false);
			expect(config.options.plugins.tooltip.mode).toBe('index');
			expect(config.options.plugins.tooltip.intersect).toBe(false);
			expect(config.options.plugins.tooltip.callbacks.title).toEqual(jasmine.any(Function));
			expect(config.options.plugins.tooltip.callbacks.label).toEqual(jasmine.any(Function));

			expect(datasetZero.data).toEqual([0, 10, 20, 30, 40, 50]);
			expect(datasetZero.label).toBe('elevationProfile_elevation_profile');
			expect(element.shadowRoot.querySelectorAll('.chart-container canvas')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.profile__data')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.profile__box')).toHaveSize(6);
			const profile__box = element.shadowRoot.querySelectorAll('.profile__box');
			const attrs = element.shadowRoot.getElementById('attrs');
			expect(attrs.value).toBe('alt');
			expect(profile__box[0].title).toBe('elevationProfile_sumUp');
			const sumUpElement = element.shadowRoot.getElementById('route-elevation-chart-footer-sumUp');
			expect(sumUpElement.innerText).toBe(sumUpAfterToLocaleStringEn);
			expect(profile__box[1].title).toBe('elevationProfile_sumDown');
			const sumDownElement = element.shadowRoot.getElementById('route-elevation-chart-footer-sumDown');
			expect(sumDownElement.innerText).toBe(sumDownAfterToLocaleStringEn);
			expect(profile__box[2].title).toBe('elevationProfile_highestPoint');
			const verticalHeightElement = element.shadowRoot.getElementById('route-elevation-chart-footer-verticalHeight');
			expect(verticalHeightElement.innerText).toBe(verticalHeight + ' m');
			expect(profile__box[3].title).toBe('elevationProfile_lowestPoint');
			const highestPointElement = element.shadowRoot.getElementById('route-elevation-chart-footer-highestPoint');
			expect(highestPointElement.innerText).toBe(highestPoint + ' m');
			expect(profile__box[4].title).toBe('elevationProfile_verticalHeight');
			const lowestPointElement = element.shadowRoot.getElementById('route-elevation-chart-footer-lowestPoint');
			expect(lowestPointElement.innerText).toBe(lowestPoint + ' m');
			expect(profile__box[5].title).toBe('elevationProfile_linearDistance');
			const linearDistanceElement = element.shadowRoot.getElementById('route-elevation-chart-footer-linearDistance');
			expect(linearDistanceElement.innerText).toBe(linearDistanceAfterUnitsServiceEn);
		});
	});

	describe('when tooltip callback "title" is called', () => {
		const coordinates = [
			[0, 1],
			[2, 3]
		];
		it('returns a valid distance', async () => {
			// arrange
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				media: {
					darkSchema: true
				},
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			const config = element._chart.config;
			const tooltipItems = [{ parsed: { x: 1 }, label: 10 }];

			// act
			const titleRet = config.options.plugins.tooltip.callbacks.title(tooltipItems);

			// assert
			expect(titleRet).toBe('elevationProfile_distance: 10 m');
		});

		it('calls setCoordinates() with valid coordinates', async () => {
			// arrange
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				media: {
					darkSchema: true
				},
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});

			const config = element._chart.config;
			const setCoordinatesSpy = spyOn(element, 'setCoordinates');
			const tooltipItems = [{ parsed: { x: 1 }, label: 10 }];

			// act
			config.options.plugins.tooltip.callbacks.title(tooltipItems);

			// assert
			expect(setCoordinatesSpy).toHaveBeenCalled();
			expect(setCoordinatesSpy).toHaveBeenCalledWith([41, 51]);
		});
	});

	describe('when tooltip callback "label" is called', () => {
		const coordinates = [
			[0, 1],
			[2, 3]
		];
		it('returns a valid elevation', async () => {
			// arrange
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				media: {
					darkSchema: true
				},
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			const config = element._chart.config;
			const tooltipItem = { parsed: { x: 3 } };

			// act
			const labelRet = config.options.plugins.tooltip.callbacks.label(tooltipItem);

			// assert
			expect(labelRet).toBe('elevationProfile_alt: 30 m');
		});
	});

	describe('when tooltip callback "label" is called for attribute slope', () => {
		it('uses attributes prefix and unit', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			const altitudeData = profile();
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(altitudeData);
			const element = await setup({
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});

			const config = element._chart.config;
			const tooltipItem = { parsed: { x: 3 } };

			const attrs = element.shadowRoot.getElementById('attrs');
			attrs.value = 'slope';
			attrs.dispatchEvent(new Event('change'));
			const chart = element._chart;

			// act
			const labelRet = config.options.plugins.tooltip.callbacks.label(tooltipItem);
			element._getBorder(chart, altitudeData);

			// assert
			expect(labelRet).toEqual(['elevationProfile_alt: 30 m', 'elevationProfile_slope: ~ 20 %']);
		});
	});

	describe('when tooltip callback "label" is called for attribute surface', () => {
		fit('only shows the surface, no prefix or unit', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			const altitudeData = profile();
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(altitudeData);
			const element = await setup({
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});

			const config = element._chart.config;
			const tooltipItem = { parsed: { x: 3 } };

			const attrs = element.shadowRoot.getElementById('attrs');
			attrs.value = 'surface';
			attrs.dispatchEvent(new Event('change'));
			const chart = element._chart;

			// act
			const labelRet = config.options.plugins.tooltip.callbacks.label(tooltipItem);
			element._getBorder(chart, altitudeData);

			// assert
			expect(labelRet).toEqual(['elevationProfile_alt: 30 m', 'elevationProfile_surface: gravel']);
		});
	});

	describe('when _getBackground() is called', () => {
		it('returns a valid background for "selectedAttribute alt"', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			const altitudeData = profile();
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(altitudeData);
			const element = await setup({
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			const attrs = element.shadowRoot.getElementById('attrs');
			attrs.value = 'alt';
			attrs.dispatchEvent(new Event('change'));
			const chart = element._chart;

			// act
			const value = element._getBackground(chart, altitudeData);

			// assert
			expect(value).toBe('#e3eef4');
		});
	});

	describe('when _getBorder() is called', () => {
		it('executes the branch "slope" for "selectedAttribute slope"', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			const altitudeData = profile();
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(altitudeData);
			const element = await setup({
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			const attrs = element.shadowRoot.getElementById('attrs');
			attrs.value = 'slope';
			attrs.dispatchEvent(new Event('change'));
			const chart = element._chart;
			const slopeGradientSpy = spyOn(element, '_getSlopeGradient').and.callThrough();

			// act
			element._getBorder(chart, altitudeData);

			// assert
			expect(slopeGradientSpy).toHaveBeenCalled();
		});

		it('returns a gradient that ends in steep ', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			const altitudeData = profileSlopeSteep();
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(altitudeData);
			const element = await setup({
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			const attrs = element.shadowRoot.getElementById('attrs');
			attrs.value = 'slope';
			attrs.dispatchEvent(new Event('change'));
			const chart = element._chart;
			const slopeGradientSpy = spyOn(element, '_getSlopeGradient').and.callThrough();

			// act
			element._getBorder(chart, altitudeData);

			// assert
			expect(slopeGradientSpy).toHaveBeenCalled();
		});

		it('returns a gradient that uses SOTER-classification ', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			const altitudeData = profileSlopeSteep();
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(altitudeData);
			const element = await setup({
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});

			const gradientMock = { addColorStop: () => {} };
			const ctxMock = { createLinearGradient: () => gradientMock };
			const chartMock = { ctx: ctxMock, chartArea: { left: 1, right: 1, width: 1, height: 1 } };
			const gradientSpy = spyOn(gradientMock, 'addColorStop').and.callThrough();

			// act
			element._getSlopeGradient(chartMock, altitudeData);

			// assert
			expect(gradientSpy).toHaveBeenCalledWith(jasmine.any(Number), '#1f8a70');
			expect(gradientSpy).toHaveBeenCalledWith(jasmine.any(Number), '#d23600');
		});

		it('executes the branch "TextType" for "selectedAttribute surface"', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			const altitudeData = profile();
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(altitudeData);
			const element = await setup({
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			const attrs = element.shadowRoot.getElementById('attrs');
			attrs.value = 'surface';
			attrs.dispatchEvent(new Event('change'));
			const chart = element._chart;
			const textTypeGradientSpy = spyOn(element, '_getTextTypeGradient').and.callThrough();

			// act
			element._getBorder(chart, altitudeData);

			// assert
			expect(textTypeGradientSpy).toHaveBeenCalled();
		});

		it('returns a valid bordercolor for "selectedAttribute alt"', async () => {
			// arrange
			const element = await setup();
			const chart = element._chart;

			// act
			const value = element._getBorder(chart, altitudeData);

			// assert
			expect(value).toBe('#2c5a93');
		});
	});

	describe('when _getSlopeGradient() is called', () => {
		it('for coverage - slope ends in steep - _getSlopeGradient', async () => {
			// arrange
			await setup();
			const altitudeProfile = new ElevationProfile();
			const getSlopeGradientSpy = spyOn(altitudeProfile, '_getSlopeGradient').and.callThrough();

			// act
			altitudeProfile._getSlopeGradient(chart, altitudeData);

			// assert
			expect(getSlopeGradientSpy).toHaveBeenCalled();
		});
	});

	describe('when attribute changes several times', () => {
		it('should update the view', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			const destroyChartJsSpy = spyOn(element._chart, 'destroy').and.callThrough();

			//act
			const attrs = element.shadowRoot.getElementById('attrs');
			attrs.value = 'surface';
			attrs.dispatchEvent(new Event('change'));
			attrs.value = 'slope';
			attrs.dispatchEvent(new Event('change'));

			// assert
			const chart = element._chart;
			const config = chart.config;
			const datasetZero = config.data.datasets[0];
			expect(destroyChartJsSpy).toHaveBeenCalled();
			expect(chart).not.toBeNull();
			expect(config.type).toBe('line');
			expect(config.options.responsive).toBe(true);
			expect(config.data.labels).toEqual([0, 1, 2, 3, 4, 5]);
			expect(datasetZero.data).toEqual([0, 10, 20, 30, 40, 50]);
			expect(datasetZero.label).toBe('elevationProfile_elevation_profile');
			expect(element.shadowRoot.querySelectorAll('.chart-container canvas')).toHaveSize(1);
			const attrsCheck = element.shadowRoot.getElementById('attrs');
			expect(attrsCheck.value).toBe('slope');
		});
	});

	describe('when attribute changes', () => {
		const coordinates = [
			[0, 1],
			[2, 3]
		];

		it('should change _noAnimation', async () => {
			// arrange
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			const noAnimationSpy = spyOnProperty(element, '_noAnimation', 'set').and.callThrough();

			//act
			const attrs = element.shadowRoot.getElementById('attrs');
			attrs.value = 'slope';
			attrs.dispatchEvent(new Event('change'));

			// assert
			expect(noAnimationSpy).toHaveBeenCalled();
		});

		it('should reset _noAnimation afterwards', async () => {
			// arrange
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});

			//act
			const attrs = element.shadowRoot.getElementById('attrs');
			attrs.value = 'slope';
			attrs.dispatchEvent(new Event('change'));

			// assert
			expect(element._noAnimation).toBe(false);
		});
	});

	describe('when coordinates (slice-of-state) changes (from no coordinates)', () => {
		it('calls _getElevationProfile with coordinates', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			const altitudeData = profileSlopeSteep();
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(altitudeData);
			const element = await setup();
			const getAltitudeProfileSpy = spyOn(element, '_getElevationProfile').and.callThrough();

			//act
			updateCoordinates(coordinates);

			// assert
			expect(getAltitudeProfileSpy).toHaveBeenCalledTimes(1);
			expect(getAltitudeProfileSpy).toHaveBeenCalledWith(coordinates);
		});
	});

	describe('when coordinates (slice-of-state) changes (from some coordinates)', () => {
		it('calls _getElevationProfile with new coordinates', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			const altitudeData = profileSlopeSteep();
			spyOn(elevationServiceMock, 'getProfile').and.resolveTo(altitudeData);
			const element = await setup({
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			const getAltitudeProfileSpy = spyOn(element, '_getElevationProfile').and.callThrough();

			//act
			const newCoordinates = [
				[7, 8],
				[5, 6]
			];
			updateCoordinates(newCoordinates);

			// assert
			expect(getAltitudeProfileSpy).toHaveBeenCalledWith(newCoordinates);
		});
	});

	describe('when _enrichProfileData is called', () => {
		it('updates the profile', async () => {
			// arrange
			const altitudeProfile = {
				elevations: [
					{
						dist: 0,
						z: 0,
						e: 40,
						n: 50
					},
					{
						dist: 1,
						z: 10,
						e: 41,
						n: 51
					},
					{
						dist: 2,
						z: 20,
						e: 42,
						n: 52
					},
					{
						dist: 3,
						z: 20,
						e: 42,
						n: 52
					}
				],
				attrs: [
					{
						id: 'surface',
						values: [
							[0, 1, 'asphalt'],
							[2, 2, 'gravel'],
							[3, 3, 0]
						]
					}
				]
			};
			await setup({
				altitudeProfile
			});
			const ap = new ElevationProfile();

			//act
			ap._enrichProfileData(altitudeProfile);

			// assert
			expect(altitudeProfile.elevations[0].surface).toBe('asphalt');
			expect(altitudeProfile.elevations[1].surface).toBe('asphalt');
			expect(altitudeProfile.elevations[2].surface).toBe('gravel');
			expect(altitudeProfile.elevations[3].surface).toBe(0);
		});

		it('considers distances over 10000m and uses km instead', async () => {
			// arrange
			const altitudeProfile = {
				elevations: [
					{
						dist: 0,
						z: 0,
						e: 40,
						n: 50
					},
					{
						dist: 10000,
						z: 10,
						e: 41,
						n: 51
					},
					{
						dist: 20000,
						z: 20,
						e: 42,
						n: 52
					}
				],
				attrs: []
			};
			await setup({
				altitudeProfile
			});
			const ap = new ElevationProfile();

			//act
			ap._enrichProfileData(altitudeProfile);

			// assert
			expect(altitudeProfile.distUnit).toBe('km');
			expect(altitudeProfile.elevations[1].z).toBe(10);
			expect(altitudeProfile.elevations[2].z).toBe(20);
		});
	});

	describe('SlopeType', () => {
		it('provides an enum of all available types', () => {
			expect(Object.keys(SlopeType).length).toBe(6);
			expect(SlopeType.FLAT).toBe('flat');
			expect(SlopeType.GENTLY_UNDULATING).toBe('gentlyUndulating');
			expect(SlopeType.UNDULATING).toBe('undulating');
			expect(SlopeType.ROLLING).toBe('rolling');
			expect(SlopeType.MODERATELY_STEEP).toBe('moderatelySteep');
			expect(SlopeType.STEEP).toBe('steep');
		});
	});

	describe('SoterSlopeClasses', () => {
		it('provides an array of all available SOTER classes', () => {
			expect(SoterSlopeClasses).toHaveSize(6);
			expect(SoterSlopeClasses[0]).toEqual(jasmine.objectContaining({ type: SlopeType.FLAT, min: 0, max: 2, color: '#1f8a70' }));
			expect(SoterSlopeClasses[1]).toEqual(jasmine.objectContaining({ type: SlopeType.GENTLY_UNDULATING, min: 2, max: 5, color: '#bedb39' }));
			expect(SoterSlopeClasses[2]).toEqual(jasmine.objectContaining({ type: SlopeType.UNDULATING, min: 5, max: 8, color: '#ffd10f' }));
			expect(SoterSlopeClasses[3]).toEqual(jasmine.objectContaining({ type: SlopeType.ROLLING, min: 8, max: 15, color: '#fd7400' }));
			expect(SoterSlopeClasses[4]).toEqual(jasmine.objectContaining({ type: SlopeType.MODERATELY_STEEP, min: 15, max: 30, color: '#d23600' }));
			expect(SoterSlopeClasses[5]).toEqual(jasmine.objectContaining({ type: SlopeType.STEEP, min: 30, max: 60, color: '#691b00' }));
		});
	});

	describe('when dark theme is used', () => {
		it('returns the corresponding dark colors', async () => {
			// arrange
			await setup();

			// act
			setIsDarkSchema(true);

			// assert
			expect(ElevationProfile.SLOPE_FLAT_COLOR).toBe('lime');
			expect(ElevationProfile.SLOPE_STEEP_COLOR).toBe('red');
			expect(ElevationProfile.BACKGROUND_COLOR).toBe('rgb(38, 74, 89)');
			expect(ElevationProfile.BORDER_COLOR).toBe('rgb(9, 157, 220)');
			expect(ElevationProfile.DEFAULT_TEXT_COLOR).toBe('rgb(240, 243, 244)');
		});
	});

	describe('when light theme is used', () => {
		it('returns the corresponding light colors', async () => {
			// arrange
			await setup();

			// act
			setIsDarkSchema(false);

			// assert
			expect(ElevationProfile.SLOPE_FLAT_COLOR).toBe('green');
			expect(ElevationProfile.SLOPE_STEEP_COLOR).toBe('red');
			expect(ElevationProfile.BACKGROUND_COLOR).toBe('#e3eef4');
			expect(ElevationProfile.BORDER_COLOR).toBe('#2c5a93');
			expect(ElevationProfile.DEFAULT_TEXT_COLOR).toBe('rgb(92, 106, 112)');
		});
	});

	describe('events', () => {
		const chartJsTimeoutInMs = 100;

		describe('on pointermove', () => {
			it('places a highlight feature within the store', async () => {
				// arrange
				const coordinates = fromLonLat([11, 48]);

				spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
				const element = await setup({
					elevationProfile: {
						active: true,
						coordinates: coordinates
					}
				});
				const setCoordinatesSpy = spyOn(element, 'setCoordinates').and.callThrough();
				const chart = element.shadowRoot.querySelector('#route-altitude-chart');

				const event = new PointerEvent('pointermove', {
					clientX: 100,
					clientY: 100
				});

				// act
				chart.dispatchEvent(event);
				await TestUtils.timeout(chartJsTimeoutInMs); // give the chart some time to update

				// assert
				expect(setCoordinatesSpy).toHaveBeenCalled();
				expect(store.getState().highlight.features).toHaveSize(1);
				expect(store.getState().highlight.features[0].id).toBe(ElevationProfile.HIGHLIGHT_FEATURE_ID);
				expect(store.getState().highlight.features[0].data.coordinate).toHaveSize(2);
				expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.TEMPORARY);
			});
		});

		describe('on mouseout', () => {
			it('removes the highlight feature from the store', async () => {
				// arrange
				const coordinates = fromLonLat([11, 48]);

				spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
				const element = await setup({
					elevationProfile: {
						active: true,
						coordinates: coordinates
					},
					highlight: {
						features: [{ id: ElevationProfile.HIGHLIGHT_FEATURE_ID, data: [21, 41] }]
					}
				});
				const chart = element.shadowRoot.querySelector('#route-altitude-chart');

				// act
				chart.dispatchEvent(new Event('mouseout'));
				await TestUtils.timeout(chartJsTimeoutInMs); // give the chart some time to update

				// assert
				expect(store.getState().highlight.features).toHaveSize(0);
			});
		});

		describe('on pointerup', () => {
			it('removes the highlight feature from the store', async () => {
				// arrange
				const coordinates = fromLonLat([11, 48]);

				spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
				const element = await setup({
					elevationProfile: {
						active: true,
						coordinates: coordinates
					},
					highlight: {
						features: [{ id: ElevationProfile.HIGHLIGHT_FEATURE_ID, data: [21, 41] }]
					}
				});
				const chart = element.shadowRoot.querySelector('#route-altitude-chart');

				// act
				chart.dispatchEvent(new PointerEvent('pointerup'));
				await TestUtils.timeout(chartJsTimeoutInMs); // give the chart some time to update

				// assert
				expect(store.getState().highlight.features).toHaveSize(0);
			});
		});
	});

	describe('responsive layout ', () => {
		it('layouts for landscape', async () => {
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				media: {
					portrait: false
				},
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
		});

		it('layouts for portrait', async () => {
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				media: {
					portrait: true
				},
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
		});

		it('layouts for desktop', async () => {
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				media: {
					minWidth: true
				},
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(1);
		});

		it('layouts for tablet', async () => {
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				media: {
					minWidth: false
				},
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(0);
		});
	});

	describe('when disconnected', () => {
		it('removes all observers', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			const element = await setup({
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});

			//act
			element.onDisconnect(); // we have to call onDisconnect manually

			// assert
			expect(element._unsubscribers).toHaveSize(0);
		});

		it('removes an existing highlight feature', async () => {
			// arrange
			const coordinates = fromLonLat([11, 48]);
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				elevationProfile: {
					active: true,
					coordinates: coordinates
				},
				highlight: {
					features: [{ id: ElevationProfile.HIGHLIGHT_FEATURE_ID, data: [21, 41] }]
				}
			});

			//act
			element.onDisconnect(); // we have to call onDisconnect manually

			// assert
			expect(store.getState().highlight.features).toHaveSize(0);
		});
	});
});
