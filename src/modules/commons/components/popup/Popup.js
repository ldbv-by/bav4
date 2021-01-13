import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './popup.css';


/**
 * 
 * @class
 * @author bakir_en
 */
export class Popup extends BaElement {


    /**
     *@override  
     */
    initialize(){
        // TODO
    } 

    /**
     *@override 
     */
    createView(){
        return html`
        <style>${css}</style>
        <div class=popup>
        <span class="popuptext> I'm a reuseable Popup ... </span>
        </div>  
        `
    } 

    static get tag(){
        return 'ba-popup'
    } 

} 