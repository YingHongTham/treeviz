//==============================================================================
// some useful stuff
class Pos {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	make_copy() {
		return new Pos(this.x, this.y);
	}
	update(a) {
		this.x = a.x;
		this.y = a.y;
	}
	add(a) {
		this.x += a.x;
		this.y += a.y;
	}
}

// add Pos's
function add(a,b) {
	return new Pos(a.x + b.x, a.y + b.y);
}
globalvar = 0

//==============================================================================
// initialize
var start_pos = new Pos(0,0);
var root_pos = new Pos(screen.width/2, 0);
var compare_offset = new Pos(0, 50);
let level_diff = 80.0;
let horiz = screen.width * 1.0 / 3;
let anime_duration = 300;
let RED = 'rgb(255,0,0)';
let GREEN = 'rgb(0,255,0)';
let BLUE = 'rgb(0,0,255)';
let WHITE = 'rgb(255,255,255)';

// buttons
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
// for some reaons, need to seek current time
// and manually resume to that time
button_rotate_left.onclick = function() {
	//var cur_time = mytimeline.currentTime;
	bst.rotateRootLeft();
	//mytimeline.pause();
	//mytimeline.seek(cur_time);
	//mytimeline.play();
};
button_rotate_right.onclick = function() {
	bst.rotateRootRight();
};
button_insert.onclick = function() {
	var x = document.getElementById("insert_value");
	bst.insert(x.value);
};
button_search.onclick = function() {
	var x = document.getElementById("search_value");
	var cur_time = mytimeline.currentTime;
	bst.searchVal(x.value);
	mytimeline.pause();
	mytimeline.seek(cur_time);
	mytimeline.play();
}
button_delete.onclick = function() {
	var x = document.getElementById("delete_value");
	var cur_time = mytimeline.currentTime;
	bst.popVal(x.value);
	mytimeline.pause();
	mytimeline.seek(cur_time);
	mytimeline.play();
}

//==============================================================================
// keeps track of animations to execute,
// mytimeline.add adds to queue, executes one after another
var mytimeline = anime.timeline({
	// these settings apply to all animations added to mytimeline
	easing: 'easeInOutExpo',
	duration: anime_duration
});

//==============================================================================
// make animations simultaneous by introducing negative delay
function add_simultaneous(anim_list) {
	if (anim_list.length == 0)
		return;
	mytimeline.add(anim_list[0]);
	for (var i = 1; i < anim_list.length; i++) {
		mytimeline.add(anim_list[i], '-=' + anime_duration);
	}
}

//==============================================================================
// methods typically split into operations updating the "abstract" node structures,
// i.e. the left, right node, and the intended position of the node
// and operations that actually move the node to a new position
// of course some combine them; we try to make clear the distinction,
// so 
class Node {
	constructor(val) {
		this.val = val;
		this.left = null;
		this.right = null;
		this.height_diff = 0; // for AVLTrees
		let p = document.getElementById("outdiv");
		this.elem = document.createElement("div");
		this.elem.className = "treenode";
		this.elem.innerHTML = val;
		this.pos = start_pos.make_copy();
		//start_pos.y += 50;
		this.elem.style =
			`position:absolute; left:${this.pos.x}px; top:${this.pos.y}px;`;
		p.append(this.elem);
	}
	destroy() {
		var el = this.elem;
		var cur_time = mytimeline.currentTime;
		mytimeline.add({
			targets: this.elem,
			easing: 'easeOutCirc',
			complete: function(anim) {
				el.remove();
			}
		});
		mytimeline.pause();
		mytimeline.seek(cur_time);
		mytimeline.play();
	}

	moveSubtreeTo(pos) {
		this.updateSubtreePosAbstract(pos);
		var anim_list = this.getSubtreeAnimList(pos);
		add_simultaneous(anim_list);
	}
	getSubtreeAnimList(pos) {
		var anim_list = [{
			targets: this.elem,
			translateX: pos.x,
			translateY: pos.y
		}];
		//this.pos = pos.make_copy();
		if (this.left != null)
			anim_list = anim_list.concat(this.left.getSubtreeAnimList(this.getLeftChildPos()));
		if (this.right != null)
			anim_list = anim_list.concat(this.right.getSubtreeAnimList(this.getRightChildPos()));
		return anim_list;
	}
	updateSubtreePosAbstract(pos) {
		this.pos.update(pos);
		if (this.left != null)
			this.left.updateSubtreePosAbstract(this.getLeftChildPos());
		if (this.right != null)
			this.right.updateSubtreePosAbstract(this.getRightChildPos());
	}
	updateSubtreeMove() {
		this.moveSubtreeTo(this.pos);
	}


	moveby(shift) {
		this.moveto(add(this.pos, shift));
	}

	compareNode(othernode) {
		if (othernode == null) {
			console.log("othernode is null");
			return 2;
		}
		this.moveto(add(othernode.pos, compare_offset));
		if (this.val == othernode.val)
			return 0;
		if (this.val < othernode.val)
			return -1;
		return 1;
	}

	getlevel() {
		return Math.round((this.pos.y - root_pos.y)/level_diff);
	}
	getLeftChildPos() {
		return new Pos(this.pos.x - horiz / Math.pow(2, this.getlevel() + 1),
									 this.pos.y + level_diff);
	}
	getRightChildPos() {
		return new Pos(this.pos.x + horiz / Math.pow(2, this.getlevel() + 1),
									 this.pos.y + level_diff);
	}
	placeAtRoot() {
		this.moveto(root_pos);
	}

	setAsLeftChildOf(p, move=false) {
		p.left = this;
		if (move)
			this.moveto(p.getLeftChildPos());
	}
	setAsRightChildOf(p, move=false) {
		p.right = this;
		if (move)
			this.moveto(p.getRightChildPos());
	}
	setLeftSubtree(subtree_root) {
		this.left = subtree_root;
		if (subtree_root != null)
			subtree_root.moveSubtreeTo(this.getLeftChildPos());
	}
	setRightSubtree(subtree_root) {
		this.right = subtree_root;
		if (subtree_root != null)
			subtree_root.moveSubtreeTo(this.getRightChildPos());
	}
	setAsRoot() {
		//this.moveto(root_pos);
		var cur_time = mytimeline.currentTime;
		this.moveSubtreeTo(root_pos);
		mytimeline.pause();
		mytimeline.seek(cur_time);
		mytimeline.play();
	}
	popLeftChild() {
		var n = this.left;
		this.left = null;
		return n;
	}
	popRightChild() {
		var n = this.left;
		this.left = null;
		return n;
	}
	//=============================================================================
	//implement in tree?
	rotateLeft() {
		if (this.right == null) {
			console.log("cannot rotateLeft, rightnode is null");
			return;
		}
		var rightchild = this.right;
		this.right = rightchild.left;
		rightchild.left = this;
		//rightchild.updateSubtreeMove();
		return rightchild;
	}
	rotateRight() {
		if (this.left == null) {
			console.log("cannot rotateRight, leftnode is null");
			return;
		}
		var leftchild = this.left;
		this.left = leftchild.right;
		leftchild.right = this;
		//leftchild.updateSubtreeMove();
		return leftchild;
	}
	highlight(color, duration=anime_duration) {
		var cur_time = mytimeline.currentTime;
		mytimeline.add({
			targets: this.elem,
			background: color,
			duration: duration
		});
		mytimeline.pause();
		mytimeline.seek(cur_time);
		mytimeline.play();
	}
	unhighlight() {
		this.highlight(WHITE, 50);
	}
	throwaway() {
		this.moveto(new Pos(0, 2*level_diff));
	}
	//=============================================================================
	//should be private but the #varname thing isn't working
	moveto(pos) {
		var cur_time = mytimeline.currentTime;
		mytimeline.add({
			targets: this.elem,
			translateX: pos.x,
			translateY: pos.y
		});
		mytimeline.pause();
		mytimeline.seek(cur_time);
		mytimeline.play();
		this.pos.update(pos);
	}
	// avoid using these as they call methods
	// that should be private
	//setLeftChild(newnode) {
	//	this.left = newnode;
	//	newnode.moveto(this.getLeftChildPos());
	//}
	//setRightChild(newnode) {
	//	this.right = newnode;
	//	newnode.moveto(this.getRightChildPos());
	//}
}
//end Node class defn
//=============================================================================
// ValueNode
// TODO: used for search? helpful for visualizing
//=============================================================================
class ValueNode extends Node {
	constructor(val) {
		super(val);
		this.elem.className = "";
	}
}
//end Node class defn
//=============================================================================
// Tree
//=============================================================================
class Tree {
	constructor() {
		this.root = null;
	}
	isEmpty() {
		return this.root == null;
	}
	setNodeAsRoot(node) {
		this.root = node;
		if (node != null)
			node.setAsRoot();
	}
	updatePos() {
		this.root.setAsRoot();
	}
	rotateRootLeft() {
		if (this.root.right == null) {
			console.log("cannot rotateRootLeft, rightnode is null");
			// although nothing changed, need to do this
			// otherwise the animations would refresh...
			this.updatePos();
			return;
		}
		this.setNodeAsRoot(this.root.rotateLeft());
	}
	rotateRootRight() {
		if (this.root.left == null) {
			console.log("cannot rotateRootRight, leftnode is null");
			this.updatePos();
			return;
		}
		this.setNodeAsRoot(this.root.rotateRight());
	}
	// puts newnode in place of node as child of prev
	// (prev is null if node is root)
	// nodeonly=false takes the entire subtree at newnode to node
	inPlaceOf(prev, node, newnode, nodeonly=true) {
		if (prev == null) {
			this.root = newnode;
		}
		else if (prev.left == node)
			prev.left = newnode;
		else
			prev.right = newnode;
		if (nodeonly) {
			if (newnode != null) {
				if (newnode != node.left)
					newnode.left = node.left;
				if (newnode != node.right)
					newnode.right = node.right;
			}
		}
	}
}
// end Tree class defn
//=============================================================================
// Binary Search Tree
//=============================================================================
class BST extends Tree {
	constructor() {
		super();
	}
	insert(val, rt = this.root){
		var newnode = new Node(val);
		if (this.isEmpty()) {
			//this.root = newnode;
			//newnode.placeAtRoot();
			this.setNodeAsRoot(newnode);
			return;
		}
		this.insert_attempt(newnode, rt);
	}
	insert_attempt(newnode, cur) {
		var comp = newnode.compareNode(cur);
		if (comp <= 0) {
			if (cur.left == null) {
				//cur.setLeftChild(newnode);
				newnode.setAsLeftChildOf(cur, true);
				this.updatePos();
			}
			else
				this.insert_attempt(newnode,cur.left);
		}
		else {
			if (cur.right == null) {
				newnode.setAsRightChildOf(cur, true);
				this.updatePos();
			}
			else
				this.insert_attempt(newnode,cur.right);
		}

	}
	// returns [node, parent]
	// parent is null if node==root
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
			node.highlight(GREEN, 500);
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
	popVal(val) {
		var node_and_parent = this.searchVal(val);
		var node = node_and_parent[0];
		var prev = node_and_parent[1];
		if (node == null) {
			console.log("can't pop; value ", val, " not found");
			return null;
		}
		if (prev == null) {
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
	insertBalance(val) {
		var newnode = new Node(val);
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
					this.updatePos();
					break;
				}
				else {
					node = node.left;
				}
			}
			else {
				if (node.right == null) {
					newnode.setAsRightChildOf(node, true);
					this.updatePos();
					break;
				}
				else {
					node = node.right;
				}
			}
		}
		// the rebalancing part
		if (nodepath.length <= 2)
			return;
		var x = newnode;
		var p = nodepath.pop();
		var g = nodepath.pop();
		/*
		while (true) {
			if 
			
			if (nodepath.isEmpty())
				break;
			x = p;
			p = g;
			g = nodepath.pop();
		}
		*/

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

ls = [8,4,12,2,3,5,7,0,1,9,6];
bst = new AVLTree();
for (var i = 0; i < ls.length; i++) {
	//ls[i] = rand();
	bst.insertBalance(ls[i]);
}
mytimeline.pause();
mytimeline.seek(anime_duration * 36 - 100);
mytimeline.play();
