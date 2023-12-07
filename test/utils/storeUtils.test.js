/* eslint-disable no-undef */
import { observe, equals, EventLike, observeOnce } from '../../src/utils/storeUtils.js';
import { createStore } from 'redux';

// onChangeSpy.calls.reset();
describe('store utils', () => {
	describe('observe', () => {
		it('observes a property', () => {
			//arrange
			const reducer = (state = { active: false }, action) => {
				switch (action.type) {
					case 'SOMETHING':
						return { ...state, active: action.payload };
					default:
						return state;
				}
			};
			const store = createStore(reducer);
			const extract = (state) => {
				return state.active;
			};
			const onChangeSpy = jasmine.createSpy();

			//act
			observe(store, extract, onChangeSpy);
			//no initial call after observer registration
			expect(onChangeSpy).not.toHaveBeenCalled();

			//act
			store.dispatch({
				type: 'SOMETHING',
				payload: false
			});
			//no call cause state was not changed
			expect(onChangeSpy).not.toHaveBeenCalled();

			//act
			store.dispatch({
				type: 'SOMETHING',
				payload: true
			});
			expect(onChangeSpy).toHaveBeenCalledOnceWith(true, { active: true });
		});

		it('initially calls the callback when ignoreInitialState is set to false', () => {
			//arrange
			const reducer = (state = { active: false }, action) => {
				switch (action.type) {
					case 'SOMETHING':
						return { ...state, active: action.payload };
					default:
						return state;
				}
			};
			const store = createStore(reducer);
			const extract = (state) => {
				return state.active;
			};
			const onChangeSpy = jasmine.createSpy();

			//act
			observe(store, extract, onChangeSpy, false);

			expect(onChangeSpy).toHaveBeenCalledOnceWith(false, { active: false });
		});

		it('observes an object', () => {
			//arrange
			const reducer = (state = { some: { active: false } }, action) => {
				switch (action.type) {
					case 'SOMETHING':
						return { ...state, some: action.payload };

					default:
						return state;
				}
			};
			const store = createStore(reducer);
			const extract = (state) => {
				return state.some;
			};
			const onChangeSpy = jasmine.createSpy();

			//act
			observe(store, extract, onChangeSpy);

			//no initial call after observer registration
			expect(onChangeSpy).not.toHaveBeenCalled();

			//act
			store.dispatch({
				type: 'SOMETHING',
				payload: { active: false }
			});
			//no call cause state was not changed
			expect(onChangeSpy).not.toHaveBeenCalled();

			//act
			store.dispatch({
				type: 'SOMETHING',
				payload: { active: true }
			});
			expect(onChangeSpy).toHaveBeenCalledOnceWith({ active: true }, { some: { active: true } });
		});
	});

	describe('observeOnce', () => {
		it('observes a property', () => {
			//arrange
			const reducer = (state = { active: false }, action) => {
				switch (action.type) {
					case 'SOMETHING':
						return { ...state, active: action.payload };
					default:
						return state;
				}
			};
			const store = createStore(reducer);
			const extract = (state) => {
				return state.active;
			};
			const onChangeSpy = jasmine.createSpy();

			//act
			observeOnce(store, extract, onChangeSpy);
			//no initial call after observer registration
			expect(onChangeSpy).not.toHaveBeenCalled();

			//act
			store.dispatch({
				type: 'SOMETHING',
				payload: false
			});
			//no call cause state was not changed
			expect(onChangeSpy).not.toHaveBeenCalled();

			//act
			store.dispatch({
				type: 'SOMETHING',
				payload: true
			});
			//mutate again
			store.dispatch({
				type: 'SOMETHING',
				payload: false
			});
			expect(onChangeSpy).toHaveBeenCalledOnceWith(true, { active: true });
		});

		it('observes an object', () => {
			//arrange
			const reducer = (state = { some: { active: false } }, action) => {
				switch (action.type) {
					case 'SOMETHING':
						return { ...state, some: action.payload };

					default:
						return state;
				}
			};
			const store = createStore(reducer);
			const extract = (state) => {
				return state.some;
			};
			const onChangeSpy = jasmine.createSpy();

			//act
			observeOnce(store, extract, onChangeSpy);

			//no initial call after observer registration
			expect(onChangeSpy).not.toHaveBeenCalled();

			//act
			store.dispatch({
				type: 'SOMETHING',
				payload: { active: false }
			});
			//no call cause state was not changed
			expect(onChangeSpy).not.toHaveBeenCalled();

			//act
			store.dispatch({
				type: 'SOMETHING',
				payload: { active: true }
			});
			//mutate again
			store.dispatch({
				type: 'SOMETHING',
				payload: { active: false }
			});
			expect(onChangeSpy).toHaveBeenCalledOnceWith({ active: true }, { some: { active: true } });
		});
	});

	describe('equals', () => {
		it('compares values shallowly', () => {
			expect(equals(1, 1)).toBeTrue();
			expect(equals(true, true)).toBeTrue();
			expect(equals('some', 'some')).toBeTrue();
			const sym = Symbol('foo');
			expect(equals(sym, sym)).toBeTrue();
			expect(equals(undefined, null)).toBeFalse();
			expect(equals(undefined, {})).toBeFalse();
			expect(equals(null, {})).toBeFalse();

			expect(equals(1, 2)).toBeFalse();
			expect(equals(true, false)).toBeFalse();
			expect(equals('some', 'Some')).toBeFalse();
			expect(equals(Symbol('foo'), Symbol('foo'))).toBeFalse();
			expect(equals([], [])).toBeTrue();
			expect(equals(null, null)).toBeTrue();
			expect(equals(undefined, undefined)).toBeTrue();
		});

		it('compares functions', () => {
			const someF = () => {};
			const someOtherF = () => {
				return;
			};
			expect(equals(someF, someF)).toBeTrue();
			expect(equals(someF, someOtherF)).toBeFalse();
		});

		it('compares arrays and objects deeply', () => {
			expect(equals({ some: 42, thing: 21 }, { some: 42, thing: 21 })).toBeTrue();
			expect(equals({ some: 42, thing: 21 }, { thing: 21, some: 42 })).toBeTrue();
			expect(equals(['some', 'foo'], ['some', 'foo'])).toBeTrue();
			expect(equals([42, { value: 42 }, 'some'], [42, { value: 42 }, 'some'])).toBeTrue();

			expect(equals({ some: 42 }, { some: 21 })).toBeFalse();
			expect(equals({ some: 42 }, { thing: 42 })).toBeFalse();
			expect(equals({ some: () => {} }, { some: () => {} })).toBeTrue();
			expect(
				equals(
					{ some: () => {} },
					{
						some: () => {
							return;
						}
					}
				)
			).toBeFalse();
			expect(equals(['some', 'foo'], ['foo', 'some'])).toBeFalse();
			expect(equals([42, { value: 42 }, 'some'], [42, { value: 21 }, 'some'])).toBeFalse();
			expect(equals([], {})).toBeFalse();
			expect(equals({}, [])).toBeFalse();
		});
	});

	describe('class EventLike', () => {
		it('initializes the object', () => {
			const eventLike = new EventLike('payload');

			expect(eventLike.payload).toBe('payload');
			expect(eventLike.id).toBeDefined();
			expect(equals(new EventLike('some'), new EventLike('some'))).toBeFalse();
			expect(new EventLike().payload).toBeNull();
		});
	});
});
