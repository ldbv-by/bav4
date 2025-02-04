import { addOpenNode, setOpenNodes, removeOpenNode } from '../../../src/store/catalog/catalog.action.js';
import { catalogReducer } from '../../../src/store/catalog/catalog.reducer.js';
import { TestUtils } from '../../test-utils.js';

describe('catalogReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			catalog: catalogReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().catalog.openNodes).toEqual([]);
	});

	it("set the 'openNodes' property in a checked manner", () => {
		const openNodes = ['42', '21'];
		const store = setup();

		setOpenNodes({ id: 'foo' });

		expect(store.getState().catalog.openNodes).toEqual([]);

		setOpenNodes([...openNodes, '21', 57]);

		expect(store.getState().catalog.openNodes).toEqual(openNodes);
	});

	it('adds an id to the list of open nodes', () => {
		const openNodes = ['42', '21'];
		const store = setup({
			catalog: {
				openNodes: [...openNodes]
			}
		});

		addOpenNode({ id: 'foo' });

		expect(store.getState().catalog.openNodes).toEqual(openNodes);

		addOpenNode('42');

		expect(store.getState().catalog.openNodes).toEqual(openNodes);

		addOpenNode('57');

		expect(store.getState().catalog.openNodes).toEqual([...openNodes, '57']);
	});

	it('removes an id from the list of open nodes', () => {
		const openNodes = ['42', '21'];
		const store = setup({
			catalog: {
				openNodes: [...openNodes]
			}
		});

		removeOpenNode({ id: 'foo' });

		expect(store.getState().catalog.openNodes).toEqual(openNodes);

		removeOpenNode('57');

		expect(store.getState().catalog.openNodes).toEqual(openNodes);

		removeOpenNode('42');
		removeOpenNode('42');

		expect(store.getState().catalog.openNodes).toEqual(['21']);
	});
});
