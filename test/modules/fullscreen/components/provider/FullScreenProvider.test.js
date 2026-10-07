import { FullScreenProvider } from '@src/modules/fullscreen/components/provider/FullScreenProvider';
import { TestUtils } from '@test/test-utils';
import { $injector } from '@src/injection';
import { createNoInitialStateMediaReducer } from '@src/store/media/media.reducer';
import { toggleFullscreen } from '@src/store/media/media.action';

window.customElements.define(FullScreenProvider.tag, FullScreenProvider);

describe('FullScreenProvider', () => {
	const setup = (config) => {
		const { window } = config;
		const state = {
			media: {
				fullscreen: false
			}
		};
		TestUtils.setupStoreAndDi(state, {
			media: createNoInitialStateMediaReducer()
		});

		$injector.registerSingleton('EnvironmentService', {
			getWindow: () => window
		});
		return TestUtils.render(FullScreenProvider.tag);
	};

	describe('when initialized', () => {
		it('sets the correct fullscreen class, a listener and renders nothing', async () => {
			const addSpy = vi.fn();
			const removeSpy = vi.fn();
			const mockWindow = {
				document: {
					body: {
						classList: {
							add: addSpy,
							remove: removeSpy
						}
					}
				},
				matchMedia: () => ({ matches: false })
			};

			await setup({ window: mockWindow });

			expect(document.body.innerHTML).toBe('<ba-fullscreen-provider></ba-fullscreen-provider>');
			expect(addSpy).toHaveBeenCalledWith('normal-screen');
		});
	});

	describe('when fullscreen changed', () => {
		it('updates the css class and toggles fullscreen', async () => {
			const addSpy = vi.fn();
			const removeSpy = vi.fn();
			const requestFullscreenSpy = vi.fn();
			const exitFullscreenSpy = vi.fn();
			const mockWindow = {
				document: {
					body: {
						classList: {
							add: addSpy,
							remove: removeSpy
						},
						fullscreenElement: null,
						requestFullscreen: requestFullscreenSpy
					},
					exitFullscreen: exitFullscreenSpy
				},
				matchMedia: () => ({ matches: false })
			};

			await setup({ window: mockWindow });

			expect(document.body.innerHTML).toBe('<ba-fullscreen-provider></ba-fullscreen-provider>');

			expect(addSpy).toHaveBeenCalledWith('normal-screen');
			expect(removeSpy).toHaveBeenCalledWith('full-screen');

			toggleFullscreen();

			expect(addSpy).toHaveBeenCalledWith('full-screen');
			expect(removeSpy).toHaveBeenCalledWith('normal-screen');
			expect(requestFullscreenSpy).toHaveBeenCalledOnce();

			mockWindow.document.fullscreenElement = mockWindow.document.body;
			toggleFullscreen();

			expect(addSpy).toHaveBeenCalledWith('normal-screen');
			expect(removeSpy).toHaveBeenCalledWith('full-screen');
			expect(exitFullscreenSpy).toHaveBeenCalledOnce();
		});

		it('skips browser fullscreen when the body is already fullscreen', async () => {
			const requestFullscreenSpy = vi.fn();
			const body = {
				fullscreenElement: true,
				requestFullscreen: requestFullscreenSpy,
				classList: {
					add: vi.fn(),
					remove: vi.fn()
				}
			};
			const mockWindow = {
				document: { body },
				matchMedia: () => ({ matches: false })
			};

			await setup({ window: mockWindow });
			toggleFullscreen();

			expect(requestFullscreenSpy).not.toHaveBeenCalled();
		});
	});
});
