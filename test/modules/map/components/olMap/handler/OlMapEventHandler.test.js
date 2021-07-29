import { OlMapEventHandler } from '../../../../../../src/modules/map/components/olMap/handler/OlMapEventHandler';

describe('MapEventHandler', () => {

	class OlMapEventHandlerImpl extends OlMapEventHandler {
		constructor() {
			super('some');
		}
	}

	class OlMapEventHandlerImplNoId extends OlMapEventHandler {

	}

	describe('expected errors', () => {

		describe('constructor', () => {
			it('throws excepetion when instantiated without inheritance', () => {
				expect(() => new OlMapEventHandler()).toThrowError(TypeError, 'Can not construct abstract class.');
			});

			it('throws excepetion when instantiated without an ID', () => {
				expect(() => new OlMapEventHandlerImplNoId()).toThrowError(TypeError, 'Id of this handler must be defined.');
			});
		});

		describe('methods', () => {
			it('throws excepetion when abstract #register is called without overriding', () => {
				expect(() => new OlMapEventHandlerImpl().register()).toThrowError(TypeError, 'Please implement abstract method #register or do not call super.activate from child.');
			});

			it('return the id of this handler', () => {
				expect(new OlMapEventHandlerImpl().id).toBe('some');
			});
		});

	});
});
