/* eslint-disable no-undef */
import { EnvironmentService } from '../../src/utils/EnvironmentService';



describe('EnvironmentService', () => {



	describe('mobile flag', () => {


		it('detects mobile flag from query params', () => {

			let mockWindow = {
				location: {
					search: ''
				}
			};
			expect(new EnvironmentService(mockWindow).mobile).toBeFalse();

			mockWindow = {
				location: {
					search: '?mobile=true'
				}
			};
			expect(new EnvironmentService(mockWindow).mobile).toBeTrue();

			mockWindow = {
				location: {
					search: '?mobile=false'
				}
			};
			expect(new EnvironmentService(mockWindow).mobile).toBeFalse;
		});

	});


});