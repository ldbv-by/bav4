import { $injector } from '../../src/injection';
import { AuthService } from '../../src/services/AuthService';
import { bvvSignInProvider, bvvSignOutProvider } from '../../src/services/provider/auth.provider';
import { authReducer } from '../../src/store/auth/auth.reducer';
import { TestUtils } from '../test-utils';

describe('AuthService', () => {
	const geoResourceService = {
		byId() {}
	};

	let store;

	const setup = (signInProvider = bvvSignInProvider, signOutProvider = bvvSignOutProvider, state = {}) => {
		store = TestUtils.setupStoreAndDi(state, {
			auth: authReducer
		});
		$injector.registerSingleton('GeoResourceService', geoResourceService);
		return new AuthService(signInProvider, signOutProvider);
	};

	describe('constructor', () => {
		it('initializes the service with default providers', async () => {
			setup();
			const instanceUnderTest = new AuthService();
			expect(instanceUnderTest._singInProvider).toEqual(bvvSignInProvider);
			expect(instanceUnderTest._singOutProvider).toEqual(bvvSignOutProvider);
		});

		it('initializes the service with custom providers', async () => {
			const customSignInProvider = async () => {};
			const customSignOutProvider = async () => {};
			const instanceUnderTest = setup(customSignInProvider, customSignOutProvider);
			expect(instanceUnderTest._singInProvider).toEqual(customSignInProvider);
			expect(instanceUnderTest._singOutProvider).toEqual(customSignOutProvider);
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
					const instanceUnderTest = setup(null, signOutProvider, { auth: { signedIn: true } });
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
					const instanceUnderTest = setup(null, signOutProvider, { auth: { signedIn: true } });
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
				const instanceUnderTest = setup(null, null);
				spyOn(instanceUnderTest, 'isSignedIn').and.returnValue(false);

				await expectAsync(instanceUnderTest.signOut()).toBeResolvedTo(true);
			});
		});

		it('passes the error of the underlying provider', async () => {
			const msg = 'Something got wrong';
			const signOutProvider = jasmine.createSpy().and.throwError(msg);
			const instanceUnderTest = setup(null, signOutProvider);
			spyOn(instanceUnderTest, 'isSignedIn').and.returnValue(true);

			await expectAsync(instanceUnderTest.signOut()).toBeRejectedWithError(Error, msg);
		});
	});
});
