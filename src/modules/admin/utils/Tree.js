/**
 * @module modules/admin/utils/Tree
 */
import { deepClone } from '../../../utils/clone';
import { createUniqueId } from '../../../utils/numberUtils';

/**
 * A branch has at least the properties "id" and "children".
 * A leaf is a branch where the property children is equal to null.
 * @typedef Branch
 * @property {number|string} id The id of the branch.
 * @property {array|null} children The children of the branch. Null marks the branch as a Leaf.
 * @property {object|undefined} properties Optional properties can be added directly to the branch object or wrapped in a object.
 */

/**
 * Utility Class to create customizable trees
 * @class
 * @author herrmutig
 */
export class Tree {
	#root;
	#setupBranch;

	/**
	 * creates a new tree
	 *
	 * @param {function(Branch): Branch} setupBranch - Called every time the tree manipulates an entry (e.g. create, createEntry, add, update, replace)
	 * Used to set custom properties onto the branch.
	 */
	constructor(setupBranch) {
		this.#setupBranch = setupBranch;
		this.#root = [];
	}

	/**
	 * deep clones and returns the entries of the tree
	 *
	 * @returns {Array<Branch>} Array of Branch objects
	 */
	get() {
		return deepClone(this.#root);
	}

	/**
	 * deep clones and returns a branch by id
	 *
	 * @param {number|string} id - The id of the branch to return.
	 * @returns {Branch|null} - The branch if found, otherwise null.
	 */
	getById(id) {
		return deepClone(this.#getReferenceById(id));
	}

	/**
	 * creates a tree with a provided tree-structured template
	 *
	 * @param {Array<Branch>} source
	 */
	create(source) {
		const treeRoot = [];
		for (let i = 0; i < source.length; i++) {
			treeRoot.push(this.createEntry(source[i]));
		}

		this.#root = treeRoot;
	}

	/**
	 * creates a Branch object and ensures that it passed the - in the constructor provided - setupBranch function.
	 *
	 * @param {Branch} source
	 * @returns {Branch} - The setup branch
	 */
	createEntry(source) {
		const entry = { ...this.#setupBranch(source) };

		if (entry.id === undefined) {
			entry.id = createUniqueId();
		}

		if (entry.children === undefined) {
			entry.children = null;
		}

		if (entry.children) {
			const childEntries = [];
			for (let i = 0; i < entry.children.length; i++) {
				childEntries.push(this.createEntry(entry.children[i]));
			}

			entry.children = childEntries;
		}

		return entry;
	}

	/**
	 * prepends Branch as child at the given non-leaf branch id.
	 *
	 * @param {string|number} branchId
	 * @param {Branch} newEntry The branch to prepend (setup happens automatically)
	 */
	prependAt(branchId, newEntry) {
		let branch = this.#root;
		if (branchId !== null) {
			branch = this.#getReferenceById(branchId)?.children ?? null;
		}

		if (branch !== null) {
			branch.unshift(this.createEntry(newEntry));
		}
	}

	/**
	 * appends a Branch as child at the given non-leaf branch id.
	 *
	 * @param {string|number} branchId
	 * @param {Branch} newEntry The branch to append (setup happens automatically)
	 */
	appendAt(branchId, newEntry) {
		let branch = this.#root;
		if (branchId !== null) {
			branch = this.#getReferenceById(branchId)?.children ?? null;
		}

		if (branch !== null) {
			branch.push(this.createEntry(newEntry));
		}
	}

	/**
	 * adds a Branch before or after the given id.
	 *
	 * @param {string|number} id The id to add the entry.
	 * @param {Branch} newEntry The branch to add (setup happens automatically)
	 * @param {Boolean} insertBefore Whether to insert "newEntry" before or after the provided id
	 */
	addAt(id, newEntry, insertBefore = false) {
		let subTree = this.#root;
		let subTreeIndex = -1;

		this._traverseTree(this.#root, (index, currentSubTree) => {
			const currentEntry = currentSubTree[index];
			if (currentEntry.id === id) {
				subTree = currentSubTree;
				subTreeIndex = index;
				return true;
			}
			return false;
		});

		const preparedEntry = this.createEntry(newEntry);

		if (insertBefore) {
			if (subTreeIndex === 0) {
				subTree.unshift(preparedEntry);
			} else {
				subTree.splice(subTreeIndex, 0, preparedEntry);
			}
		} else {
			subTree.splice(subTreeIndex + 1, 0, preparedEntry);
		}
	}

	/**
	 * updates a branch with the provided properties.
	 *
	 * @param {string|number} id The id of the branch
	 * @param {Branch} properties A set of properties to override the branch with. Note: the property "id "is immutable and can not be changed.
	 */
	update(id, properties) {
		const tree = this.#root;

		this._traverseTree(tree, (index, subTree) => {
			const entryToUpdate = subTree[index];
			if (entryToUpdate.id === id) {
				const idSafety = entryToUpdate.id;
				subTree[index] = this.createEntry({ ...entryToUpdate, ...properties, id: idSafety });
				return true;
			}

			return false;
		});
	}

	/**
	 * removes a branch.
	 *
	 * @param {string|number} id The id of the branch to remove
	 */
	remove(id) {
		const tree = this.#root;
		this._traverseTree(tree, (index, subTree) => {
			const entryToRemove = subTree[index];
			if (entryToRemove.id === id) {
				subTree.splice(index, 1);
				return true;
			}

			return false;
		});
	}

	/**
	 * replaces a branch with another branch.
	 *
	 * @param {string|number} idToReplace - The id of the branch to replace
	 * @param {Branch} newEntry  - The new branch to replace the old with
	 */
	replace(idToReplace, newEntry) {
		const tree = this.#root;
		this._traverseTree(tree, (index, subTree) => {
			const currentNode = subTree[index];
			if (currentNode.id === idToReplace) {
				subTree[index] = this.createEntry({ ...newEntry });
				return true;
			}

			return false;
		});
	}

	#getReferenceById(id) {
		const tree = this.#root;
		let entry = null;

		this._traverseTree(tree, (index, subTree) => {
			const currentEntry = subTree[index];
			if (currentEntry.id === id) {
				entry = { ...currentEntry };
				return true;
			}

			return false;
		});

		return entry;
	}

	_traverseTree(tree, nodeCallback) {
		const traverse = (currentTree, parentNode, callback) => {
			for (let i = 0; i < currentTree.length; i++) {
				// children is undefined on root tree level.
				if (callback(i, currentTree, parentNode) === true) {
					return;
				}

				const currentNode = currentTree[i];
				if (currentNode.children !== null) {
					traverse(currentNode.children, currentNode, callback);
				}
			}
		};

		traverse(tree, null, nodeCallback);
	}
}
