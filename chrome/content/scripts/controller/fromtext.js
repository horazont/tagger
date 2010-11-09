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

function TaggerFromTextController(parentController)
{
  this._parent = parentController;
  this.Ci = Components.interfaces;
  this.Cc = Components.classes;
  this.xul = {};
  this.xul.pattern = document.getElementById("fromtextfile-pattern");
  this.xul.sourceFile = document.getElementById("fromtextfile-textfile");
  this.xul.encoding = document.getElementById("fromtextfile-encoding");
  this.xul.list = document.getElementById("fromtextfile-list");
  this.xul.patternInFile = document.getElementById("fromtextfile-patterninfile");
  this.xul.skip = document.getElementById("fromtextfile-skip");
  this.parser = new TaggerTokenparser2(this._parent);
}

TaggerFromTextController.prototype = {
  loadSettings: function() {
    var value;
    if ((value = Application.prefs.get("extensions.tagger.fromtext.encoding")) != null)
      this.xul.encoding.value = value.value;
    if ((value = Application.prefs.get("extensions.tagger.fromtext.pattern")) != null)
      this.xul.pattern.value = value.value;
    if ((value = Application.prefs.get("extensions.tagger.fromtext.sourceFile")) != null)
      this.xul.sourceFile.value = value.value;
    if ((value = Application.prefs.get("extensions.tagger.fromtext.patternInFile")) != null)
    {
      this.xul.patternInFile.checked = value.value;
      this.patternInFileClick(this.xul.patternInFile);
    }
    if ((value = Application.prefs.get("extensions.tagger.fromtext.skip")) != null)
      this.xul.skip.value = value.value;
  },
  
  saveSettings: function() {
    Application.prefs.setValue("extensions.tagger.fromtext.encoding", this.xul.encoding.value);
    Application.prefs.setValue("extensions.tagger.fromtext.pattern", this.xul.pattern.value);
    Application.prefs.setValue("extensions.tagger.fromtext.sourceFile", this.xul.sourceFile.value);
    Application.prefs.setValue("extensions.tagger.fromtext.patternInFile", this.xul.patternInFile.checked);
    Application.prefs.setValue("extensions.tagger.fromtext.skip", this.xul.skip.value);
  },

  selectSourceFile : function(sender) {
    var fp = this.Cc["@mozilla.org/filepicker;1"]
      .createInstance(this.Ci.nsIFilePicker);
    fp.init(this._parent._mainWindow, this._parent._strings.getString("taggerWindowSelectSourceTextFile"), 0); // 0 = modeOpen
    if (fp.show() == 0)
    {
      this.xul.sourceFile.value = fp.file.path;
    }
  },
  
  patternInFileClick: function(sender) {
    var checked = sender.checked;
    this.xul.pattern.disabled = checked;
  },
  
  loadTextFileContents: function(sourceFile) {
    var inputStream = this.Cc["@mozilla.org/network/file-input-stream;1"].createInstance(this.Ci.nsIFileInputStream);
    inputStream.init(sourceFile, -1, -1, 0);
    const replacementChar = Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
    var decodedInputStream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterInputStream);
    decodedInputStream.init(inputStream, this.xul.encoding.value, 0, replacementChar);
    var data = "";
    var buffer = {};
    while (decodedInputStream.readString(8192, buffer) != 0)
    {
      data += buffer.value;
    }
    decodedInputStream.close();
    inputStream.close();
    return data;
  },
  
  doFromText: function() {
    if (this._parent.getIsLocked())
      return;
    if (this.xul.list.getRowCount() == 0)
    {
      alert(this._parent._strings.getString("taggerWindowNoTracksInList"));
      return;
    }
    if (!this._parent.askConfirmation(this.xul.list.getRowCount()))
      return;

    var sourceFile = this.Cc["@mozilla.org/file/local;1"]
      .createInstance(this.Ci.nsILocalFile);
    sourceFile.initWithPath(this.xul.sourceFile.value);
    if (!sourceFile.exists())
    {
      alert(this._parent._strings.getString("taggerWindowFileNotFound"));
      throw "Source file \""+this.xul.sourceFile.value+"\" not found.";
    }
    
    var fileContents = this.loadTextFileContents(sourceFile);
    var rawPattern;
    if (this.xul.patternInFile.checked)
    {
      rawPattern = fileContents.split("\n", 1)[0]
      fileContents = fileContents.substr(rawPattern.length+1); // Kill the newline-char too
      if (rawPattern.charCodeAt(rawPattern.length-1) == 13)
        rawPattern = rawPattern.substr(0, rawPattern.length-1);
      rawPattern = rawPattern.replace("\x09", "\\t"); // Substitute "hard coded" tabs by the \t combo
    }
    else
    {
      rawPattern = this.xul.pattern.value;
    }
    this.parser.init(rawPattern, true, true);
    if (this.parser.fmtTokens.length == 0)
    {
      if (!confirm(this._parent._strings.getString("taggerWindowPatternMaybeWrong").replace("%s", rawPattern)))
        return;
    }
    var autoCommit = null;
    if (this._parent.autocommit)
    {
      autoCommit = new TaggerCommit();
      for (var i=0;i<this.parser.fmtTokens.length;i++)
      {
        autoCommit.addProperty("http://songbirdnest.com/data/1.0#"+this.parser.fmtTokens[i].token.prop);
      }
    }
    var regExp = new RegExp(this.parser.fmtExpression, "g"); // just use the expression here - the normal parser is not suitable for this.
    //alert(this.parser.fmtExpression);
    //alert(fileContents);
    var i=0;
    var count = this.xul.list.getRowCount();
    var item;
    var data;
    var matched = false;
    var toSkip = this.xul.skip.value;
    this._parent.initProgress(count);
    while ((i < count) && ((match = regExp.exec(fileContents)) != null))
    {
      matched = true;
      if (toSkip > 0)
      {
        toSkip--;
        continue;
      }
      data = this.parser.getDataFromMatch(match); // here use the data from match extraction mechanism
      item = this.xul.list.getItemAtIndex(i).data.item;
      //alert("\""+data.matchdata+"\"\n"+data.matchdata.charCodeAt(0)+" "+data.matchdata.charCodeAt(data.matchdata.length-1));
      for (var prop in data)
      {
        if (prop == "matchdata")
          continue;
        //alert(prop+"\n"+data[prop]);
        item.setProperty("http://songbirdnest.com/data/1.0#"+prop, data[prop]);
      }
      if (autoCommit != null)
        autoCommit.addItem(item);
      i++;
      this._parent.updateProgress(i);
    }
    if (i < count)
      this._parent.updateProgress(count);
    if (!matched)
    {
      alert(this._parent._strings.getString("taggerWindowNoMatch"));
      return;
    }
    if (autoCommit != null)
      autoCommit.commit();
  }
};
