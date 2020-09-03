import { html } from 'lit-html';
import BaElement from '../BaElement';
import './headerElement.css';

/**
 * Container Element for header stuff. 
 * @class
 */
export class HeaderElement extends BaElement {



    createView() {

        return html`
         <div class="header">BAv4 (#nomigration)</div>
        `;
    }

    static get tag() {
        return 'ba-header';
    }
}
