import { getDefaultLayerOptions, OlLayerHandler } from '../../../../src/modules/olMap/handler/OlLayerHandler';


describe('getDefaultLayerConfig', () => {

	it('returns thr default configuration for a layer handler', () => {
		expect(getDefaultLayerOptions()).toEqual({ preventDefaultClickHandling: true, preventDefaultContextClickHandling: true });
	});
});

describe('LayerHandler', () => {

	class OlLayerHandleNoId extends OlLayerHandler {

	}
	class OlLayerHandlerImpl extends OlLayerHandler {

		constructor() {
			super('some');
		}
	}
	class OlLayerHandlerImpl2 extends OlLayerHandler {

		constructor(id, options) {
			super(id, options);
		}

		onActivate() { }

		onDeactivate() { }
	}


	describe('expected errors', () => {

		describe('constructor', () => {
			it('throws exception when instantiated without inheritance', () => {
				expect(() => new OlLayerHandler()).toThrowError(TypeError, 'Can not construct abstract class.');
			});

			it('throws exception when instantiated without an ID', () => {
				expect(() => new OlLayerHandleNoId()).toThrowError(TypeError, 'Id of this handler must be defined.');
			});
		});

		describe('methods', () => {
			it('throws exception when abstract #activate is called without overriding', () => {
				expect(() => new OlLayerHandlerImpl().activate()).toThrowError(TypeError, 'Please implement abstract method #onActivate or do not call super.onActivate from child.');
			});
			it('throws exception when abstract #activate is called without overriding', () => {
				expect(() => new OlLayerHandlerImpl().deactivate()).toThrowError(TypeError, 'Please implement abstract method #onDeactivate or do not call super.onDeactivate from child.');
			});
		});
	});

	describe('implementation', () => {

		describe('constructor', () => {
			it('initializes fields with default config', () => {
				const instanceUnderTest = new OlLayerHandlerImpl2('foo');

				expect(instanceUnderTest.id).toBe('foo');
				expect(instanceUnderTest.active).toBeFalse();
				expect(instanceUnderTest.options).toEqual(getDefaultLayerOptions());
			});

			it('initializes fields with custom config', () => {
				const options = { preventDefaultClickHandling: false, preventDefaultContextClickHandling: false };
				const instanceUnderTest = new OlLayerHandlerImpl2('foo', options);

				expect(instanceUnderTest.id).toBe('foo');
				expect(instanceUnderTest.active).toBeFalse();
				expect(instanceUnderTest.options).toEqual({ preventDefaultClickHandling: false, preventDefaultContextClickHandling: false });
			});
		});

		describe('methods', () => {
			it('activates/deactivates the handler', () => {
				const map = {};
				const layer = {};
				const instanceUnderTest = new OlLayerHandlerImpl2('foo');
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
