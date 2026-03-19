import { AbstractResultItem } from '../../../../../src/modules/search/components/menu/AbstractResultItem';
import { TestUtils } from '../../../../test-utils';

const setupStoreAndDi = () => {
	TestUtils.setupStoreAndDi();
};
window.customElements.define('ba-abstract-result-item', AbstractResultItem);

describe('AbstractResultItem', () => {
	beforeEach(() => {
		setupStoreAndDi();
	});

	describe('constructor', () => {
		it('contains a model from the child model', () => {
			const model = { foo: 'bar' };
			class MyResultItem extends AbstractResultItem {
				constructor() {
					super(model);
				}
			}
			window.customElements.define('ba-my-result-item', MyResultItem);

			const instance = new MyResultItem();

			expect(instance.getModel()).toEqual({ foo: 'bar' });
		});
	});

	describe('expected errors', () => {
		describe('constructor', () => {
			it('throws exception when instantiated without inheritance', () => {
				expect(() => new AbstractResultItem()).toThrowError(TypeError, 'Can not construct abstract class.');
			});
		});

		describe('methods', () => {
			it('throws exception when called without inheritance', () => {
				class MyResultItem extends AbstractResultItem {
					constructor() {
						super({});
					}
				}

				window.customElements.define('ba-result-item', MyResultItem);
				const classUnderTest = new MyResultItem();
				expect(() => classUnderTest.selectResult()).toThrowError(
					TypeError,
					'Please implement abstract method selectResult or do not call super.selectResult from child.'
				);
				expect(() => classUnderTest.highlightResult()).toThrowError(
					TypeError,
					'Please implement abstract method highlightResult or do not call super.highlightResult from child.'
				);
			});
		});
	});
});
