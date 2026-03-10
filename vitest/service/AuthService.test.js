import { $injector } from '@src/injection';
import { AuthService } from '@src/services/AuthService';
import { bvvInitialAuthStatusProvider, bvvSignInProvider, bvvSignOutProvider } from '@src/services/provider/auth.provider';
import { authReducer } from '@src/store/auth/auth.reducer';
import { TestUtils } from '@test/test-utils';

describe('AuthService', () => {
	const geoResourceService = {
		byId() {}
	};

	let store;

	const setup = (
		signInProvider = bvvSignInProvider,
		signOutProvider = bvvSignOutProvider,
		initialAuthStatusProvider = bvvInitialAuthStatusProvider,
		state = {}
	) => {
		store = TestUtils.setupStoreAndDi(state, {
			auth: authReducer
		});
		$injector.registerSingleton('GeoResourceService', geoResourceService);
		return new AuthService(signInProvider, signOutProvider, initialAuthStatusProvider);
	};

	describe('constructor', () => {
		it('initializes the service with default providers', async () => {
			setup();
			const instanceUnderTest = new AuthService();
			expect(instanceUnderTest._singInProvider).toEqual(bvvSignInProvider);
			expect(instanceUnderTest._singOutProvider).toEqual(bvvSignOutProvider);
			expect(instanceUnderTest._initialAuthStatusProvider).toEqual(bvvInitialAuthStatusProvider);
		});

		it('initializes the service with custom providers', async () => {
			const customSignInProvider = async () => {};
			const customSignOutProvider = async () => {};
			const customInitialAuthStatusProvider = async () => {};
			const instanceUnderTest = setup(customSignInProvider, customSignOutProvider, customInitialAuthStatusProvider);
			expect(instanceUnderTest._singInProvider).toEqual(customSignInProvider);
			expect(instanceUnderTest._singOutProvider).toEqual(customSignOutProvider);
			expect(instanceUnderTest._initialAuthStatusProvider).toEqual(customInitialAuthStatusProvider);
		});
	});

	describe('init', () => {
		describe('when roles are available', () => {
			it('updates the internal state and the auth s-o-s', async () => {
				const roles = ['TEST'];
				const initialAuthStatusProvider = vi.fn().mockResolvedValue(roles);
				const instanceUnderTest = setup(null, null, initialAuthStatusProvider);

				await instanceUnderTest.init();

				expect(instanceUnderTest.getRoles()).toEqual(roles);
				expect(instanceUnderTest.isSignedIn()).toBe(true);
				expect(store.getState().auth.signedIn).toBe(true);
			});
		});
		describe('when roles are NOT available', () => {
			it('does nothing', async () => {
				const initialAuthStatusProvider = vi.fn().mockResolvedValue([]);
				const instanceUnderTest = setup(null, null, initialAuthStatusProvider);

				await instanceUnderTest.init();

				expect(instanceUnderTest.getRoles()).toEqual([]);
				expect(instanceUnderTest.isSignedIn()).toBe(false);
				expect(store.getState().auth.signedIn).toBe(false);
			});
		});
	});

	describe('getRoles', () => {
		describe('and user is not signed in', () => {
			it('returns an empty array', () => {
				const instanceUnderTest = setup();

				expect(instanceUnderTest.getRoles()).toHaveLength(0);
			});
		});
	});

	describe('isSignedIn', () => {
		describe('and user is not signed in', () => {
			it('returns an empty array', () => {
				const instanceUnderTest = setup();

				expect(instanceUnderTest.isSignedIn()).toBe(false);
			});
		});
	});

	describe('signIn', () => {
		describe('the user is NOT signed in', () => {
			describe('is successful', () => {
				it('returns `true`, updates the internal state and the auth s-o-s', async () => {
					const roles = ['TEST'];
					const credential = { username: 'u', password: 'p' };
					const signInProvider = vi.fn().mockResolvedValue(roles);
					const instanceUnderTest = setup(signInProvider);

					await expect(instanceUnderTest.signIn(credential)).resolves.toBe(true);
					expect(instanceUnderTest.getRoles()).toEqual(roles);
					expect(instanceUnderTest.isSignedIn()).toBe(true);
					expect(store.getState().auth.signedIn).toBe(true);
					expect(signInProvider).toHaveBeenCalledWith(credential);
				});
			});
			describe('is NOT successful', () => {
				it('returns `false`', async () => {
					const credential = { username: 'u', password: 'p' };
					const signInProvider = vi.fn().mockResolvedValue([]);
					const instanceUnderTest = setup(signInProvider);

					await expect(instanceUnderTest.signIn(credential)).resolves.toBe(false);
					expect(instanceUnderTest.getRoles()).toEqual([]);
					expect(instanceUnderTest.isSignedIn()).toBe(false);
					expect(store.getState().auth.signedIn).toBe(false);
					expect(signInProvider).toHaveBeenCalledWith(credential);
				});
			});
		});
		describe('the user is signed in', () => {
			it('returns `true`', async () => {
				const credential = { username: 'u', password: 'p' };
				const instanceUnderTest = setup();
				vi.spyOn(instanceUnderTest, 'isSignedIn').mockReturnValue(true);

				expect(instanceUnderTest.signIn(credential)).resolves.toBe(true);
			});
		});

		it('passes the error of the underlying provider', async () => {
			const msg = 'Something got wrong';
			const credential = { username: 'u', password: 'p' };
			const signInProvider = vi.fn().mockRejectedValue(new Error(msg));
			const instanceUnderTest = setup(signInProvider);
			vi.spyOn(instanceUnderTest, 'isSignedIn').mockReturnValue(false);

			expect(instanceUnderTest.signIn(credential)).rejects.toThrowError(msg);
		});
	});

	describe('signOut', () => {
		describe('the user is signed in', () => {
			describe('is successful', () => {
				it('returns `true`, updates the internal state and the auth s-o-s', async () => {
					const signOutProvider = vi.fn().mockResolvedValue(true);
					const instanceUnderTest = setup(null, signOutProvider, null, { auth: { signedIn: true } });
					instanceUnderTest._roles = ['TEST'];
					vi.spyOn(instanceUnderTest, 'isSignedIn').mockReturnValue(true);

					expect(store.getState().auth.signedIn).toBe(true);

					await expect(instanceUnderTest.signOut()).resolves.toBe(true);
					expect(instanceUnderTest.getRoles()).toEqual([]);
					expect(store.getState().auth.signedIn).toBe(false);
					expect(store.getState().auth.byUser).toBe(true);
				});
			});

			describe('is NOT successful', () => {
				it('returns `false`', async () => {
					const signOutProvider = vi.fn().mockResolvedValue(false);
					const instanceUnderTest = setup(null, signOutProvider, null, { auth: { signedIn: true } });
					instanceUnderTest._roles = ['TEST'];
					vi.spyOn(instanceUnderTest, 'isSignedIn').mockReturnValue(true);

					expect(store.getState().auth.signedIn).toBe(true);

					await expect(instanceUnderTest.signOut()).resolves.toBe(false);
					expect(instanceUnderTest.getRoles()).not.toEqual([]);
					expect(store.getState().auth.signedIn).toBe(true);
				});
			});
		});

		describe('the user is NOT signed in', () => {
			it('returns `true`', async () => {
				const instanceUnderTest = setup(null, null);
				vi.spyOn(instanceUnderTest, 'isSignedIn').mockReturnValue(false);

				await expect(instanceUnderTest.signOut()).resolves.toBe(true);
			});
		});

		it('passes the error of the underlying provider', async () => {
			const msg = 'Something got wrong';
			const signOutProvider = vi.fn().mockRejectedValue(new Error(msg));
			const instanceUnderTest = setup(null, signOutProvider);
			vi.spyOn(instanceUnderTest, 'isSignedIn').mockReturnValue(true);

			await expect(instanceUnderTest.signOut()).rejects.toThrowError(msg);
		});
	});

	describe('invalidate', () => {
		describe('the user is signed in', () => {
			it('updates the internal state, the auth s-o-s and returns `true`', () => {
				const instanceUnderTest = setup(null, null, null, { auth: { signedIn: true } });
				instanceUnderTest._roles = ['TEST'];
				vi.spyOn(instanceUnderTest, 'isSignedIn').mockReturnValue(true);

				expect(store.getState().auth.signedIn).toBe(true);

				const result = instanceUnderTest.invalidate();

				expect(result).toBe(true);
				expect(instanceUnderTest.getRoles()).toEqual([]);
				expect(store.getState().auth.signedIn).toBe(false);
				expect(store.getState().auth.byUser).toBe(false);
			});
		});
		describe('the user is NOT signed in', () => {
			it('returns `false`', () => {
				const instanceUnderTest = setup();
				vi.spyOn(instanceUnderTest, 'isSignedIn').mockReturnValue(false);

				const result = instanceUnderTest.invalidate();

				expect(result).toBe(false);
			});
		});
	});
});
