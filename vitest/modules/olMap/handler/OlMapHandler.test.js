import { OlMapHandler } from '../../../../src/modules/olMap/handler/OlMapHandler';

describe('OlMapHandler', () => {
	class OlMapHandlerImpl extends OlMapHandler {
		constructor() {
			super('some');
		}
	}

	class OlMapHandlerImplNoId extends OlMapHandler {}

	describe('expected errors', () => {
		describe('constructor', () => {
			it('throws exception when instantiated without inheritance', () => {
				expect(() => new OlMapHandler()).toThrowError(TypeError, 'Can not construct abstract class.');
			});

			it('throws exception when instantiated without an ID', () => {
				expect(() => new OlMapHandlerImplNoId()).toThrowError(TypeError, 'Id of this handler must be defined.');
			});
		});

		describe('methods', () => {
			it('throws exception when abstract #register is called without overriding', () => {
				expect(() => new OlMapHandlerImpl().register()).toThrowError(
					TypeError,
					'Please implement abstract method #register or do not call super.activate from child.'
				);
			});

			it('return the id of this handler', () => {
				expect(new OlMapHandlerImpl().id).toBe('some');
			});
		});
	});
});
