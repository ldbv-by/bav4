import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './kebabmenu.css';

const Update_IsCollapsed = 'update_is_collapsed';
const Update_Commands = 'update_commands';


/**
 * @typedef {Object} MenuOption
 * @property {string} label the label of the menu item
 * @property {string} [icon] the icon of the menu item; Data-URI of Base64 encoded SVG
 * @property {function} [action] the action to perform, when user press the menu item
 * @property {boolean} [disabled] whether or not the menu item is enabled
 */

/**
 *
 * @class
 * @author thiloSchlemmer
 */
export class KebabMenu extends MvuElement {

    constructor() {
        super({
            commands: [],
            isCollapsed: true
        });

    }

    update(type, data, model) {

        switch (type) {
            case Update_IsCollapsed:
                return { ...model, isCollapsed: data };
            case Update_Commands:
                return { ...model, commands: data };
        }
    }

    /**
     * @override
     */
    createView(model) {
        const { disabled, label, type } = model;
        const onClick = () => {
            this._onClick();
        };

        const classes = {
            primary: type === 'primary',
            secondary: type !== 'primary',
            disabled: disabled
        };

        return html`
		 <style>${css}</style> 
         <div class='kebabmenu__container'>
         <div class='kebab_header'>							
             <button id="kebab-icon" data-test-id class='kebabmenu__toggle-button' @click=${onClick}  ></button>	
         </div>
         <div class='kebab_container'>
             ${getIcons()}
         </div>
     </div>
		`;
    }

    static get tag() {
        return 'ba-kebab';
    }
}
