
import { ContextMenue } from '../../../src/components/contextMenue/ContextMenue';
import { contextMenueReducer } from '../../../src/components/contextMenue/store/contextMenue.reducer';
import { contextMenueClose, contextMenueOpen } from '../../../src/components/contextMenue/store/contextMenue.action';


import { html, render } from 'lit-html';
import { TestUtils } from '../../test-utils';
window.customElements.define(ContextMenue.tag, ContextMenue);

const setupStoreAndDi = (state) => {
    TestUtils.setupStoreAndDi(state, { contextMenue: contextMenueReducer });

};

describe('ContextMenue', () => {

    let element;

    describe('when initialized', () => {
        it('is hidden with no contextMenue-Entries', async () => {
            //arrange
            setupStoreAndDi({
                contextMenue: {
                    data: { pointer: false, commands: false }
                }
            });

            // act
            element = await TestUtils.render(ContextMenue.tag);

            // assert
            expect(element.shadowRoot.querySelector('.context-menu--active')).toBeFalsy();
            expect(element.shadowRoot.querySelector('.context-menu')).toBeTruthy();
            expect(element.shadowRoot.querySelector('.context-menu__items')).toBeFalsy();
            expect(element.shadowRoot.querySelector('.context-menu__item')).toBeFalsy();

        });
    });

    describe('when contextmenue state changed', () => {
        beforeEach(async () => {

            const state = {
                contextMenue: {
                    data: { pointer: false, commands: false }
                }
            };

            TestUtils.setupStoreAndDi(state, {
                contextMenue: contextMenueReducer
            });

            element = await TestUtils.render(ContextMenue.tag);
        });

        it('adds data-content to context-menu', () => {
            // arrange
            const contextMenueData = {
                pointer: { x: 0, y: 0 },
                commands: [
                    { label: 'foo', action: () => { } },
                    { label: 'bar', action: () => { } }]
            };

            // act
            contextMenueOpen(contextMenueData);

            // assert
            expect(element.shadowRoot.querySelector('.context-menu--active')).toBeTruthy();
            expect(element.shadowRoot.querySelector('.context-menu')).toBeTruthy();
            expect(element.shadowRoot.querySelector('.context-menu__items')).toBeTruthy();
            expect(element.shadowRoot.querySelector('.context-menu__item')).toBeTruthy();
        });

        it('removes data-content from context-menu', () => {
            // arrange
            const contextMenueData = {
                pointer: { x: 0, y: 0 },
                commands: [
                    { label: 'foo', action: () => { } },
                    { label: 'bar', action: () => { } }]
            };

            // act
            contextMenueOpen(contextMenueData);
            const wasOpen = element.shadowRoot.querySelector('.context-menu--active').length > 0;

            contextMenueClose();

            // assert
            expect(wasOpen).toBeFalsy();
            expect(element.shadowRoot.querySelector('.context-menu--active')).toBeFalsy();
            expect(element.shadowRoot.querySelector('.context-menu')).toBeTruthy();
            expect(element.shadowRoot.querySelector('.context-menu__items')).toBeFalsy();
            expect(element.shadowRoot.querySelector('.context-menu__item')).toBeFalsy();
        });

        it('adds a webcombonent as data-content to context-menu', () => {
            // arrange
            let button = document.createElement('button');
            button.setAttribute('class', 'thebutton');
            button.innerHTML = 'Test';
            button.addEventListener('click', () => alert('This is a test'));

            let component = document.createElement('div');
            component.setAttribute('class', 'thecomponent');
            component.appendChild(button);

            const command = () => alert('This is another test');
            const alternateCommand = () => {
                alert('This is the alternate test');
            };
            component.querySelector('.thebutton').addEventListener('click', alternateCommand);
            const contextMenueData = {
                pointer: { x: 0, y: 0 },
                commands: [
                    { label: component, action: command }]
            };

            // act
            spyOn(window, 'alert');
            contextMenueOpen(contextMenueData);
            button.click();

            // assert
            expect(window.alert).toHaveBeenCalledWith('This is a test');
            expect(window.alert).toHaveBeenCalledWith('This is another test');
            expect(window.alert).toHaveBeenCalledWith('This is the alternate test');
        });
    });
});