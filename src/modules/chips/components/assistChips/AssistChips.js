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
					<svg class="chips__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
						<path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21.294 21.294 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21.317 21.317 0 0 0 14 7.655V1.222z"/>
					</svg>
					<span class="chips__button-text">Feedback</span>
				</button>
				<button class=' chips__button' >
					<svg class="chips__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
						<path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
					</svg>
					<span class="chips__button-text">Markieren</span>
				</button>
			</div>	
		` ;
		}
		else if (type === 'search') {
			return html`
			<style>${css}</style>	
			<div id='assistchips' class=" chips__container " style="justify-content:center">  			
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
			<svg class="chips__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
				<path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
			</svg>
			<span class="chips__button-text">Markieren</span>
		</button>	
		<button class=' chips__button' >
		<svg class="chips__icon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
		<title>measure</title>
		<path  opacity="0.2" d="M1.078 11.593l1.487-1.178 9.971-9.66 3.020 2.757-11.415 10.949z"></path>
		<path  d="M12.424 0.039l-11.699 11.501 3.509 3.464 11.71-11.47zM4.224 14.204l-2.675-2.643 0.885-0.874 0.714 0.688 0.34-0.331-0.714-0.688 0.936-0.927 0.66 0.638 0.34-0.331-0.66-0.638 0.813-0.779 1.776 1.742 0.442-0.437-1.776-1.742 0.648-0.65 0.66 0.638 0.34-0.331-0.66-0.638 0.968-0.938 0.618 0.618 0.34-0.331-0.618-0.618 0.885-0.874 1.776 1.742 0.411-0.426-1.776-1.742 1.102-1.056 0.606 0.587 0.34-0.331-0.606-0.587 0.988-0.98 0.583 0.525 0.308-0.319-0.552-0.537 0.751-0.756 2.675 2.643z"></path>
		</svg>
		<span class="chips__button-text">Messen</span>
	</button>
	<button class=' chips__button' >
	<svg class="chips__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
		<path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21.294 21.294 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21.317 21.317 0 0 0 14 7.655V1.222z"/>
	</svg>
	<span class="chips__button-text">Feedback</span>
</button>
		

			</div>	
		` ;
		}
		else if (type === 'line') {
			return html`
			<style>${css}</style>	
			<div id='assistchips' class=" chips__container " style="justify-content:center">  			
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
					<span class="chips__button-text">Geländeprofil</span>
				</button>										
				<button class=' chips__button' >
				<svg class="chips__icon" width="16" height="16"  class="bi bi-download" viewBox="0 0 16 16">
					<path
					d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
					<path
					d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
					</svg>
					<span class="chips__button-text">Export</span>
				</button>										
			</div>	
		` ;
		}
		else if (type === 'pointinfo') {
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
