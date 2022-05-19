import { KeyActionMapper } from '../../../src/modules/commons/KeyActionMapper';

describe('KeyActionMapper', () => {

	describe('when instantiated', () => {

		it('has initial state', () => {
			const instanceUnderTest = new KeyActionMapper(document);

			expect(instanceUnderTest).toBeTruthy();
			expect(instanceUnderTest._document).toBe(document);
			expect(instanceUnderTest._mapping).toEqual({ keyup: {}, keydown: {} });
			expect(instanceUnderTest._keyUpListener).toBeTruthy();
			expect(instanceUnderTest._keyDownListener).toBeTruthy();
		});

		it('has methods', () => {
			const instanceUnderTest = new KeyActionMapper(document);

			expect(instanceUnderTest).toBeTruthy();
			expect(instanceUnderTest.activate).toBeTruthy();
			expect(instanceUnderTest.deactivate).toBeTruthy();
			expect(instanceUnderTest.addForKeyUp).toBeTruthy();
			expect(instanceUnderTest.addForKeyDown).toBeTruthy();
		});
	});

	describe('when activated', () => {
		it('adds event listener', () => {

			const instanceUnderTest = new KeyActionMapper(document);
			const spy = spyOn(document, 'addEventListener');

			instanceUnderTest.activate();

			expect(spy).toHaveBeenCalledWith('keyup', instanceUnderTest._keyUpListener);
			expect(spy).toHaveBeenCalledWith('keydown', instanceUnderTest._keyDownListener);
		});
	});

	describe('when deactivated', () => {
		it('removes event listener', () => {

			const instanceUnderTest = new KeyActionMapper(document);
			const spy = spyOn(document, 'removeEventListener');

			instanceUnderTest.deactivate();

			expect(spy).toHaveBeenCalledWith('keyup', instanceUnderTest._keyUpListener);
			expect(spy).toHaveBeenCalledWith('keydown', instanceUnderTest._keyDownListener);
		});
	});

	describe('when key is pressed', () => {
		const keyCodes = { 'Escape': 8, 'Backspace': 27, 'Delete': 46, 'F11': 122 };

		describe('and keys for keyup mapped to actions', () => {
			const getKeyEvent = (keyCode) => {
				return new KeyboardEvent('keyup', { code: keyCode });
			};

			xit('calls the mapped actions', () => {
				const backspaceSpy = jasmine.createSpy('backspace');
				const instanceUnderTest = new KeyActionMapper(document)
					.addForKeyUp(keyCodes.Backspace, backspaceSpy);

				instanceUnderTest.activate();
				document.dispatchEvent(getKeyEvent(keyCodes.Backspace));
				instanceUnderTest.deactivate();

				expect(backspaceSpy).toHaveBeenCalled();
			});
		});

	});
});
