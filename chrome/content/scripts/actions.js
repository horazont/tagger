/*******************************************************************************
*** Tagger Songbird addon
********************************************************************************
The contents of this file are subject to the Mozilla Public License
Version 1.1 (the "License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at
<http://www.mozilla.org/MPL/>

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
License for the specific language governing rights and limitations
under the License.

Alternatively, the contents of this file may be used under the terms
of the GNU General Public license (the  "GPL License"), in which case the
provisions of GPL License are applicable instead of those
above.


For feedback and questions about the Tagger Songbird addon please mail me,
Jonas Wielicki:
<j.wielicki@sotecware.net>
- or -
Leave a comment at:
<http://addons.songbirdnest.com/addons/1554>
*******************************************************************************/
function TaggerActionController(window)
{
  this.xul = {};
  this.xul.treepopup = {};
  this.xul.treepopup._ = document.getElementById("treepopup");
  this.xul.treepopup.new = {};
  this.xul.treepopup.new._ = document.getElementById("treepopup-new-submenu");
  this.xul.treepopup.new._item = document.getElementById("treepopup-new");
  this.xul.treepopup.new.cats = {};
  this.xul.treepopup.new.cats._ = new Array(
    document.getElementById("treepopup-new-general-submenu"),
    document.getElementById("treepopup-new-peritem-submenu"),
    document.getElementById("treepopup-new-selection-submenu")
  );
  this.xul.treepopup.new.cats._item = new Array(
    document.getElementById("treepopup-new-general"),
    document.getElementById("treepopup-new-peritem"),
    document.getElementById("treepopup-new-selection")
  );
  this.xul.treepopup.newcond = {};
  this.xul.treepopup.newcond._ = document.getElementById("treepopup-newcond-submenu");
  this.xul.treepopup.newcond._item = document.getElementById("treepopup-newcond");
  this.xul.treepopup.cut = document.getElementById("treepopup-cut");
  this.xul.treepopup.copy = document.getElementById("treepopup-copy");
  this.xul.treepopup.paste = document.getElementById("treepopup-paste");
  this.xul.treepopup.edit = document.getElementById("treepopup-edit");
  this.xul.treepopup.delete = document.getElementById("treepopup-delete");
  this.xul.treepopup.separator = {};
  this.xul.treepopup.separator.ccp = document.getElementById("treepopup-separator-ccp");
  this.xul.treepopup.separator.delete = document.getElementById("treepopup-separator-delete");
  this.xul.tree = document.getElementById("tree");
  this.xul.treeRoot = document.getElementById("tree-root");
  this.xul.progressBar = document.getElementById("progress-bar");
  this.xul.toolBar = document.getElementById("tool-bar");
  this.xul.sideToolBar = document.getElementById("side-tool-bar");
  this.xul.metaSection = document.getElementById("meta-section");
  this.xul.metaButton = document.getElementById("meta-button");
  this.xul.description = document.getElementById("meta-description");
  this.working = false;
  
  this.buildNewMenu();
  
  var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                       .getInterface(Components.interfaces.nsIWebNavigation)
                       .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                       .rootTreeItem
                       .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                       .getInterface(Components.interfaces.nsIDOMWindow);
  this.mainWindow = mainWindow;
  this.gBrowser = this.mainWindow.gBrowser;
  
  
  this.notifier = getNotifier(this.mainWindow);
  this.macroList = getMacroList(this.mainWindow);
  
  //document.getElementById("tagger-actions").value = this;
  document.getElementById("tagger-actions").setUserData("controller", this, null);
  
  /*var me = this;
  this.macroListChange = function()
  {
    me.macroListUpdate();
  }
  this.notifier.addHandler("onMacroListChange", this.macroListChange);*/

}

TaggerActionController.prototype = 
{ 
  actions: new Array(),
  
  unload: function()
  {
    //var notifier = getNotifier(this.mainWindow);
    //notifier.removeHandler("onMacroListChange", this.macroListChange);
  },
  
  macroListUpdate: function()
  {
    alert("macro list update");
  },
  
  tmp: function()
  {
    window.openDialog("chrome://tagger/content/macrodlg.xul", "", "modal=yes", this.mainWindow, "-askoverwrite,-allownew");
  },

  buildNewMenu: function()
  {
    var cats = this.xul.treepopup.new.cats._;
    var menupopup = this.xul.treepopup.new._;
    
    for (var i=0;i<ActionRegistry.length;i++)
    {
      var item = document.createElement("menuitem");
      var action = ActionRegistry[i];
      item.setAttribute("label", i18n(action.displayName));
      item.cc = action.cc;
      item.setAttribute("oncommand", "TaggerActions.dynamicActionConstructor(this);");
      if ((action.section >= 0) && (action.section < cats.length))
        cats[action.section].appendChild(item);
      else
        menupopup.appendChild(item);
    }
    
    menupopup = this.xul.treepopup.newcond._;
    
    for (var i=0;i<ConditionRegistry.length;i++)
    {
      var item = document.createElement("menuitem");
      item.setAttribute("label", i18n(ConditionRegistry[i].displayName));
      item.cc = ConditionRegistry[i].cc;
      item.setAttribute("oncommand", "TaggerActions.dynamicConditionConstructor(this);");
      menupopup.appendChild(item);
    }
    
    this.newMacro();
  },
  
  dynamicActionConstructor: function(menuitem)
  {
    var target = this.xul.treeRoot;
    if (this.xul.treepopup.new._item.item)
    {
      target = this.xul.treepopup.new._item.item.firstChild.nextSibling;
      target.parentNode.setAttribute("open", "true");
    }
    var treeitem = this.dynamicConstructor(menuitem, target);
    if (target == this.xul.treeRoot)
    {
      this.actions.push(treeitem.action);
    }
    else
    {
      var treeNode = this.xul.treepopup.new._item.item;
      treeNode.prop.value.push(treeitem.action);
    }
  },
  
  dynamicConditionConstructor: function(menuitem)
  {
    var target = null;
    if (this.xul.treepopup.newcond._item.item)
    {
      target = this.xul.treepopup.newcond._item.item.firstChild.nextSibling;
      target.parentNode.setAttribute("open", "true");
    }
    if (target == null)
      return;
    var treeitem = this.dynamicConstructor(menuitem, target);
    var treeNode = this.xul.treepopup.newcond._item.item;
    treeNode.prop.value.push(treeitem.action);
  },
  
  dynamicConstructor: function(menuitem, target)
  {
    var action = new menuitem.cc();
    var treeItem = this.actionToTreeItem(action);
    target.appendChild(treeItem);
    return treeItem;
  },
  
  treePopup_Setup: function(allowNew, allowAddCondition, allowEdit, allowDelete, selectedItem, idx)
  {
    this.xul.treepopup.new._item.hidden = !allowNew;
    this.xul.treepopup.new._item.item = false;
    this.xul.treepopup.newcond._item.hidden = !allowAddCondition;
    this.xul.treepopup.newcond._item.item = false;
    this.xul.treepopup.edit.hidden = !allowEdit;
    this.xul.treepopup.delete.hidden = !allowDelete;
    this.xul.treepopup.cut.hidden = true;
    this.xul.treepopup.copy.hidden = true;
    this.xul.treepopup.paste.hidden = true;
    this.xul.treepopup.separator.delete.hidden = true;
    this.xul.treepopup.separator.ccp.hidden = true;
    
    if ((selectedItem) && (selectedItem != null))
    {
      this.xul.treepopup.cut.hidden = (selectedItem.kind == "property");
      this.xul.treepopup.copy.hidden = this.xul.treepopup.cut.hidden;
      this.xul.treepopup.cut.item = selectedItem;
      this.xul.treepopup.copy.item = selectedItem;
      if (selectedItem.kind == "property")
      {
        // Property item.
        if (allowNew)
        {
          if (selectedItem.prop.propType == TA_PROPTYPE_ACTIONLIST)
          {
            this.xul.treepopup.new._item.item = selectedItem;
          }
          else
          {
            var parent = selectedItem.parentNode.parentNode;
            while (parent.kind == "condition")
            {
              parent = parent.parentNode.parentNode.parentNode.parentNode;
            }
            this.xul.treepopup.new._item.item = parent.parentNode.parentNode;
          }
        }
        if (allowAddCondition)
        {
          if (selectedItem.prop.propType == TA_PROPTYPE_CONDITIONLIST)
            this.xul.treepopup.newcond._item.item = selectedItem;
          else
            this.xul.treepopup.newcond._item.item = selectedItem.parentNode.parentNode.parentNode.parentNode;
        }
        if (allowEdit)
        {
          this.xul.treepopup.edit.item = selectedItem;
          this.xul.treepopup.edit.prop = selectedItem.prop;
        }
        if (allowDelete)
        {
          this.xul.treepopup.delete.item = selectedItem.parentNode.parentNode;
        }
      }
      else if (selectedItem.kind == "condition")
      {
        if (allowNew)
        {
          var parent = selectedItem.parentNode.parentNode.parentNode.parentNode;
          while (parent.kind == "condition")
            parent = parent.parentNode.parentNode.parentNode.parentNode;
          this.xul.treepopup.new._item.item = parent.parentNode.parentNode;
        }
        if (allowAddCondition)
        {
          this.xul.treepopup.newcond._item.item = selectedItem.parentNode.parentNode;
        }
        if (allowEdit)
        {
          this.xul.treepopup.edit.item = false;
        }
        if (allowDelete)
        {
          this.xul.treepopup.delete.item = selectedItem;
        }
      }
      else if (selectedItem.kind == "action")
      {
        if (allowNew)
        {
          this.xul.treepopup.new._item.item = selectedItem.parentNode.parentNode;
        }
        if (allowAddCondition)
        {
          this.xul.treepopup.newcond._item.item = false;
        }
        if (allowEdit)
        {
          this.xul.treepopup.edit.item = false;
        }
        if (allowDelete)
        {
          this.xul.treepopup.delete.item = selectedItem;
        }
      }
    }
    var clipboard = getTaggerActionClipboard();
    if (clipboard.hasContent)
    {
      if (clipboard.isCondition)
      {
        this.xul.treepopup.paste.hidden = !allowAddCondition;
        if (allowAddCondition)
          this.xul.treepopup.paste.item = this.xul.treepopup.newcond._item.item;
      }
      else
      {
        this.xul.treepopup.paste.hidden = !allowNew;
        if (allowNew)
          this.xul.treepopup.paste.item = this.xul.treepopup.new._item.item;
      }
    }
    this.xul.treepopup.separator.ccp.hidden = (this.xul.treepopup.cut.hidden && this.xul.treepopup.paste.hidden);
    this.xul.treepopup.separator.delete.hidden = (this.xul.treepopup.delete.hidden);

  },
  
  treePopupOnPopup: function(popup)
  {
    if (this.working)
      return false;
    var popupNode = document.popupNode;
    if (popupNode.id == "tree-root")
    {
      var i = this.xul.tree.currentIndex;
      if (i < 0)
      {
        this.treePopup_Setup(true, false, false, false, null, -1);
        return;
      }
      if (!this.xul.tree.view.selection.isSelected(i))
      {
        this.treePopup_Setup(true, false, false, false, null, -1);
        return;
      }
      var item = this.xul.tree.view.getItemAtIndex(i);
      if (item.kind == "action")
      {
        this.treePopup_Setup(true, false, false, true, item, i);
      }
      else if (item.kind == "property")
      {
        this.treePopup_Setup(true, 
          ((item.prop.propType == TA_PROPTYPE_CONDITIONLIST) || (item.parentNode.parentNode.kind == "condition")), 
          ((item.prop.propType != TA_PROPTYPE_CONDITIONLIST) && (item.prop.propType != TA_PROPTYPE_ACTIONLIST) && 
          ((item.prop.propType != TA_PROPTYPE_CUSTOM) || (item.prop.edit))), true, item);
      }
      else if (item.kind == "condition")
      {
        this.treePopup_Setup(true, true, false, true, item, i);
      }
    }
  },
  
  getOwningList: function(treeNode)
  {
    var owner = treeNode.parentNode.parentNode;
    if (owner.nodeName == "tree")
    {
      owner = this.actions;
    }
    else
    {
      owner = owner.prop.value;
    }
    return owner;
  },
  
  deleteAction: function(treeNode)
  {
    var owner = this.getOwningList(treeNode);
    for (var i=0;i<owner.length;i++)
    {
      if (owner[i] == treeNode.action)
      {
        owner.splice(i, 1);
        break;
      }
    }
    treeNode.parentNode.removeChild(treeNode);
  },
  
  treePopupCopy: function(menuitem, deleteOriginal)
  {
    var serializer = new TaggerActionSerializer();
    var clipboard = getTaggerActionClipboard();
    clipboard.setContent(serializer.serialize(menuitem.item.action), (menuitem.item.kind == "condition"));
    if (deleteOriginal)
      this.deleteAction(menuitem.item);
  },
  
  treePopupPaste: function(menuitem)
  {
    var serializer = new TaggerActionSerializer();
    var clipboard = getTaggerActionClipboard();
    var action = serializer.deserialize(clipboard.content);
    var target = this.xul.treeRoot;
    if (menuitem.item)
      target = menuitem.item.firstChild.nextSibling;
    var node = this.actionToTreeItem(action);
    target.appendChild(node);
    var owner = this.getOwningList(node);
    owner.push(action);
  },
  
  treePopupDeleteAction: function(menuitem)
  {
    if (!confirm(i18n("deletionconfirmation")))
      return;
    this.deleteAction(menuitem.item);
  },
  
  treePopupEditProperty: function(menuitem)
  {
    var prop = menuitem.prop;
    switch (prop.propType)
    {
      case TA_PROPTYPE_ACTIONLIST:
      case TA_PROPTYPE_CONDITIONLIST:
        throw "Invalid proptype for editing.";
      
      case TA_PROPTYPE_CUSTOM:
      {
        if (!prop.edit)
          throw "Cannot edit a CUSTOM proptype which does not specify an editing method.";
        if (prop.edit(this, prop))
          this.updateNode(menuitem.item, false);
        break;
      }
      
      default:
      {
        var state = {};
        state.changed = false;
        window.openDialog("chrome://tagger/content/edit-prop.xul", "", "modal=yes", prop, state);
        if (state.changed)
          this.updateNode(menuitem.item, false);
      }
    }
  },
  
  treeDblClick: function(tree)
  {
    var item = tree.view.getItemAtIndex(tree.currentIndex);
    var prop = item.prop;
    if ((item.kind == "property") && (prop.propType != TA_PROPTYPE_ACTIONLIST) && (prop.propType != TA_PROPTYPE_CONDITIONLIST))
      this.treePopupEditProperty({"prop": prop, "item": item});
  },
  
  treeMoveUp: function()
  {
    var i = this.xul.tree.currentIndex;
    if (i < 0)
    {
      return;
    }
    var currentNode = this.xul.tree.view.getItemAtIndex(i);
    if (currentNode.kind == "property")
    {
      return;
    }
    var prev = currentNode.previousSibling;
    if (!prev)
    {
      return;
    }
    currentNode.parentNode.removeChild(currentNode);
    prev.parentNode.insertBefore(currentNode, prev);
    
    var owner = currentNode.parentNode.parentNode;
    if (owner.nodeName == "tree")
    {
      owner = this.actions;
    }
    else
    {
      owner = owner.prop.value;
    }
    for (var i=0;i<owner.length;i++)
    {
      if (owner[i] == currentNode.action)
      {
        var tmp = owner[i-1];
        owner[i-1] = owner[i];
        owner[i] = tmp;
        break;
      }
    }
  },
  
  treeMoveDown: function()
  {
    var i = this.xul.tree.currentIndex;
    if (i < 0)
    {
      return;
    }
    var currentNode = this.xul.tree.view.getItemAtIndex(i);
    if (currentNode.kind == "property")
    {
      return;
    }
    var next = currentNode.nextSibling;
    if (!next)
    {
      return;
    }
    next.parentNode.removeChild(next);
    currentNode.parentNode.insertBefore(next, currentNode);
    
    
    var owner = currentNode.parentNode.parentNode;
    if (owner.nodeName == "tree")
    {
      owner = this.actions;
    }
    else
    {
      owner = owner.prop.value;
    }
    for (var i=0;i<owner.length;i++)
    {
      if (owner[i] == currentNode.action)
      {
        var tmp = owner[i+1];
        owner[i+1] = owner[i];
        owner[i] = tmp;
        break;
      }
    }
  },
  
  updateNode: function(node, recursive)
  {
    if ((node.kind == "action") || (node.kind == "condition"))
    {
      var children = node.firstChild.nextSibling;
      var child = children.firstChild;
      while (child)
      {
        updateNode(child, recursive);
        child = child.nextSibling;
      }
    }
    else if (node.kind == "property")
    {
      switch (node.prop.propType)
      {
        case TA_PROPTYPE_ACTIONLIST:
        case TA_PROPTYPE_CONDITIONLIST:
          break;
          
        case TA_PROPTYPE_ENUM:
        {
          if (node.prop.value == null)
            node.firstChild.firstChild.nextSibling.setAttribute("label", i18n("null"));
          else
            node.firstChild.firstChild.nextSibling.setAttribute("label", node.prop.values[node.prop.value].displayName);
          break;
        }
        case TA_PROPTYPE_CUSTOM:
        {
          if (node.prop.valueToString)
            node.firstChild.firstChild.nextSibling.setAttribute("label", node.prop.valueToString(node.prop));
          else
            node.firstChild.firstChild.nextSibling.setAttribute("label", node.prop.value);
          break;
        }
        case TA_PROPTYPE_SET:
        {
          if (node.prop.value == null)
            node.firstChild.firstChild.nextSibling.setAttribute("label", i18n("null"));
          else
            node.firstChild.firstChild.nextSibling.setAttribute("label", node.prop.value.join(", "));
          break;
        }
        case TA_PROPTYPE_BOOL:
        {
          if (node.prop.value == null)
            node.firstChild.firstChild.nextSibling.setAttribute("label", i18n("null"));
          else if (node.prop.value)
            node.firstChild.firstChild.nextSibling.setAttribute("label", i18n("true"));
          else
            node.firstChild.firstChild.nextSibling.setAttribute("label", i18n("false"));
          break;
        }
        default:
        {
          if (node.prop.value == null)
            node.firstChild.firstChild.nextSibling.setAttribute("label", i18n("null"));
          else
            node.firstChild.firstChild.nextSibling.setAttribute("label", "\""+node.prop.value+"\"");
          break;
        }
      }
    }
  },
  
  rebuildTree: function()
  {
    var root = this.xul.treeRoot;
    while (root.firstChild)
      root.removeChild(root.firstChild);
    for (var i=0;i<this.actions.length;i++)
    {
      root.appendChild(this.actionToTreeItem(this.actions[i]));
    }
  },
  
  actionToTreeItem: function(action)
  {
    var item = document.createElement("treeitem");
    var row = document.createElement("treerow");
    var cell;
    cell = document.createElement("treecell");
    cell.setAttribute("label", action.displayName);
    row.appendChild(cell);
    
    item.appendChild(row);
    
    if (action.evaluate)
      item.kind = "condition";
    else
      item.kind = "action";
    item.action = action;
    if (action.properties.length > 0)
    {
      var children = document.createElement("treechildren");
      item.setAttribute("container", "true");
      item.setAttribute("open", "true");
      var propItem;
      var propRow;
      var propCell;
      for (var i=0;i<action.properties.length;i++)
      {
        var prop = action.properties[i];
        var isContainer = false;
        propItem = document.createElement("treeitem");
        propItem.prop = prop;
        propItem.kind = "property";
          
        propRow = document.createElement("treerow");
        propCell = document.createElement("treecell");
        
        // Caption
        propCell.setAttribute("label", prop.displayName);
        propRow.appendChild(propCell);
        
        var propChildren = document.createElement("treechildren");

        // Value
        propCell = document.createElement("treecell");
        switch (prop.propType)
        {
          case TA_PROPTYPE_ACTIONLIST:
          {
            propCell.setAttribute("label", i18n("actionlistplaceholder"));
            propItem.setAttribute("container", "true");
            propItem.setAttribute("open", "true");
            isContainer = true;
            for (var j=0;j<prop.value.length;j++)
            {
              propChildren.appendChild(this.actionToTreeItem(prop.value[j]));
            }
            break;
          }
          case TA_PROPTYPE_CONDITIONLIST:
          {
            propCell.setAttribute("label", i18n("conditionlistplaceholder"));
            propItem.setAttribute("container", "true");
            propItem.setAttribute("open", "true");
            isContainer = true;
            for (var j=0;j<prop.value.length;j++)
            {
              propChildren.appendChild(this.actionToTreeItem(prop.value[j]));
            }
            break;
          }
          case TA_PROPTYPE_ENUM:
          {
            if (prop.value != null)
              propCell.setAttribute("label", prop.values[prop.value].displayName);
            else
              propCell.setAttribute("label", i18n("null"));
            break;
          }
          case TA_PROPTYPE_CUSTOM:
          {
            if (prop.valueToString)
              propCell.setAttribute("label", prop.valueToString(prop));
            else
              propCell.setAttribute("label", prop.value);
            break;
          }
          case TA_PROPTYPE_BOOL:
          {
            if (prop.value == null)
              propCell.setAttribute("label", i18n("null"));
            else if (prop.value)
              propCell.setAttribute("label", i18n("true"));
            else
              propCell.setAttribute("label", i18n("false"));
            break;
          }
          default:
          {
            if (prop.value == null)
              propCell.setAttribute("label", i18n("null"));
            else
              propCell.setAttribute("label", "\""+prop.value+"\"");
          }
        }

        propRow.appendChild(propCell);
        
        propItem.appendChild(propRow);
        
        if (isContainer)
        {
          propItem.appendChild(propChildren);
        }
        
        children.appendChild(propItem);
      }
      item.appendChild(children);
    }
    return item;
  },
  
  newMacro: function()
  {
    if (this.working)
      return;
    this.actions = new Array();
    this.actions.push(new TaggerAction_ImportSelection());
    this.actions.push(new TaggerAction_ForEachSelected());
    this.xul.description.value = "";
    this.rebuildTree();
  },
  
  saveMacro: function()
  {
    if (this.working)
      return;
    /*var serializer = new TaggerActionSerializer();
    alert(serializer.serializeActionList(this.actions));*/
    var resultContainer = {};
    window.openDialog("chrome://tagger/content/macrodlg.xul", "", "modal=yes", this.mainWindow, resultContainer, "+askoverwrite,+allownew");
    if (!resultContainer.selectedName)
      return;
    this.macroList.saveMacro(new TaggerMacro(resultContainer.selectedName, (new TaggerActionSerializer()).serializeActionList(this.actions), this.xul.description.value));
  },
  
  loadMacro: function()
  {
    if (this.working)
      return;
    /*var serializer = new TaggerActionSerializer();
    this.actions = serializer.deserializeActionList(prompt());*/
    var resultContainer = {};
    window.openDialog("chrome://tagger/content/macrodlg.xul", "", "modal=yes", this.mainWindow, resultContainer, "-askoverwrite,-allownew");
    if (!resultContainer.selectedName)
      return;
    var macro = this.macroList.getMacro(resultContainer.selectedName);
    this.actions = (new TaggerActionSerializer()).deserializeActionList(macro.code);
    this.xul.description.value = macro.description;
    this.rebuildTree();
  },
  
  execMacro: function()
  {
    if (this.working)
      return;
    var state = new TaggerActionState();
    try
    {
      this.working = true;
      this.xul.progressBar.setAttribute("hidden", "false");
      this.xul.toolBar.setAttribute("disabled", "true");
      this.xul.sideToolBar.setAttribute("disabled", "true");
      this.xul.tree.setAttribute("disabled", "true");
      state.prepareActionList(this.actions);
      state.executeActionList(this.actions);
    }
    finally
    {
      this.xul.tree.setAttribute("disabled", "false");
      this.xul.toolBar.setAttribute("disabled", "false");
      this.xul.sideToolBar.setAttribute("disabled", "false");
      this.xul.progressBar.setAttribute("hidden", "true");
      this.working = false;
    }
  },
  
  help: function()
  {
    if (this.working)
      return;
    top.open("chrome://tagger/content/help/actions.xhtml");
  },
  
  toggleMetaSection: function()
  {
    if (this.xul.metaSection.getAttribute("hidden") == "true")
    {
      this.xul.metaSection.setAttribute("hidden", false);
      this.xul.metaButton.setAttribute("label", "↥");
    }
    else
    {
      this.xul.metaSection.setAttribute("hidden", true);
      this.xul.metaButton.setAttribute("label", "↧");
    }
  }
}

var TaggerActions = null;
var ActionRegistry = new Array();
var ConditionRegistry = new Array();

var TA_PROPTYPE_STRING = 0;
var TA_PROPTYPE_INT = 1;
var TA_PROPTYPE_BOOL = 2;
var TA_PROPTYPE_CUSTOMEXPRESSION = 3;
var TA_PROPTYPE_ACTIONLIST = 4;
var TA_PROPTYPE_CONDITIONLIST = 5;
var TA_PROPTYPE_ENUM = 6;
var TA_PROPTYPE_TEXT = 7;
var TA_PROPTYPE_CUSTOM = 8;
var TA_PROPTYPE_SET = 9;

var TA_ACTIONTYPE_GENERAL = 0;
var TA_ACTIONTYPE_PERITEM = 1;
var TA_ACTIONTYPE_SELECTION = 2;

function actions_onLoad(window)
{
  TaggerActions = new TaggerActionController(window);
 }
 
function actions_onUnload(window)
{
  TaggerActions.unload();
  TaggerActions = null;
}

function TARegister(classConstructor, displayName, section)
{
  ActionRegistry.push({"cc": classConstructor, "displayName": displayName, "section": section});
}

function TCRegister(classConstructor, displayName, section)
{
  ConditionRegistry.push({"cc": classConstructor, "displayName": displayName, "section": section});
}

function TAProp(name, displayName, propType, mayBeNull)
{
  this.name = name;
  this.displayName = displayName;
  
  switch (propType.id)
  {
    case TA_PROPTYPE_STRING:
    {
      this.propType = TA_PROPTYPE_STRING;
      if (mayBeNull)
        this.value = null;
      else
        this.value = "";
      break;
    }
    case TA_PROPTYPE_INT:
    {
      this.propType = TA_PROPTYPE_INT;
      if (mayBeNull)
        this.value = null;
      else
        this.value = 0;
      break;
    }
    case TA_PROPTYPE_BOOL:
    {
      this.propType = TA_PROPTYPE_BOOL;
      if (mayBeNull)
        this.value = null;
      else
        this.value = false;
      break;
    }
    case TA_PROPTYPE_CUSTOMEXPRESSION:
    {
      this.propType = TA_PROPTYPE_CUSTOMEXPRESSION;
      this.expression = propType.expression;
      if (!mayBeNull)
        throw "TA_PROPTYPE_CUSTOMEXPRESSION values must be able to be null.";
      this.value = null;
      break;
    }
    case TA_PROPTYPE_ACTIONLIST:
    {
      this.propType = TA_PROPTYPE_ACTIONLIST;
      this.value = new Array();
      break;
    }
    case TA_PROPTYPE_CONDITIONLIST:
    {
      this.propType = TA_PROPTYPE_CONDITIONLIST;
      this.value = new Array();
      break;
    }
    case TA_PROPTYPE_ENUM:
    {
      this.propType = TA_PROPTYPE_ENUM;
      this.values = propType.values;
      if (mayBeNull)
        this.value = null;
      else
        this.value = 0;
      break;
    }
    case TA_PROPTYPE_TEXT:
    {
      this.propType = TA_PROPTYPE_TEXT;
      if (mayBeNull)
        this.value = null;
      else
        this.value = "";
      break;
    }
    case TA_PROPTYPE_CUSTOM:
    {
      this.propType = TA_PROPTYPE_CUSTOM;
      this.valueToString = propType.valueToString;
      this.edit = propType.edit;
      this.value = null;
      break;
    }
    case TA_PROPTYPE_SET:
    {
      this.propType = TA_PROPTYPE_SET;
      if (mayBeNull)
        this.value = null;
      else
        this.value = new Array();
      this.values = propType.values;
      break;
    }
    default: throw "Invalid proptype.";
  }
  this.mayBeNull = mayBeNull;
}

function TAEnumValue(value, displayName)
{
  this.value = value;
  this.displayName = displayName;
}

function TAProp_Attribute(name, displayName, allowAny, asSet)
{
  var attribList = new Array(
    new TAEnumValue("trackName", i18n("trackName")),
    new TAEnumValue("artistName", i18n("artistName")),
    new TAEnumValue("albumName", i18n("albumName")),
    new TAEnumValue("trackNumber", i18n("trackNumber")),
    new TAEnumValue("discNumber", i18n("discNumber")),
    new TAEnumValue("year", i18n("year")),
    new TAEnumValue("albumArtistName", i18n("albumArtistName")),
    new TAEnumValue("composerName", i18n("composerName")),
    new TAEnumValue("genre", i18n("genre")),
    new TAEnumValue("trackCount", i18n("trackCount")),
    new TAEnumValue("discCount", i18n("discCount")),
    new TAEnumValue("comment", i18n("comment"))
  );
  if (allowAny)
    attribList.unshift(new TAEnumValue("*", i18n("all")));
  var type = TA_PROPTYPE_ENUM;
  if (asSet)
    type = TA_PROPTYPE_SET;
  return new TAProp(name, displayName, {"id": type, "values": attribList}, false);
}

function TaggerAction_ToString()
{
  return "[TaggerAction "+this.displayName+"]";
}

function TaggerCondition_ToString()
{
  return "[TaggerCondition "+this.displayName+"]";
}

function TaggerAction_Super(obj)
{
  for (var i=0;i<obj.properties.length;i++)
  {     
    obj[obj.properties[i].name] = obj.properties[i];
  }
}