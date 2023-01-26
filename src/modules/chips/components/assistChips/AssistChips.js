import { html } from 'lit-html';
import css from './assistChips.css';
import { MvuElement } from '../../../MvuElement';

const Update_Type = 'update_type';

/**
 * @class
 * @author alsturm
 */
export class AssistChips extends MvuElement {

	constructor() {
		super({
			type: 'line'
		});

	}

	update(type, data, model) {
		switch (type) {

			case Update_Type:
				return { ...model, type: data };

		}
	}




	/**
	 * @property {string} type=point
	 */
	set type(value) {
		this.signal(Update_Type, value);
	}

	get type() {
		return this.getModel().type;
	}



	/**
	 * @override
	 */
	createView(model) {

		const { type } = model;



		if (type === 'point') {
			return html`
			<style>${css}</style>	
			<div id='assistchips' class=" chips__container">  			
				<button class=' chips__button' >				
					<svg class="chips__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" >
					<path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
					</svg>
					<span class="chips__button-text">Teilen</span>					
				</button>
				<button class=' chips__button' >
					<svg class="chips__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" >
						<path d="M4.097 3.238v9.139c-0 0.010-0.003 0.020-0.003 0.031v4.291c0 1.049 1.573 1.049 1.573 0v-1.189c0-0.005 0.003-0.010 0.003-0.015v-3.118c0.017-1.288 1.064-2.328 2.356-2.328 9.786-0.149 6.991-1.626 0-1.573-0.889 0-1.698 0.305-2.356 0.802v-6.039c0.451-5.846-3.869 2.228-1.573 0z"></path>
						<path d="M5.232 0.757l2.067 3.334c0.244 0.393 0.046 1.008-0.325 1.008h-4.134c-0 0-0 0-0 0-0.238 0-0.431-0.272-0.431-0.608 0-0.154 0.040-0.294 0.107-0.401l-0 0.001 2.067-3.333c0.079-0.128 0.195-0.208 0.325-0.208s0.245 0.080 0.324 0.207l0 0.001z"></path>
						<path d="M14.366 9.561l-3.334 2.067c-0.393 0.244-1.008 0.046-1.008-0.325v-4.134c0-0 0-0 0-0 0-0.238 0.272-0.431 0.608-0.431 0.154 0 0.294 0.040 0.401 0.107l-0.001-0 3.333 2.067c0.128 0.079 0.208 0.195 0.208 0.325s-0.080 0.245-0.207 0.324l-0.001 0z"></path>
					</svg>
					<span class="chips__button-text">Routing</span>
				</button>
				<button class=' chips__button' >
					<svg class="chips__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" >
					<path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
						</svg>
					<span class="chips__button-text">Feedback</span>
				</button>
			</div>	
		` ;
		}
		else if (type === 'line') {
			return html`
			<style>${css}</style>	
			<div id='assistchips' class=" chips__container">  			
				<button class=' chips__button' >				
					<svg class="chips__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" >
					<path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
					</svg>
					<span class="chips__button-text">Teilen</span>					
				</button>
				<button class=' chips__button' >
					<svg class="chips__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" >
						<path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54A.505.505 0 0 1 1 12.5v-9a.5.5 0 0 1 .5-.5h13z"/>
					</svg>
					<span class="chips__button-text">Profil</span>
				</button>										
			</div>	
		` ;
		}
		else if (type === 'poointinfo') {
			return html`
			<style>${css}</style>	
			<div id='assistchips' class=" chips__container">  			
				<button class=' chips__button' >				
					<svg class="chips__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" >
					<path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
					</svg>
					<span class="chips__button-text">Teilen</span>					
				</button>							
				<button class=' chips__button' >
					<svg class="chips__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
					<path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
					<path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
					</svg>
					<span class="chips__button-text">Drucken</span>
				</button>				
			</div>	
		` ;
		}


	}


	static get tag() {
		return 'ba-assist-chips';
	}
}
