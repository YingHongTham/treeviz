//==============================================================================
// Note to self: runs very slow when timeline gets very long
// current fix: upon each onclick action,
// set mytimeline to new timeline;
// see finishAction_newTimeline()
//==============================================================================
// dummy timeline, used to suppress the anime.js stuff for testing
//class dummytimeline {
//	constructor(a=null) {
//		this.currentTime = 0;
//	}
//	play() {}
//	seek(t=0) {}
//	pause() {}
//	add(a=null,b=null) {}
//}

//==============================================================================
// position class for convenience
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

//==============================================================================
// global variables that should be initialized before starting
// we give some default values
let level_diff = 80.0;
let start_pos = new Pos(30,50);
let	root_pos = new Pos(screen.width/2, 50);
let trash_pos = new Pos(30, 2*level_diff);
let compare_offset = new Pos(40, 0);
let outdiv = document.getElementById("outdiv");
let errorbox = null;
let node_radius = 20;
let horiz = screen.width * 1.0 / 3;
let anime_duration = 300;
let highlight_duration = 500;
const RED = 'rgb(255,0,0)';
const YELLOW = 'rgb(128,128,0)';
const GREEN = 'rgb(0,255,0)';
const BLUE = 'rgb(0,0,255)';
const WHITE = 'rgb(255,255,255)';


// set the div element that is to contain the tree
function set_outdiv(elem) {
	outdiv = elem;
	outdiv.style.position = "absolute";
}

// level_diff determines the difference in y-coord between levels of tree
function set_level_diff(val) {
	level_diff = val;
}

// sets position of node when it is initialized
function set_start_pos(x,y) {
	start_pos.x = x;
	start_pos.y = y;
}

// sets position of position of root node of tree
function set_root_pos(x,y) {
	root_pos.x = x;
	root_pos.y = y;
}

// sets position of deleted node
function set_trash_pos(x,y) {
	trash_pos.x = x;
	trash_pos.y = y;
}

// sets the amount of offset when comparing one node to another
// (see Node.compareNode(othernode))
function set_compare_offset(x,y) {
	compare_offset.x = x;
	compare_offset.y = y;
}

// sets HTML elem that will contain error messages
function set_errorbox(elem) {
	errorbox = elem;
}

// sets the radius of nodes
function set_node_radius(val) {
	node_radius = val;
}

// sets the difference in x-coord between the children of root
function set_horiz(val) {
	horiz = val;
}

// sets duration for each movement action, in miliseconds
function set_anime_duration(val) {
	anime_duration = val;
}

// sets duration of highlight, in miliseconds
function set_highlight_duration(val) {
	highlight_duration = val;
}


//==============================================================================
// anime.js uses timeline to keep track of animations to execute,
// mytimeline.add adds to queue, executes one after another
let mytimeline = newTimeline();
// creates and returns a timeline object with some default settings
function newTimeline() {
	return anime.timeline({
		easing: 'easeInOutExpo',
		duration: anime_duration
	});
}
// forward to end of animation then set to new timeline
function finishAction_newTimeline() {
	mytimeline.seek(mytimeline.duration);
	mytimeline = newTimeline();
}
// animation restarts if you just add an animation to timeline
// after the javascript is done executing;
// current stop gap solution is to pause the animation before adding,
// get the current time,
// only then add the animation, and finally skip to that time
// e.g.:
// var curtime = pauseCurtime();
// mytimeline.add({animation...});
// skipTo(curtime);
// used to keep curtime to avoid 
let curtime_tmp = 0;
function pauseCurtime() {
	mytimeline.pause();
	return mytimeline.currentTime;
}
function skipTo(newtime) {
	//mytimeline.pause();
	mytimeline.seek(newtime);
	mytimeline.play();
}
function resume() {
	mytimeline.seek(mytimeline.currentTime);
	mytimeline.play();
}
// wrapper for adding animation
// does the pausing and seeking stuff for you
function add_anim(anim) {
	mytimeline.pause();
	mytimeline.add(anim);
	resume();
}
// make animations simultaneous by introducing negative delay
function add_simul(anim_list) {
	if (anim_list.length == 0)
		return;
	mytimeline.pause();
	mytimeline.add(anim_list[0]);
	for (var i = 1; i < anim_list.length; i++) {
		mytimeline.add(anim_list[i], '-=' + anime_duration);
	}
	resume();
}


//==============================================================================
// methods typically split into operations updating the "abstract" node structures,
// i.e. the left, right child nodes, and the intended position of the node
// and operations that actually move the node to a new position
// of course some combine them; we try to make clear the distinction,
class Node {
	constructor(val, sideval=null) {
		this.val = val;
		this.left = null;
		this.right = null;
		this.height_diff = 0; // for AVLTrees
		this.extra = null; // for anything else
		// HTML stuff
		this.elem = document.createElement("div");
		this.elem.className = "divstyle";
		this.pos = start_pos.make_copy();
		this.elem.style =
			`z-index:2; position:absolute; left:${this.pos.x}px; top:${this.pos.y}px;`;
		this.elem.style.zIndex = "2";
		outdiv.append(this.elem);
		this.elem.appendChild(create_elemValue(val));
		if (sideval != null)
			this.elem.appendChild(create_elemSidevalue());
		this.elem.appendChild(create_leftline());
		this.elem.appendChild(create_rightline());
	}
	// garbage collection; gotta remove the HTML elem
	// note we use add_anim to remove,
	// otherwise it'll remove the HTML node far sooner than the rest of the animation
	// (e.g. animation of the searching process before deletion)
	destroy() {
		var el = this.elem;
		add_anim({
			targets: el,
			easing: 'easeOutCirc',
			duration:10,
			complete: function(anim) {
				el.remove();
			}
		});
	}

	// #moves
	moveSubtreeTo(pos) {
		this.updateSubtreePosAbstract(pos);
		var anim_list = this.getSubtreeAnimList(pos);
		add_simul(anim_list);
	}
	// #nomove
	// this should be called after the abstract tree has been updated,
	// returns a list of animations to be performed to reposition the HTML nodes
	getSubtreeAnimList(pos) {
		var node = this;
		var el = this.elem;
		var leftline = this.get_leftline();//el.querySelector(".class_leftline");//.childNodes[2];//this.leftline;
		var rightline = this.get_rightline();//this.rightline;
		var leftchild = this.left;
		var rightchild = this.right;
		var finalwidth = horiz / Math.pow(2, this.getlevel() + 1);
		var anim_list = [{
			targets: el,
			translateX: pos.x,
			translateY: pos.y,
			complete: function(anim) {
				node.updateZIndex();
			}
		}, {
			targets: leftline,
			width: finalwidth,
			translateX: -finalwidth,
			complete: function(anim) {
				if (leftchild == null)
					leftline.style.display = 'none';
				else
					leftline.style.display = 'inline';
			}
		}, {
			targets: rightline,
			width: finalwidth,
			complete: function(anim) {
				if (rightchild == null)
					rightline.style.display = 'none';
				else
					rightline.style.display = 'inline';
			}
		}];
		//this.pos = pos.make_copy();
		if (this.left != null)
			anim_list = anim_list.concat(this.left.getSubtreeAnimList(this.getLeftChildPos()));
		if (this.right != null)
			anim_list = anim_list.concat(this.right.getSubtreeAnimList(this.getRightChildPos()));
		return anim_list;
	}
	// #nomove but uses add_simul hmmmmm
	updateSidevalue() {
		var anim_list = this.getUpdateSidevalueAnimList();
		// maybe no need as duration=0
		add_simul(anim_list);
	}
	// #nomove
	getUpdateSidevalueAnimList() {
		var el = this.get_elemSidevalue();
		var height_diff = this.height_diff;
		var anim_list = [{
			targets: el,
			duration: 10,
			complete: function(anim) {
				el.innerHTML = height_diff;
			}
		}];
		if (this.left != null)
			anim_list = anim_list.concat(this.left.getUpdateSidevalueAnimList());
		if (this.right != null)
			anim_list = anim_list.concat(this.right.getUpdateSidevalueAnimList());
		return anim_list;
	}
	// #nomove
	updateSubtreePosAbstract(pos) {
		this.pos.update(pos);
		if (this.left != null)
			this.left.updateSubtreePosAbstract(this.getLeftChildPos());
		if (this.right != null)
			this.right.updateSubtreePosAbstract(this.getRightChildPos());
	}

	compareNode(othernode) {
		if (othernode == null) {
			console.log("othernode is null");
			return 2;
		}
		this.moveto(add(othernode.pos, compare_offset));
		console.log("compare ", this.val, othernode.val);
		console.log(othernode.pos.x, othernode.pos.y, this.pos.x, this.pos.y);
		if (this.val == othernode.val)
			return 0;
		if (this.val < othernode.val) {
			console.log("what? ", this.val, othernode.val);
			console.log("less");
			return -1;
		}
		console.log("more");
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
	// #moves
	moveToRoot() {
		//this.moveto(root_pos);
		//var cur_time = mytimeline.currentTime;
		this.moveSubtreeTo(root_pos);
		//skipTo(cur_time);
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
	isLeaf() {
		return this.left == null && this.right == null;
	}
	//=============================================================================
	// rotates subtree rooted at this
	// returns the new root of this subtree
	// rotateLeft and rotateRight do not update positions,
	// as parent of this has to reset its child node
	rotateLeft() {
		if (this.right == null) {
			console.log("cannot rotateLeft, rightnode is null");
			return;
		}
		var rightchild = this.right;
		this.right = rightchild.left;
		rightchild.left = this;
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
		return leftchild;
	}
	highlight(color, duration=anime_duration) {
		var el = this.get_elemValue();
		add_anim({
			targets: el,
			background: color,
			duration: duration
		});
	}
	unhighlight() {
		this.highlight(WHITE, 50);
	}
	throwaway() {
		var leftline = this.get_leftline();
		var rightline = this.get_rightline();
		var el = this.elem;
		leftline.remove();
		rightline.remove();
		this.moveto(trash_pos);
		add_anim({
			targets: el,
			complete: function(anim) {
				el.remove();
			}
		});
		//mytimeline.add({
		//add_anim({
		//	targets: leftline, rightline,
		//	complete: function(anim) {
		//		leftline.style.display = 'none';
		//		rightline.style.display = 'none';
		//		leftline.remove();
		//		rightline.remove();
		//	}
		//});
	}
	//=============================================================================
	//should be private but the #varname thing isn't working
	moveto(pos) {
		var finalwidth = horiz / Math.pow(2, this.getlevel() + 1);
		var el = this.elem;
		var leftline = this.get_leftline();
		var rightline = this.get_rightline();
		add_simul([ {
			targets: el,
			translateX: pos.x,
			translateY: pos.y
		}, {
			targets: rightline,
			width: finalwidth
		}, {
			targets: leftline,
			width: finalwidth,
			translateX: -finalwidth,
		}]);
	}
	updateZIndex() {
		this.elem.style.zIndex = `${this.getlevel()}`;
	}
	get_elemValue(el = this.elem) {
		return el.querySelector(".class_elemValue");
	}
	get_elemSidevalue(el = this.elem) {
		return el.querySelector(".class_elemSidevalue")
	}
	get_leftline(el = this.elem) {
		return el.querySelector(".class_leftline");
	}
	get_rightline(el = this.elem) {
		return el.querySelector(".class_rightline");
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
		this.elem.innerHTML = "= " + val + " ?";
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
	destroy(node=this.root) {
		if (node == null)
			return;
		node.destroy();
		this.destroy(node.left);
		this.destroy(node.right);
	}
	isEmpty() {
		return this.root == null;
	}
	setNodeAsRoot(node) {
		this.root = node;
		if (node != null)
			node.moveToRoot();
	}
	updatePos() {
		this.setNodeAsRoot(this.root);
	}
	rotateRootLeftFromButton() {
		// do this so other trees can inherit the rotate method
		// but can prevent users from manually rotating
		// hmm TODO this seems like bad practice...
		// shouldn't I leave this to the button.onclick function?,
		this.rotateRootLeft();
	}
	rotateRootRightFromButton() {
		// do this so other trees can inherit the rotate method
		// but can prevent users from manually rotating
		this.rotateRootRight();
	}
	rotateRootLeft() {
		if (this.root.right == null) {
			this.showMessage("cannot rotateRootLeft, rightnode is null");
			// although nothing changed, need to do this
			// otherwise the animations would refresh...
			this.updatePos();
			return;
		}
		this.setNodeAsRoot(this.root.rotateLeft());
	}
	rotateRootRight() {
		if (this.root.left == null) {
			this.showMessage("cannot rotateRootRight, leftnode is null");
			this.updatePos();
			return;
		}
		this.setNodeAsRoot(this.root.rotateRight());
	}
	rotateNodeLeft(node, par) {
		if (node == this.root) {
			this.rotateRootLeft();
			return;
		}
		if (node.right == null) {
			console.log("cannot rotateNodeLeft, node.right is null");
			this.updatePos();
			return;
		}
		var rightchild = node.right;
		node.right = rightchild.left;
		rightchild.left = node;
		if (node == par.left)
			par.left = rightchild;
		else if (node == par.right)
			par.right = rightchild;
		else
			console.log("BAD: node is not child of par!");
		this.updatePos();
		return;
	}
	rotateNodeRight(node, par) {
		if (node == this.root) {
			this.rotateRootRight();
			return;
		}
		if (node.left == null) {
			console.log("cannot rotateNodeLeft, node.left is null");
			this.updatePos();
			return;
		}
		var leftchild = node.left;
		node.left = leftchild.right;
		leftchild.right = node;
		if (node == par.left)
			par.left = leftchild;
		else if (node == par.right)
			par.right = leftchild;
		else
			console.log("BAD: node is not child of par!");
		this.updatePos();
		return;
	}
	// puts newnode in place of node as child of prev
	// (prev is null if node is root)
	// nodeonly=false takes the entire subtree at newnode to node
	// TODO i don't think I use this...
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
	// TODO change to the simple setTimeout (call a function to remove added elem)
	// (use some global count to keep track of number of error messages so far or something
	// so doesn't overlap with old messages)
	showMessage(message) {
		console.log(message);
		if (errorbox == null)
			return;
		//errorbox.innerHTML = message;
		//window.setTimeout("errorbox;", 3000);
		//return;
		var cur_time = mytimeline.currentTime;
		errorbox.innerHTML = message;
		add_anim({
			targets: outdiv,
			duration: 600,
			begin: function(anim) {
				//errorbox.innerHTML = message;
				outdiv.appendChild(errorbox);
			},
			complete: function(anim) {
				errorbox.innerHTML = "";
				errorbox.remove();
				//outdiv.removeChild(errorbox);
			}
		});
	}
}
// end Tree class defn

// creates HTML elem to show the value of Node
function create_elemValue(val) {
	var elemValue = document.createElement("div");
	elemValue.className = "treenode";
	elemValue.innerHTML = val;
	elemValue.className += " class_elemValue";
	elemValue.style =
		`z-index:2; position:absolute; left:-${node_radius}px; top:-${node_radius}px;`;
	return elemValue;
}
// creates HTML elem to show side value (e.g. for AVL, the height difference)
function create_elemSidevalue(sideval = null) {
	elemSidevalue = document.createElement("div");
	elemSidevalue.innerHTML = (sideval == null) ? "" : sideval;
	elemSidevalue.style = `position:absolute; top:${node_radius+10}px`;
	elemSidevalue.className = "class_elemSidevalue";
	return elemSidevalue;
}
// creates HTML elem for the line segment to left child
// currently sort of cheating by using an image of a diagonal line
// width should shrink by half each time go down level
// initialized to be not displayed, only display when there is child
function create_leftline() {
	var leftline = document.createElement("img");
	leftline.className = "class_leftline";
	leftline.src = "leftdiagonal.png";
	leftline.style =
		`z-index:-1; position:absolute; left:0px; top:0px; width:${horiz/2}px; height:${level_diff}px`;
	leftline.style.display = 'none';
	return leftline;
}
// similar to above but for right
function create_rightline() {
	var rightline = document.createElement("img");
	rightline.className = "class_rightline";
	rightline.src = "rightdiagonal.png";
	rightline.style =
		`z-index:-1; position:absolute; left:0px; top:0px; width:${horiz/2}px; height:${level_diff}px`;
	rightline.style.display = 'none';
	return rightline;
}
