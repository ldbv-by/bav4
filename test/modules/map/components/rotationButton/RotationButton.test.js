import { TestUtils } from '@test/test-utils.js';
import { $injector } from '@src/injection';
import { positionReducer } from '@src/store/position/position.reducer.js';
import { RotationButton } from '@src/modules/map/components/rotationButton/RotationButton.js';
import { changeLiveRotation } from '@src/store/position/position.action.js';
window.customElements.define(RotationButton.tag, RotationButton);

describe('RotationButton', () => {
	let store;
	const defaultState = {
		liveRotation: 0
	};

	const setup = async (positionState = defaultState) => {
		const state = {
			position: positionState
		};

		store = TestUtils.setupStoreAndDi(state, { position: positionReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return await TestUtils.render(RotationButton.tag);
	};

	describe('class', () => {
		it('defines constant values', async () => {
			expect(RotationButton.HIDE_BUTTON_DELAY_MS).toBe(1000);
			expect(RotationButton.THROTTLE_DELAY_MS).toBe(10);
			expect(RotationButton.VISIBILITY_THRESHOLD_RAD).toBe(0.0001);
		});
	});

	describe('when initialized', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new RotationButton().getModel();

			expect(model).toEqual({
				liveRotation: 0
			});
		});

		describe('liveRotation < threshold value', () => {
			it('renders a rotation button', async () => {
				const liveRotationValue = RotationButton.VISIBILITY_THRESHOLD_RAD - 0.00001;
				const element = await setup({ liveRotation: liveRotationValue });

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});

		describe('liveRotation > threshold value', () => {
			it('renders a rotation button', async () => {
				const liveRotationValue = 0.5;
				const element = await setup({ rotation: 0.5, liveRotation: liveRotationValue });
				expect(element.shadowRoot.querySelectorAll('button')).toHaveLength(1);
				expect(element.shadowRoot.querySelector('button').classList.contains('rotation-button')).toBe(true);
				expect(element.shadowRoot.querySelector('button').title).toBe('map_rotationButton_title');
				expect(element.shadowRoot.querySelector('#rotation-target').style.transform).toBe(`rotate(${liveRotationValue}rad)`);
				expect(element.shadowRoot.querySelectorAll('.icon')).toHaveLength(1);
			});
		});
	});

	describe('when rotation changes', () => {
		beforeEach(async () => {
			vi.useFakeTimers();
		});

		afterEach(function () {
			vi.useRealTimers();
		});

		it('rotates the button throttled', async () => {
			//throttle is based on Date
			vi.setSystemTime(new Date());
			let liveRotationValue = 0.5;
			const element = await setup({ liveRotation: liveRotationValue });

			vi.advanceTimersByTime(RotationButton.THROTTLE_DELAY_MS + 100);
			expect(element.shadowRoot.querySelector('#rotation-target').style.transform).toBe(`rotate(${liveRotationValue}rad)`);

			changeLiveRotation((liveRotationValue = 1));
			vi.advanceTimersByTime(RotationButton.THROTTLE_DELAY_MS) + 100;

			expect(element.shadowRoot.querySelector('#rotation-target').style.transform).toBe(`rotate(${liveRotationValue}rad)`);
		});

		it('hides the button when rotation < threshold', async () => {
			const element = await setup({ liveRotation: RotationButton.VISIBILITY_THRESHOLD_RAD - 0.00001 });

			changeLiveRotation();

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('avoids flickering', async () => {
			//throttle is based on Date
			vi.setSystemTime(new Date());
			const liveRotationValue = 0.5;
			const element = await setup({ liveRotation: liveRotationValue });

			expect(element.shadowRoot.children.length).not.toBe(0);

			changeLiveRotation();
			changeLiveRotation(liveRotationValue);
			changeLiveRotation();
			vi.advanceTimersByTime(RotationButton.HIDE_BUTTON_DELAY_MS + 100);

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when clicked', () => {
		it('updates the rotation property', async () => {
			const element = await setup({ liveRotation: 0.5 });

			element.shadowRoot.querySelector('button').click();

			expect(store.getState().position.rotation).toBe(0);
		});
	});
});
