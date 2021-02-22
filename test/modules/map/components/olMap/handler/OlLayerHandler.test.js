import { OlLayerHandler } from '../../../../../../src/modules/map/components/olMap/handler/OlLayerHandler';

describe('LayerHandler', () => {

	class OlLayerHandlerImpl extends OlLayerHandler {
		constructor() {
			super('some');
		}
	}
	class OlLayerHandleNoId extends OlLayerHandler {

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
				expect(() => new OlLayerHandlerImpl().activate()).toThrowError(TypeError, 'Please implement abstract method #activate or do not call super.activate from child.');
			});
			it('throws excepetion when abstract #activate is called without overriding', () => {
				expect(() => new OlLayerHandlerImpl().deactivate()).toThrowError(TypeError, 'Please implement abstract method #deactivate or do not call super.deactivate from child.');
			});
			it('return the id of this handler', () => {
				expect(new OlLayerHandlerImpl().id).toBe('some');
			});
		});

	});
});