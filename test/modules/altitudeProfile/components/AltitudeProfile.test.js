import { $injector } from '../../../../src/injection/index.js';
import { AltitudeProfile } from '../../../../src/modules/altitudeProfile/components/AltitudeProfile.js';
import { altitudeProfileReducer } from '../../../../src/store/altitudeProfile/altitudeProfile.reducer.js';
import { updateCoordinates } from '../../../../src/store/altitudeProfile/altitudeProfile.action.js';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer.js';

import { TestUtils } from '../../../test-utils.js';

window.customElements.define(AltitudeProfile.tag, AltitudeProfile);

describe('AltitudeProfile', () => {
	const profile = {
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
					[0, 1, 0],
					[2, 3, 2],
					[4, 4, 4],
					[5, 5, 4]
				]
			},
			{
				id: 'surface',
				values: [
					[0, 2, 'asphalt'],
					[3, 5, 'gravel']
				]
			},
			{
				id: 'anotherType',
				values: [
					[0, 3, 'cycle'],
					[4, 5, 'foot']
				]
			}
		]
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
		return TestUtils.render(AltitudeProfile.tag);
	};

	describe('when instantiating the component', () => {
		it('expects the initial values of the model to be empty', async () => {
			await setup();
			const altitudeProfile = new AltitudeProfile();
			const initialModel = altitudeProfile.getModel();
			expect(initialModel).toEqual({ profile: null, labels: null, data: null, selectedAttribute: null, darkSchema: null });
		});
	});

	describe('when initialized', () => {
		it('renders nothing when no profile is available', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders the view when  profile is available', async () => {
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile);

			const element = await setup({
				altitudeProfile: {
					active: false,
					coordinates: coordinates
				}
			});

			expect(element._chart).not.toBeNull();
			// todo - check chart content / setup
			// todo - shorten and check test data
			// todo - check correct schema is used
			expect(element.shadowRoot.querySelectorAll('.chart-container canvas')).toHaveSize(1);
		});
	});

	// todo - mock AltitudeService.getAltitude()
	describe('when profile (slice-of-state) changes', () => {
		it('updates the view', async () => {
			// arrange
			const coordinates = [
				[0, 1],
				[2, 3]
			];
			spyOn(altitudeServiceMock, 'getProfile').withArgs(coordinates).and.resolveTo(profile);
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
		it('updates the view', async () => {});
	});

	describe('when media schema changes', () => {
		it('updates the view', async () => {});
	});
});
