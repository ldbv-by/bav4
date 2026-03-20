import { $injector } from '@src/injection/index.js';
import {
	Default_Attribute_Id,
	ElevationProfile,
	Empty_Profile_Data,
	SlopeType,
	SoterSlopeClasses
} from '@src/modules/elevationProfile/components/panel/ElevationProfile.js';
import { elevationProfileReducer } from '@src/store/elevationProfile/elevationProfile.reducer.js';
import { indicateChange } from '@src/store/elevationProfile/elevationProfile.action.js';
import { createNoInitialStateMediaReducer } from '@src/store/media/media.reducer.js';

import { TestUtils } from '@test/test-utils';
import { setIsDarkSchema, setIsHighContrast } from '@src/store/media/media.action.js';
import { highlightReducer } from '@src/store/highlight/highlight.reducer.js';
import { notificationReducer } from '@src/store/notifications/notifications.reducer.js';
import { Chart } from 'chart.js';
import { HighlightFeatureType } from '@src/domain/highlightFeature.js';

window.customElements.define(ElevationProfile.tag, ElevationProfile);

describe('ElevationProfile', () => {
	const renderComplete = () => {
		return new Promise((resolve) => {
			// we register on the chartJsAfterRender event
			window.addEventListener('chartJsAfterRender', () => {
				resolve();
			});
		});
	};

	const sumUp = 1480.8;
	const sumUpAfterToLocaleStringEn = '1480.8';

	const sumDown = 1668.6;
	const sumDownAfterToLocaleStringEn = '1668.6';

	const verticalHeight = 84;
	const highestPoint = 42;
	const lowestPoint = -21;
	const linearDistance = 5000;
	const linearDistanceAfterUnitsServiceEn = '5.0';

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
				n: 50,
				slope: 0
			},
			{
				dist: 1,
				z: 10,
				e: 41,
				n: 51,
				slope: 0
			},
			{
				dist: 2,
				z: 20,
				e: 42,
				n: 52,
				slope: 1
			},
			{
				dist: 3,
				z: 30,
				e: 43,
				n: 53,
				slope: 1
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
			}
		],
		refSystem: 'DGM 25 / DHHN2016'
	};

	const _profileWithoutSlope = {
		elevations: [
			{
				dist: 0,
				z: 0,
				e: 400,
				n: 500
			},
			{
				dist: 1,
				z: 100,
				e: 410,
				n: 510
			},
			{
				dist: 2,
				z: 200,
				e: 420,
				n: 520
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
		attrs: [],
		refSystem: 'DGM 25 / DHHN2016'
	};

	const profile = () => {
		const newLocalProfile = JSON.parse(JSON.stringify(_profile));
		return newLocalProfile;
	};

	const profileSlopeSteep = () => {
		const newLocalProfile = JSON.parse(JSON.stringify(_profileSlopeSteep));
		return newLocalProfile;
	};

	const profileWithoutSlope = () => {
		const newLocalProfile = JSON.parse(JSON.stringify(_profileWithoutSlope));
		return newLocalProfile;
	};

	const coordinateServiceMock = {
		stringify() {},
		toLonLat() {}
	};

	const elevationServiceMock = {
		fetchProfile() {}
	};

	const configServiceMock = {
		getValueAsPath: () => {}
	};

	const unitsServiceMock = {
		formatDistance: (distance) => {
			const formatted = distance / 1000;
			return distance > 100
				? { value: formatted, localizedValue: formatted.toFixed(1), unit: 'km' }
				: { value: distance, localizedValue: distance, unit: 'm' };
		}
	};

	const elevationData = profileSlopeSteep();

	const id = 'profileReferenceId';

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
			.registerSingleton('ConfigService', configServiceMock)
			.registerSingleton('ElevationService', elevationServiceMock)
			.registerSingleton('UnitsService', unitsServiceMock);

		const style = document.createElement('style');
		style.innerHTML = ':root,:host {--primary-color: rgb(42,21,0);--header-background-color:rgb(0,21,42);--text1:rgb(0,0,0)}';
		document.head.appendChild(style);

		return TestUtils.render(ElevationProfile.tag);
	};

	describe('ElevationService returns NULL', () => {
		it('resets the profile property of the model', async () => {
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockReturnValue(null);
			const element = await setup();

			await element._getElevationProfile(id);

			expect(elevationServiceSpy).toHaveBeenCalled();
			expect(element.getModel().profile).toEqual(Empty_Profile_Data);
		});
	});

	describe('class', () => {
		it('defines constant values', async () => {
			expect(ElevationProfile.HIGHLIGHT_FEATURE_ID).toBe('#elevationProfileHighlightFeatureId');
		});
	});

	describe('when instantiating the component', () => {
		it('expects the initial values of the model to be empty', async () => {
			// arrange
			await setup();
			const elevationProfile = new ElevationProfile();

			// assert
			const initialModel = elevationProfile.getModel();
			expect(initialModel).toEqual({
				profile: Empty_Profile_Data,
				labels: null,
				data: null,
				selectedAttribute: Default_Attribute_Id,
				distUnit: null,
				portrait: false,
				minWidth: false,
				colorSchema: null
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
			expect(element.shadowRoot.children.length).toBe(4);
			expect(datasetZero.data).toEqual([]);
			expect(config.data.labels).toEqual([]);
		});

		it('renders the view when a profile is available', async () => {
			// arrange
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
			const element = await setup({
				media: {
					darkSchema: true
				},
				elevationProfile: {
					active: true,
					id
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
			expect(config.options.scales.x.title.text).toBe('elevationProfile_distance (m)');
			expect(config.options.scales.x.title.color).toBe('rgb(0,0,0)');
			expect(config.options.scales.x.ticks.color).toBe('rgb(0,0,0)');
			// config.options.scales.y
			expect(config.options.scales.y.type).toBe('linear');
			expect(config.options.scales.y.title.display).toBe(true);
			expect(config.options.scales.y.title.text).toBe('elevationProfile_alt (m)');
			expect(config.options.scales.y.title.color).toBe('rgb(0,0,0)');
			expect(config.options.scales.y.ticks.color).toBe('rgb(0,0,0)');
			// config.options.plugins.title
			expect(config.options.plugins.title.align).toBe('end');
			expect(config.options.plugins.title.display).toBe(true);
			expect(config.options.plugins.title.text).toBe('elevationProfile_unknown');
			expect(config.options.plugins.title.color).toBe('rgb(0,0,0)');
			// config.options.plugins.legend
			expect(config.options.plugins.legend.display).toBe(false);
			// config.options.plugins.tooltip
			expect(config.options.plugins.tooltip.displayColors).toBe(false);
			expect(config.options.plugins.tooltip.mode).toBe('index');
			expect(config.options.plugins.tooltip.intersect).toBe(false);
			expect(config.options.plugins.tooltip.callbacks.title).toEqual(expect.any(Function));
			expect(config.options.plugins.tooltip.callbacks.label).toEqual(expect.any(Function));

			expect(datasetZero.data).toEqual([0, 10, 20, 30, 40, 50]);
			expect(datasetZero.label).toBe('elevationProfile_elevation_profile');
			expect(element.shadowRoot.querySelectorAll('.chart-container canvas')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.profile__data')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.profile__box')).toHaveLength(6);
			const header = element.shadowRoot.querySelectorAll('.header h3');
			expect(header).toHaveLength(1);
			expect(header[0].textContent).toContain('elevationProfile_header');
			const buttons = element.shadowRoot.querySelectorAll('.header ba-button');
			expect(buttons).toHaveLength(3);
			expect(buttons[0].label).toBe('elevationProfile_alt');
			expect(buttons[0].classList).toContain('active');
			expect(buttons[1].classList).not.toContain('active');
			expect(buttons[2].classList).not.toContain('active');
			const profile__box = element.shadowRoot.querySelectorAll('.profile__box');
			expect(profile__box[0].querySelector('.profile__header').innerText).toBe('elevationProfile_sumUp (m)');
			const sumUpElement = element.shadowRoot.getElementById('route-elevation-chart-footer-sumUp');
			expect(sumUpElement.innerText).toBe(sumUpAfterToLocaleStringEn);
			expect(profile__box[1].querySelector('.profile__header').innerText).toBe('elevationProfile_sumDown (m)');
			const sumDownElement = element.shadowRoot.getElementById('route-elevation-chart-footer-sumDown');
			expect(sumDownElement.innerText).toBe(sumDownAfterToLocaleStringEn);
			expect(profile__box[2].querySelector('.profile__header').innerText).toBe('elevationProfile_highestPoint (m)');
			const verticalHeightElement = element.shadowRoot.getElementById('route-elevation-chart-footer-verticalHeight');
			expect(verticalHeightElement.innerText).toBe('84');
			expect(profile__box[3].querySelector('.profile__header').innerText).toBe('elevationProfile_lowestPoint (m)');
			const highestPointElement = element.shadowRoot.getElementById('route-elevation-chart-footer-highestPoint');
			expect(highestPointElement.innerText).toBe('42');
			expect(profile__box[4].querySelector('.profile__header').innerText).toBe('elevationProfile_verticalHeight (m)');
			const lowestPointElement = element.shadowRoot.getElementById('route-elevation-chart-footer-lowestPoint');
			expect(lowestPointElement.innerText).toBe('-21');
			expect(profile__box[5].querySelector('.profile__header').innerText).toBe('elevationProfile_linearDistance (km)');
			const linearDistanceElement = element.shadowRoot.getElementById('route-elevation-chart-footer-linearDistance');
			expect(linearDistanceElement.innerText).toBe(linearDistanceAfterUnitsServiceEn);

			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});

		it('uses refSystem if provided', async () => {
			// arrange

			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profileSlopeSteep());
			const element = await setup({
				media: {
					darkSchema: true
				},
				elevationProfile: {
					active: true,
					id
				}
			});
			const chart = element._chart;
			const config = chart.config;

			// assert
			expect(config.options.plugins.title.text).toBe('DGM 25 / DHHN2016');
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});
	});

	describe('when tooltip callback "title" is called', () => {
		it('returns a valid distance', async () => {
			// arrange
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
			const element = await setup({
				media: {
					darkSchema: true
				},
				elevationProfile: {
					active: true,
					id
				}
			});
			const config = element._chart.config;
			const tooltipItems = [{ parsed: { x: 1 } }];

			// act
			const titleRet = config.options.plugins.tooltip.callbacks.title(tooltipItems);

			// assert
			expect(titleRet).toBe('elevationProfile_distance (m): 1');
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});

		it('calls setCoordinates() with valid coordinates', async () => {
			// arrange
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
			const element = await setup({
				media: {
					darkSchema: true
				},
				elevationProfile: {
					active: true,
					id
				}
			});

			const config = element._chart.config;
			const setCoordinatesSpy = vi.spyOn(element, 'setCoordinates');
			const tooltipItems = [{ parsed: { x: 1 }, label: 10 }];

			// act
			config.options.plugins.tooltip.callbacks.title(tooltipItems);

			// assert
			expect(setCoordinatesSpy).toHaveBeenCalled();
			expect(setCoordinatesSpy).toHaveBeenCalledWith([41, 51]);
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});
	});

	describe('when tooltip callback "label" is called', () => {
		it('returns a valid elevation', async () => {
			// arrange
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
			const element = await setup({
				media: {
					darkSchema: true
				},
				elevationProfile: {
					active: true,
					id
				}
			});
			const config = element._chart.config;
			const tooltipItem = { parsed: { x: 3 } };

			// act
			const labelRet = config.options.plugins.tooltip.callbacks.label(tooltipItem);

			// assert
			expect(labelRet).toBe('elevationProfile_alt (m): 30');
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});
	});

	describe('when tooltip callback "label" is called for attribute slope', () => {
		it('uses attributes prefix and unit', async () => {
			// arrange
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
			const element = await setup({
				elevationProfile: {
					active: true,
					id
				}
			});

			const config = element._chart.config;
			const tooltipItem = { parsed: { x: 3 } };

			const slope = element.shadowRoot.getElementById('slope');
			slope.dispatchEvent(new Event('click'));
			const chart = element._chart;

			// act
			const labelRet = config.options.plugins.tooltip.callbacks.label(tooltipItem);
			element._getBorder(chart, elevationData);

			// assert
			expect(labelRet).toEqual(['elevationProfile_alt (m): 30', 'elevationProfile_slope (%): ~ 20']);
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});
	});

	describe('when tooltip callback "label" is called for attribute surface', () => {
		it('only shows the surface, no prefix or unit', async () => {
			// arrange
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
			const element = await setup({
				elevationProfile: {
					active: true,
					id
				}
			});

			const config = element._chart.config;
			const tooltipItem = { parsed: { x: 3 } };

			const surface = element.shadowRoot.getElementById('surface');
			surface.dispatchEvent(new Event('click'));
			const chart = element._chart;

			// act
			const labelRet = config.options.plugins.tooltip.callbacks.label(tooltipItem);
			element._getBorder(chart, elevationData);

			// assert
			expect(labelRet).toEqual(['elevationProfile_alt (m): 30', 'elevationProfile_surface: gravel']);
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});
	});

	describe('when _getBackground() is called', () => {
		it('returns a valid background for "selectedAttribute alt"', async () => {
			// arrange
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
			const element = await setup({
				elevationProfile: {
					active: true,
					id
				}
			});
			const alt = element.shadowRoot.getElementById('alt');
			alt.dispatchEvent(new Event('click'));
			const chart = element._chart;

			// act
			const value = element._getBackground(chart, elevationData);

			// assert
			expect(value).toBe('rgb(0,21,42)');
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});
	});

	describe('when _getBorder() is called', () => {
		it('executes the branch "slope" for "selectedAttribute slope"', async () => {
			// arrange
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
			const element = await setup({
				elevationProfile: {
					active: true,
					id
				}
			});
			const slope = element.shadowRoot.getElementById('slope');
			slope.dispatchEvent(new Event('click'));
			const chart = element._chart;
			const slopeGradientSpy = vi.spyOn(element, '_getSlopeGradient');

			// act
			element._getBorder(chart, elevationData, slope.id);

			// assert
			expect(slopeGradientSpy).toHaveBeenCalled();
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});

		it('returns a gradient that ends in steep ', async () => {
			// arrange

			const elevationData = profileSlopeSteep();
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
			const element = await setup({
				elevationProfile: {
					active: true,
					id
				}
			});
			const slope = element.shadowRoot.getElementById('slope');
			slope.dispatchEvent(new Event('click'));
			const chart = element._chart;
			const slopeGradientSpy = vi.spyOn(element, '_getSlopeGradient');

			// act
			element._getBorder(chart, elevationData, slope.id);

			// assert
			expect(slopeGradientSpy).toHaveBeenCalled();
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});

		it('returns a gradient that uses SOTER-classification ', async () => {
			// arrange
			const elevationData = profileSlopeSteep();
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(elevationData);
			const element = await setup({
				elevationProfile: {
					active: true,
					id
				}
			});

			const gradientMock = { addColorStop: () => {} };
			const ctxMock = { createLinearGradient: () => gradientMock };
			const chartMock = { ctx: ctxMock, chartArea: { left: 1, right: 1, width: 1, height: 1 } };
			const gradientSpy = vi.spyOn(gradientMock, 'addColorStop');

			// act
			element._getSlopeGradient(chartMock, elevationData);

			// assert
			expect(gradientSpy).toHaveBeenCalledWith(expect.any(Number), '#1f8a70');
			expect(gradientSpy).toHaveBeenCalledWith(expect.any(Number), '#d23600');
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});

		it('returns a gradient that uses the elevation dist property to place the color stop', async () => {
			// arrange
			const unequalElevations = [
				{
					dist: 0,
					z: 0,
					e: 40,
					n: 50,
					slope: 0
				},
				{
					dist: 1,
					z: 10,
					e: 41,
					n: 51,
					slope: 0
				},
				{
					dist: 4,
					z: 20,
					e: 42,
					n: 52,
					slope: 1
				},
				{
					dist: 10,
					z: 30,
					e: 43,
					n: 53,
					slope: 7
				}
			];
			const elevationData = { ...profileSlopeSteep(), elevations: unequalElevations };
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(elevationData);
			const element = await setup({
				elevationProfile: {
					active: true,
					id
				}
			});

			const gradientMock = {
				addColorStop: () => {}
			};
			const ctxMock = { createLinearGradient: () => gradientMock };
			const chartMock = { ctx: ctxMock, chartArea: { left: 1, right: 1, width: 1, height: 1 } };
			const gradientSpy = vi.spyOn(gradientMock, 'addColorStop');

			// act
			element._getSlopeGradient(chartMock, elevationData);

			// assert
			expect(gradientSpy).toHaveBeenCalledWith(0, expect.any(String));
			expect(gradientSpy).toHaveBeenCalledWith(0.1, expect.any(String));
			expect(gradientSpy).toHaveBeenCalledWith(0.4, expect.any(String));
			expect(gradientSpy).toHaveBeenCalledWith(1, expect.any(String));
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});

		it('executes the branch "TextType" for "selectedAttribute surface"', async () => {
			// arrange
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
			const element = await setup({
				elevationProfile: {
					active: true,
					id
				}
			});
			const textTypeGradientSpy = vi.spyOn(element, '_getTextTypeGradient');
			const surface = element.shadowRoot.getElementById('surface');
			surface.dispatchEvent(new Event('click'));

			// assert
			expect(textTypeGradientSpy).toHaveBeenCalled();
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});

		it('calls _getFixedColorGradient with a valid color and returns a gradient', async () => {
			// arrange
			const element = await setup();
			const chart = element._chart;
			const getFixedColorGradientSpy = vi.spyOn(element, '_getFixedColorGradient');

			// act
			const canvasGradient = element._getBorder(chart, elevationData);

			// assert
			expect(getFixedColorGradientSpy).toHaveBeenCalledWith(expect.any(Chart), 'rgb(42,21,0)');
			expect(canvasGradient).toEqual(expect.any(CanvasGradient));
		});
	});

	describe('when _getSlopeGradient() is called', () => {
		const gradientMock = {
			addColorStop: () => {}
		};
		const chart = {
			ctx: {
				createLinearGradient: () => gradientMock
			},
			colorStops: 0,
			chartArea: { left: 0, right: 100, width: 200 }
		};

		it('adds colorStops for each slope value', async () => {
			// arrange
			await setup();
			const colorStopSpy = vi.spyOn(gradientMock, 'addColorStop');

			// act
			const elevationProfile = new ElevationProfile();
			elevationProfile._getSlopeGradient(chart, elevationData);

			// assert
			expect(colorStopSpy).toHaveBeenCalledTimes(elevationData.elevations.length);
		});

		it('skips colorStops for missing slope values', async () => {
			// arrange
			await setup();
			const elevationData = profileSlopeSteep();
			elevationData.elevations[0].slope = undefined;
			const colorStopSpy = vi.spyOn(gradientMock, 'addColorStop');

			// act
			const elevationProfile = new ElevationProfile();
			elevationProfile._getSlopeGradient(chart, elevationData);

			// assert
			expect(colorStopSpy).toHaveBeenCalledTimes(elevationData.elevations.length - 1);
		});
	});

	describe('when attribute changes several times', () => {
		it('should update the view', async () => {
			// arrange
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
			const element = await setup({
				elevationProfile: {
					active: true,
					id
				}
			});
			const destroyChartJsSpy = vi.spyOn(element._chart, 'destroy');

			//act
			const surface = element.shadowRoot.getElementById('surface');
			surface.dispatchEvent(new Event('click'));
			expect(surface.classList).toContain('active');
			const slope = element.shadowRoot.getElementById('slope');
			slope.dispatchEvent(new Event('click'));

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
			expect(element.shadowRoot.querySelectorAll('.chart-container canvas')).toHaveLength(1);
			expect(slope.classList).toContain('active');
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});
	});

	describe('when chart resizes', () => {
		it('should update the slope gradient', async () => {
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
			const element = await setup({
				elevationProfile: {
					active: true,
					id
				}
			});

			expect(element._chartColorOptions['slope']).toBeUndefined();

			//init slopes
			const slope = element.shadowRoot.getElementById('slope');
			slope.dispatchEvent(new Event('click'));

			expect(element._chartColorOptions['slope']).toEqual(
				expect.objectContaining({ borderColor: expect.any(CanvasGradient), backgroundColor: expect.any(String) })
			);

			const chart = element._chart;
			const firstSlopeGradient = element._chartColorOptions['slope'].borderColor;

			chart.resize(200, 400);

			const secondSlopeGradient = element._chartColorOptions['slope'].borderColor;
			expect(firstSlopeGradient).not.toBe(secondSlopeGradient);

			chart.resize(400, 200);

			const thirdSlopeGradient = element._chartColorOptions['slope'].borderColor;
			expect(secondSlopeGradient).not.toBe(thirdSlopeGradient);
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});
	});

	describe('when _getLocalizedValue(x) is called', () => {
		it('should return "x m" for "x" any number', async () => {
			// arrange
			const element = await setup();

			// assert
			expect(element._getLocalizedValue(0)).toBe('0');
			expect(element._getLocalizedValue(1)).toBe('1');
			expect(element._getLocalizedValue(-1)).toBe('-1');
		});

		it('should return "-" for "x" undefined or null', async () => {
			// arrange
			const element = await setup();

			// assert
			expect(element._getLocalizedValue()).toBe('-');
			expect(element._getLocalizedValue(undefined)).toBe('-');
			expect(element._getLocalizedValue(null)).toBe('-');
		});
	});

	describe('when attribute changes', () => {
		it('should change _noAnimation', async () => {
			// arrange
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
			const element = await setup({
				elevationProfile: {
					active: true,
					id
				}
			});
			const noAnimationSpy = vi.spyOn(element, '_noAnimation', 'set');

			//act
			const slope = element.shadowRoot.getElementById('slope');
			slope.dispatchEvent(new Event('click'));

			// assert
			expect(noAnimationSpy).toHaveBeenCalled();
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});

		it('should reset _noAnimation afterwards', async () => {
			// arrange
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
			const element = await setup({
				elevationProfile: {
					active: true,
					id
				}
			});

			//act
			const slope = element.shadowRoot.getElementById('slope');
			slope.dispatchEvent(new Event('click'));

			// assert
			expect(element._noAnimation).toBe(false);
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});
	});

	describe('when coordinates (slice-of-state) changes (from no coordinates)', () => {
		it('calls _getElevationProfile with coordinates', async () => {
			// arrange
			const elevationData = profileSlopeSteep();
			const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(elevationData);
			const element = await setup();
			const getElevationProfileSpy = vi.spyOn(element, '_getElevationProfile');

			//act
			indicateChange(id);

			// assert
			expect(getElevationProfileSpy).toHaveBeenCalledTimes(1);
			expect(getElevationProfileSpy).toHaveBeenCalledWith(id);
			expect(elevationServiceSpy).toHaveBeenCalledWith(id);
		});
	});

	describe('when coordinates (slice-of-state) changes (from some coordinates)', () => {
		it('calls _getElevationProfile with new coordinates', async () => {
			// arrange
			const id2 = 'profileReferenceId2';
			vi.spyOn(elevationServiceMock, 'fetchProfile').mockReturnValue(profileWithoutSlope()).mockReturnValueOnce(profile());

			const element = await setup({
				elevationProfile: {
					active: true,
					id
				}
			});
			const getElevationProfileSpy = vi.spyOn(element, '_getElevationProfile');

			//act
			indicateChange(id2);

			// assert
			expect(getElevationProfileSpy).toHaveBeenCalledWith(id2);
		});
	});

	describe('when _enrichProfileData is called', () => {
		it('updates the profile', async () => {
			// arrange
			const elevationProfile = {
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
			await setup();
			const ap = new ElevationProfile();

			//act
			ap._enrichProfileData(elevationProfile);

			// assert
			expect(elevationProfile.elevations[0].surface).toBe('asphalt');
			expect(elevationProfile.elevations[1].surface).toBe('asphalt');
			expect(elevationProfile.elevations[2].surface).toBe('gravel');
			expect(elevationProfile.elevations[3].surface).toBe(0);
		});

		it('considers distances over 10000m and uses km instead', async () => {
			// arrange
			const elevationProfile = {
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
			await setup();
			const ap = new ElevationProfile();

			//act
			ap._enrichProfileData(elevationProfile);

			// assert
			expect(elevationProfile.distUnit).toBe('km');
			expect(elevationProfile.elevations[1].z).toBe(10);
			expect(elevationProfile.elevations[2].z).toBe(20);
		});
	});

	describe('SlopeType', () => {
		it('provides an enum of all available types', () => {
			expect(Object.keys(SlopeType).length).toBe(6);
			expect(Object.isFrozen(SlopeType)).toBe(true);
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
			expect(SoterSlopeClasses).toHaveLength(6);
			expect(Object.isFrozen(SoterSlopeClasses)).toBe(true);
			expect(SoterSlopeClasses[0]).toEqual(expect.objectContaining({ type: SlopeType.FLAT, min: 0, max: 2, color: '#1f8a70' }));
			expect(SoterSlopeClasses[1]).toEqual(expect.objectContaining({ type: SlopeType.GENTLY_UNDULATING, min: 2, max: 5, color: '#bedb39' }));
			expect(SoterSlopeClasses[2]).toEqual(expect.objectContaining({ type: SlopeType.UNDULATING, min: 5, max: 8, color: '#ffd10f' }));
			expect(SoterSlopeClasses[3]).toEqual(expect.objectContaining({ type: SlopeType.ROLLING, min: 8, max: 15, color: '#fd7400' }));
			expect(SoterSlopeClasses[4]).toEqual(expect.objectContaining({ type: SlopeType.MODERATELY_STEEP, min: 15, max: 30, color: '#d23600' }));
			expect(SoterSlopeClasses[5]).toEqual(expect.objectContaining({ type: SlopeType.STEEP, min: 30, max: Infinity, color: '#691b00' }));
		});
	});

	describe('Empty_Profile_Data', () => {
		it('provides an emty profile data set', () => {
			expect(Object.isFrozen(Empty_Profile_Data)).toBe(true);
			expect(Empty_Profile_Data).toEqual({
				labels: [],
				chartData: [],
				elevations: [],
				attrs: [],
				distUnit: 'm',
				stats: {
					verticalHeight: 0,
					linearDistance: 0
				}
			});
		});
	});

	describe('when colorTheme is changing', () => {
		it('updates the view', async () => {
			// arrange
			const element = await setup({
				media: {
					darkSchema: false,
					highContrast: false
				},
				elevationProfile: {
					active: true,
					id
				}
			});

			// act & assert
			setIsDarkSchema(true);
			expect(element.getModel().colorSchema).toBe('darkSchema:true');
			setIsDarkSchema(false);
			expect(element.getModel().colorSchema).toBe('darkSchema:false');
			setIsHighContrast(true);
			expect(element.getModel().colorSchema).toBe('highContrast:true');
			setIsHighContrast(false);
			expect(element.getModel().colorSchema).toBe('highContrast:false');
		});
	});

	describe('events', () => {
		describe('when chart was rendered', () => {
			it('fires a bubbling "chartJsAfterRender" event', async () => {
				// arrange
				const spy = vi.fn();
				window.addEventListener('chartJsAfterRender', spy);

				const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());

				//act
				await setup({
					media: {
						darkSchema: true
					},
					elevationProfile: {
						active: true,
						id
					}
				});

				// assert
				expect(spy).toHaveBeenCalledWith(expect.objectContaining({ bubbles: true }));
				expect(elevationServiceSpy).toHaveBeenCalledWith(id);
			});
		});

		describe('on pointermove', () => {
			it('places a highlight feature within the store', async () => {
				// arrange
				const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
				const element = await setup({
					elevationProfile: {
						active: true,
						id
					}
				});
				const setCoordinatesSpy = vi.spyOn(element, 'setCoordinates');
				const chart = element.shadowRoot.querySelector('#route-elevation-chart');

				const event = new PointerEvent('pointermove', {
					clientX: 100,
					clientY: 100
				});

				// act
				chart.dispatchEvent(event);
				// wait until chart was updated
				await renderComplete();

				// assert
				expect(setCoordinatesSpy).toHaveBeenCalled();
				expect(elevationServiceSpy).toHaveBeenCalledWith(id);
				expect(store.getState().highlight.features).toHaveLength(1);
				expect(store.getState().highlight.features[0].id).toBe(ElevationProfile.HIGHLIGHT_FEATURE_ID);
				expect(store.getState().highlight.features[0].data).toHaveLength(2);
				expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.MARKER_TMP);
			});
		});

		describe('on mouseout', () => {
			it('removes the highlight feature from the store', async () => {
				// arrange
				const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
				const element = await setup({
					elevationProfile: {
						active: true,
						id
					},
					highlight: {
						features: [{ id: ElevationProfile.HIGHLIGHT_FEATURE_ID, data: [21, 41] }]
					}
				});
				const chart = element.shadowRoot.querySelector('#route-elevation-chart');

				// act
				chart.dispatchEvent(new Event('mouseout'));
				// wait until chart was updated
				await renderComplete();

				// assert
				expect(store.getState().highlight.features).toHaveLength(0);
				expect(elevationServiceSpy).toHaveBeenCalledWith(id);
			});
		});

		describe('on pointerup', () => {
			it('removes the highlight feature from the store', async () => {
				// arrange
				const elevationServiceSpy = vi.spyOn(elevationServiceMock, 'fetchProfile').mockResolvedValue(profile());
				const element = await setup({
					elevationProfile: {
						active: true,
						id
					},
					highlight: {
						features: [{ id: ElevationProfile.HIGHLIGHT_FEATURE_ID, data: [21, 41] }]
					}
				});
				const chart = element.shadowRoot.querySelector('#route-elevation-chart');

				// act
				chart.dispatchEvent(new PointerEvent('pointerup'));
				// wait until chart was updated
				await renderComplete();

				// assert
				expect(store.getState().highlight.features).toHaveLength(0);
				expect(elevationServiceSpy).toHaveBeenCalledWith(id);
			});
		});
	});

	describe('responsive layout ', () => {
		it('layouts for landscape', async () => {
			const element = await setup({
				media: {
					portrait: false
				},
				elevationProfile: {
					active: true,
					id
				}
			});
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveLength(0);
		});

		it('layouts for portrait', async () => {
			const element = await setup({
				media: {
					portrait: true
				},
				elevationProfile: {
					active: true,
					id
				}
			});
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveLength(1);
		});

		it('layouts for desktop', async () => {
			const element = await setup({
				media: {
					minWidth: true
				},
				elevationProfile: {
					active: true,
					id
				}
			});
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveLength(1);
		});

		it('layouts for tablet', async () => {
			const element = await setup({
				media: {
					minWidth: false
				},
				elevationProfile: {
					active: true,
					id
				}
			});
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveLength(0);
		});
	});

	describe('when disconnected', () => {
		it('removes an existing highlight feature', async () => {
			// arrange
			const element = await setup({
				elevationProfile: {
					active: true,
					id
				},
				highlight: {
					features: [{ id: ElevationProfile.HIGHLIGHT_FEATURE_ID, data: [21, 41] }]
				}
			});

			//act
			element.onDisconnect(); // we have to call onDisconnect manually

			// assert
			expect(store.getState().highlight.features).toHaveLength(0);
		});
	});

	describe('when a profile with attribute slope (selected), is replaced by another without slope', () => {
		it('should use the Default_Selected_Attribute instead', async () => {
			// arrange
			const id2 = 'profileReferenceId2';
			vi.spyOn(elevationServiceMock, 'fetchProfile').mockReturnValue(profileWithoutSlope()).mockReturnValueOnce(profile());

			const element = await setup({
				elevationProfile: {
					active: true,
					id
				}
			});
			const destroyChartJsSpy = vi.spyOn(element._chart, 'destroy');
			const getElevationProfileSpy = vi.spyOn(element, '_getElevationProfile');
			const enrichProfileDataSpy = vi.spyOn(element, '_enrichProfileData');

			//act
			const slope = element.shadowRoot.getElementById('slope');
			slope.dispatchEvent(new Event('click'));
			expect(slope.classList).toContain('active');

			indicateChange(id2);
			await TestUtils.timeout();

			// assert
			expect(destroyChartJsSpy).toHaveBeenCalled();
			expect(getElevationProfileSpy).toHaveBeenCalled();
			expect(getElevationProfileSpy).toHaveBeenCalledTimes(1); // only once, first time happens before spy (in setup)
			expect(enrichProfileDataSpy).toHaveBeenCalledTimes(1);

			const defaultButton = element.shadowRoot.getElementById(Default_Attribute_Id);
			expect(defaultButton.classList).toContain('active');
		});
	});
});
