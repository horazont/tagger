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

Components.utils.import("resource://app/jsmodules/sbProperties.jsm");

function TaggerRenameController(parentController)
{
  this._parent = parentController;
  this.Cc = Components.classes;
  this.Ci = Components.interfaces;
  this.xul = {};
  this.xul.targetDir = document.getElementById("tagtofile-targetdir");
  this.xul.pattern = document.getElementById("tagtofile-pattern");
  this.xul.keepextension = document.getElementById("tagtofile-keepextension");
  this.xul.keepcopy = document.getElementById("tagtofile-keepcopy");
  this.xul.preview = {};
  this.xul.preview.oldName = document.getElementById("tagtofile-oldname");
  this.xul.preview.newName = document.getElementById("tagtofile-newname");
  this.xul.presenceFilter = document.getElementById("tagtofile-presencefilter");
  this.xul.presenceFilterAuto = document.getElementById("tagtofile-presencefilter-auto");
  this.xul.presenceFilterCustom = document.getElementById("tagtofile-presencefilter-custom");
  this.xul.presenceFilterNone = document.getElementById("tagtofile-presencefilter-none");
  this.xul.onlyLocalFiles = document.getElementById("tagtofile-onlylocal");
  this.xul.customFilter = {};
  this.xul.customFilter.trackName = document.getElementById("tagtofile-trackName");
  this.xul.customFilter.albumName = document.getElementById("tagtofile-albumName");
  this.xul.customFilter.artistName = document.getElementById("tagtofile-artistName");
  this.xul.customFilter.albumArtistName = document.getElementById("tagtofile-albumArtistName");
  this.xul.customFilter.composerName = document.getElementById("tagtofile-composerName");
  this.xul.customFilter.genre = document.getElementById("tagtofile-genre");
  this.xul.customFilter.year = document.getElementById("tagtofile-year");
  this.xul.customFilter.trackNumber = document.getElementById("tagtofile-trackNumber");
  this.xul.customFilter.discNumber = document.getElementById("tagtofile-discNumber");
  this.xul.customFilter.comment = document.getElementById("tagtofile-comment");
  this.parser = new TaggerTokenparser();
}

TaggerRenameController.prototype = {
  _parserTokens: new Array(
    {token: "t",         prop: "trackName",               "kind": 0},
    {token: "a",         prop: "artistName",              "kind": 0},
    {token: "b",         prop: "albumName",               "kind": 0},// kind = 0: str
    {token: "n",         prop: "trackNumber",             "kind": 1},
    {token: "c",         prop: "discNumber",              "kind": 1},
    {token: "y",         prop: "year",                    "kind": 1},// kind = 1: numeric
    {token: "x",         prop: "",                        "kind": 3} // kind = 3: file extension
  ),
  
  _parserTokensString: "tabncyx",
  
  _tokenObjectByToken: function(token) {
    for (var currentToken in this._parserTokens)
    {
      if (this._parserTokens[currentToken].token == token)
      {
        this._parserTokens[currentToken].id = currentToken;
        return this._parserTokens[currentToken];
      }
    }
    return null;
  },
  
  _error: 0, // 1: ERR_MISSINGTAG

  loadSettings: function() {
    var value;
    if ((value = Application.prefs.get("extensions.tagger.rename.targetdir")) != null)
      this.xul.targetDir.value = value.value;
    if ((value = Application.prefs.get("extensions.tagger.rename.pattern")) != null)
      this.xul.pattern.value = value.value;
    if ((value = Application.prefs.get("extensions.tagger.rename.keepextension")) != null)
      this.xul.keepextension.checked = value.value;
    if ((value = Application.prefs.get("extensions.tagger.rename.keepcopy")) != null)
      this.xul.keepcopy.checked = value.value;
  },

  saveSettings: function() {
    Application.prefs.setValue("extensions.tagger.rename.targetdir", this.xul.targetDir.value);
    Application.prefs.setValue("extensions.tagger.rename.pattern", this.xul.pattern.value);
    Application.prefs.setValue("extensions.tagger.rename.keepextension", this.xul.keepextension.checked);     
    Application.prefs.setValue("extensions.tagger.rename.keepcopy", this.xul.keepcopy.checked);
  },
  
  loadGeneratorStates: function() {
    //this.onlyLocal = this.xul.onlyLocalFiles.checked;
    this.presenceFilter = this.xul.presenceFilter.selectedIndex;
    this.keepExtension = this.xul.keepextension.checked;
    this.keepCopy = this.xul.keepcopy.checked;
    
    var rootDir = this.Cc["@mozilla.org/file/local;1"].createInstance(this.Ci.nsILocalFile);
    try
    {
      rootDir.initWithPath(this.xul.targetDir.value);
    } catch (e)
    {
      alert(this._parent._strings.getString("taggerWindowInvalidTargetDir"));
      throw e;
    }
    
    this.rootDir = rootDir;
    this.rootPath = rootDir.path;
    if (this.presenceFilter == 2)
    {
      this.requiredTags = new Array();
      for (var checkbox in this.xul.customFilter)
      {
        if (this.xul.customFilter[checkbox].checked)
        {
          this.requiredTags.push(checkbox);
        }
      }
    }
    else
      this.requiredTags = null;
    
    this.parser.init(this.xul.pattern.value, this.requiredTags, this.presenceFilter);
  },
  
  generateFileName: function(item) {
    var oldExtension = item.getProperty(SBProperties.contentURL);    
    oldExtension = oldExtension.substr(oldExtension.lastIndexOf(".")+1);
    var fileName = this.parser.execute(item);
    if (!fileName)      
      return false;
    if (this.keepExtension)
      fileName += "."+oldExtension;
    return fileName;
  },

  previewRename: function() {
    this.loadGeneratorStates();
    var item = this._parent.getSampleItem();
    var fileName = this.generateFileName(item);
    oldFileName = this._parent.fileNameFromURI(item.getProperty(SBProperties.contentURL));    
    if (!fileName)
    {
      switch (this.parser._error)
      {
        case 1: alert(this._parent._strings.getString("taggerWindowMissingTags")+"\n "+oldFileName); return; //alert(this._parent._strings.getString("taggerWindowMissingTags")); break;
        default: alert(this._parent._strings.getString("taggerWindowUnknownError")+"\n "+oldFileName); return; //alert(this._parent._strings.getString("taggerWindowUnknownError"));
      }
    }
    this.xul.preview.oldName.value = oldFileName;
    this.xul.preview.newName.value = this.rootPath + this._parent._pathSeparator + this._parent.filterFileName(fileName);
  },

  selectTargetDir: function() {
    var fp = this.Cc["@mozilla.org/filepicker;1"]
      .createInstance(this.Ci.nsIFilePicker);
    fp.init(this._parent._mainWindow, this._parent._strings.getString("taggerWindowSelectTargetDir"), 2); // 2 = modeGetFolder
    if (fp.show() == 0) // 0 = returnOK
    {
      this.xul.targetDir.value = fp.file.path;
    }
  },

  selectExistanceFilter: function(filter) {
    switch (parseInt(filter))
    {
      case 0: 
      {
        this.xul.presenceFilterAuto.style.display = "none";
        this.xul.presenceFilterCustom.style.display = "none";
        this.xul.presenceFilterNone.style.display = null; 
        break;
      }
      case 1: 
      {
        this.xul.presenceFilterNone.style.display = "none";
        this.xul.presenceFilterCustom.style.display = "none";
        this.xul.presenceFilterAuto.style.display = null; 
        break;
      }
      case 2: 
      {
        this.xul.presenceFilterNone.style.display = "none";
        this.xul.presenceFilterAuto.style.display = "none";
        this.xul.presenceFilterCustom.style.display = null; 
        break;
      }
    }
    this.xul.presenceFilter.value = filter;
  },
  
  doRename: function() {
    if (this._parent.getIsLocked())
      return;
    
    this.loadGeneratorStates();
    
    
    var file;// = ;
    
    var selection = this._parent.getMediaListView().selection;
    var mediaItems = selection.selectedMediaItems;
    var count = selection.count;
    
    if (!this._parent.askConfirmation(count))
      return;
    
    var mediaItem;
    var oldFileName, newFileName, lastSeparator;
    var file;
    var dirStructure, subPath;
    var skipAll = false;
    var file = this.Cc["@mozilla.org/file/local;1"].createInstance(this.Ci.nsILocalFile);
    var newFile = this.Cc["@mozilla.org/file/local;1"].createInstance(this.Ci.nsILocalFile);
    var dir = this.Cc["@mozilla.org/file/local;1"].createInstance(this.Ci.nsILocalFile);
    var parentDir = this.Cc["@mozilla.org/file/local;1"].createInstance(this.Ci.nsILocalFile);
    
    var permissions = this.rootDir.permissions;
    

    this._parent.initProgress(count);
    for (var i = 0;i<count;i++)
    {
      mediaItem = mediaItems.getNext();
      oldFileName = this._parent.fileNameFromURI(mediaItem.getProperty(SBProperties.contentURL));
      try
      {
        file.initWithPath(oldFileName);
        if (!file.exists())
        {
          alert("DEBUG: File not found \""+oldFileName+"\"");
          continue;
        }
      } catch (e)
      {
        alert("DEBUG: Skipped due to exception.");
        continue;
      }
      try
      {
        newFileName = this.generateFileName(mediaItem);
        if (!newFileName )
        {
          switch (this.parser._error)
          {
            case 1: alert(this._parent._strings.getString("taggerWindowMissingTags")+"\n "+oldFileName); continue; //alert(this._parent._strings.getString("taggerWindowMissingTags")); break;
            default: alert(this._parent._strings.getString("taggerWindowUnknownError")+"\n "+oldFileName); continue; //alert(this._parent._strings.getString("taggerWindowUnknownError"));
          }
          continue;
        }
      } catch (e)
      {
        alert("DEBUG: Skipped due to exception.");
        continue;
      }
      newFileName = this._parent.filterFileName(newFileName);
      if (oldFileName == this.rootPath+this._parent._pathSeparator+newFileName)
        continue;
      lastSeparator = newFileName.lastIndexOf(this._parent._pathSeparator);
      dir.initWithPath(this.rootPath+this._parent._pathSeparator+newFileName.substr(0, lastSeparator));
      try
      {
        if (!dir.exists())
        {
          dir.create(dir.DIRECTORY_TYPE, permissions);
          if (!dir.exists())
            throw "Created directory does not exist. Probably a permission problem.";
        }
      } catch (e)
      {
        alert("Could not enforce path.\nFrom: "+oldFileName+"\nTo: "+this.rootPath+this._parent._pathSeparator+newFileName+"\nError: "+e);
        continue;
      }
      try
      {
        newFile.initWithPath(this.rootPath+this._parent._pathSeparator+newFileName);
        if (newFile.exists())
        {
          alert("File with new name already exists.\nFrom: "+oldFileName+"\nTo: "+this.rootPath+this._parent._pathSeparator+newFileName);
          continue;
        }
      } catch (e)
      {
        alert("DEBUG: Skipped due to exception.\nFrom: "+oldFileName+"\nTo: "+this.rootPath+this._parent._pathSeparator+newFileName+"\nError: "+e);
        continue;
      }
      try
      {
        //if a copy of the original not already in the Target Dir has to be kept, copy instead of move. 
        if ((this.keepCopy) && (oldFileName.toLowerCase().indexOf(this.rootPath.toLowerCase())==-1))
           file.copyTo(dir, newFileName.substr(lastSeparator+1));
        else
           file.moveTo(dir, newFileName.substr(lastSeparator+1));
      } catch (e)
      {
        alert(this._parent._strings.getString("taggerWindowFileNotMoved").replace("%s1",oldFileName).replace("%s2",this.rootPath+this._parent._pathSeparator+newFileName)+"\n\nException: "+e);
        continue;
      }
      mediaItem.setProperty(SBProperties.contentURL, this._parent.fileNameToURI(this.rootPath+this._parent._pathSeparator+newFileName));
      
      // Disabled to not let Songbird doing evil stuff
      //this._parent.updateProgress(i+1);
    }
    

  }
}
