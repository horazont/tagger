function TaggerTrackType()
{
  this.xul = {};
  this.xul.lookupKeyword = document.getElementById("lookup-keyword");
  this.xul.lookupIn = document.getElementById("lookup-in");
  this.xul.lookupServer = document.getElementById("lookup-server");
  this.xul.resultList = document.getElementById("lookup-results");
}

TaggerTrackType.prototype = {
  performQuery: function()
  {
    this.clearList();
    query = new TrackTypeQuery(this.xul.lookupIn.selectedItem.value, 
      this.xul.lookupKeyword.value, this.xul.lookupServer.value);
    while ((obj = query.fetchRow()) != false)
    {
      this.addItem(obj);
    }
  },
  
  addItem: function(obj)
  {
    var item = document.createElement("treeitem");
    var row = document.createElement("treerow");
    var cell = document.createElement("treecell");
    cell.setAttribute("label", obj.genre);
    row.appendChild(cell);
    cell = document.createElement("treecell");
    cell.setAttribute("label", obj.discid);
    row.appendChild(cell);
    cell = document.createElement("treecell");
    cell.setAttribute("label", obj.artist);
    row.appendChild(cell);
    cell = document.createElement("treecell");
    cell.setAttribute("label", obj.album);
    row.appendChild(cell);
    item.appendChild(row);
    var children = document.createElement("treechildren");
    item.appendChild(children);
    item.data = obj;
    this.xul.resultList.appendChild(item);
  },  
  
  clearList: function()
  {
    var node = this.xul.resultList.firstChild;
    while (node)
    {
      var nextNode = node.nextSibling;
      node.parentNode.removeChild(node);
      node = nextNode;
    }
  }
};

var TrackType = null;