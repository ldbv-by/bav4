import{ Popup } from '../../../../src/modules/commons/components/popup/Popup';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Popup.tag, Popup);


describe('Popup', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});
    
	describe('when initialized with no attributes', () => {
		it('renders the view', async () => {

			const element = await TestUtils.render(Popup.tag, {}, '<span>some slot content</span>');

			expect(element.type).toBe('hide');
			expect(element.right).toBe('0');
			expect(element.top).toBe('0');
			expect(element.shadowRoot.querySelector('.popup')).toBeTruthy();
			expect(element.shadowRoot.querySelector('span')).toBeTruthy();

			expect(element.shadowRoot.querySelector('slot')).toBeTruthy();
			expect(element.shadowRoot.querySelector('slot').assignedNodes().length).toBe(1);
			expect(element.shadowRoot.querySelector('slot').assignedNodes()[0].innerHTML).toEqual('some slot content');
			expect(element.shadowRoot.querySelector('slot').assignedNodes()[0].outerHTML).toEqual('<span>some slot content</span>');
		});
	});
    
	describe('when initialized with \'show\' attribute', () => {

		it('renders the visible popup', async () => {

			const element = await TestUtils.render(Popup.tag, {}, '<span>some</span>');
            
			expect(element.type).toBe('hide');
            
			element.setAttribute('type', 'show');
            
			expect(element.type).toBe('show');
			expect(element.shadowRoot.querySelector('span').classList.contains('show')).toBeTrue();
		});

		it('re-renders the popup when property \'show\' changed', async () => {

			const element = await TestUtils.render(Popup.tag);

			expect(element.shadowRoot.querySelector('span').classList.contains('show')).toBeFalse();

			element.type = 'show';

			expect(element.shadowRoot.querySelector('span').classList.contains('show')).toBeTrue();
		});

		it('re-renders the popup when attribute \'show\' changed', async () => {

			const element = await TestUtils.render(Popup.tag);

			expect(element.shadowRoot.querySelector('span').classList.contains('show')).toBeFalse();

			element.setAttribute('type', 'show');

			expect(element.type).toBe('show');
			expect(element.shadowRoot.querySelector('span').classList.contains('show')).toBeTrue();
		});
	});
    
	describe('when initialized with \'right\' and \'top\' attribute', () => {

		it('renders the popup with \'right\' and \'top\' initial', async () => {
			const element = await TestUtils.render(Popup.tag, { right:'60', top:'210' }, '<span>some</span>');

			expect(element.shadowRoot.querySelector('.popup').style.right).toEqual('');
			expect(element.shadowRoot.querySelector('.popup').style.top).toEqual('');

			element.setAttribute('type', 'show');

			expect(element.shadowRoot.querySelector('.popup').style.right).toEqual('60px');
			expect(element.shadowRoot.querySelector('.popup').style.top).toEqual('210px');      
            
		}); 

		it('renders the popup with \'right\' and \'top\' property', async () => {
			const element = await TestUtils.render(Popup.tag, {}, '<span>some</span>');

			expect(element.shadowRoot.querySelector('.popup').style.right).toEqual('');
			expect(element.shadowRoot.querySelector('.popup').style.top).toEqual('');

			element.right = '60';
			element.top = '210';
			element.setAttribute('type', 'show');

			expect(element.shadowRoot.querySelector('.popup').style.right).toEqual('60px');
			expect(element.shadowRoot.querySelector('.popup').style.top).toEqual('210px');      
            
		});
	});
});