define([ "dojo/dom-class", "dojo/dnd/Source" ], function(domClass, Source){
	// create the DOM representation for the given item
	function catalogNodeCreator(item, hint){
		// create a table/tr/td-based node structure; each item here needs an
		// image, a name, a brief description, and a quantity available
		var tr = document.createElement("tr"),
			imgTd = document.createElement("td"),
			nameTd = document.createElement("td"),
			qtyTd = document.createElement("td"),
			img = document.createElement("img");
		
		img.src = "images/" + (item.image || "_blank.gif");
		domClass.add(imgTd, "itemImg dojoDndHandle");
		imgTd.appendChild(img);

		nameTd.appendChild(document.createTextNode(item.name || "Product"));
		if(item.description && hint != "avatar"){
			var descSpan = document.createElement("span");
			descSpan.innerHTML = item.description;
			nameTd.appendChild(document.createElement("br"));
			nameTd.appendChild(descSpan);
		}
		
		domClass.add(nameTd, "itemText");

		tr.appendChild(imgTd);
		tr.appendChild(nameTd);

		if(hint != "avatar"){
			qtyTd.innerHTML = item.quantity;
			domClass.add(qtyTd, "itemQty");
			tr.appendChild(qtyTd);
		}else{
			// put the avatar into a self-contained table
			var table = document.createElement("table"),
				tbody = document.createElement("tbody");
			tbody.appendChild(tr);
			table.appendChild(tbody);
			node = table;
		}

		var type = item.quantity ? [ "inStock" ] : [ "outOfStock" ];

		return { node: tr, data: item, type: type };
	}

	// create a dojo.dnd.Source from the data provided
	function buildCatalog(node, data){
		var dndObj = new Source(node, { copyOnly: true, creator: catalogNodeCreator });
		dndObj.insertNodes(false, data);
		dndObj.forInItems(function(item, id, map){
			domClass.add(id, item.type[0]);
		});
		
		return dndObj;
	}
	
	return {
		catalogNodeCreator: catalogNodeCreator,
		buildCatalog: buildCatalog
	};
});