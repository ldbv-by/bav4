import { html } from 'lit-html';
import BaElement from '../BaElement';
import './style.css';

/**
 * Container element for header stuff. 
 * @class
 * @author aul
 */
export class HeaderElement extends BaElement {



    createView(){

        return html`
         <div class="header">BAv4 (#nomigration)</div>
        `;
    }

    static get tag() {
        return 'ba-header';
    }
}
