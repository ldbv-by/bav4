import { mainMenuLandscapePaddingProvider } from '../../../src/services/provider/padding.provider';
import { createNoInitialStateMainMenuReducer } from '../../../src/store/mainMenu/mainMenu.reducer';
import { createNoInitialStateMediaReducer } from '../../../src/store/media/media.reducer';
import { TestUtils } from '../../test-utils';

describe('Padding provider', () => {
	describe('padding provider based on mainmenu-width and landscape orientation', () => {

		const setup = async (state) => {

			const initialState = {
				media: {
					portrait: false
				},
				mainMenu: {
					open: true
				},
				...state
			};
			TestUtils.setupStoreAndDi(initialState, { media: createNoInitialStateMediaReducer(), mainMenu: createNoInitialStateMainMenuReducer() });
		};

		it('returns the padding for open mainmenu in landscape orientation', async () => {
			await setup();
			const styleMock = { fontSize: '42px', getPropertyValue: () => {} };
			spyOn(styleMock, 'getPropertyValue').withArgs('--width-mainmenu').and.callFake(() => '4.2em');
			spyOn(window, 'getComputedStyle').and.returnValue(styleMock);
			expect(mainMenuLandscapePaddingProvider()).toEqual([0, 0, 0, 176.4]);
		});

		it('returns the padding for closed mainmenu in landscape orientation', async () => {
			const state = {
				mainMenu: {
					open: false
				}
			};
			await setup(state);
			const styleMock = { fontSize: '42px', getPropertyValue: () => {} };
			spyOn(styleMock, 'getPropertyValue').withArgs('--width-mainmenu').and.callFake(() => '4.2em');
			spyOn(window, 'getComputedStyle').and.returnValue(styleMock);
			expect(mainMenuLandscapePaddingProvider()).toEqual([0, 0, 0, 0]);
		});

		it('returns the padding for open mainmenu in portrait orientation', async () => {
			const state = {
				media: {
					portrait: true
				}
			};
			await setup(state);
			const styleMock = { fontSize: '42px', getPropertyValue: () => {} };
			spyOn(styleMock, 'getPropertyValue').withArgs('--width-mainmenu').and.callFake(() => '4.2em');
			spyOn(window, 'getComputedStyle').and.returnValue(styleMock);
			expect(mainMenuLandscapePaddingProvider()).toEqual([0, 0, 0, 0]);
		});


		it('returns the padding for closed mainmenu in portrait orientation', async () => {
			const state = {
				mainMenu: {
					open: false
				},
				media: {
					portrait: true
				}
			};
			await setup(state);
			const styleMock = { fontSize: '42px', getPropertyValue: () => {} };
			spyOn(styleMock, 'getPropertyValue').withArgs('--width-mainmenu').and.callFake(() => '4.2em');
			spyOn(window, 'getComputedStyle').and.returnValue(styleMock);
			expect(mainMenuLandscapePaddingProvider()).toEqual([0, 0, 0, 0]);
		});
	});
});
