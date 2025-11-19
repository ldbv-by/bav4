/**
 * @module modules/admin/utils/Tree
 */
import { deepClone } from '../../../utils/clone';
import { createUniqueId } from '../../../utils/numberUtils';

/**
 * A branch has at least the properties "id" and "children".
 * A leaf is a branch where the property children is equal to null.
 * {@link Tree}
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
	 * Creates a new tree
	 *
	 * @param {function(object): object} setupBranch - Called every time the tree manipulates an entry (e.g. create, createEntry, add, update, replace)
	 * Used to set custom properties onto the branch.
	 */
	constructor(setupBranch) {
		this.#setupBranch = setupBranch;
		this.#root = [];
	}

	/**
	 * Deep clones and returns the entries of the tree
	 *
	 * @returns {module:modules/admin/utils/Tree~Branch[]} Array of Branch objects
	 */
	get() {
		return deepClone(this.#root);
	}

	/**
	 * Deep clones and returns a branch by id
	 *
	 * @param {number|string} id - The id of the branch to return.
	 * @returns {module:modules/admin/utils/Tree~Branch[]|null} - The branch if found, otherwise null.
	 */
	getById(id) {
		return deepClone(this.#getReferenceById(id));
	}

	/**
	 * Checks whether a branch with the provided id exists in the tree
	 *
	 * @param {number|string} id - The id to check.
	 * @returns {boolean} - True if found, False otherwise.
	 */
	has(id) {
		return this.#getReferenceById(id) !== null;
	}

	/**
	 * Creates a tree with a provided tree-structured template
	 *
	 * @param {module:modules/admin/utils/Tree~Branch[]|object[]} source
	 */
	create(source) {
		const treeRoot = [];
		for (let i = 0; i < source.length; i++) {
			treeRoot.push(this.createEntry(source[i]));
		}

		this.#root = treeRoot;
	}

	/**
	 * Creates a Branch object and ensures that it passed the - in the constructor provided - setupBranch function.
	 *
	 * @param {module:modules/admin/utils/Tree~Branch|object} source
	 * @returns {module:modules/admin/utils/Tree~Branch} - The setup branch
	 */
	createEntry(source) {
		if (source.id === undefined || source.id === null) {
			source.id = createUniqueId();
		}

		const idSafety = source.id;
		const entry = { ...this.#setupBranch(source), id: idSafety };

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
	 * Prepends Branch as child at the given non-leaf branch id.
	 *
	 * @param {string|number} branchId
	 * @param {module:modules/admin/utils/Tree~Branch|object} newEntry The branch to prepend (setup happens automatically)
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
	 * Appends a Branch as child at the given non-leaf branch id.
	 *
	 * @param {string|number} branchId
	 * @param {module:modules/admin/utils/Tree~Branch|object} newEntry The branch to append (setup happens automatically)
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
	 * Adds a Branch before or after the given id.
	 *
	 * @param {string|number} id The id to add the entry.
	 * @param {module:modules/admin/utils/Tree~Branch|object} newEntry The branch to add (setup happens automatically)
	 * @param {Boolean} insertBefore Whether to insert "newEntry" before or after the provided id
	 */
	addAt(id, newEntry, insertBefore = false) {
		let subTree = this.#root;
		let subTreeIndex = 0;

		if (id !== null && id !== undefined) {
			this._traverseTree(this.#root, (index, currentSubTree) => {
				const currentEntry = currentSubTree[index];
				if (currentEntry.id === id) {
					subTree = currentSubTree;
					subTreeIndex = index;
					return true;
				}
				return false;
			});
		}

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
	 * Updates a branch with the provided properties.
	 *
	 * @param {string|number} id The id of the branch
	 * @param {module:modules/admin/utils/Tree~Branch|object} properties A set of properties to override the branch with. Note: the property "id "is immutable and can not be changed.
	 */
	update(id, properties) {
		const tree = this.#root;

		this._traverseTree(tree, (index, subTree) => {
			const entryToUpdate = subTree[index];
			if (entryToUpdate.id === id) {
				subTree[index] = this.createEntry({ ...entryToUpdate, ...properties, id: entryToUpdate.id });
				return true;
			}

			return false;
		});
	}

	/**
	 * Removes a branch.
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
	 * Replaces a branch with another branch.
	 *
	 * @param {string|number} idToReplace - The id of the branch to replace
	 * @param {module:modules/admin/utils/Tree~Branch} newEntry  - The new branch to replace the old with
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
