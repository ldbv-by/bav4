import { Tree } from '../../../../src/modules/admin/utils/Tree';
import { isNumber } from '../../../../src/utils/checks';
import { createUniqueId } from '../../../../src/utils/numberUtils';

describe('Tree', () => {
	const createTreeNode = (label, childNodes = undefined) => {
		return { id: createUniqueId(), label: label, children: childNodes ? [...childNodes] : null };
	};

	it('traverses the tree when _traverseTree is called', () => {
		const tree = new Tree((s) => s);
		const entries = [
			createTreeNode('foo resource'),
			createTreeNode('faz resource', [createTreeNode('sub faz')]),
			createTreeNode('bar group', [createTreeNode('sub foo'), createTreeNode('sub bar'), createTreeNode('sub baz')])
		];
		const traversedEntries = [];

		tree.create(entries);
		tree._traverseTree(tree.get(), (index, subTree) => {
			traversedEntries.push(subTree[index]);
		});

		expect(traversedEntries).toHaveSize(7);
		expect(traversedEntries[0]).toEqual(entries[0]);
		expect(traversedEntries[1]).toEqual(entries[1]);
		expect(traversedEntries[2]).toEqual(entries[1].children[0]);
		expect(traversedEntries[3]).toEqual(entries[2]);
		expect(traversedEntries[4]).toEqual(entries[2].children[0]);
		expect(traversedEntries[5]).toEqual(entries[2].children[1]);
		expect(traversedEntries[6]).toEqual(entries[2].children[2]);
	});

	it('cancels traversing the tree when _traverseTree callback returns true', () => {
		let cancelCounter = 4;
		const tree = new Tree((s) => s);
		const entries = [
			createTreeNode('foo resource'),
			createTreeNode('faz resource', [createTreeNode('sub faz')]),
			createTreeNode('bar group', [createTreeNode('sub foo'), createTreeNode('sub bar'), createTreeNode('sub baz')])
		];
		const traversedEntries = [];

		tree.create(entries);
		tree._traverseTree(tree.get(), (index, subTree) => {
			traversedEntries.push(subTree[index]);
			cancelCounter--;
			return cancelCounter === 0;
		});

		expect(traversedEntries).toHaveSize(4);
		expect(traversedEntries[0]).toEqual(entries[0]);
		expect(traversedEntries[1]).toEqual(entries[1]);
		expect(traversedEntries[2]).toEqual(entries[1].children[0]);
	});

	it('creates a tree', () => {
		const tree = new Tree((s) => s);
		const entries = [
			createTreeNode('foo resource'),
			createTreeNode('faz resource', [createTreeNode('sub faz')]),
			createTreeNode('bar group', [createTreeNode('sub foo'), createTreeNode('sub bar'), createTreeNode('sub baz')])
		];

		const createEntrySpy = spyOn(tree, 'createEntry').and.callThrough();
		tree.create(entries);
		const treeEntries = tree.get();

		expect(treeEntries[0]).toEqual(entries[0]);
		expect(treeEntries[1]).toEqual(entries[1]);
		expect(treeEntries[1].children[0]).toEqual(entries[1].children[0]);
		expect(treeEntries[2]).toEqual(entries[2]);
		expect(treeEntries[2].children[0]).toEqual(entries[2].children[0]);
		expect(treeEntries[2].children[1]).toEqual(entries[2].children[1]);
		expect(treeEntries[2].children[2]).toEqual(entries[2].children[2]);
		expect(createEntrySpy).toHaveBeenCalledTimes(7);
	});

	it('creates an entry', () => {
		const tree = new Tree((s) => s);

		const entryWithoutId = tree.createEntry({ label: 'foo label' });
		expect(isNumber(entryWithoutId.id)).toBeTrue();
		expect(entryWithoutId.children).toBeNull();
		expect(entryWithoutId.label).toEqual('foo label');

		const entryWithId = tree.createEntry({ id: 'bar', label: 'bar label' });
		expect(entryWithId.id).toEqual('bar');
		expect(entryWithId.children).toBeNull();
		expect(entryWithId.label).toEqual('bar label');

		const createEntrySpy = spyOn(tree, 'createEntry').and.callThrough();
		const entryWithChildren = tree.createEntry({ children: [{ label: 'boo child' }] });
		expect(entryWithChildren.children).toHaveSize(1);
		expect(entryWithChildren.children[0].label).toEqual('boo child');
		expect(createEntrySpy).toHaveBeenCalledTimes(2); // called once time for the parent and once for the child.
	});

	it('prepends an entry to the tree', () => {
		const tree = new Tree((s) => s);
		const createEntrySpy = spyOn(tree, 'createEntry').and.callThrough();
		const traversalSpy = spyOn(tree, '_traverseTree').and.callThrough();

		tree.prependAt(null, { id: 'foo' });
		tree.prependAt('id not found', { id: 'do not prepend!' });
		tree.prependAt(null, { id: 'faz' });
		tree.prependAt(null, { id: 'bar', children: [] });
		tree.prependAt('bar', { id: 'bar one' });
		tree.prependAt('bar', { id: 'bar two' });

		const entries = tree.get();
		expect(entries[0].id).toEqual('bar');
		expect(entries[1].id).toEqual('faz');
		expect(entries[2].id).toEqual('foo');
		expect(entries[0].children[0].id).toEqual('bar two');
		expect(entries[0].children[1].id).toEqual('bar one');
		expect(createEntrySpy).toHaveBeenCalledTimes(5);
		expect(traversalSpy).toHaveBeenCalledTimes(3); // should only traverse when an id is given in prependAt.
	});

	it('appends an entry to the tree', () => {
		const tree = new Tree((s) => s);
		const createEntrySpy = spyOn(tree, 'createEntry').and.callThrough();
		const traversalSpy = spyOn(tree, '_traverseTree').and.callThrough();

		tree.appendAt(null, { id: 'foo' });
		tree.appendAt('id not found', { id: 'do not append!' });
		tree.appendAt(null, { id: 'faz' });
		tree.appendAt(null, { id: 'bar', children: [] });
		tree.appendAt('bar', { id: 'bar one' });
		tree.appendAt('bar', { id: 'bar two' });

		const entries = tree.get();
		expect(entries[0].id).toEqual('foo');
		expect(entries[1].id).toEqual('faz');
		expect(entries[2].id).toEqual('bar');
		expect(entries[2].children[0].id).toEqual('bar one');
		expect(entries[2].children[1].id).toEqual('bar two');
		expect(createEntrySpy).toHaveBeenCalledTimes(5);
		expect(traversalSpy).toHaveBeenCalledTimes(3); // should only traverse when an id is given in appendAt.
	});

	it('adds an entry to the tree', () => {
		const tree = new Tree((s) => s);
		const createEntrySpy = spyOn(tree, 'createEntry').and.callThrough();
		const traversalSpy = spyOn(tree, '_traverseTree').and.callThrough();

		tree.addAt(null, { id: 'foo' });
		tree.addAt('foo', { id: 'foo add at start' }, true);
		tree.addAt('foo', { id: 'foo add default after', children: [{ id: 'bar' }] });
		tree.addAt('foo', { id: 'foo add after' }, false);
		tree.addAt('foo', { id: 'foo add before' }, true);
		tree.addAt('bar', { id: 'bar two' });

		const entries = tree.get();
		expect(entries[0].id).toEqual('foo add at start');
		expect(entries[1].id).toEqual('foo add before');
		expect(entries[2].id).toEqual('foo');
		expect(entries[3].id).toEqual('foo add after');
		expect(entries[4].id).toEqual('foo add default after');
		expect(entries[4].children[1].id).toBe('bar two');
		expect(traversalSpy).toHaveBeenCalledTimes(5); // called once for each addAt/appendAt call.
		expect(createEntrySpy).toHaveBeenCalledTimes(7); // called once for each tree entry.
	});

	it('updates an entry in the tree', () => {
		const tree = new Tree((s) => s);
		tree.appendAt(null, { id: 'foo' });

		const createEntrySpy = spyOn(tree, 'createEntry').and.callThrough();
		const traversalSpy = spyOn(tree, '_traverseTree').and.callThrough();
		tree.update('foo', { id: 'id change not possible', myProperty: 'bar' });
		tree.update('id not found', {});

		const entries = tree.get();
		expect(entries[0].id).toEqual('foo');
		expect(entries[0].myProperty).toEqual('bar');
		expect(traversalSpy).toHaveBeenCalledTimes(2);
		expect(createEntrySpy).toHaveBeenCalledTimes(1);
	});

	it('removes an entry from the tree', () => {
		const tree = new Tree((s) => s);
		tree.appendAt(null, { id: 'faz' });
		tree.appendAt(null, { id: 'foo' });
		tree.appendAt(null, { id: 'bar' });

		const traversalSpy = spyOn(tree, '_traverseTree').and.callThrough();
		tree.remove('foo');
		tree.remove('id not found');

		const entries = tree.get();
		expect(entries).toHaveSize(2);
		expect(entries[0].id).toEqual('faz');
		expect(entries[1].id).toEqual('bar');
		expect(traversalSpy).toHaveBeenCalledTimes(2);
	});

	it('replaces an entry in the tree', () => {
		const tree = new Tree((s) => s);
		tree.appendAt(null, { id: 'faz' });
		tree.appendAt(null, { id: 'foo' });
		tree.appendAt(null, { id: 'bar' });

		const traversalSpy = spyOn(tree, '_traverseTree').and.callThrough();
		const createEntrySpy = spyOn(tree, 'createEntry').and.callThrough();
		tree.replace('foo', { id: 'newEntry' });
		tree.replace('id not found', {});

		const entries = tree.get();
		expect(entries).toHaveSize(3);
		expect(entries[1].id).toEqual('newEntry');
		expect(traversalSpy).toHaveBeenCalledTimes(2);
		expect(createEntrySpy).toHaveBeenCalledTimes(1);
	});

	it('gets the entries of the tree', () => {
		const tree = new Tree((s) => s);
		tree.appendAt(null, { id: 1 });
		tree.appendAt(null, { id: '23', children: [] });
		tree.appendAt('23', { id: '23 child', label: '23 child label' });
		tree.appendAt(null, { id: 'foo' });

		const entriesA = tree.get();
		const entriesB = tree.get();

		// tree.get() should deep clone the entries to stay immutable from other influences.
		expect(entriesA).not.toBe(entriesB);
		expect(entriesA).toEqual(entriesB);
		expect(entriesA[0].id).toEqual(1);
		expect(entriesA[1].id).toEqual('23');
		expect(entriesA[1].children[0].id).toEqual('23 child');
		expect(entriesA[2].id).toEqual('foo');
	});

	it('gets an entry by id', () => {
		const tree = new Tree((s) => s);
		tree.appendAt(null, { id: 1 });
		tree.appendAt(null, { id: '23', children: [] });
		tree.appendAt('23', { id: '23 child', label: '23 child label' });
		tree.appendAt(null, { id: 'foo' });

		const traversalSpy = spyOn(tree, '_traverseTree').and.callThrough();
		const entryA = tree.getById('23 child');
		const entryB = tree.getById('23 child');
		const entryC = tree.getById('id not found');

		expect(entryA).toEqual(entryB);
		expect(entryA).not.toBe(entryB);
		expect(entryC).toBeNull();
		expect(entryA.id).toEqual('23 child');
		expect(entryA.label).toEqual('23 child label');
		expect(traversalSpy).toHaveBeenCalledTimes(3);
	});

	it('checks for if tree has a branch by id', async () => {
		const tree = new Tree((s) => s);
		tree.appendAt(null, { id: 1 });
		tree.appendAt(null, { id: '23', children: [] });
		tree.appendAt('23', { id: '23 child', label: '23 child label' });

		expect(tree.has(1)).toBeTrue();
		expect(tree.has('23 child')).toBeTrue();
		expect(tree.has('bar')).toBeFalse();
	});
});
