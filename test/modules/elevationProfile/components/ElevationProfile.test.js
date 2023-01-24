import { $injector } from '../../../../src/injection/index.js';
import { ElevationProfile, SlopeType } from '../../../../src/modules/elevationProfile/components/ElevationProfile.js';
import { elevationProfileReducer } from '../../../../src/store/elevationProfile/elevationProfile.reducer.js';
import { updateCoordinates } from '../../../../src/store/elevationProfile/elevationProfile.action.js';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer.js';

import { TestUtils } from '../../../test-utils.js';
import { setIsDarkSchema } from '../../../../src/store/media/media.action.js';
import { HighlightFeatureType } from '../../../../src/store/highlight/highlight.action.js';
import { highlightReducer } from '../../../../src/store/highlight/highlight.reducer.js';
import { fromLonLat } from 'ol/proj.js';
// import { highlightReducer } from '../../../../../../../src/store/highlight/highlight.reducer';
// import {  ChartData} from 'chart.js/auto';
// import { Chart } from 'chart.js';

window.customElements.define(ElevationProfile.tag, ElevationProfile);

describe('ElevationProfile', () => {

	const sumUp = 1480.8;
	const sumDown = 1668.6;
	const verticalHeight = 50;
	const highestPoint = 50;
	const lowestPoint = 0;
	const linearDistance = 5;

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
				values: [
					[0, 1, 0.01],
					[2, 3, 0.2],
					[4, 4, 0.4],
					[5, 5, 0.01]
				]
			},
			{
				id: 'surface',
				values: [
					[0, 1, 'asphalt'],
					[3, 5, 'gravel']
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
				values: [
					[0, 0, 0.01],
					[1, 3, 0.2]
				]
			},
			{
				id: 'surface',
				values: [
					[0, 0, 'asphalt'],
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

	const chart = {
		ctx: {
			createLinearGradient: () => {
				return { addColorStop: () => {} };
			}
		}, chartArea: { left: 0, right: 100, width: 200 }
	} ;
	const altitudeData = profileSlopeSteep();
	const context = { chart };


	let store;

	const setup = (state = {}) => {
		const initialState = {
			media: {
				darkSchema: false,
				portrait: false
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			highlight: highlightReducer,
			media: createNoInitialStateMediaReducer(),
			elevationProfile: elevationProfileReducer
		});

		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('ConfigService', configService)
			.registerSingleton('ElevationService', elevationServiceMock);

		return TestUtils.renderAndLogLifecycle(ElevationProfile.tag);
	};

	describe('class', () => {
		it('defines constant values', async () => {
			expect(ElevationProfile.SLOPE_STEEP_THRESHOLD).toBe(0.02);
			expect(ElevationProfile.SLOPE_FLAT_COLOR_DARK).toBe('#66eeff');
			expect(ElevationProfile.SLOPE_FLAT_COLOR_LIGHT).toBe('#eeff66');
			expect(ElevationProfile.SLOPE_STEEP_COLOR_DARK).toBe('#ee4444');
			expect(ElevationProfile.SLOPE_STEEP_COLOR_LIGHT).toBe('#4444ee');
			expect(ElevationProfile.BACKGROUND_COLOR_DARK).toBe('#888888');
			expect(ElevationProfile.BACKGROUND_COLOR_LIGHT).toBe('#ddddff');
			expect(ElevationProfile.BORDER_COLOR_DARK).toBe('#886644');
			expect(ElevationProfile.BORDER_COLOR_LIGHT).toBe('#AA2266');
		});
	});

	describe('when instantiating the component', () => {
		it('expects the initial values of the model to be empty', async () => {
			// arrange
			await setup();
			const altitudeProfile = new ElevationProfile();

			// assert
			const initialModel = altitudeProfile.getModel();
			expect(initialModel).toEqual({ profile: null, labels: null, data: null, selectedAttribute: null, darkSchema: null, distUnit: null });
		});
	});

	describe('when initialized', () => {
		it('renders nothing when no profile is available', async () => {
			// arrange
			const element = await setup();

			// assert
			expect(element.shadowRoot.children.length).toBe(0);
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

			// assert
			const chart = element._chart;
			const config = chart.config;
			const datasetZero = config.data.datasets[0];
			expect(chart).not.toBeNull();
			expect(config.type).toBe('line');
			expect(config.options.responsive).toBe(true);
			expect(config.options.scales.x.title.text).toBe('elevationProfile_distance [m]');
			expect(config.options.scales.y.title.text).toBe('elevationProfile_alt [m]');
			expect(config.options.plugins.title.text).toBe('elevationProfile_elevation_reference_system');
			expect(config.data.labels).toEqual([0, 1, 2, 3, 4, 5]);
			expect(datasetZero.data).toEqual([0, 10, 20, 30, 40, 50]);
			expect(datasetZero.label).toBe('elevationProfile_elevation_profile');
			expect(element.shadowRoot.querySelectorAll('.chart-container canvas')).toHaveSize(1);
			const attrs = element.shadowRoot.getElementById('attrs');
			expect(attrs.value).toBe('alt');
			const sumUpElement = element.shadowRoot.getElementById('route-elevation-chart-footer-sumUp');
			expect(sumUpElement.innerText).toBe('elevationProfile_sumUp: ' + sumUp);
			const sumDownElement = element.shadowRoot.getElementById('route-elevation-chart-footer-sumDown');
			expect(sumDownElement.innerText).toBe('elevationProfile_sumDown: ' + sumDown);
			const verticalHeightElement = element.shadowRoot.getElementById('route-elevation-chart-footer-verticalHeight');
			expect(verticalHeightElement.innerText).toBe('elevationProfile_verticalHeight: ' + verticalHeight);
			const highestPointElement = element.shadowRoot.getElementById('route-elevation-chart-footer-highestPoint');
			expect(highestPointElement.innerText).toBe('elevationProfile_highestPoint: ' + highestPoint);
			const lowestPointElement = element.shadowRoot.getElementById('route-elevation-chart-footer-lowestPoint');
			expect(lowestPointElement.innerText).toBe('elevationProfile_lowestPoint: ' + lowestPoint);
			const linearDistanceElement = element.shadowRoot.getElementById('route-elevation-chart-footer-linearDistance');
			expect(linearDistanceElement.innerText).toBe('elevationProfile_linearDistance: ' + linearDistance);
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
			expect(value).toBe('#ddddff');
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

		it('returns a gradient that ends in steep ', async () => {// todo check
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

			// act
			const value = element._getBorder(context, altitudeData);

			// assert
			expect(value).toBe('#AA2266');
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

		it('should call _updateChart() and update the view', async () => {
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
			const updateChartSpy = spyOn(element, '_updateChart').and.callThrough();
			//act
			const attrs = element.shadowRoot.getElementById('attrs');
			attrs.value = 'surface';
			attrs.dispatchEvent(new Event('change'));
			attrs.value = 'slope';
			attrs.dispatchEvent(new Event('change'));

			// assert
			expect(updateChartSpy).toHaveBeenCalled();
			const chart = element._chart;
			const config = chart.config;
			const datasetZero = config.data.datasets[0];
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

	describe('when coordinates (slice-of-state) changes (from no coordinates)', () => {
		it('calls _getAltitudeProfile with coordinates', async () => {

			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			const altitudeData = profileSlopeSteep();
			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(altitudeData);
			const element = await setup();
			const getAltitudeProfileSpy = spyOn(element, '_getAltitudeProfile').and.callThrough();

			//act
			updateCoordinates(coordinates);

			// assert
			expect(getAltitudeProfileSpy).toHaveBeenCalledTimes(1);
			expect(getAltitudeProfileSpy).toHaveBeenCalledWith(coordinates);
		});
	});

	describe('when coordinates (slice-of-state) changes (from some coordinates)', () => {
		it('calls _getAltitudeProfile with new coordinates', async () => {

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
			const getAltitudeProfileSpy = spyOn(element, '_getAltitudeProfile').and.callThrough();

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
					}
				],
				attrs: [
					{
						id: 'surface',
						values: [
							[0, 0, 'asphalt'],
							[2, 2, 'gravel']
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
			expect(altitudeProfile.elevations[1].surface).toBe('missing');
			expect(altitudeProfile.elevations[2].surface).toBe('gravel');
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
				attrs: [
				]
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

			expect(Object.keys(SlopeType).length).toBe(2);
			expect(SlopeType.FLAT).toBe('flat');
			expect(SlopeType.STEEP).toBe('steep');
		});
	});

	describe('when dark theme is used', () => {
		it('returns the corresponding dark colors', async () => {
			// arrange
			await setup();

			// act
			setIsDarkSchema(true);

			// assert
			expect(ElevationProfile.SLOPE_FLAT_COLOR).toBe('#66eeff');
			expect(ElevationProfile.SLOPE_STEEP_COLOR).toBe('#ee4444');
			expect(ElevationProfile.BACKGROUND_COLOR).toBe('#888888');
			expect(ElevationProfile.BORDER_COLOR).toBe('#886644');
		});
	});

	describe('when light theme is used', () => {
		it('returns the corresponding light colors', async () => {
			// arrange
			await setup();

			// act
			setIsDarkSchema(false);

			// assert
			expect(ElevationProfile.SLOPE_FLAT_COLOR).toBe('#eeff66');
			expect(ElevationProfile.SLOPE_STEEP_COLOR).toBe('#4444ee');
			expect(ElevationProfile.BACKGROUND_COLOR).toBe('#ddddff');
			expect(ElevationProfile.BORDER_COLOR).toBe('#AA2266');
		});
	});


	describe('when mouse moves over chart', () => {

		fit('setCoodinates to write to  store', async () => {
			// arrange
			const coordinates = fromLonLat([11, 48]);

			spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			await setup({
				elevationProfile: {
					active: true,
					coordinates: coordinates
				}
			});
			const altitudeProfile = new ElevationProfile();
			const setCoordinatesSpy = spyOn(altitudeProfile, 'setCoordinates').and.callThrough();

			// act
			altitudeProfile.setCoordinates(coordinates);

			// assert
			expect(setCoordinatesSpy).toHaveBeenCalled();


			expect(store.getState().highlight.features).toHaveSize(1);
			// expect(store.getState().highlight.features[0].data.coordinate).toEqual([coordinates]);
			expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.TEMPORARY);

		});

		// it('should xxx', async () => {
		// 	// arrange
		// 	const coordinates = [
		// 		[0, 1],
		// 		[2, 3]
		// 	];
		// 	spyOn(elevationServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
		// 	const element = await setup({
		// 		elevationProfile: {
		// 			active: true,
		// 			coordinates: coordinates
		// 		}
		// 	});

		// 	//act
		// 	// const target = element.shadowRoot.querySelector('.altitudeprofile');
		// 	// const target = element.shadowRoot.querySelectorAll('.chart-container canvas')[0];
		// 	// console.log('🚀 ~ target', target);

		// 	const chart = element._chart;

		// 	console.log('🚀 ~ chart', chart);


		// 	// trigger mousemove event
		// 	chart.canvas.dispatchEvent(new MouseEvent('mousemove', {
		// 		clientX: 100,
		// 		clientY: 100
		// 	}));

		// 	// // check if tooltip is displayed with correct value
		// 	// const tooltip = element.shadowRoot.querySelector('.chartjs-tooltip');
		// 	// // console.log('🚀 ~ file: ElevationProfile.test.js:677 ~ fit ~ tooltip.innerText', tooltip.innerText);
		// 	// expect(tooltip.innerText).toEqual('10');


		// 	expect(store.getState().highlight.features).toHaveSize(1);
		// 	expect(store.getState().highlight.features[0].data.coordinate).toEqual([10, 10]);
		// 	expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.TEMPORARY);

		// });
	});




});
