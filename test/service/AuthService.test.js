import { $injector } from '../../src/injection';
import { AuthService } from '../../src/services/AuthService';
import { bvvAuthResponseInterceptorProvider, bvvSignInProvider, bvvSignOutProvider } from '../../src/services/provider/auth.provider';
import { authReducer } from '../../src/store/auth/auth.reducer';
import { TestUtils } from '../test-utils';

describe('AuthService', () => {
	const geoResourceService = {
		byId() {}
	};

	let store;

	const setup = (
		signInProvider = bvvSignInProvider,
		signOutProvider = bvvSignOutProvider,
		authResponseInterceptorProvider = bvvAuthResponseInterceptorProvider,
		state = {}
	) => {
		store = TestUtils.setupStoreAndDi(state, {
			auth: authReducer
		});
		$injector.registerSingleton('GeoResourceService', geoResourceService);
		return new AuthService(signInProvider, signOutProvider, authResponseInterceptorProvider);
	};

	describe('constructor', () => {
		it('initializes the service with default providers', async () => {
			setup();
			const instanceUnderTest = new AuthService();
			expect(instanceUnderTest._singInProvider).toEqual(bvvSignInProvider);
			expect(instanceUnderTest._singOutProvider).toEqual(bvvSignOutProvider);
			expect(instanceUnderTest._authResponseInterceptorProvider).toEqual(bvvAuthResponseInterceptorProvider);
		});

		it('initializes the service with custom provider', async () => {
			const customSignInProvider = async () => {};
			const customSignOutProvider = async () => {};
			const customAuthResponseInterceptorProvider = () => {};
			const instanceUnderTest = setup(customSignInProvider, customSignOutProvider, customAuthResponseInterceptorProvider);
			expect(instanceUnderTest._singInProvider).toEqual(customSignInProvider);
			expect(instanceUnderTest._singOutProvider).toEqual(customSignOutProvider);
			expect(instanceUnderTest._authResponseInterceptorProvider).toEqual(customAuthResponseInterceptorProvider);
		});
	});

	describe('getRoles', () => {
		describe('and user is not signed in', () => {
			it('returns an empty array', () => {
				const instanceUnderTest = setup();

				expect(instanceUnderTest.getRoles()).toHaveSize(0);
			});
		});
	});

	describe('isSignedIn', () => {
		describe('and user is not signed in', () => {
			it('returns an empty array', () => {
				const instanceUnderTest = setup();

				expect(instanceUnderTest.isSignedIn()).toBeFalse();
			});
		});
	});

	describe('signIn', () => {
		describe('the user is NOT signed in', () => {
			describe('is successful', () => {
				it('returns `true`, updates the internal state and the auth s-o.s', async () => {
					const roles = ['TEST'];
					const credential = { username: 'u', password: 'p' };
					const signInProvider = jasmine.createSpy().withArgs(credential).and.resolveTo(roles);
					const instanceUnderTest = setup(signInProvider);

					await expectAsync(instanceUnderTest.signIn(credential)).toBeResolvedTo(true);
					expect(instanceUnderTest.getRoles()).toEqual(roles);
					expect(instanceUnderTest.isSignedIn()).toBeTrue();
					expect(store.getState().auth.signedIn).toBeTrue();
				});
			});
			describe('is NOT successful', () => {
				it('returns `false`', async () => {
					const credential = { username: 'u', password: 'p' };
					const signInProvider = jasmine.createSpy().withArgs(credential).and.resolveTo([]);
					const instanceUnderTest = setup(signInProvider);

					await expectAsync(instanceUnderTest.signIn(credential)).toBeResolvedTo(false);
					expect(instanceUnderTest.getRoles()).toEqual([]);
					expect(instanceUnderTest.isSignedIn()).toBeFalse();
					expect(store.getState().auth.signedIn).toBeFalse();
				});
			});
		});
		describe('the user is signed in', () => {
			it('returns `true`', async () => {
				const credential = { username: 'u', password: 'p' };
				const instanceUnderTest = setup();
				spyOn(instanceUnderTest, 'isSignedIn').and.returnValue(true);

				await expectAsync(instanceUnderTest.signIn(credential)).toBeResolvedTo(true);
			});
		});

		it('passes the error of the underlying provider', async () => {
			const msg = 'Something got wrong';
			const credential = { username: 'u', password: 'p' };
			const signInProvider = jasmine.createSpy().and.throwError(msg);
			const instanceUnderTest = setup(signInProvider);
			spyOn(instanceUnderTest, 'isSignedIn').and.returnValue(false);

			await expectAsync(instanceUnderTest.signIn(credential)).toBeRejectedWithError(Error, msg);
		});
	});

	describe('signOut', () => {
		describe('the user is signed in', () => {
			describe('is successful', () => {
				it('returns `true`, updates the internal state and the auth s-o.s', async () => {
					const signOutProvider = jasmine.createSpy().and.resolveTo(true);
					const instanceUnderTest = setup(null, signOutProvider, null, { auth: { signedIn: true } });
					instanceUnderTest._roles = ['TEST'];
					spyOn(instanceUnderTest, 'isSignedIn').and.returnValue(true);

					expect(store.getState().auth.signedIn).toBeTrue();

					await expectAsync(instanceUnderTest.signOut()).toBeResolvedTo(true);
					expect(instanceUnderTest.getRoles()).toEqual([]);
					expect(store.getState().auth.signedIn).toBeFalse();
				});
			});

			describe('is NOT successful', () => {
				it('returns `false`', async () => {
					const signOutProvider = jasmine.createSpy().and.resolveTo(false);
					const instanceUnderTest = setup(null, signOutProvider, null, { auth: { signedIn: true } });
					instanceUnderTest._roles = ['TEST'];
					spyOn(instanceUnderTest, 'isSignedIn').and.returnValue(true);

					expect(store.getState().auth.signedIn).toBeTrue();

					await expectAsync(instanceUnderTest.signOut()).toBeResolvedTo(false);
					expect(instanceUnderTest.getRoles()).not.toEqual([]);
					expect(store.getState().auth.signedIn).toBeTrue();
				});
			});
		});

		describe('the user is NOT signed in', () => {
			it('returns `true`', async () => {
				const instanceUnderTest = setup(null, null, null);
				spyOn(instanceUnderTest, 'isSignedIn').and.returnValue(false);

				await expectAsync(instanceUnderTest.signOut()).toBeResolvedTo(true);
			});
		});

		it('passes the error of the underlying provider', async () => {
			const msg = 'Something got wrong';
			const signOutProvider = jasmine.createSpy().and.throwError(msg);
			const instanceUnderTest = setup(null, signOutProvider, null);
			spyOn(instanceUnderTest, 'isSignedIn').and.returnValue(true);

			await expectAsync(instanceUnderTest.signOut()).toBeRejectedWithError(Error, msg);
		});
	});

	describe('isAuthorizedFor', () => {
		describe('and user is NOT signed in', () => {
			it('returns `false`', async () => {
				const geoResourceId = 'id';
				const geoResource = { authRoles: [] };
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);
				const instanceUnderTest = setup();

				expect(instanceUnderTest.isAuthorizedFor(geoResourceId)).toBeFalse();
			});
			describe('and GeoResource is unknown', () => {
				it('returns `false`', async () => {
					const geoResourceId = 'id';
					spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(null);
					const instanceUnderTest = setup();

					expect(instanceUnderTest.isAuthorizedFor(geoResourceId)).toBeFalse();
				});
			});
		});
		describe('and user is signed in', () => {
			describe('and user has the wrong role', () => {
				it('returns `false`', async () => {
					const geoResourceId = 'id';
					const geoResource = { restricted: true, authRoles: ['FOO', 'BAR'] };
					spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);
					const instanceUnderTest = setup();
					instanceUnderTest._roles = ['TEST'];

					expect(instanceUnderTest.isAuthorizedFor(geoResourceId)).toBeFalse();
				});
			});
			describe('and user has a suitable role', () => {
				it('returns `true` and updates', async () => {
					const geoResourceId = 'id';
					const geoResource = { restricted: true, authRoles: ['FOO', 'BAR'] };
					spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);
					const instanceUnderTest = setup();
					instanceUnderTest._roles = ['BAR'];

					expect(instanceUnderTest.isAuthorizedFor(geoResourceId)).toBeTrue();
				});
			});
			describe('and GeoResource is NOT restricted', () => {
				it('returns `true`', async () => {
					const geoResourceId = 'id';
					const geoResource = { restricted: false, authRoles: [] };
					spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);
					const instanceUnderTest = setup();
					instanceUnderTest._roles = ['BAR'];

					expect(instanceUnderTest.isAuthorizedFor(geoResourceId)).toBeTrue();
				});
			});
			describe('and GeoResource is unknown', () => {
				it('returns `false`', async () => {
					const geoResourceId = 'id';
					spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(null);
					const instanceUnderTest = setup();
					instanceUnderTest._roles = ['TEST'];

					expect(instanceUnderTest.isAuthorizedFor(geoResourceId)).toBeFalse();
				});
			});
		});
	});

	describe('getAuthResponseInterceptorForGeoResource', () => {
		describe('and GeoResource is known', () => {
			it('returns a response interceptor for that GeoResource', async () => {
				const geoResourceId = 'id';
				const geoResource = { authRoles: ['TEST'] };
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);
				const responseInterceptor = () => {};
				const authResponseInterceptorProvider = jasmine.createSpy().withArgs(['TEST']).and.returnValue(responseInterceptor);
				const instanceUnderTest = setup(null, null, authResponseInterceptorProvider);

				const result = instanceUnderTest.getAuthResponseInterceptorForGeoResource(geoResourceId);

				expect(result).toEqual(responseInterceptor);
			});
			describe('and GeoResource is unknown', () => {
				it('returns `false`', async () => {
					const geoResourceId = 'id';
					spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(null);
					const responseInterceptor = () => {};
					const authResponseInterceptorProvider = jasmine.createSpy().withArgs([]).and.returnValue(responseInterceptor);
					const instanceUnderTest = setup(null, null, authResponseInterceptorProvider);

					const result = instanceUnderTest.getAuthResponseInterceptorForGeoResource(geoResourceId);

					expect(result).toEqual(responseInterceptor);
				});
			});
		});
	});
});
