/* Copyright (c) 2008 SitePen, Inc. All rights reserved. */

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
