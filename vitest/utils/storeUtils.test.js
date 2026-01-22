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
            const onChangeSpy = vi.fn();

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
            expect(onChangeSpy).toHaveBeenCalledTimes(1);
            expect(onChangeSpy).toHaveBeenCalledWith(true, { active: true });
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
            const onChangeSpy = vi.fn();

            //act
            observe(store, extract, onChangeSpy, false);

            expect(onChangeSpy).toHaveBeenCalledTimes(1);

            expect(onChangeSpy).toHaveBeenCalledWith(false, { active: false });
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
            const onChangeSpy = vi.fn();

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
            expect(onChangeSpy).toHaveBeenCalledTimes(1);
            expect(onChangeSpy).toHaveBeenCalledWith({ active: true }, { some: { active: true } });
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
            const onChangeSpy = vi.fn();

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
            expect(onChangeSpy).toHaveBeenCalledTimes(1);
            expect(onChangeSpy).toHaveBeenCalledWith(true, { active: true });
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
            const onChangeSpy = vi.fn();

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
            expect(onChangeSpy).toHaveBeenCalledTimes(1);
            expect(onChangeSpy).toHaveBeenCalledWith({ active: true }, { some: { active: true } });
        });
    });

    describe('equals', () => {
        it('compares values shallowly', () => {
            expect(equals(1, 1)).toBe(true);
            expect(equals(true, true)).toBe(true);
            expect(equals('some', 'some')).toBe(true);
            const sym = Symbol('foo');
            expect(equals(sym, sym)).toBe(true);
            expect(equals(undefined, null)).toBe(false);
            expect(equals(undefined, {})).toBe(false);
            expect(equals(null, {})).toBe(false);

            expect(equals(1, 2)).toBe(false);
            expect(equals(true, false)).toBe(false);
            expect(equals('some', 'Some')).toBe(false);
            expect(equals(Symbol('foo'), Symbol('foo'))).toBe(false);
            expect(equals([], [])).toBe(true);
            expect(equals(null, null)).toBe(true);
            expect(equals(undefined, undefined)).toBe(true);
        });

        it('compares functions', () => {
            const someF = () => { };
            const someOtherF = () => {
                return;
            };
            expect(equals(someF, someF)).toBe(true);
            expect(equals(someF, someOtherF)).toBe(false);
        });

        it('compares arrays and objects deeply', () => {
            expect(equals({ some: 42, thing: 21 }, { some: 42, thing: 21 })).toBe(true);
            expect(equals({ some: 42, thing: 21 }, { thing: 21, some: 42 })).toBe(true);
            expect(equals(['some', 'foo'], ['some', 'foo'])).toBe(true);
            expect(equals([42, { value: 42 }, 'some'], [42, { value: 42 }, 'some'])).toBe(true);

            expect(equals({ some: 42 }, { some: 21 })).toBe(false);
            expect(equals({ some: 42 }, { thing: 42 })).toBe(false);
            expect(equals({ some: () => { } }, { some: () => { } })).toBe(true);
            expect(equals({ some: () => { } }, {
                some: () => {
                    return;
                }
            })).toBe(false);
            expect(equals(['some', 'foo'], ['foo', 'some'])).toBe(false);
            expect(equals([42, { value: 42 }, 'some'], [42, { value: 21 }, 'some'])).toBe(false);
            expect(equals([], {})).toBe(false);
            expect(equals({}, [])).toBe(false);
        });
    });

    describe('class EventLike', () => {
        it('initializes the object', () => {
            const eventLike = new EventLike('payload');

            expect(eventLike.payload).toBe('payload');
            expect(eventLike.id).toBeDefined();
            expect(equals(new EventLike('some'), new EventLike('some'))).toBe(false);
            expect(new EventLike().payload).toBeNull();
        });
    });
});
