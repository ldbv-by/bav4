/**
 * @module services/provider/auth_provider
 */
import { $injector } from '../../injection/index';
import { MediaType } from '../../domain/mediaTypes';

/**
 * Bvv specific implementation of {@link module:services/AuthService~signInProvider}.
 * @function
 * @type {module:services/AuthService~signInProvider}
 */
export const bvvSignInProvider = async (credential) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const result = await httpService.post(`${configService.getValueAsPath('BACKEND_URL')}auth/signin`, JSON.stringify(credential), MediaType.JSON);

	switch (result.status) {
		case 200:
			return await result.json();
		case 400:
			return [];
		default:
			throw new Error(`Sign in not possible: Http-Status ${result.status}`);
	}
};
