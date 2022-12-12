import { $injector } from '../../../../src/injection/index.js';
import { AltitudeProfile } from '../../../../src/modules/altitudeProfile/components/AltitudeProfile.js';
import { altitudeProfileReducer } from '../../../../src/store/altitudeProfile/altitudeProfile.reducer.js';
import { updateCoordinates } from '../../../../src/store/altitudeProfile/altitudeProfile.action.js';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer.js';

import { TestUtils } from '../../../test-utils.js';
import { SurfaceType } from '../../../../src/modules/altitudeProfile/components/SurfaceType.js';

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

	const configService = {
		getValueAsPath: () => {}
	};

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
			await TestUtils.timeout();
			expect(element.shadowRoot.querySelectorAll('.chart-container canvas')).toHaveSize(1);
			const attrs = element.shadowRoot.getElementById('attrs');
			expect(attrs.value).toBe('slope');
		});

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

			// assert
			const chart = element._chart;
			expect(chart).not.toBeNull();
		});
	});

	describe('when attribute changes', () => {
		it('updates the view', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
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
			const chart = element._chart;
			const config = chart.config;
			const datasetZero = config.data.datasets[0];
			expect(chart).not.toBeNull();
			expect(config.type).toBe('line');
			expect(config.options.responsive).toBe(true);
			expect(config.data.labels).toEqual([0, 1, 2, 3, 4, 5]);
			expect(datasetZero.data).toEqual([0, 10, 20, 30, 40, 50]);
			expect(datasetZero.label).toBe('Höhenprofil');
			await TestUtils.timeout();
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

	describe('when user changes profile attribute', () => {
		it('renders the surface view when surface is selected', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				altitudeProfile: {
					active: false,
					coordinates: coordinates
				}
			});

			//act
			element.signal('update_selected_attribute', 'surface');
			element.dispatchEvent(new Event('select'));

			// assert
			await TestUtils.timeout();
			const canvas = element.shadowRoot.querySelectorAll('.chart-container canvas');
			expect(canvas).toHaveSize(1);
			const attrs = element.shadowRoot.getElementById('attrs');
			expect(attrs.value).toBe('surface');
		});

		it('updates the model when alt is selected in DOM', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile());
			const element = await setup({
				altitudeProfile: {
					active: false,
					coordinates: coordinates
				}
			});

			//act
			const attrs = element.shadowRoot.getElementById('attrs');
			attrs.value = 'alt';
			attrs.dispatchEvent(new Event('change'));

			// assert
			await TestUtils.timeout();
			const selectedAttribute = element.getModel().selectedAttribute;
			expect(selectedAttribute).toBe('alt');
		});
	});

	describe('when attribute types are initialized only with light color', () => {
		it('returns light color (as dark) if requesting dark', async () => {
			// arrange
			await setup();
			const surfaceType = new SurfaceType('asphalt', '#222222');

			// assert
			expect(surfaceType.name).toBe('asphalt');
			expect(surfaceType.caption).toBe('altitudeProfile_surface');
			expect(surfaceType.color).toBe('#222222');
		});
	});
	// todo - check correct schema is used
});
