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
MacroDlg = {
  allowNew: true,
  askOverwrite: true,
  allowDelete: true,
  
  init: function()
  {
    this.xul = {};
    this.xul.macroNew = document.getElementById("macro-new");
    this.xul.dialog = document.getElementById("tagger-macrodlg");
    this.xul.macroList = document.getElementById("macro-list");
    
    this.mainWindow = window.arguments[0];
    this.result = window.arguments[1];
    this.parameters = window.arguments[2];
    if (this.parameters)
    {
      var args = this.parameters.split(",");
      for (var i=0;i<args.length;i++)
      {
	var arg = args[i].substr(1).toLowerCase();
	var bit = args[i][0];
	if (arg == "allownew")
	  this.allowNew = (bit == "+");
	else if (arg == "askoverwrite")
	  this.askOverwrite = (bit == "+");
	else if (arg == "allowdelete")
	  this.allowDelete = (bit == "+");
      }
    }
    this.result.selectedName = false;
    this.macroList = getMacroList(this.mainWindow);
    this.notifier = getNotifier(this.mainWindow);
    
    var me = this;
    this.macroListChangeHandler = function() {
      me.updateList();
    };
    this.notifier.addHandler("onMacroListChange", this.macroListChangeHandler);
    
    this.updateList();
  },
  
  burn: function()
  {
    if (this.notifier)
    {
      this.notifier.removeHandler("onMacroListChange", this.macroListChangeHandler);
    }
  },
  
  clearList: function()
  {
    var node = this.xul.macroNew.nextSibling;
    while (node)
    {
      var tmp = node.nextSibling;
      node.parentNode.removeChild(node);
      node = tmp;
    }
  },
  
  enumCallback: function(name, macro, array)
  {
    array.push(macro);
  },
  
  updateList: function()
  {
    this.clearList();
    this.xul.macroNew.setAttribute("hidden", !this.allowNew);
    var target = new Array();
    this.macroList.enumMacrosByCallback(this.enumCallback, target);
    target.sort(function(a, b) {
      if (a.name > b.name)
        return 1;
      return -1;
    });
    for (var i=0;i<target.length;i++)
    {
      var macro = target[i];
      var name = macro.name;
      var node = document.createElement("listitem");
      node.setAttribute("label", name);
      node.setAttribute("value", name);
      node.setAttribute("tooltiptext", macro.description);
      node.setAttribute("ondblclick", "MacroDlg.dblClickItem(this);");
      node.setAttribute("context", "list-popup");
      this.xul.macroList.appendChild(node);
    }
    if (this.allowNew)
      this.xul.macroList.selectedIndex = 0;
    else if (target.length > 0)
      this.xul.macroList.selectedIndex = 1;
    else
      this.xul.macroList.selectedIndex = -1;
  },
  
  createNew: function()
  {
    var name = prompt(i18n("newfilename"));
    if (!name)
      return;
    if (this.macroList.getMacro(name))
      if (this.askOverwrite && !confirm(i18n("overwrite").replace("%s", name)))
	return;
    this.result.selectedName = name;
    this.xul.dialog.acceptDialog();
  },
  
  dblClickItem: function(item)
  {
    var name = item.getAttribute("value");
    if (this.askOverwrite && !confirm(i18n("overwrite").replace("%s", name)))
      return;
    this.result.selectedName = name;
    this.xul.dialog.acceptDialog();
  },
  
  buttonAccept: function()
  {
    if (!this.result.selectedName)
    {
      if (!this.xul.macroList.selectedItem)
        return false;
      if (this.xul.macroNew.selected)
	this.createNew();
      else if (this.xul.macroList.selectedItem)
	this.dblClickItem(this.xul.macroList.selectedItem);
    }
    return true;
  },
  
  deleteMacro: function()
  {
    if (!this.xul.macroList.selectedItem)
      return;
    if (!this.allowDelete)
      return;
    var name = this.xul.macroList.selectedItem.getAttribute("label");
    if (!confirm(i18n("delete").replace("%s", name)))
      return;
    this.macroList.deleteMacro(name);
  }
};

function i18n(code)
{
  var node = document.getElementById(code);
  if (node)
    return node.getAttribute("label");
  return code;
}