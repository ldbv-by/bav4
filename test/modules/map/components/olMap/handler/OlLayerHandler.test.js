import { OlLayerHandler } from '../../../../../../src/modules/map/components/olMap/handler/OlLayerHandler';

describe('LayerHandler', () => {

	class OlLayerHandleNoId extends OlLayerHandler {

	}
	class OlLayerHandlerImpl extends OlLayerHandler {
		
		constructor() {
			super('some');
		}
	}
	class OlLayerHandlerImpl2 extends OlLayerHandler {
		
		constructor() {
			super('some');
		}

		onActivate() { }

		onDeactivate() { }
	}

	describe('expected errors', () => {

		describe('constructor', () => {
			it('throws excepetion when instantiated without inheritance', () => {
				expect(() => new OlLayerHandler()).toThrowError(TypeError, 'Can not construct abstract class.');
			});

			it('throws excepetion when instantiated without an ID', () => {
				expect(() => new OlLayerHandleNoId()).toThrowError(TypeError, 'Id of this handler must be defined.');
			});
		});

		describe('methods', () => {
			it('throws excepetion when abstract #activate is called without overriding', () => {
				expect(() => new OlLayerHandlerImpl().activate()).toThrowError(TypeError, 'Please implement abstract method #onActivate or do not call super.onActivate from child.');
			});
			it('throws excepetion when abstract #activate is called without overriding', () => {
				expect(() => new OlLayerHandlerImpl().deactivate()).toThrowError(TypeError, 'Please implement abstract method #onDeactivate or do not call super.onDeactivate from child.');
			});
		});
	});

	describe('implementation', () => {

		describe('constructor', () => {
			it('initializes fields', () => {
				const instanceUnderTest = new OlLayerHandlerImpl2();

				expect(instanceUnderTest.id).toBe('some');
				expect(instanceUnderTest.active).toBeFalse();
			});
		});

		describe('methods', () => {
			it('activates/deactivates the handler', () => {
				const map = {};
				const layer = {};
				const instanceUnderTest = new OlLayerHandlerImpl2();
				const onActivateSpy = spyOn(instanceUnderTest, 'onActivate').and.returnValue(layer);
				const onDeactivateSpy = spyOn(instanceUnderTest, 'onDeactivate');

				instanceUnderTest.activate(map);

				expect(onActivateSpy).toHaveBeenCalledOnceWith(map);
				expect(onDeactivateSpy).not.toHaveBeenCalled();
				expect(instanceUnderTest.active).toBeTrue();
				onActivateSpy.calls.reset();

				instanceUnderTest.deactivate(map);

				expect(onActivateSpy).not.toHaveBeenCalled();
				expect(onDeactivateSpy).toHaveBeenCalled();
				expect(instanceUnderTest.active).toBeFalse();
			});
		});
	});
});
