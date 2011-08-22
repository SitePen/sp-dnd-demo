define([ "dojo/string", "dojo/dom-construct", "dojo/dom-class", "dojo/dnd/Source", "dojo/text!./itemTemplate.html", "dojo/text!./avatarTemplate.html" ], function(stringUtil, domConstruct, domClass, Source, template, avatarTemplate){
	// create the DOM representation for the given item
	function catalogNodeCreator(item, hint){
		var node = domConstruct.toDom(stringUtil.substitute(hint === "avatar" ? avatarTemplate : template, {
			name: item.name || "Product",
			imageUrl: "images/" + (item.image || "_blank.gif"),
			quantity: item.quantity || 0,
			description: item.description ? "<br><span>" + item.description + "</span>" : ""
		})),

		type = item.quantity ? [ "inStock" ] : [ "outOfStock" ];

		return { node: node, data: item, type: type };
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