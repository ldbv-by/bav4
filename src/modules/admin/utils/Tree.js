/**
 * @module modules/admin/utils/Tree
 */
import { deepClone } from '../../../utils/clone';
import { createUniqueId } from '../../../utils/numberUtils';

/**
 * Represents a piece of a CQL string (e.g. keyword, symbol)
 * @typedef Branch
 * @property {string} id The id of the branch.
 * @property {array} children The children of the branch.
 * @property {object} properties .
 */

/**
 * Tokenizes a given CQL string
 * @class
 * @author herrmutig
 */
export class Tree {
	#root;
	#entryConversionRule;

	constructor(entryConversionRule) {
		this.#entryConversionRule = entryConversionRule;
		this.#root = [];
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

	get() {
		return deepClone(this.#root);
	}

	// TODO maybe create a private implementation that allows direct mutation of the branch. public should return a deepcopy instead
	// to ensure the tree is immutable outside of the class.
	getById(id) {
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

	create(source) {
		const treeRoot = [];
		for (let i = 0; i < source.length; i++) {
			treeRoot.push(this.createEntry(source[i]));
		}

		this.#root = treeRoot;
	}

	createEntry(source) {
		const entry = { ...this.#entryConversionRule(source) };

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

	prependAt(branchId, newEntry) {
		let branch = this.#root;
		if (branchId !== null) {
			branch = this.getById(branchId)?.children ?? this.#root;
		}

		branch.unshift(this.createEntry(newEntry));
	}

	appendAt(branchId, newEntry) {
		let branch = this.#root;
		if (branchId !== null) {
			branch = this.getById(branchId)?.children ?? this.#root;
		}

		branch.push(this.createEntry(newEntry));
	}

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
}
