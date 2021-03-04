//==============================================================================
// some useful stuff
class Pos {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	copy() {
		return new Pos(this.x, this.y);
	}
	update(a) {
		this.x = a.x;
		this.y = a.y;
	}
}

// add Pos's
function add(a,b) {
	return new Pos(a.x + b.x, a.y + b.y);
}

//==============================================================================
// initialize
var start_pos = new Pos(0,0);
var root_pos = new Pos(screen.width/2, 0);
var compare_offset = new Pos(0, 50);
let level_diff = 80.0;
let horiz = screen.width * 1.0 / 2;
let anime_duration = 300;

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
class Node {
	constructor(val) {
		this.val = val;
		this.left = null;
		this.right = null;
		let p = document.getElementById("outdiv");
		this.elem = document.createElement("div");
		this.elem.className = "treenode";
		this.elem.innerHTML = val;
		this.pos = start_pos.copy();
		//start_pos.y += 50;
		this.elem.style =
			`position:absolute; left:${this.pos.x}px; top:${this.pos.y}px;`;
		p.append(this.elem);
	}

	moveto(pos) {
		mytimeline.add({
			targets: this.elem,
			translateX: pos.x,
			translateY: pos.y
		});
		this.pos.update(pos);
	}

	moveSubtreeTo(pos) {
		this.updateSubtreePos(pos);
		var anim_list = this.getSubtreeAnimList(pos);
		add_simultaneous(anim_list);
	}
	getSubtreeAnimList(pos) {
		var anim_list = [{
			targets: this.elem,
			translateX: pos.x,
			translateY: pos.y
		}];
		//this.pos = pos;
		if (this.left != null)
			anim_list = anim_list.concat(this.left.getSubtreeAnimList(this.getLeftChildPos()));
		if (this.right != null)
			anim_list = anim_list.concat(this.right.getSubtreeAnimList(this.getRightChildPos()));
		return anim_list;
	}
	updateSubtreePos(pos) {
		this.pos = pos;
		if (this.left != null)
			this.left.updateSubtreePos(this.getLeftChildPos());
		if (this.right != null)
			this.right.updateSubtreePos(this.getRightChildPos());
	}


	moveby(shift) {
		console.log("moveby: ", shift.x, shift.y);
		this.moveto(add(this.pos, shift));
	}

	compare_leq(othernode) {
		this.moveto(add(othernode.pos, compare_offset));
		if (this.val <= othernode.val)
			return true;
		return false;
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
	setLeftChild(newnode) {
		this.left = newnode;
		newnode.moveto(this.getLeftChildPos());
	}
	setRightChild(newnode) {
		this.right = newnode;
		newnode.moveto(this.getRightChildPos());
	}
}


//=============================================================================
// Binary Search Tree
class BST {
	constructor() {
		this.root = null;
	}
	insert(val, rt = this.root){
		var newnode = new Node(val);
		if (this.root == null) {
			this.root = newnode;
			newnode.placeAtRoot();
			return;
		}
		this.insert_attempt(newnode, rt);
	}
	insert_attempt(newnode, cur) {
		if (newnode.compare_leq(cur)) {
			if (cur.left == null)
				cur.setLeftChild(newnode);
			else
				this.insert_attempt(newnode,cur.left);
		}
		else {
			if (cur.right == null)
				cur.setRightChild(newnode);
			else
				this.insert_attempt(newnode,cur.right);
		}

	}
}

//TODO make clear which methods are to be made public
// since the whole point of this is to be able to use
// this as a library to code these trees
// but with visualization for the steps
// for example, Node.moveto should not be made public,
// and generally things to do with pos shouldn't be
// public things: compare_leq, getlevel, setLeftChild etc

//=============================================================================
// testing out
bst = new BST();
bst.insert(1);
bst.insert(0);
bst.insert(2);
bst.insert(4);
bst.insert(0);
bst.insert(3);
bst.insert(1);

bst.root.moveSubtreeTo(bst.root.getLeftChildPos());
bst.root.moveSubtreeTo(bst.root.getRightChildPos());
bst.root.moveSubtreeTo(root_pos);
