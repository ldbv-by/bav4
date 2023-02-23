import { KeyActionMapper } from '../../src/utils/KeyActionMapper';

describe('KeyActionMapper', () => {
	const keyCodes = { Escape: 'Escape', Backspace: 'Backspace', Delete: 'Delete', F11: 'F11' };

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

		it('accepts only key-values as String', () => {
			const action = () => {};

			expect(() => new KeyActionMapper(document).addForKeyDown({}, action)).toThrowError(TypeError, 'keyCode must be a string');
			expect(() => new KeyActionMapper(document).addForKeyDown(42, action)).toThrowError(TypeError, 'keyCode must be a string');
			expect(() => new KeyActionMapper(document).addForKeyDown(null, action)).toThrowError(TypeError, 'keyCode must be a string');
			expect(() => new KeyActionMapper(document).addForKeyDown(undefined, action)).toThrowError(TypeError, 'keyCode must be a string');
		});

		it('accepts only functions as action', () => {
			const key = 'some';
			expect(() => new KeyActionMapper(document).addForKeyDown(key, {})).toThrowError(TypeError, 'action must be a function');
			expect(() => new KeyActionMapper(document).addForKeyDown(key, 'some')).toThrowError(TypeError, 'action must be a function');
			expect(() => new KeyActionMapper(document).addForKeyDown(key, null)).toThrowError(TypeError, 'action must be a function');
			expect(() => new KeyActionMapper(document).addForKeyDown(key, undefined)).toThrowError(TypeError, 'action must be a function');
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
		describe('and keys for keyup mapped to actions', () => {
			const getKeyEvent = (key) => {
				return new KeyboardEvent('keyup', { key: key });
			};

			it('calls the mapped actions', () => {
				const backspaceSpy = jasmine.createSpy('backspaceAction');
				const escapeSpy = jasmine.createSpy('escapeAction');
				const deleteSpy = jasmine.createSpy('deleteAction');
				const notMappedF11Spy = jasmine.createSpy('notMappedF11Action');
				const instanceUnderTest = new KeyActionMapper(document)
					.addForKeyUp(keyCodes.Backspace, backspaceSpy)
					.addForKeyUp(keyCodes.Escape, escapeSpy)
					.addForKeyUp(keyCodes.Delete, deleteSpy);

				instanceUnderTest.activate();
				document.dispatchEvent(getKeyEvent(keyCodes.Backspace));
				document.dispatchEvent(getKeyEvent(keyCodes.Escape));
				document.dispatchEvent(getKeyEvent(keyCodes.Delete));
				document.dispatchEvent(getKeyEvent(keyCodes.F11));
				instanceUnderTest.deactivate();

				expect(backspaceSpy).toHaveBeenCalled();
				expect(escapeSpy).toHaveBeenCalled();
				expect(deleteSpy).toHaveBeenCalled();
				expect(notMappedF11Spy).not.toHaveBeenCalled();
			});

			it('does NOT calls the mapped actions after deactivate', () => {
				const backspaceSpy = jasmine.createSpy('backspaceAction');
				const instanceUnderTest = new KeyActionMapper(document).addForKeyUp(keyCodes.Backspace, backspaceSpy);

				instanceUnderTest.activate();
				document.dispatchEvent(getKeyEvent(keyCodes.Backspace));
				instanceUnderTest.deactivate();

				expect(backspaceSpy).toHaveBeenCalled();
				backspaceSpy.calls.reset();

				document.dispatchEvent(getKeyEvent(keyCodes.Backspace));

				expect(backspaceSpy).not.toHaveBeenCalled();
			});
		});

		describe('and keys for keydown mapped to actions', () => {
			const getKeyEvent = (key) => {
				return new KeyboardEvent('keydown', { key: key });
			};

			it('calls the mapped actions', () => {
				const backspaceSpy = jasmine.createSpy('backspaceAction');
				const escapeSpy = jasmine.createSpy('escapeAction');
				const deleteSpy = jasmine.createSpy('deleteAction');
				const notMappedF11Spy = jasmine.createSpy('notMappedF11Action');
				const instanceUnderTest = new KeyActionMapper(document)
					.addForKeyDown(keyCodes.Backspace, backspaceSpy)
					.addForKeyDown(keyCodes.Escape, escapeSpy)
					.addForKeyDown(keyCodes.Delete, deleteSpy);

				instanceUnderTest.activate();
				document.dispatchEvent(getKeyEvent(keyCodes.Backspace));
				document.dispatchEvent(getKeyEvent(keyCodes.Escape));
				document.dispatchEvent(getKeyEvent(keyCodes.Delete));
				document.dispatchEvent(getKeyEvent(keyCodes.F11));
				instanceUnderTest.deactivate();

				expect(backspaceSpy).toHaveBeenCalled();
				expect(escapeSpy).toHaveBeenCalled();
				expect(deleteSpy).toHaveBeenCalled();
				expect(notMappedF11Spy).not.toHaveBeenCalled();
			});

			it('does NOT calls the mapped actions after deactivate', () => {
				const backspaceSpy = jasmine.createSpy('backspaceAction');
				const instanceUnderTest = new KeyActionMapper(document).addForKeyDown(keyCodes.Backspace, backspaceSpy);

				instanceUnderTest.activate();
				document.dispatchEvent(getKeyEvent(keyCodes.Backspace));
				instanceUnderTest.deactivate();

				expect(backspaceSpy).toHaveBeenCalled();
				backspaceSpy.calls.reset();

				document.dispatchEvent(getKeyEvent(keyCodes.Backspace));

				expect(backspaceSpy).not.toHaveBeenCalled();
			});
		});
	});

	describe('when key is pressed on inputElement', () => {
		describe('and keys for keyup mapped to actions', () => {
			const getKeyDownEvent = (keyCode, target) => {
				const event = new KeyboardEvent('keydown', { code: keyCode });
				spyOnProperty(event, 'target', 'get').and.returnValue(target);
				return event;
			};

			const getKeyUpEvent = (keyCode, target) => {
				const event = new KeyboardEvent('keyup', { code: keyCode });
				spyOnProperty(event, 'target', 'get').and.returnValue(target);
				return event;
			};

			it('does NOT calls the mapped actions', () => {
				const backspaceSpy = jasmine.createSpy('backspaceAction');
				const instanceUnderTest = new KeyActionMapper(document).addForKeyDown(keyCodes.Backspace, backspaceSpy);

				const input = document.createElement('input');
				input.type = 'text';
				document.body.appendChild(input);
				const spy = spyOn(instanceUnderTest, '_isInputElement').withArgs(input).and.callThrough();

				instanceUnderTest.activate();
				document.dispatchEvent(getKeyDownEvent(keyCodes.Backspace, input));
				document.dispatchEvent(getKeyUpEvent(keyCodes.Backspace, input));
				instanceUnderTest.deactivate();

				expect(backspaceSpy).not.toHaveBeenCalled();
				expect(spy).toHaveBeenCalledTimes(2);
			});
		});
	});
});
