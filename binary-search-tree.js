//==============================================================================
// initialize

set_level_diff(80.0);
set_start_pos(30,50);
set_root_pos(screen.width/2, 50);
set_trash_pos(30, 2*level_diff);
set_compare_offset(40, 0);
set_outdiv(document.getElementById("outdiv"));
let errorbox_tmp = document.createElement("div");
errorbox_tmp.style = `position:absolute; left:${screen.width * 1.0 / 4}px; top:${root_pos.y + 20}px;
	width:${screen.width * 1.0 / 8}px`;
set_errorbox(errorbox_tmp);
set_node_radius(20);
set_horiz(screen.width * 1.0 / 3);
set_anime_duration(300);
set_highlight_duration(500);
//const RED = 'rgb(255,0,0)';
//const YELLOW = 'rgb(128,128,0)';
//const GREEN = 'rgb(0,255,0)';
//const BLUE = 'rgb(0,0,255)';
//const WHITE = 'rgb(255,255,255)';


var mytree = null;

//==============================================================================
// buttons and HTML stuff
let body = document.body;
let button_rotate_left = document.getElementById('button_rotate_left');
let button_rotate_right = document.getElementById('button_rotate_right');
body.addEventListener('keydown', (event) => {
	switch (event.key) {
		case 'l':
			button_rotate_left.click();
			break;
		case 'r':
			button_rotate_right.click();
			break;
	}
});
button_rotate_left.onclick = function() {
	finishAction_newTimeline();
	mytree.rotateRootLeftFromButton();
};
button_rotate_right.onclick = function() {
	finishAction_newTimeline();
	mytree.rotateRootRightFromButton();
};
button_insert.onclick = function() {
	finishAction_newTimeline();
	var x = document.getElementById("insert_value");
	mytree.insert(Number(x.value));
};
button_search.onclick = function() {
	finishAction_newTimeline();
	var x = document.getElementById("search_value");
	var cur_time = mytimeline.currentTime;
	mytree.searchVal(Number(x.value));
	skipTo(cur_time);
}
button_delete.onclick = function() {
	finishAction_newTimeline();
	var x = document.getElementById("delete_value");
	var cur_time = mytimeline.currentTime;
	mytree.popVal(x.value);
	skipTo(cur_time);
}
button_newBST.onclick = function() {
	if (mytree != null)
		mytree.destroy();
	finishAction_newTimeline();
	mytree = new BST();
}
button_newAVL.onclick = function() {
	if (mytree != null)
		mytree.destroy();
	finishAction_newTimeline();
	mytree = new AVLTree();
}
button_updatePos.onclick = function() {
	if (mytree != null)
		mytree.updatePos();
	finishAction_newTimeline();
}


//=============================================================================
// Binary Search Tree
//=============================================================================
class BST extends Tree {
	constructor() {
		super();
	}
	insert(val) {
		var newnode = new Node(val);
		if (this.isEmpty()) {
			//this.root = newnode;
			//newnode.placeAtRoot();
			this.setNodeAsRoot(newnode);
			return;
		}
		var cur = this.root;
		while (true) {
			var comp = newnode.compareNode(cur);
			console.log(newnode.val, cur.val, comp);
			if (comp <= 0) {
				if (cur.left == null) {
					newnode.setAsLeftChildOf(cur, true);
					break;
				}
				else
					cur = cur.left;
			}
			else {
				if (cur.right == null) {
					newnode.setAsRightChildOf(cur, true);
					break;
				}
				else
					cur = cur.right;
			}
			this.updatePos();
		}
		this.updatePos();
	}
	// returns [node, parent]
	// parent is null if node==root
	searchVal(val) {
		if (this.isEmpty()) {
			return [null, null];
		}
		var cur = this.root;
		var prev = null;
		var visNode = new ValueNode(val);
		while (cur != null) {
			var comp = visNode.compareNode(cur);
			if (comp == 0) {
				cur.highlight(GREEN, highlight_duration);
				cur.unhighlight();
				visNode.destroy();
				return [cur, prev];
			}
			cur.highlight(BLUE);
			cur.unhighlight();
			prev = cur;
			if (comp < 0)
				cur = cur.left;
			else
				cur = cur.right;
		}
		visNode.destroy();
		return [cur, prev];
	}
	/*
	searchVal(val, node=this.root, prev=null, visNode=null) {
		if (visNode == null) {
			visNode = new ValueNode(val);
		}
		visNode.compareNode(node);
		if (node == null) {
			visNode.destroy();
			return [null, null];
		}
		if (node.val == val) {
			node.highlight(GREEN, highlight_duration);
			node.unhighlight();
			visNode.destroy();
			return [node, prev];
		}
		node.highlight(BLUE);
		node.unhighlight();
		if (val < node.val)
			return this.searchVal(val, node.left, node, visNode);
		else
			return this.searchVal(val, node.right, node, visNode);
	}
	*/
	popVal(val) {
		var node_and_parent = this.searchVal(val);
		var node = node_and_parent[0];
		var prev = node_and_parent[1];
		if (node == null) {
			console.log("here?", val);
			this.showMessage(`value ${val} not found`);
			return null;
		}
		if (node.left == null) {
			if (node.right == null) {
				this.inPlaceOf(prev,node,null);
				node.throwaway();
				//this.updatePos();
				return node;
			}
			else {
				this.inPlaceOf(prev,node,node.right,false);
				node.throwaway();
				this.updatePos();
				return node;
			}
		}
		else {
			if (node.right == null) {
				this.inPlaceOf(prev,node,node.left,false);
				node.throwaway();
				this.updatePos();
				return node;
			}
			else {
				var leftchild = node.left;
				if (leftchild.right == null) {
					this.inPlaceOf(prev,node,leftchild);
				}
				else {
					var secondrightmost = leftchild;
					var rightmost = leftchild.right;
					while (rightmost.right != null) {
						secondrightmost = rightmost;
						rightmost = rightmost.right;
					}
					var rightmost_leftchild = rightmost.left;
					this.inPlaceOf(prev,node,rightmost);
					secondrightmost.right = rightmost_leftchild;
				}
				node.throwaway();
				this.updatePos();
				return node;
			}
		}
		updatePos();
	}
}
// end BST class defn
//=============================================================================
// Splay Tree
//=============================================================================
class SplayTree extends BST {
	constructor() {
		super();
	}
	splay(val) {
		if (this.root == null)
			return false;
		var p;
		while (val != this.root.val) {
			var v = this.root.val;
			if (val < v) {
				p = this.root.left;
				if (val == p.val) {
					this.rotateRootRight();
					return true;
				}
				// x = p.left = g.left.left
				else if (val < p.val) {
					if (p.left != null) {
						this.zigzigRight();
						continue;
					}
					else {
						return false;
					}
				}
				// x = p.right = g.left.right
				else {
					if (p.right != null) {
						this.zigzagRight();
						continue;
					}
					else {
						return false;
					}
				}
			}
			// val > this.root.val
			else {
				p = this.root.right;
				if (val == p.val) {
					this.rotateRootLeft();
					return true;
				}
				// x = p.right = g.right.right
				else if (val > p.val) {
					if (p.right != null) {
						this.zigzigLeft();
						continue;
					}
					else {
						return false;
					}
				}
				// x = p.left = g.right.left
				else {
					if (p.left != null) {
						this.zigzagLeft();
						continue;
					}
					else {
						return false;
					}
				}
			}
			this.updatePos();
		}
		this.updatePos();
	}
	zigzigRight() {
		var g = this.root;
		var p = g.left;
		var x = p.left;
		//TODO test if x,p,g not null
		p.left = x.right;
		x.right = p;
		g.left = p.right;
		p.right = g;
		this.root = x;
		this.updatePos();
	}
	zigzigLeft() {
		var g = this.root;
		var p = g.right;
		var x = p.right;
		//TODO test if x,p,g not null
		p.right = x.left;
		x.left = p;
		g.right = p.left;
		p.left = g;
		this.root = x;
		this.updatePos();
	}
	zigzagRight() {
		var g = this.root;
		var p = g.left;
		var x = p.right;
		console.log(g.val);
		console.log(p.val);
		console.log(x.val);
		p.right = x.left;
		x.left = p;
		g.left = x.right;
		x.right = g;
		this.root = x;
		this.updatePos();
	}
	zigzagLeft() {
		var g = this.root;
		var p = g.right;
		var x = p.left;
		p.left = x.right;
		x.right = p;
		g.right = x.left;
		x.left = g;
		this.root = x;
		this.updatePos();
	}
}
// end SplayTree class defn
//=============================================================================
// AVL Tree
//=============================================================================
class AVLTree extends BST {
	constructor() {
		super();
	}
	updatePosAVL() {
		this.updatePos();
		this.root.updateSidevalue();
	}
	insert(val) {
		// idea is simple, but has many cases to consider
		// first insert as usual like BST
		// then go along nodes from inserted node to root,
		// check if needs rebalancing and update height_diff
		// once a rebalancing by rotate/zigzag has been performed,
		// it is guaranteed that the rest of the tree is balanced
		//=============================
		// insert part:
		var newnode = new Node(val,0);
		if (this.isEmpty()) {
			this.setNodeAsRoot(newnode);
			return;
		}
		var node = this.root;
		var nodepath = [];
		while (true) {
			nodepath.push(node);
			var comp = newnode.compareNode(node);
			if (comp <= 0) {
				if (node.left == null) {
					newnode.setAsLeftChildOf(node, true);
					this.updatePosAVL();
					break;
				}
				else {
					node = node.left;
				}
			}
			else {
				if (node.right == null) {
					newnode.setAsRightChildOf(node, true);
					this.updatePosAVL();
					break;
				}
				else {
					node = node.right;
				}
			}
		}
		//=============================
		// some visualization
		for (var i = 0; i < nodepath.length; i++) {
			nodepath[i].highlight(BLUE);
			nodepath[i].unhighlight();
		}
		//=============================
		// the rebalancing part
		// newnode being this.root has been handled at beginning
		if (nodepath.length <= 1) {
			// newnode is child of root
			if (newnode == this.root.left)
				this.root.height_diff--;
			else
				this.root.height_diff++;
			this.updatePosAVL();
			return;
		}
		//console.log(nodepath.length);
		var x = newnode;
		var p = nodepath.pop();
		if (p.left != null && p.right != null) {
			// p doesn't change height; end here
			p.height_diff = 0;
			this.updatePosAVL();
			return;
		}
		// so p was leaf before x added
		if (p.left == x)
			p.height_diff = -1;
		else
			p.height_diff = 1;
		console.log(p.height_diff);
		var g = p;
		p = x;
		while (nodepath.length) {
			// x child of p child of g
			// x and p are guaranteed to be balanced
			// if g found to be balanced, update its height_diff
			// if g is unbalanced, then balance and done
			x = p;
			p = g;
			g = nodepath.pop();
			console.log("x,p,g: ", x.val, p.val, g.val);
			// p's height has increased; how will g respond?
			// bunch of if else cases
			// in comments, A,B,C,D are heights of subtrees under
			// x,p,g from left to right before addition of newnode
			if (p == g.left) {
				console.log(g.val);
				if (g.height_diff == 1) {
					// g absorbs height increase under p
					g.height_diff = 0;
					break;
				}
				else if (g.height_diff == 0) {
					// g's height increases from p, continue up the tree
					g.height_diff = -1;
				}
				else {
					// rotate/zigzag to absord height, end loop
					if (x == p.left) {
						console.log("x = p.left = g.left.left");
						p.height_diff = g.height_diff = 0;
						// rotate right at g, need parent of g
						var gg = null;
						if (g != this.root)
							gg = nodepath.pop();
						this.rotateNodeRight(g, gg);
						break;
					}
					else {
						console.log("x = p.right = g.left.right");
						var xIsLeaf = x.isLeaf();
						p.right = x.left;
						x.left = p;
						g.left = x.right;
						x.right = g;
						if (xIsLeaf) {
							// x is leaf => A,B,C,D are empty
							x.height_diff = p.height_diff = g.height_diff = 0;
						}
						else {
							// x not leaf
							// A = B+1 = C+1 = D
							if (x.height_diff == 1) {
								p.height_diff = -1;
								g.height_diff = 0;
							}
							else if (x.height_diff == -1) {
								p.height_diff = 0;
								g.height_diff = 1;
							}
							else {
								console.log("x.height_diff should not be 0!");
							}
							x.height_diff = 0;
						}
						if (g == this.root)
							this.root = x;
						else {
							var gg = nodepath.pop();
							if (g == gg.left)
								gg.left = x;
							else
								gg.right = x;
						}
						//if (p.left != null)
						//	console.log("BAD: p.left should be null");
						//if (g.right != null)
						//	console.log("BAD: g.right should be null");
						break;
					}
				}
			}
			else { // p = g.right
				console.log(g.val);
				if (g.height_diff == -1) {
					// g absorbs height increase under p
					g.height_diff = 0;
					break;
				}
				else if (g.height_diff == 0) {
					// g's height increases from p, continue up the tree
					g.height_diff = 1;
				}
				else {
					// rotate/zigzag to absord height, end loop
					if (x == p.right) {
						console.log("x = p.right = g.right.right");
						p.height_diff = g.height_diff = 0;
						// rotate right at g, need parent of g
						var gg = null;
						if (g != this.root)
							gg = nodepath.pop();
						this.rotateNodeLeft(g, gg);
						break;
					}
					else {
						console.log("x = p.left = g.right.left");
						var xIsLeaf = x.isLeaf();
						p.left= x.right;
						x.right = p;
						g.right = x.left;
						x.left = g;
						if (xIsLeaf) {
							// x is leaf => A,B,C,D are empty
							x.height_diff = p.height_diff = g.height_diff = 0;
						}
						else {
							// x not leaf
							// A = B+1 = C+1 = D
							if (x.height_diff == 1) {
								p.height_diff = 0;
								g.height_diff = -1;
							}
							else if (x.height_diff == -1) {
								p.height_diff = 1;
								g.height_diff = 0;
							}
							else {
								console.log("x.height_diff should not be 0!");
							}
							x.height_diff = 0;
						}
						if (g == this.root)
							this.root = x;
						else {
							var gg = nodepath.pop();
							if (g == gg.left)
								gg.left = x;
							else
								gg.right = x;
						}
						//if (p.left != null)
						//	console.log("BAD: p.left should be null");
						//if (g.right != null)
						//	console.log("BAD: g.right should be null");
						break;
					}
				}
			}
			this.updatePosAVL();
		}
		this.updatePosAVL();
	}
	
	popVal(val) {
		// similar to insert, delete as usual,
		// but go back up the tree and update height_diff or rebalance
		var node = this.root;
		var nodepath = [];
		// search for node
		while (true) {
			if (node == null) {
				this.showMessage(`value ${val} not found`);
				return;
			}
			nodepath.push(node);
			if (val == node.val) {
				node.highlight(GREEN);
				node.unhighlight();
				break;
			}
			node.highlight(BLUE);
			node.unhighlight();
			if (val < node.val) {
				node = node.left
			}
			else {
				node = node.right;
			}
		}
		if (node != nodepath.pop()) {
			console.log("BAD: current node should be the last node on nodepath");
			return;
		}
		// removing the node
		// note nodepath may have to include more nodes
		// before passing to the rebalancing stage,
		// the height_diff of nodes in nodepath should all be as before
		// except the last node is updated to the correct value
		var p = null;
		if (nodepath.length > 0)
			p = nodepath[nodepath.length-1];
		if (node.isLeaf()) {
			// handle trivial node==root case
			if (node == this.root) { // = == null
				this.root = null;
				node.throwaway();
				return;
			}
			if (node == p.left) {
				p.left = null;
				p.height_diff++;
			}
			else {
				p.right = null;
				p.height_diff--;
			}
			node.throwaway();
		}
		else if (node.left == null) {
			if (p == null) {
				this.root = node.right;
			}
			else if (node == p.right) {
				p.right = node.right;
				p.height_diff--;
			}
			else {
				p.left = node.right;
				p.height_diff++;
			}
			node.throwaway();
		}
		else if (node.right == null) {
			if (p == null) {
				this.root = node.left;
			}
			else if (node == p.right) {
				p.right = node.right;
				p.height_diff--;
			}
			else {
				p.left = node.left;
				p.height_diff++;
			}
			node.throwaway();
		}
		else {
			// find rightmost node of leftsubtree of node
			// extend nodepath
			nodepath.push(node);
			var node_ind = nodepath.length - 1; // node has to be swapped in later
			var n = node.left;
			var np = null;
			while (n.right != null) {
				nodepath.push(n);
				np = n;
				n = n.right;
			}
			for (var i = 0; i < nodepath.length; i++) {
				console.log("nodepath", nodepath[i].val);
				nodepath[i].highlight(YELLOW);
				nodepath[i].unhighlight();
			}
			console.log("n.val", n.val);
			// now n is rightmost node under n
			// nodepath is extended to np (if np is null, it's extended to just node)
			if (np == null) {
				// node.left has no right child
				n.right = node.right;
				n.height_diff = node.height_diff + 1; // n will replace node and will be last node of nodepath
			}
			else {
				np.right = n.left;
				np.height_diff--; //np will be the last node of nodepath
				n.left = node.left;
				n.right = node.right;
				n.height_diff = node.height_diff;
			}
			// update p child to n, but don't update p.height_diff,
			// as it's not the last node in nodepath
			if (node == this.root) // p==null
				this.root = n;
			else if (node == p.right)
				p.right = n;
			else
				p.left = n;
			nodepath[node_ind] = n;
			node.throwaway();
		}
		this.updatePosAVL();
		//for (var i = 0; i < nodepath.length; i++) {
			//nodepath[i].highlight(YELLOW);
			//nodepath[i].unhighlight();
		//}
		// rebalancing
		// if the last node in nodepath has height_diff is 0,
		//	it means the height of this node has decreased, go to parent
		// if height_diff is +1 or -1, norebalancing necessary
		// if height_diff is +2 or -2, perform rotate/zigzag, go to parent
		// (note for insert, after doing rotate/zigzag to rebalance,
		//	parent's height_diff unaffected as now the subtree is same height as before
		//	but for remove, subtree after rebalancing may reduce height by 1)
		while (nodepath.length > 0) {
			var curnode = nodepath.pop();
			var par = null;
			if (nodepath.length > 0)
				par = nodepath[nodepath.length-1];
			if (Math.abs(curnode.height_diff) == 1) {
				break;
			}
			else if (curnode.height_diff == 0) {
				if (par == null)
					break;
				else if (curnode == par.left)
					par.height_diff++;
				else
					par.height_diff--;
			}
			else {
				console.log("curnode.val:", curnode.val, curnode.height_diff);
				if (curnode.height_diff == 2) {
					var g = curnode;
					var p = g.right;
					var x = null;
					if (p.height_diff >= 0) {
						var height_dec = p.height_diff; // how this rotate affects height
						x = p.right;
						//rotate left at g
						g.right = p.left;
						g.height_diff = 1 - height_dec;
						p.left = g;
						p.height_diff = height_dec - 1;
						if (par == null) {
							this.root = p;
							break;
						}
						else if (curnode == par.left) {
							par.left = p;
							par.height_diff += height_dec;
						}
						else {
							par.right = p;
							par.height_diff -= height_dec;
						}
						if (height_dec == 0)
							break;
					}
					else {
						// p.height_diff < 0
						// do zigzag
						x = p.left;
						console.log("g,p,x:", g.val, p.val, x.val);
						g.right = x.left;
						p.left = x.right;
						x.left = g;
						x.right = p;
						g.height_diff = (x.height_diff <= 0) ? 0 : -1;
						p.height_diff = (x.height_diff >= 0) ? 0 : 1;
						x.height_diff = 0;
						if (par == null) {
							this.root = x;
							break;
						}
						else if (curnode == par.left) {
							par.left = x;
							par.height_diff++;
						}
						else {
							par.right = x;
							par.height_diff--;
						}
					}
				}
				else {
					// curnode.height_diff == -2
					var g = curnode;
					var p = g.left;
					var x = null;
					if (p.height_diff <= 0) {
						var height_dec = -p.height_diff; // how this rotate affects height
						x = p.left;
						//rotate right at g
						g.left = p.right;
						g.height_diff = height_dec - 1;
						p.right = g;
						p.height_diff = 1 - height_dec;
						if (par == null) {
							this.root = p;
							break;
						}
						else if (curnode == par.left) {
							par.left = p;
							par.height_diff += height_dec;
						}
						else {
							par.right = p;
							par.height_diff -= height_dec;
						}
						if (height_dec == 0)
							break;
					}
					else {
						// p.height_diff > 0
						// do zigzag
						x = p.right;
						console.log("g,p,x: ", g.val, p.val, x.val);
						g.left = x.right;
						p.right = x.left;
						x.right = g;
						x.left = p;
						g.height_diff = (x.height_diff >= 0) ? 0 : 1;
						p.height_diff = (x.height_diff <= 0) ? 0 : -1;
						x.height_diff = 0;
						if (par == null) {
							this.root = x;
							break;
						}
						else if (curnode == par.left) {
							par.left = x;
							par.height_diff++;
						}
						else {
							par.right = x;
							par.height_diff--;
						}
					}
				}
			}
			this.updatePosAVL();
		}
		this.updatePosAVL();
	}

	verify_height_diff(node = this.root) {
		if (node == null)
			return 0;
		var height_left = this.verify_height_diff(node.left);
		var height_right = this.verify_height_diff(node.right);
		var height = Math.max(height_left, height_right) + 1;
		if (node.height_diff != height_right - height_left) {
			console.log("Bad node, height_diff wrong: ", node);
			node.highlight(RED);
			node.unhighlight();
		}
		return height;
	}
	rotateRootLeftFromButton() {
		this.showMessage("AVL Tree cannot rotate manually");
	}
	rotateRootRightFromButton() {
		this.showMessage("AVL Tree cannot rotate manually");
	}
}

// TODO: add animation to operations that are not allowed,
// e.g. rotateLeft but rightchild=null
//
// TODO: add "action list" to show operations being performed
// (can replace previous idea about unallowed operations)

//=============================================================================
// testing out
function rand() {
	return Math.floor(Math.random() * 10);
}

//mytree = new AVLTree();
//ls = [16,15,15.5,14];//,13,12,11,10,9,8,7,6,5,4,3,2,1];
//for (var i = 0; i < ls.length; i++) {
//	mytree.insert(ls[i]);
//	mytimeline = newTimeline();
//}
//skipTo(anime_durationi * 90 - 100);
