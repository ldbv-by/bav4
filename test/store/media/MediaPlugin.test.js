import { TestUtils } from '../../test-utils.js';
import { MediaPlugin } from '../../../src/store/media/MediaPlugin';
import { createMediaReducerWithInitialState, MIN_WIDTH_MEDIA_QUERY, ORIENTATION_MEDIA_QUERY } from '../../../src/store/media/media.reducer.js';
import { $injector } from '../../../src/injection/index.js';


describe('MediaPlugin', () => {

	const environmentServiceWindowMock = {
		matchMedia() { }
	};

	const setup = (mediaReducer) => {

		const store = TestUtils.setupStoreAndDi({}, {
			media: mediaReducer,
		});
		$injector
			.registerSingleton('EnvironmentService', { getWindow: () => environmentServiceWindowMock });
		return store;
	};

	it('registers media query change listeners', async () => {
		const initialState = {
			portrait: false,
			minWidth: false

		};
		spyOn(environmentServiceWindowMock, 'matchMedia')
			.withArgs(ORIENTATION_MEDIA_QUERY).and.returnValue(TestUtils.newMediaQueryList(true))
			.withArgs(MIN_WIDTH_MEDIA_QUERY).and.returnValue(TestUtils.newMediaQueryList(true));
		const store = setup(createMediaReducerWithInitialState(initialState));
		const instanceUnderTest = new MediaPlugin();

		await instanceUnderTest.register(store);

		expect(store.getState().media.portrait).toBeTrue();
		expect(store.getState().media.minWidth).toBeTrue();
	});
});
