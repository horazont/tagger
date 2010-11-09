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
function TaggerMacroController(taggerInstance)
{
  this._tagger = taggerInstance;
  this.xul = {};
  this.xul.macroList = document.getElementById("macro-list");
  this.xul.noMacrosItem = document.getElementById("macro-list-nomacros");
  this.macroList = getMacroList(this._tagger._mainWindow);
  this.Cc = Components.classes;
  this.Ci = Components.interfaces;
  
  this.updateMacroList();
}

TaggerMacroController.prototype = {
  clearMacroList: function() {
    var node = this.xul.noMacrosItem.nextSibling;
    while (node)
    {
      var tmp = node.nextSibling;
      node.parentNode.removeChild(node);
      node = tmp;
    }
    this.xul.noMacrosItem.setAttribute("hidden", false);
  },

  updateMacroList: function() {
    var array = new Array();
    this.macroList.enumMacrosByCallback(function(name, macro) {
      array.push(macro);
    });
    array.sort(function(a, b) {
      if (a.name > b.name)
        return 1;
      return -1;
    });
    
    this.clearMacroList();
    if (array.length == 0)
      return;
    this.xul.noMacrosItem.setAttribute("hidden", true);
    for (var i=0;i<array.length;i++)
    {
      var macro = array[i];
      var node = document.createElement("listitem");
      node.setAttribute("label", macro.name);
      node.value = macro;
      node.setAttribute("tooltiptext", macro.description);
      node.setAttribute("context", "macro-list-popup");
      this.xul.macroList.appendChild(node);
    }
  },
  
  execute: function() {
    if (this._tagger.getIsLocked())
      return;
    this._tagger.lockUI();
    try
    {
      var macro = document.popupNode.value;
      if (!macro)
        return;
      var actionList = (new TaggerActionSerializer()).deserializeActionList(macro.code);
      var state = new TaggerActionState();
      this._tagger.initProgress(-1);
      state.executeActionList(actionList);
    }
    finally
    {
      this._tagger.updateProgress(0, 1);
      this._tagger.unlockUI();
    }
  },
  
  edit: function() {
    /*var browser = this._tagger._mainWindow.gBrowser;
    var tab = browser.loadOneTab("chrome://tagger/content/actions.xul");
    browser = browser.getBrowserForTab(tab);
    var wnd;
    var i = 0;
    while (browser.contentWindow == null)
    {
      this._tagger.pollEvents();
      i++;
      if (i > 20000)
      {
        alert("timeout");
        return;
      }
    }*/
    /*while ((wnd = browser.contentDocument.getElementById("tagger-actions")) == null)
    {
      this._tagger.pollEvents();
      i++;
      if (i > 20000)
        return;
    }
    for (var i=0;i<2000;i++)
      this._tagger.pollEvents();
    wnd = browser.contentDocument.getElementById("tagger-actions");
    alert("looking for controller: "+wnd.value);
    i=0;
    while (!wnd.value)
    {
      this._tagger.pollEvents();
      i++;
      if (i > 20000)
      {
        alert("controller timeout");
        return;
      }
    }
    alert("controller present");*/
    /*.onreadystatechange = function() {
      alert("meow");
    }*/
  },
  
  export: function()
  {    
    var macro = document.popupNode.value;
    if (!macro)
      return;
    var fp = this.Cc["@mozilla.org/filepicker;1"]
      .createInstance(this.Ci.nsIFilePicker);
    fp.init(this._tagger._mainWindow, i18n("macros-exporttarget"), 1); // 1 = modeSave
    fp.appendFilters(5); // 5 = 1 or 4 = filterAll or filterText
    var mode = fp.show();
    if (mode == 1) // 1 = resultCancel
      return;
    var file = fp.file;
    writeStringToFile(file, escape(macro.name)+","+escape(macro.description)+","+escape(macro.code));
  },
  
  delete: function()
  {
    var macro = document.popupNode.value;
    if (!macro)
      return;
    var name = macro.name;
    if (!name)
      return;
    if (!confirm(i18n("macros-askdelete").replace("%s", name)))
      return;
    this.macroList.deleteMacro(name);
  },
  
  import: function()
  {
    var fp = this.Cc["@mozilla.org/filepicker;1"]
      .createInstance(this.Ci.nsIFilePicker);
    fp.init(this._tagger._mainWindow, i18n("macros-exporttarget"), 0); // 0 = modeOpen
    fp.appendFilters(5); // 5 = 1 or 4 = filterAll or filterText
    var mode = fp.show();
    if (mode == 1) // 1 = resultCancel
      return;
    var file = fp.file;
    var data = readStringFromFile(file).split(",");
    var name = unescape(data[0]);
    if (this.macroList.getMacro(name))
      if (!confirm(i18n("macros-askoverwrite").replace("%s", name)))
        return;
    this.macroList.saveMacro(new TaggerMacro(name, unescape(data[2]), unescape(data[1])));
  }
}