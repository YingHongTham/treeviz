//==============================================================================
// Note to self: runs very slow when timeline gets very long
// current fix: upon each onclick action,
// set mytimeline to new timeline;
// it seems to work so far, and speeds things up,
// and also it shows actions simultaneously if click, say insert, too fast
//==============================================================================
// dummy timeline
// used to suppress the anime.js stuff for testing
// AVLTree runs very slowly,
// but after using dummy instead of anime.timeline,
// it's not slow...
class dummy {
	constructor(a=null) {
		this.currentTime = 0;
	}
	play() {}
	seek(t=0) {}
	pause() {}
	add(a=null,b=null) {}
}

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
// global variables that need to be initialized before starting
let level_diff = 80.0;
let start_pos = new Pos(30,50);
let	root_pos = new Pos(screen.width/2, 50);
let trash_pos = new Pos(30, 2*level_diff);
let compare_offset = new Pos(40, 0);
let outdiv = document.getElementById("outdiv");
//let errorbox = document.createElement("div");
//errorbox.style = `position:absolute; left:${screen.width * 1.0 / 4}px; top:${root_pos.y + 20}px;
//	width:${screen.width * 1.0 / 8}px`;
//	TODO put this in CSS?
let errorbox_style = `position:absolute; left:${screen.width * 1.0 / 4}px; top:${root_pos.y + 20}px;
	width:${screen.width * 1.0 / 8}px`;
//outdiv.appendChild(errorbox);
let node_radius = 20;
let horiz = screen.width * 1.0 / 3;
let anime_duration = 300;
let highlight_duration = 500;
const RED = 'rgb(255,0,0)';
const YELLOW = 'rgb(128,128,0)';
const GREEN = 'rgb(0,255,0)';
const BLUE = 'rgb(0,0,255)';
const WHITE = 'rgb(255,255,255)';
var mytree = null;


// set the div element that is to contain the tree
function set_outdiv(elem) {
	outdiv = elem;
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
