/* Copyright (c) 2008 SitePen, Inc. All rights reserved. */

dojo.require("dojo.dnd.Source");
dojo.require("dijit.TitlePane");
dojo.require("dijit.form.Button");


// quick and dirty global catalog data
junkCatalogData = [
	{ name: "Wrist watch", image: "watch.jpg", description: "Tell time with Swiss precision", quantity: 3 },
	{ name: "Life jacket", image: "life-jacket.jpg", description: "Stay afloat during your frequent shipwrecks", quantity: 1 },
	{ name: "Toy bulldozer", image: "bulldozer.jpg", description: "Move the earth, one cup at a time", quantity: 8 },
	{ name: "Vintage microphone", image: "microphone.jpg", description: "Make 'em swoon in your blue suede shoes", quantity: 0 },
	{ name: "TIE fighter", image: "tie-fighter.jpg", description: "Rid your neighborhood of pesky Rebel Scum", quantity: 0 }
];

foodCatalogData = [
	{ name: "Apples", image: "apple.jpg", description: "Keep the doctor away on a daily basis", quantity: 10 },
	{ name: "Bananas", image: "bananas.jpg", description: "Bananas are an excellent source of potassium", quantity: 18 },
	{ name: "Tomatoes", image: "tomatoes.jpg", description: "Imported fresh daily from Dylan's front porch", quantity: 0 },
	{ name: "Bread", image: "bread.jpg", description: "Guaranteed to be either stale or fresh", quantity: 7 }
];


// create the DOM representation for the given item
function catalogNodeCreator(item, hint){
	// create a table/tr/td-based node structure; each item here needs an
	// image, a name, a brief description, and a quantity available
	var tr = document.createElement("tr");
	var imgTd = document.createElement("td");
	var nameTd = document.createElement("td");
	var qtyTd = document.createElement("td");

	var img = document.createElement("img");
	img.src = "images/" + (item.image || "_blank.gif");
	dojo.addClass(imgTd, "itemImg");
	dojo.addClass(imgTd, "dojoDndHandle");
	imgTd.appendChild(img);

	nameTd.appendChild(document.createTextNode(item.name || "Product"));
	if(item.description && hint != "avatar"){
		var descSpan = document.createElement("span");
		descSpan.innerHTML = item.description;
		nameTd.appendChild(document.createElement("br"));
		nameTd.appendChild(descSpan);
	}
	dojo.addClass(nameTd, "itemText");

	tr.appendChild(imgTd);
	tr.appendChild(nameTd);
	var node = tr;

	if(hint != "avatar"){
		qtyTd.innerHTML = item.quantity;
		dojo.addClass(qtyTd, "itemQty");
		tr.appendChild(qtyTd);
	}else{
		// put the avatar into a self-contained table
		var table = document.createElement("table");
		var tbody = document.createElement("tbody");
		tbody.appendChild(tr);
		table.appendChild(tbody);
		node = table;
	}

	var type = item.quantity ? ["inStock"] : ["outOfStock"];

	return {node: node, data: item, type: type};
}

// create a dojo.dnd.Source from the data provided
function buildCatalog(node, data){
	var dndObj = new dojo.dnd.Source(node, {copyOnly: true, creator: catalogNodeCreator});
	dndObj.insertNodes(false, data);
	dndObj.forInItems(function(item, id, map){
		dojo.addClass(id, item.type[0]);
	});
	return dndObj;
}

// function to create a function that toggles a property of the
// provided objects based on the state of the button provided
function makeToggler(btn, objs, prop){
	return function(){
		for (i=0; i<objs.length; i++) {
			objs[i][prop] = btn.checked;
		}
	}
}

// based on dojo.dnd.Source.checkAcceptance()
function checkAcceptanceWithoutSelfDrop(source, nodes) {
	if(this == source){ return false; }
	for(var i = 0; i < nodes.length; ++i){
		var type = source.getItem(nodes[i].id).type;
		// type instanceof Array
		var flag = false;
		for(var j = 0; j < type.length; ++j){
			if(type[j] in this.accept){
				flag = true;
				break;
			}
		}
		if(!flag){
			return false;
		}
	}
	return true;
}

function highlightTargets(){
	var props = {
			margin: { start: '0', end: '-5', unit: 'px' },
			borderWidth: { start: '0', end: '5', unit: 'px' }
	};
	var m = dojo.dnd.manager();
	var hasZero = false;
	dojo.forEach(m.nodes, function(node){
		// check the selected item(s) to look for a zero quantity
		// so we know whether we can highlight the cart
		if(m.source.getItem(node.id).data.quantity == 0){
			hasZero = true;
		}
	});
	dojo.style("wishlistPaneNode", "borderColor", "#97e68d");
	dojo.style("cartPaneNode", "borderColor", "#97e68d");
	dojo.anim("wishlistPaneNode", props, 250);
	if(!hasZero){
		dojo.anim("cartPaneNode", props, 250);
		dojo.byId("cartPaneNode").isHighlighted = true;
	}
}

function unhighlightTargets(dropTarget){
	var props = {
			margin: { start: '-5', end: '0', unit: 'px' },
			borderWidth: { start: '5', end: '0', unit: 'px' }
	};
	cpn = dojo.byId("cartPaneNode");
	var cartIsHighlighted = cpn.isHighlighted;
	cpn.isHighlighted = false;
	if(dropTarget && dropTarget.node && dropTarget.node.id){
		// dropTarget lets us know which node to highlight yellow
		switch(dropTarget.node.id){
			case "wishlistPaneNode":
				if(cartIsHighlighted){
					dojo.anim("cartPaneNode", props, 250);
				}
				dojo.style("wishlistPaneNode", "borderColor", "#ffff33");
				dojo.anim("wishlistPaneNode", props, 500, null, null, 750);
				break;
			case "cartPaneNode":
				dojo.anim("wishlistPaneNode", props, 250);
				dojo.style("cartPaneNode", "borderColor", "#ffff33");
				dojo.anim("cartPaneNode", props, 500, null, null, 750);
				break;
			default:
				dojo.anim("wishlistPaneNode", props, 250);
				if(cartIsHighlighted){
					dojo.anim("cartPaneNode", props, 250);
				}
		}
	}else{
		dojo.anim("wishlistPaneNode", props, 250);
		if(cartIsHighlighted){
			dojo.anim("cartPaneNode", props, 250);
		}
	}
}

function init(){
	// get rid of nodes marked with class="deleteMe"; they're here just
	// to satisfy validation, but not needed for the demo
	dojo.query(".deleteMe").orphan();

	var junkCatalog = buildCatalog("junkCatalogNode", junkCatalogData);
	var foodCatalog = buildCatalog("foodCatalogNode", foodCatalogData);

	var cartPane = new dijit.TitlePane({title: "Shopping Cart", open: false}, "cartPaneNode");
	var wishlistPane = new dijit.TitlePane({title: "Wishlist", open: false}, "wishlistPaneNode");

	var cart = new dojo.dnd.Target("cartPaneNode", {accept: ["inStock"]});
	cart.parent = dojo.query("#cartNode tbody")[0];
	var wishlist = new dojo.dnd.Target("wishlistPaneNode", {accept: ["inStock","outOfStock"]});
	wishlist.parent = dojo.query("#wishlistNode tbody")[0];

	var resetSelections = function(){
		cart.selectNone();
		wishlist.selectNone();
		junkCatalog.selectNone();
		foodCatalog.selectNone();
	};

	// highlight valid drop targets when a drag operation starts;
	dojo.subscribe("/dnd/start", null, highlightTargets);
	dojo.subscribe("/dnd/cancel", null, unhighlightTargets);

	dojo.subscribe("/dnd/drop", function(){
		resetSelections();
		unhighlightTargets(dojo.dnd.manager().target);

		// reset the manager's drop flag to false, since in our
		// case DnD operations always start on a container that
		// will not allow "self drops"
		dojo.dnd.manager().canDrop(false);
	});

	// calculate simple totals in the wishlist and cart titles
	var setupCartTitle = function(force){
		if(!force && dojo.dnd.manager().target !== this){
			return;
		}
		var title = "Shopping Cart";
		var cartLength = cart.getAllNodes().length;
		if(cartLength){
			var items = cartLength > 1 ? " items" : " item";
			title += " (" + cartLength + items + ")";
		}
		cartPane.setTitle(title);
	};
	var setupWishlistTitle = function(force){
		if(!force && dojo.dnd.manager().target !== this){
			return;
		}
		var title = "Wishlist";
		var wishlistLength = wishlist.getAllNodes().length;
		if(wishlistLength){
			var items = wishlistLength > 1 ? " items" : " item";
			title += " (" + wishlistLength + items + ")";
		}
		wishlistPane.setTitle(title);
	};
	dojo.connect(cart, "onDndDrop", setupCartTitle);
	dojo.connect(wishlist, "onDndDrop", setupWishlistTitle);

	// override the normal checkAcceptance so we don't duplicate
	// items when we do "self drops"
	junkCatalog.checkAcceptance = foodCatalog.checkAcceptance = checkAcceptanceWithoutSelfDrop;

	// clear selection state on the "other" catalog
	dojo.connect(junkCatalog, "onMouseDown", function(){ foodCatalog.selectNone(); });
	dojo.connect(foodCatalog, "onMouseDown", function(){ junkCatalog.selectNone(); });


	//
	// various buttons
	//

	// button to clear the cart and reset selections
	var clearCartButton = new dijit.form.Button({}, "clearCartNode");
	dojo.connect(clearCartButton, "onClick", function(e){
		cart.selectAll();
		cart.deleteSelectedNodes();
		resetSelections();
		setupCartTitle(true);
	});

	// button to clear the wishlist and reset selections
	var clearWishlistButton = new dijit.form.Button({}, "clearWishlistNode");
	dojo.connect(clearWishlistButton, "onClick", function(e){
		wishlist.selectAll();
		wishlist.deleteSelectedNodes();
		resetSelections();
		setupWishlistTitle(true);
	});

	var catalogs = [junkCatalog, foodCatalog];

	// button to toggle DnD on/off
	var enableDndButton = new dijit.form.ToggleButton({iconClass:"dijitCheckBoxIcon", checked: true}, "enableDndNode");
	dojo.connect(enableDndButton, "onClick", makeToggler(enableDndButton, catalogs, "isSource"));

	// button to switch handles-only mode on/off
	var enableDndHandlesButton = new dijit.form.ToggleButton({iconClass:"dijitCheckBoxIcon", checked: false}, "enableDndHandlesNode");
	dojo.connect(enableDndHandlesButton, "onClick", makeToggler(enableDndHandlesButton, catalogs, "withHandles"));
}
dojo.addOnLoad(init);
