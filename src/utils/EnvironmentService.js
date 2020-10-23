export class EnvironmentService {

	constructor(_window) {
		const urlParams = new URLSearchParams(_window.location.search);

		this.mobile =  urlParams.get('mobile') === 'true';
		this.touch = false;
	}

}