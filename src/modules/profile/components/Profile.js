import { html } from 'lit-html';
import css from './profile.css';
import { MvuElement } from '../../MvuElement';
import Chart from 'chart.js/auto'; // Todo: Import single dependencies for tree shaking

const Update_Data = 'update_counter';


/**
 * @author taulinger
 */
export class Profile extends MvuElement {

	constructor() {
		super({
			data: [0, 0, 0, 0, 0, 0]
		});
		this._chart = null;
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Data:
				return { ...model, data: data };
		}
	}

	/**
	 * @override
	 */
	onInitialize() {

		//simulate model update
		const getRandomInt = max => {
			return Math.floor(Math.random() * max);
		};

		setInterval(() => {
			const data = this.getModel().data.map(() => getRandomInt(10));
			this.signal(Update_Data, data);

		}, 2000);
	}

	_createChart() {
		const ctx = this.shadowRoot.querySelector('.profile').getContext('2d');
		const { data } = this.getModel();

		this._chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
				datasets: [{
					label: '# of Votes',
					data: data,
					backgroundColor: [
						'rgba(255, 99, 132, 0.2)',
						'rgba(54, 162, 235, 0.2)',
						'rgba(255, 206, 86, 0.2)',
						'rgba(75, 192, 192, 0.2)',
						'rgba(153, 102, 255, 0.2)',
						'rgba(255, 159, 64, 0.2)'
					],
					borderColor: [
						'rgba(255, 99, 132, 1)',
						'rgba(54, 162, 235, 1)',
						'rgba(255, 206, 86, 1)',
						'rgba(75, 192, 192, 1)',
						'rgba(153, 102, 255, 1)',
						'rgba(255, 159, 64, 1)'
					],
					borderWidth: 1
				}]
			},
			options: {
				responsive: true,
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
	}

	/**
	 * @override
	 */
	onAfterRender(firsttime) {
		if (firsttime) {
			this._createChart();
		}
	}

	/**
	* @override
	*/
	createView(model) {
		const { data } = model;

		if (this._chart) {
			// update data of chart
			this._chart.data.datasets.forEach((dataset) => {
				dataset.data = data;
			});
			this._chart.update();
		}

		return html`
			<style>${css}</style>	
			<canvas class="profile"></canvas>
		` ;
	}

	static get tag() {
		return 'ba-profile';
	}
}
