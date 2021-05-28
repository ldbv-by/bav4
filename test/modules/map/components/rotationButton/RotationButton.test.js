import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
import { positionReducer } from '../../../../../src/store/position/position.reducer.js';
import { RotationButton } from '../../../../../src/modules/map/components/rotationButton/RotationButton.js';
import { changeLiveRotation } from '../../../../../src/store/position/position.action.js';
window.customElements.define(RotationButton.tag, RotationButton);


describe('GeolocationButton', () => {
	let store;
	const defaultState = {
		rotation: 0, liveRotation: 0
	};

	const setup = async (positionState = defaultState) => {

		const state = {
			position: positionState
		};

		store = TestUtils.setupStoreAndDi(state, { position: positionReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });


		return await TestUtils.render(RotationButton.tag);
	};

	describe('when initialized', () => {
		describe('rotation = 0', () => {

			it('renders a geolocation button', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelectorAll('button')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('button').classList.contains('hidden')).toBeTrue();
				expect(element.shadowRoot.querySelector('button').title).toBe('map_rotationButton_title');
				expect(element.shadowRoot.querySelector('button').style.transform).toBe('rotate(0rad)');
				expect(element.shadowRoot.querySelectorAll('.icon')).toHaveSize(1);
			});
		});

		describe('rotation != 0', () => {

			it('renders a geolocation button', async () => {
				const liveRotationValue = .5;
				const element = await setup({ rotation: .5, liveRotation: liveRotationValue });
				expect(element.shadowRoot.querySelectorAll('button')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('button').classList.contains('hidden')).toBeFalse();
				expect(element.shadowRoot.querySelector('button').title).toBe('map_rotationButton_title');
				expect(element.shadowRoot.querySelector('button').style.transform).toBe(`rotate(${liveRotationValue}rad)`);
				expect(element.shadowRoot.querySelectorAll('.icon')).toHaveSize(1);
			});
		});
	});

	describe('when rotation changes', () => {

		it('rotates the button', async () => {
			let liveRotationValue = .5;
			const element = await setup({ liveRotation: liveRotationValue });
			expect(element.shadowRoot.querySelector('button').style.transform).toBe(`rotate(${liveRotationValue}rad)`);
			
			changeLiveRotation(liveRotationValue = 1);
			
			expect(element.shadowRoot.querySelector('button').style.transform).toBe(`rotate(${liveRotationValue}rad)`);
		});

		it('hides the button when rotaion = 0', async () => {
			const element = await setup({ liveRotation: .5 });
			
			changeLiveRotation(0);
			
			expect(element.shadowRoot.querySelector('button').classList.contains('hidden')).toBeTrue();
		});
	});

	describe('when clicked', () => {

		it('updates the rotation property', async () => {
			const element = await setup({ rotation: .5 });

			element.shadowRoot.querySelector('button').click();

			expect(store.getState().position.rotation).toBe(0);
		});
	});
});
