import { AbstractAssistChip } from '../../../../src/modules/chips/components/assistChip/AbstractAssistChip';
import { TestUtils } from '../../../test-utils';

class AbstractAssistChipNoImpl extends AbstractAssistChip {
}
window.customElements.define('ba-abstract-assist-chip', AbstractAssistChip);
window.customElements.define('ba-abstract-assist-chip-no-impl', AbstractAssistChipNoImpl);


const setupStoreAndDi = () => {
	TestUtils.setupStoreAndDi();
};
describe('AbstractAssistChip', () => {

	beforeEach(() => {
		setupStoreAndDi();
	});

	describe('expected errors', () => {

		describe('constructor', () => {
			it('throws exception when instantiated without inheritance', () => {
				expect(() => new AbstractAssistChip()).toThrowError(Error, 'Can not construct abstract class.');
			});
		});

		describe('methods', () => {
			it('throws exception when abstract #getIcon is called without overriding', () => {
				expect(() => new AbstractAssistChipNoImpl().getIcon()).toThrowError(Error, 'Please implement abstract method #getIcon or do not call super.getIcon from child.');
			});

			it('throws exception when #getLabel is called without overriding', () => {
				expect(() => new AbstractAssistChipNoImpl().getLabel()).toThrowError(Error, 'Please implement abstract method #getLabel or do not call super.getLabel from child.');
			});

			it('throws exception when #isVisible is called without overriding', () => {
				expect(() => new AbstractAssistChipNoImpl().isVisible()).toThrowError(Error, 'Please implement abstract method #isVisible or do not call super.isVisible from child.');
			});

			it('throws exception when abstract static method #tag is called without overriding', () => {
				expect(() => AbstractAssistChipNoImpl.tag).toThrowError(Error, 'Please implement static abstract method #tag or do not call static abstract method #tag from child.');
			});
		});

	});

});
