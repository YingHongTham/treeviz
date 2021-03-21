Treeviz
=======

Visualizing binary trees without the hassle
--------

The goal of this project is to provide an easy way
to visualize the various operations in a binary tree
without having to deal with the positioning of nodes.
It should separate the manipulation of nodes/tree structure
from the positioning of nodes on the webpage.

Tree implements basic operations of a tree,
the main one being updatePos(),
which would typically be used after each operation
to move the nodes to their new positions.
The user is offered the flexibility to apply updatePos()
whenever they want, which allows the user to essentially
group movements of nodes together, for example
after rotating at the root by reassigning left/right children,
calling updatePos() moves the nodes so it looks like
entire subtrees move in unison (which they do but the movements
are really implemented on the node level).

The Node class should be used as expected;
e.g. it has left and right children (but no parent),
new Node(val) creates a new node, appearing on the left
of the screen, with value val.
There is also a height_diff attribute that is used for AVL Tree.

One may construct a simple tree as follows:

var x = 1, y = 2;

tree = new Tree();
tree.setNodeAsRoot(new Node(x));

var n = new Node(y);
comp = n.compareNode(tree.root);
if (comp <= 0)
	n.setAsLeftChildOf(tree.root);
else
	n.setAsRightChildOf(tree.root);
tree.updatePos();


Of course, the point is to learn to implement various binary search trees,
so the user should extend Tree().
(As a demo, I have implemented a simple binary search tree, and a AVL Tree.
Probably would implement red-black trees some day.)

nodetree.js implements two classes, Node and Tree.
Here are the main ways to interact with the objects:
For a node n = new Node(val);
- n.left, n.right are its children,
- n.val is the main value stored (currently only real numbers supported)
- n.height_diff = height of right subtree - height of left subtree
	(but it is only shown if n created with second variable, n = new Node(val,0);)
- n.compareNode(othernode) moves n near to othernode,
	and returns -1, 0, 1 depending on if n.val is less, equal, more than othernode.val
- n.highlight(color,duration) changes color for duration (in miliseconds)
	duration is optional, defaults to anime_duration
- n.setAsLeftChildOf(othernode) makes n the left child of othernode,
	n.setAsLeftChildOf(othernode,true) animates the movement of n to its new position
	(similar for setAsRightChildOf)
	TODO probably best to simply call updatePos after setting left/right child abstractly
- n.destroy() for cleaning up the HTML stuff
For a tree t = new Tree();
- t.root is the root node,
- t.updatePos() moves HTML nodes to new position,
	purely based on the abstract tree structure
- t.destroy() for recursively destroying nodes
some useful things:
- call finishAction_newTimeline() to force animation to end, then
	clears away all old animation;
	when the number of animations gets large, tends to slow down a lot..
- t.isEmpty() checks if tree is empty
- t.rotateNodeLeft(node, par) rotates subtree at node; par is parent of node
	(par is irrelevant if node = t.root)
- t.showMessage(message)
- TODO not done
