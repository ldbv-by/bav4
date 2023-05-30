import { AbstractAssistChip } from '../../../../src/modules/chips/components/assistChips/AbstractAssistChip';
import { TestUtils } from '../../../test-utils';

class AssistChipImpl extends AbstractAssistChip {
	constructor() {
		super({ foo: 'bar' });
	}

	getIcon() {
		return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
	}

	getLabel() {
		return 'foo';
	}

	isVisible() {
		return true;
	}

	onClick() {
		console.warn('called AssistChipImpl.onClick');
	}

	static get tag() {
		return 'ba-assist-chip-impl';
	}
}

class AssistChipNotVisibleImpl extends AbstractAssistChip {
	constructor() {
		super({ foo: 'bar' });
	}

	getIcon() {
		return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
	}

	getLabel() {
		return 'foo';
	}

	isVisible() {
		return false;
	}

	onClick() {
		console.warn('called AssistChipImpl.onClick');
	}

	static get tag() {
		return 'ba-assist-chip-not-visible-impl';
	}
}

class AbstractAssistChipNoImpl extends AbstractAssistChip {}
window.customElements.define('ba-abstract-assist-chip', AbstractAssistChip);
window.customElements.define(AssistChipImpl.tag, AssistChipImpl);
window.customElements.define(AssistChipNotVisibleImpl.tag, AssistChipNotVisibleImpl);
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
				expect(() => new AbstractAssistChipNoImpl().getIcon()).toThrowError(
					Error,
					'Please implement abstract method #getIcon or do not call super.getIcon from child.'
				);
			});

			it('throws exception when #getLabel is called without overriding', () => {
				expect(() => new AbstractAssistChipNoImpl().getLabel()).toThrowError(
					Error,
					'Please implement abstract method #getLabel or do not call super.getLabel from child.'
				);
			});

			it('throws exception when #isVisible is called without overriding', () => {
				expect(() => new AbstractAssistChipNoImpl().isVisible()).toThrowError(
					Error,
					'Please implement abstract method #isVisible or do not call super.isVisible from child.'
				);
			});

			it('throws exception when #onClick is called without overriding', () => {
				expect(() => new AbstractAssistChipNoImpl().onClick()).toThrowError(
					Error,
					'Please implement abstract method #onClick or do not call super.onClick from child.'
				);
			});

			it('throws exception when abstract static method #tag is called without overriding', () => {
				expect(() => AbstractAssistChipNoImpl.tag).toThrowError(
					Error,
					'Please implement static abstract method #tag or do not call static abstract method #tag from child.'
				);
			});
		});
	});

	describe('when instantiated', () => {
		it('takes the model from its child class', async () => {
			const model = new AssistChipImpl().getModel();

			expect(model).toEqual({ foo: 'bar' });
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			const element = await TestUtils.render(AssistChipImpl.tag);

			expect(element.shadowRoot.querySelector('.chips__button').innerHTML.includes('foo')).toBeTrue();
			expect(element.shadowRoot.querySelector('.chips__button-text').innerHTML.includes('foo')).toBeTrue();
			expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);
		});

		it('renders nothing when getVisible is false', async () => {
			const element = await TestUtils.render(AssistChipNotVisibleImpl.tag);

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('calls onClick method on click on the chip', async () => {
			const element = await TestUtils.render(AssistChipImpl.tag);
			const button = element.shadowRoot.querySelector('.chips__button');
			const warnSpy = spyOn(console, 'warn').and.callFake(() => {});

			button.click();

			expect(warnSpy).toHaveBeenCalledWith('called AssistChipImpl.onClick');
		});
	});
});
