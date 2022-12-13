import { $injector } from '../../../../src/injection/index.js';
import { AltitudeProfile } from '../../../../src/modules/altitudeProfile/components/AltitudeProfile.js';
import { altitudeProfileReducer } from '../../../../src/store/altitudeProfile/altitudeProfile.reducer.js';
import { updateCoordinates } from '../../../../src/store/altitudeProfile/altitudeProfile.action.js';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer.js';

import { TestUtils } from '../../../test-utils.js';

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
			},
			{
				id: 'anotherType',
				values: [
					[0, 2, 'cycle'],
					[4, 5, 'foot']
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
					[1, 1, 0.2]
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

	const elementMock = {
		_getSlopeGradient() {},
		_getTextTypeGradient() {}
	};

	const configService = {
		getValueAsPath: () => {}
	};

	const chart = { ctx: { createLinearGradient: () => {
		return { addColorStop: () => {} };
	} }, chartArea: { left: 0, right: 100, width: 200 } } ;
	const altitudeData = profileSlopeSteep();

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

		return TestUtils.render(AltitudeProfile.tag);
	};

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
					active: false,
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

	describe('when _getSlopeGradient() is called', () => {
		it('for coverage - slope ends in steep - renders the view when a profile is available', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profileSlopeSteep());
			const element = await setup({
				media: {
					darkSchema: true
				},
				altitudeProfile: {
					active: false,
					coordinates: coordinates
				}
			});
			// element._getGradient();
			// const xxx = spyOn(element, '_getGradient').withArgs(jasmine.any(Chart), jasmine.anything).and.callThrough();


			const attrs = element.shadowRoot.getElementById('attrs');
			attrs.value = 'slope';
			attrs.dispatchEvent(new Event('change'));

			// assert
			const chart = element._chart;
			expect(chart).not.toBeNull();
			// expect(xxx).toHaveBeenCalled();
		});
	});
	describe('when _getGradient() is called', () => {

		it('returns a valid value for "selectedAttribute alt"', async () => {
			// arrange
			const element = await setup();

			// act
			const value = element._getGradient('alt', chart, altitudeData);
			// element.signal('update_selected_attribute', 'alt');

			// assert
			expect(value).toBe('#88dd88');
		});

		it('executes the branch "slope" for "selectedAttribute slope"', async () => {
			// arrange
			const element = await setup();
			const slopeGradientSpy = spyOn(element, '_getSlopeGradient').and.callThrough();

			// act
			element._getGradient('slope', chart, altitudeData);
			// element.signal('update_selected_attribute', 'slope');

			// assert
			expect(slopeGradientSpy).toHaveBeenCalled();
		});

		const checkTextTypeWorks = async (attributeType, chart, altitudeData) => {
			// arrange
			const element = await setup();
			const textTypeGradientSpy = spyOn(element, '_getTextTypeGradient').and.callThrough();
			spyOn(element, 'getAltitudeProfileAttributeType').and.resolveTo(attributeType);

			// act
			element._getGradient(attributeType, chart, altitudeData);

			// assert
			expect(textTypeGradientSpy).toHaveBeenCalled();
		};

		it('executes the branch "TextType" for "selectedAttribute surface"', async () => {
			await checkTextTypeWorks('surface', chart, altitudeData);
		});

		it('executes the branch "TextType" for "selectedAttribute anotherType"', async () => {
			await checkTextTypeWorks('anotherType', chart, altitudeData);
		});

		// it('executes the branch "slope" for "selectedAttribute slope"', async () => {
		// 	// arrange
		// 	const element = await setup();
		// 	const getGradientSpy = spyOn(element, '_getGradient').and.callThrough();
		// 	const getSlopeGradientSpy = spyOn(element, '_getSlopeGradient').and.callThrough();

		// 	// act
		// 	const altValue = element._getGradient(chart, altitudeData);
		// 	element.signal('update_selected_attribute', 'slope');
		// 	// element.signal(Update_Selected_Attribute, 'other');

		// 	element._getGradient(chart, altitudeData);

		// 	// assert
		// 	expect(altValue).toBe('#88dd88');
		// 	expect(getGradientSpy).toHaveBeenCalled();
		// 	expect(getSlopeGradientSpy).toHaveBeenCalled();
		// });


		// it('for coverage - slope ends in steep - _getSlopeGradient', async () => {
		// 	// arrange
		// 	// const element =
		// 	await setup();
		// 	const altitudeProfile = new AltitudeProfile();
		// 	const getSlopeGradientSpy = spyOn(altitudeProfile, '_getSlopeGradient').and.callThrough();
		// 	//.withArgs(chart, altitudeData).and.resolveTo(profileSlopeSteep())     .withArgs(jasmine.any(Chart), jasmine.anything)
		// 	// element.shadowRoot.querySelectorAll('.chart-container canvas')

		// 	// act
		// 	altitudeProfile._getSlopeGradient(chart, altitudeData);

		// 	// assert
		// 	expect(getSlopeGradientSpy).toHaveBeenCalled();
		// });

	});

	describe('when attribute changes', () => {

		it('should call chart.update() and updates the view', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());


			// const chartSpy = jasmine.createSpyObj({ update: null });
			// const chartMock = { chart: chartSpy };
			// service.updateChartWith(chartMock);


			const element = await setup({
				altitudeProfile: {
					active: false,
					coordinates: coordinates
				}
			});

			//act
			const attrs = element.shadowRoot.getElementById('attrs');
			attrs.value = 'slope';
			attrs.dispatchEvent(new Event('change'));

			// assert

			// expect(chartSpy.update).toHaveBeenCalled();


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

	describe('when profile (slice-of-state) changes', () => {
		it('updates the view', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup();

			//act
			updateCoordinates(coordinates);

			// assert
			await TestUtils.timeout();
			expect(element._chart).not.toBeNull();
			expect(element.shadowRoot.querySelectorAll('.chart-container canvas')).toHaveSize(1);
		});
	});



	// todo - check correct schema is used
});
