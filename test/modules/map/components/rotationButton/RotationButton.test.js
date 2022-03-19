import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
import { positionReducer } from '../../../../../src/store/position/position.reducer.js';
import { RotationButton } from '../../../../../src/modules/map/components/rotationButton/RotationButton.js';
import { changeLiveRotation } from '../../../../../src/store/position/position.action.js';
window.customElements.define(RotationButton.tag, RotationButton);


describe('GeolocationButton', () => {
	let store;
	const defaultState = {
		liveRotation: 0
	};
	const mapServiceStub = {
		getMinimalRotation() {
			return .05;
		}
	};

	const setup = async (positionState = defaultState) => {

		const state = {
			position: positionState
		};

		store = TestUtils.setupStoreAndDi(state, { position: positionReducer });
		$injector
			.registerSingleton('MapService', mapServiceStub)
			.registerSingleton('TranslationService', { translate: (key) => key });


		return await TestUtils.render(RotationButton.tag);
	};

	describe('class', () => {

		it('defines constant values', async () => {

			expect(RotationButton.HIDE_BUTTON_DELAY_MS).toBe(1000);
			expect(RotationButton.THROTTLE_DELAY_MS).toBe(100);
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

			it('renders a geolocation button', async () => {
				const liveRotationValue = mapServiceStub.getMinimalRotation() - .01;
				const element = await setup({ liveRotation: liveRotationValue });

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});

		describe('liveRotation > threshold value', () => {

			it('renders a geolocation button', async () => {
				const liveRotationValue = .5;
				const element = await setup({ rotation: .5, liveRotation: liveRotationValue });
				expect(element.shadowRoot.querySelectorAll('button')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('button').classList.contains('rotation-button')).toBeTrue();
				expect(element.shadowRoot.querySelector('button').title).toBe('map_rotationButton_title');
				expect(element.shadowRoot.querySelector('button').style.transform).toBe(`rotate(${liveRotationValue}rad)`);
				expect(element.shadowRoot.querySelectorAll('.icon')).toHaveSize(1);
			});
		});
	});

	describe('when rotation changes', () => {

		beforeEach(async () => {
			jasmine.clock().install();
		});

		afterEach(function () {
			jasmine.clock().uninstall();
		});

		it('rotates the button throttled', async () => {
			//throttle is based on Date
			jasmine.clock().mockDate();
			let liveRotationValue = .5;
			const element = await setup({ liveRotation: liveRotationValue });

			jasmine.clock().tick(RotationButton.THROTTLE_DELAY_MS + 100);
			expect(element.shadowRoot.querySelector('button').style.transform).toBe(`rotate(${liveRotationValue}rad)`);

			changeLiveRotation(liveRotationValue = 1);
			jasmine.clock().tick(RotationButton.THROTTLE_DELAY_MS) + 100;

			expect(element.shadowRoot.querySelector('button').style.transform).toBe(`rotate(${liveRotationValue}rad)`);
		});

		it('hides the button when rotation < threshold', async () => {
			const element = await setup({ liveRotation: mapServiceStub.getMinimalRotation() - .01 });

			changeLiveRotation();

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('avoids flickering', async () => {
			//throttle is based on Date
			jasmine.clock().mockDate();
			const liveRotationValue = .5;
			const element = await setup({ liveRotation: liveRotationValue });

			expect(element.shadowRoot.children.length).not.toBe(0);

			changeLiveRotation();
			changeLiveRotation(liveRotationValue);
			changeLiveRotation();
			jasmine.clock().tick(RotationButton.HIDE_BUTTON_DELAY_MS + 100);

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when clicked', () => {

		it('updates the rotation property', async () => {
			const element = await setup({ liveRotation: .5 });

			element.shadowRoot.querySelector('button').click();

			expect(store.getState().position.rotation).toBe(0);
		});
	});
});
