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
(Here I have implemented a simple binary search tree, and a AVL Tree.
Probably would implement red-black trees some day.)

TODO: my code is still a mess! Make it more library-like.
