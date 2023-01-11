import { $injector } from '../../../../src/injection';
import { SurfaceType } from '../../../../src/modules/altitudeProfile/utils/elevationProfileAttributeTypes';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { TestUtils } from '../../../test-utils';

const setup = (state = {}) => {
	const initialState = {
		media: {
			darkSchema: false
		},
		...state
	};
	TestUtils.setupStoreAndDi(initialState, {
		media: createNoInitialStateMediaReducer()
	});

	$injector
		.registerSingleton('TranslationService', { translate: (key) => key });

	return;
};

describe('tests for elevationProfileAttributeTypes.js', () => {
	describe('when SurfaceType is initialized', () => {
		it('all fields should be set', async () => {
			// arrange
			await setup();
			const surfaceType = new SurfaceType('asphalt', '#111111', '#222222');

			// assert
			expect(surfaceType.name).toBe('asphalt');
			expect(surfaceType.caption).toBe('elevationProfile_surface');
			expect(surfaceType.color).toBe('#111111');
		});
	});

	const darkState = {
		media: {
			darkSchema: true
		}
	};

	describe('when SurfaceType is initialtzed and dark mode is selected', () => {
		it('all fields should be set and color should be the dark color', async () => {
			// arrange
			await setup(darkState);
			const surfaceType = new SurfaceType('asphalt', '#111111', '#222222');

			// assert
			expect(surfaceType.name).toBe('asphalt');
			expect(surfaceType.caption).toBe('elevationProfile_surface');
			expect(surfaceType.color).toBe('#222222');
		});
	});

	describe('when attribute types are initialized only with light color', () => {
		it('returns light color (as dark) if requesting dark', async () => {
			// arrange
			await setup(darkState);
			const surfaceType = new SurfaceType('asphalt', '#111111');

			// assert
			expect(surfaceType.name).toBe('asphalt');
			expect(surfaceType.caption).toBe('elevationProfile_surface');
			expect(surfaceType.color).toBe('#111111');
		});
	});
});
