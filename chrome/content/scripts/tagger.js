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


Components.utils.import("resource://app/jsmodules/ArrayConverter.jsm");
Components.utils.import("resource://app/jsmodules/sbLibraryUtils.jsm");
Components.utils.import("resource://app/jsmodules/sbProperties.jsm");
Components.utils.import("resource://app/jsmodules/SBJobUtils.jsm");

function TaggerWindowController(ownWindow, isSidebar)
{
  this._window = ownWindow;
  this.Cc = Components.classes;
  this.Ci = Components.interfaces;
  if (isSidebar)
  {
    // Sidebar mode
    this._sidebar = true;
    this._mainWindow = top;
  }
  else
  {
    this._sidebar = false;
    this._mainWindow = this._window.arguments[0];
  }
  if (!this._sidebar)
  {
    //this._selCount = document.getElementById("selcount");
    this._mediaListView = this._mainWindow.gBrowser.currentMediaListView;
    this._selection = this._mediaListView.selection;
    //this._selCount.value = this._selection.count;
    this._sampleItem = this._mediaListView.selection.currentMediaItem;
    this._sampleFileName = this._sampleItem.getProperty(SBProperties.contentURL);
  }
  
  this._progress = document.getElementById("progress");
  this._progressCaption = document.getElementById("progress-caption");
  this._strings = document.getElementById("tagger-strings");
  
  this.retag = new TaggerRetagController(this);
  this.save = new TaggerSaveTagController(this);
  this.set = new TaggerSetTagController(this);
  this.rename = new TaggerRenameController(this);
  this.numbers = new TaggerNumbersController(this);
  this.replace = new TaggerReplaceController(this);
  this.fromtext = new TaggerFromTextController(this);
  this.macros = new TaggerMacroController(this);
  this.tools = new TaggerToolsController(this);
  
  this.xul = {};
  this.xul.tabs = document.getElementById("tagger-tabs");
  this.xul.gentoolstabs = document.getElementById("tagger-gentools-tabs");
  this.xul.modtoolstabs = document.getElementById("tagger-modtools-tabs");
  this.xul.storetoolstabs = document.getElementById("tagger-storetools-tabs");
  
  /*if (!this._mainWindow.__taggerHelper)
  {
    this._mainWindow.__taggerHelper = new TaggerHelper();
    this._mainWindow.__taggerHelper.list.push(this);
  }*/
  this.notifier = getNotifier(this._mainWindow);
  var me = this;
  this.globalConfigChange = function() {
    me.loadGlobalSettings();
  }
  this.macroListChange = function() {
    me.macros.updateMacroList();
  }
  
  this.notifier.addHandler("onGlobalConfigChange", this.globalConfigChange);
  this.notifier.addHandler("onMacroListChange", this.macroListChange);

  this.loadSettings();
}

TaggerWindowController.prototype = {
  _expressionEscapeList: {
    0: "\\",
    1: "[",
    2: "]",
    3: "^",
    4: "$",
    5: "(",
    6: ")",
    7: "{",
    8: "}",
    9: ".",
    10: "?",
    11: "*",
    12: "+"
  },
  
  winEvilCharacters: new Array(
    (/\//g),
    (/\\/g),
    (/:/g),
    (/\*/g),
    (/\?/g),
    (/"/g),
    (/</g),
    (/>/g),
    (/#/g),
    (/;/g),
    (/\|/g)
  ),
  
  _pathSeparator: "",
  
  detectOS: function() 
  {
    alert(this._strings.getString("taggerWindowDetectingOS"));
    var file = this.Cc["@mozilla.org/file/local;1"].createInstance(this.Ci.nsILocalFile);
    try
    {
      file.initWithPath("/");
      this.osflag = 0;
      this._pathSeparator = "/";
    } catch (e)
    {
      try
      {
        file.initWithPath("C:\\");
        this.osflag = 1;
        this._pathSeparator = "\\";
      } catch (e)
      {
        alert(this._strings.getString("taggerWindowCannotDetectOS"));
        window.openDialog("chrome://tagger/content/options.xul", "", "modal=yes", window, 1);
      }
    }
    Application.prefs.setValue("extensions.tagger.osflag", this.osflag);
    alert(this._strings.getString("taggerWindowDetectedOS"));
    if (this.osflag == 1)
      Application.prefs.setValue("extensions.tagger.filterfilename", true);
  },
  
  filterFileNameSection: function(section)
  {
    if (this.filterFileNames)
    {
      for (var i=0;i<this.winEvilCharacters.length;i++)
        section = section.replace(this.winEvilCharacters[i], this.filterReplacement);
    }
    return section;
  },
  
  filterFileName: function(fileName)
  {
    if (!this.filterFileName)
      return fileName;
    var components = fileName.split(this._pathSeparator);
    var filtered = "";
    for (var i=0;i<components.length;i++)
    {
      if (i > 0)
        filtered += this._pathSeparator + this.filterFileNameSection(components[i]);
      else
        filtered = this.filterFileNameSection(components[i]);
    }
    return filtered;
  },
  
  encodeFileNameSection: function(section)
  {
    return encodeURIComponent(this.filterFileNameSection(section));
  },
  
  encodeFileName: function(fileName)
  {
    var components = fileName.split(this._pathSeparator);
    var encoded = "";
    for (var i=0;i<components.length;i++)
    {
      if (i>0)
        encoded += "/"+this.encodeFileNameSection(components[i]);
      else
        encoded += this.encodeFileNameSection(components[i]);
    }
    return encoded;
  },
  
  /* NOTE: Changes to this need to be reflected in helper/action-state.js! */
  /* ToDo: Branch the file name encoding stuff into a separate class. */
  decodeFileName: function(fileName)
  {
    var components = fileName.split("/");
    var encoded = "";
    for (var i=0;i<components.length;i++)
    {
      if (i>0)
        encoded += this._pathSeparator+decodeURIComponent(components[i]);
      else
        encoded += decodeURIComponent(components[i]);
    }
    return encoded;
  },
  
  fileNameFromURI: function(uri)
  {
    if (uri.substr(0, 7) != "file://")
      return null;
    switch (this.osflag)
    {
      case 0:
      { 
        return this.decodeFileName(uri.substr(7));
      }
      case 1:
      {
        return this.decodeFileName(uri.substr(8));
      }
      default:
      {
        alert(this._strings.getString("taggerWindowOSNotKnown"));
        throw "OS not known."
      }
    }
  },
  
  fileNameToURI: function(fileName)
  {
    switch (this.osflag)
    {
      case 0:
      { 
        return encodeURI("file://"+fileName);
      }
      case 1:
      {
        return encodeURI(("file:///"+fileName).replace("\\", "/"));
      }
      default:
      {
        alert(this._strings.getString("taggerWindowOSNotKnown"));
        throw "OS not known."
      }
    }
  },
  
  loadGlobalSettings: function()
  {
    var value;
    if ((value = Application.prefs.get("extensions.tagger.autocommit")) != null)
      this.autocommit = value.value;
    if ((value = Application.prefs.get("extensions.tagger.donotask")) != null)
      this.donotask = value.value;
    if ((value = Application.prefs.get("extensions.tagger.osflag")) != null)
    {
      this.osflag = value.value;      
      switch (this.osflag)
      {
        case 0: this._pathSeparator = "/"; break;
        case 1: this._pathSeparator = "\\"; break;
      }
    }
    else
    {
      setTimeout("TaggerController.detectOS()", 2000);
    }
    if ((value = Application.prefs.get("extensions.tagger.filterfilenames")) != null)
      this.filterFileNames = value.value;
    else
    {
      if ((this.osflag) && (this.osflag == 1))
        this.filterFileNames = true;
      else
        this.filterFileNames = false;
    }
    if ((value = Application.prefs.get("extensions.tagger.filter.replace")) != null)
      this.filterReplace = value.value;
    if (this.filterReplace)
    {
      if ((value = Application.prefs.get("extensions.tagger.filter.replacement")) != null)
        this.filterReplacement = value.value;
    }
    else
      this.filterReplacement = "";
  },

  loadSettings: function()
  {
    var value;
    this.loadGlobalSettings();
    if ((value = Application.prefs.get("extensions.tagger.activetab")) != null)
      this.xul.tabs.selectedIndex = value.value;
    if ((value = Application.prefs.get("extensions.tagger.activetab.gen")) != null)
      this.xul.gentoolstabs.selectedIndex = value.value;
    if ((value = Application.prefs.get("extensions.tagger.activetab.mod")) != null)
      this.xul.modtoolstabs.selectedIndex = value.value;
    if ((value = Application.prefs.get("extensions.tagger.activetab.store")) != null)
      this.xul.storetoolstabs.selectedIndex = value.value;
    this.retag.loadSettings();
    this.save.loadSettings();
    this.set.loadSettings();
    this.rename.loadSettings();
    this.numbers.loadSettings();
    this.replace.loadSettings();
    this.fromtext.loadSettings();
    this.tools.loadSettings();
  },

  saveSettings: function() 
  {
    Application.prefs.setValue("extensions.tagger.activetab", this.xul.tabs.selectedIndex);
    Application.prefs.setValue("extensions.tagger.activetab.gen", this.xul.gentoolstabs.selectedIndex);
    Application.prefs.setValue("extensions.tagger.activetab.mod", this.xul.modtoolstabs.selectedIndex);
    Application.prefs.setValue("extensions.tagger.activetab.store", this.xul.storetoolstabs.selectedIndex);
    this.retag.saveSettings();
    this.save.saveSettings();
    this.set.saveSettings();
    this.rename.saveSettings();
    this.numbers.saveSettings();
    this.replace.saveSettings();
    this.fromtext.saveSettings();
    this.tools.saveSettings();
  },
  
  unload: function() {
    this.notifier.removeHandler("onGlobalConfigChange", this.globalConfigChange);
    this.notifier.removeHandler("onMacroListChange", this.macroListChange);
  },

  getMediaListView: function() {
    if (this._sidebar)
    {
      return this._mainWindow.gBrowser.currentMediaListView;
    }
    else
    {
      return this._mediaListView;
    }
  },

  getSampleName: function() {
    if (this._sidebar)
    {
      var selection = this.getMediaListView().selection;
      if (selection.count == 0)
      {
        alert(this._strings.getString("taggerWindowNeedSelection"));
        throw "You must select at least one item to perform a preview.";
      }
      return selection.currentMediaItem.getProperty(SBProperties.contentURL);
    }
    else
    {
      return this._sampleFileName;
    }
  },
  
  getSampleItem: function() {
    if (this._sidebar)
    {
      var selection = this.getMediaListView().selection;
      if (selection.count == 0)
      {
        alert(this._strings.getString("taggerWindowNeedSelection"));
        throw "You must select at least one item to perform a preview.";
      }
      return selection.currentMediaItem;
    }
    else
    {
      return this._sampleItem;
    }
  },

  regEscape: function(str) {
    return str.replace(".", "\\.").replace("(", "\\(").replace(")", "\\)").replace("*", "\\*").replace("?", "\\?").replace("[", "\[").replace("]", "\]");
  },

  openParserHelp: function() {
    /*if (this._sidebar)
      this._mainWindow.openDialog("chrome://tagger/content/parserhelp.xul", "", "modal=yes");
    else
      window.openDialog("chrome://tagger/content/parserhelp.xul", "", "modal=yes");*/
    if (!this._sidebar)
      throw "No windowed support for this atm.";
    this._mainWindow.gBrowser.loadOneTab("chrome://tagger/content/parserhelp.xul");
  },
  
  openMacroEditor: function() {
    this._mainWindow.gBrowser.loadOneTab("chrome://tagger/content/actions.xul");
  },
  
  askConfirmation: function(itemCount) {
    if (itemCount <= 0)
      return false;
    if (this.donotask)
      return true;
    return confirm(this._strings.getString("taggerWindowActionConfirmation").replace("%d", itemCount));
  },
  
  escapeExpression: function(expression) {
    for (var i in this._expressionEscapeList)
    {
      expression = expression.replace(new RegExp("\\"+this._expressionEscapeList[i], "g"), "\\"+this._expressionEscapeList[i]);
    }
    return expression;
  },
  
  clearList: function(list) {
    for (var i=list.getRowCount()-1;i>=0;i--)
      list.removeItemAt(i);
  },
  
  renumber: function(list) {
    this.renumberAfter(-1, list);
  },
  
  renumberAfter: function(afterIdx, list) {
    var item;
    for (var i=afterIdx+1;i<list.getRowCount();i++)
    {
      item = list.getItemAtIndex(i);
      item.firstChild.setAttribute("label", i+1);
    }
  },
  
  setHookState: function(enabled, targetList) {
    var hookEnabled = enabled;
    if (hookEnabled)
    {
      if (this.hook != null)
      {
        alert(this._strings.getString("taggerAlreadyHooking"));
        return false;
      }
      this.hook = this.getMediaListView().selection;
      this.hook.addListener(this);
      this.hookList = targetList;
      this.lastHook = null;
    }
    else
    {
      if (this.hook == null)
        return false;
      this.hook.removeListener(this);
      this.hook = null;
      this.hookList = null;
      this.lastHook = null;
    }
    return true;
  },
  
  newItem: function(mediaItem) {
    var result = {};
    result.title = mediaItem.getProperty("http://songbirdnest.com/data/1.0#trackName");
    result.artist = mediaItem.getProperty("http://songbirdnest.com/data/1.0#artistName");
    result.item = mediaItem;
    return result;
  },
  
  newNode: function(item) {
    var row = document.createElement("listitem");
    var cell;
    cell = document.createElement("listcell");
    cell.setAttribute("label", 0);
    row.appendChild(cell);
    cell = document.createElement("listcell");
    cell.setAttribute("label", item.artist);
    row.appendChild(cell);
    cell = document.createElement("listcell");
    cell.setAttribute("label", item.title);
    row.appendChild(cell);
    row.data = item;
    return row;
  },

  
  takeButtonClick: function(sender, targetList) {
    var selection = this.getMediaListView().selection;
    var count = selection.count;
    selection = selection.selectedMediaItems;
    for (var i=0;i<count;i++)
    {
      var item = selection.getNext();
      var node = this.newNode(this.newItem(item));
      node.firstChild.setAttribute("label", targetList.getRowCount()+1);
      targetList.appendChild(node);
    } 
    
  },
  
  onSelectionChanged: function() {
    var item = this.hook.currentMediaItem;
    if (this.lastHook != item)
    {
      var node = this.newNode(this.newItem(this.hook.currentMediaItem));
      node.firstChild.setAttribute("label", this.hookList.getRowCount()+1);
      this.hookList.appendChild(node);
      this.lastHook = item;
    }
  },
  
  onCurrentIndexChanged: function() {
    //this.xul.list.appendChild(this.newNode(this.newItem(this.hook.currentMediaItem)));
  },

  exchangeItems: function(item1, item2) {
    var buffer = {};
    buffer.data = item1.data;
    item1.data = item2.data;
    item2.data = buffer.data;
    var traverse = item1.firstChild.nextSibling;
    traverse.setAttribute("label", item1.data.artist);
    traverse = traverse.nextSibling;
    traverse.setAttribute("label", item1.data.title);
    
    traverse = item2.firstChild.nextSibling;
    traverse.setAttribute("label", item2.data.artist);
    traverse = traverse.nextSibling;
    traverse.setAttribute("label", item2.data.title);
  },
  
  moveUp: function(targetList) {
    var selected = targetList.getSelectedItem(0);
    var selectedIdx = targetList.getIndexOfItem(selected);
    if (selectedIdx <= 0)
      return;
    var upperItem = targetList.getItemAtIndex(selectedIdx - 1);
    this.exchangeItems(selected, upperItem);
    targetList.moveByOffset(-1, true, false);
  },
  
  moveDown: function(targetList) {
    var selected = targetList.getSelectedItem(0);
    var selectedIdx = targetList.getIndexOfItem(selected);
    if ((selectedIdx < 0) || (selectedIdx >= targetList.getRowCount() - 1))
      return;
    var lowerItem = targetList.getItemAtIndex(selectedIdx + 1);
    this.exchangeItems(selected, lowerItem);
    targetList.moveByOffset(1, true, false);
  },
  
  remove: function(targetList) {
    var item = targetList.getSelectedItem(0);
    if (!item)
      return;
    var selectedIdx = targetList.getIndexOfItem(item);
    targetList.removeItemAt(selectedIdx);
    this.renumberAfter(selectedIdx-1, targetList);
    if (selectedIdx >= targetList.getRowCount())
      selectedIdx--;
    targetList.addItemToSelection(targetList.getItemAtIndex(selectedIdx));
  },
  
  initProgress: function(max)
  {
    if (max <= 0)
    {
      this._progress.mode = "undetermined";
      this._progress.max = 0;
      this._progress.value = 0;
    }
    else
    {
      this._progress.mode = "determined";
      this._progress.max = max;
      this._progress.value = 0;
    }
  },
  
  updateProgress: function(pos, max, text)
  {
    if (max)
      this.initProgress(max);
    this._progress.value = pos;
    this.pollEvents();
  },
  
  pollEvents: function()
  {
    var thread = this.Cc["@mozilla.org/thread-manager;1"]
                        .getService(this.Ci.nsIThreadManager)
                        .currentThread;
    thread.processNextEvent(false);
  },
  
  enumeratorToArray: function(enum, count)
  {
    var result = new Array(count);
    for (var i=0;i<count;i++)
      result[i] = enum.getNext();
    return result;
  },
  
  lockUI: function()
  {
    this.xul.tabs.setAttribute("disabled", true);
    this.locked = true;
  },
  
  unlockUI: function()
  {
    //this.unlockUIBranch(this.xul.tabs);
    this.locked = false;
    this.xul.tabs.setAttribute("disabled", false);
  },
  
  getIsLocked: function()
  {
    return this.locked;
  }
}

var TaggerController = null;

function Tagger_doLoad(event)
{
  var isSidebar;
  if (!event.currentTarget.arguments)
    isSidebar = true;
  else
    isSidebar = false;
  TaggerController = new TaggerWindowController(event.currentTarget, isSidebar);
}

function Tagger_doUnload(event)
{
  TaggerController.saveSettings();
  TaggerController.unload();
  TaggerController = null;
}

window.addEventListener("load", function(e) {Tagger_doLoad(e);}, false);
window.addEventListener("unload", function(e) {Tagger_doUnload(e);}, false);
