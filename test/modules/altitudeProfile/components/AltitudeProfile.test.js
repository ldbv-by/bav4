import { $injector } from '../../../../src/injection/index.js';
import { AltitudeProfile, SlopeType } from '../../../../src/modules/altitudeProfile/components/AltitudeProfile.js';
import { altitudeProfileReducer } from '../../../../src/store/altitudeProfile/altitudeProfile.reducer.js';
import { updateCoordinates } from '../../../../src/store/altitudeProfile/altitudeProfile.action.js';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer.js';

import { TestUtils } from '../../../test-utils.js';
import { setIsDarkSchema } from '../../../../src/store/media/media.action.js';

window.customElements.define(AltitudeProfile.tag, AltitudeProfile);

describe('AltitudeProfile', () => {
	const _profile = {
		alts: [
			{
				dist: 0,
				alt: 0,
				e: 40,
				n: 50
			},
			{
				dist: 1,
				alt: 10,
				e: 41,
				n: 51
			},
			{
				dist: 2,
				alt: 20,
				e: 42,
				n: 52
			},
			{
				dist: 3,
				alt: 30,
				e: 43,
				n: 53
			},
			{
				dist: 4,
				alt: 40,
				e: 44,
				n: 54
			},
			{
				dist: 5,
				alt: 50,
				e: 45,
				n: 55
			}
		],
		stats: {
			sumUp: 1480.8,
			sumDown: 1668.6
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
		alts: [
			{
				dist: 0,
				alt: 0,
				e: 40,
				n: 50
			},
			{
				dist: 1,
				alt: 10,
				e: 41,
				n: 51
			},
			{
				dist: 2,
				alt: 20,
				e: 42,
				n: 52
			},
			{
				dist: 3,
				alt: 30,
				e: 43,
				n: 53
			}
		],
		stats: {
			sumUp: 1480.8,
			sumDown: 1668.6
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

	const altitudeServiceMock = {
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

	const setup = (state = {}) => {
		const initialState = {
			media: {
				darkSchema: false
			},
			...state
		};

		TestUtils.setupStoreAndDi(initialState, {
			media: createNoInitialStateMediaReducer(),
			altitudeProfile: altitudeProfileReducer
		});

		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('ConfigService', configService)
			.registerSingleton('AltitudeService', altitudeServiceMock);

		return TestUtils.renderAndLogLifecycle(AltitudeProfile.tag);
	};

	describe('class', () => {
		it('defines constant values', async () => {
			expect(AltitudeProfile.SLOPE_STEEP_THRESHOLD).toBe(0.02);
			expect(AltitudeProfile.SLOPE_FLAT_COLOR_DARK).toBe('#66eeff');
			expect(AltitudeProfile.SLOPE_FLAT_COLOR_LIGHT).toBe('#eeff66');
			expect(AltitudeProfile.SLOPE_STEEP_COLOR_DARK).toBe('#ee4444');
			expect(AltitudeProfile.SLOPE_STEEP_COLOR_LIGHT).toBe('#4444ee');
			expect(AltitudeProfile.BACKGROUND_COLOR_DARK).toBe('#888888');
			expect(AltitudeProfile.BACKGROUND_COLOR_LIGHT).toBe('#ddddff');
			expect(AltitudeProfile.BORDER_COLOR_DARK).toBe('#886644');
			expect(AltitudeProfile.BORDER_COLOR_LIGHT).toBe('#AA2266');
		});
	});

	describe('when instantiating the component', () => {
		it('expects the initial values of the model to be empty', async () => {
			// arrange
			await setup();
			const altitudeProfile = new AltitudeProfile();

			// assert
			const initialModel = altitudeProfile.getModel();
			expect(initialModel).toEqual({ profile: null, labels: null, data: null, selectedAttribute: null, darkSchema: null });
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
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				media: {
					darkSchema: true
				},
				altitudeProfile: {
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
			expect(config.data.labels).toEqual([0, 1, 2, 3, 4, 5]);
			expect(datasetZero.data).toEqual([0, 10, 20, 30, 40, 50]);
			expect(datasetZero.label).toBe('Höhenprofil');
			expect(element.shadowRoot.querySelectorAll('.chart-container canvas')).toHaveSize(1);
			const attrs = element.shadowRoot.getElementById('attrs');
			expect(attrs.value).toBe('alt');
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
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(altitudeData);
			const element = await setup({
				altitudeProfile: {
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
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(altitudeData);
			const element = await setup({
				altitudeProfile: {
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
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(altitudeData);
			const element = await setup({
				altitudeProfile: {
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
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(altitudeData);
			const element = await setup({
				altitudeProfile: {
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
			const altitudeProfile = new AltitudeProfile();
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
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				altitudeProfile: {
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
			expect(datasetZero.label).toBe('Höhenprofil');
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
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(altitudeData);
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
			spyOn(altitudeServiceMock, 'getProfile').and.resolveTo(altitudeData);
			const element = await setup({
				altitudeProfile: {
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
				alts: [
					{
						dist: 0,
						alt: 0,
						e: 40,
						n: 50
					},
					{
						dist: 1,
						alt: 10,
						e: 41,
						n: 51
					},
					{
						dist: 2,
						alt: 20,
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
			const ap = new AltitudeProfile();

			//act
			ap._enrichProfileData(altitudeProfile);

			// assert
			expect(altitudeProfile.alts[0].surface).toBe('asphalt');
			expect(altitudeProfile.alts[1].surface).toBe('missing');
			expect(altitudeProfile.alts[2].surface).toBe('gravel');
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
			expect(AltitudeProfile.SLOPE_FLAT_COLOR).toBe('#66eeff');
			expect(AltitudeProfile.SLOPE_STEEP_COLOR).toBe('#ee4444');
			expect(AltitudeProfile.BACKGROUND_COLOR).toBe('#888888');
			expect(AltitudeProfile.BORDER_COLOR).toBe('#886644');
		});
	});

	describe('when light theme is used', () => {
		it('returns the corresponding light colors', async () => {
			// arrange
			await setup();

			// act
			setIsDarkSchema(false);

			// assert
			expect(AltitudeProfile.SLOPE_FLAT_COLOR).toBe('#eeff66');
			expect(AltitudeProfile.SLOPE_STEEP_COLOR).toBe('#4444ee');
			expect(AltitudeProfile.BACKGROUND_COLOR).toBe('#ddddff');
			expect(AltitudeProfile.BORDER_COLOR).toBe('#AA2266');
		});
	});
});
