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
function TaggerReplaceController(parentController)
{
  this._parent = parentController;
  this.xul = {};
  this.xul.all = document.getElementById("replace-all");
  this.xul.checkbox = new Array();
  this.xul.search = new Array();
  this.xul.replace = new Array();
  this.xul.gflag = new Array();
  this.xul.iflag = new Array();
  this.xul.enableRegExp = document.getElementById("replace-enableregexp");
  for (var i=0;i<=9;i++)
  {
    this.xul.checkbox.push(document.getElementById("replace-"+this.mapping[i]));
    this.xul.search.push(document.getElementById("replace-"+this.mapping[i]+"-search"));
    this.xul.replace.push(document.getElementById("replace-"+this.mapping[i]+"-replace"));
    this.xul.gflag.push(document.getElementById("replace-"+this.mapping[i]+"-rg"));
    this.xul.iflag.push(document.getElementById("replace-"+this.mapping[i]+"-ri"));
  }
}

TaggerReplaceController.prototype = {
  mapping: {
    0: "trackName",
    1: "albumName",
    2: "artistName",
    3: "albumArtistName",
    4: "composerName",
    5: "genre",
    6: "year",
    7: "trackNumber",
    8: "discNumber",
    9: "comment"
  },
  
  mappingCount: 10,
  
  indexOfCheckbox: function(cb) {
    for (var i=0;i<this.mappingCount;i++)
      if (this.xul.checkbox[i] == cb)
        return i;
    return -1;
  },
  
  loadSettings: function() {
    var value;
    var mappingName;
    var enabledCount = 0;
    for (var i=0;i<this.mappingCount;i++)
    {
      mappingName = this.mapping[i];
      if ((value = Application.prefs.get("extensions.tagger.replace."+mappingName+".enabled")) != null)
      {
        this.switchOne(i, value.value);
        if (value.value)
          enabledCount++;
      }
      if ((value = Application.prefs.get("extensions.tagger.replace."+mappingName+".pattern")) != null)
        this.xul.search[i].value = value.value;
      if ((value = Application.prefs.get("extensions.tagger.replace."+mappingName+".replace")) != null)
        this.xul.replace[i].value = value.value;
      if ((value = Application.prefs.get("extensions.tagger.replace."+mappingName+".gflag")) != null)
        this.xul.gflag[i].checked = value.value;
      if ((value = Application.prefs.get("extensions.tagger.replace."+mappingName+".iflag")) != null)
        this.xul.iflag[i].checked = value.value;
    } 
    if (enabledCount >= 5)
      this.xul.all.checked = true;
    if ((value = Application.prefs.get("extensions.tagger.replace.regexp") != null))
      this.xul.enableRegExp.checked = value.value;
  },
  
  saveSettings: function() {
    var mappingName;
    for (var i=0;i<this.mappingCount;i++)
    {
      mappingName = this.mapping[i];
      Application.prefs.setValue("extensions.tagger.replace."+mappingName+".enabled", this.xul.checkbox[i].checked);
      Application.prefs.setValue("extensions.tagger.replace."+mappingName+".pattern", this.xul.search[i].value);
      Application.prefs.setValue("extensions.tagger.replace."+mappingName+".replace", this.xul.replace[i].value);
      Application.prefs.setValue("extensions.tagger.replace."+mappingName+".gflag", this.xul.gflag[i].checked);
      Application.prefs.setValue("extensions.tagger.replace."+mappingName+".iflag", this.xul.iflag[i].checked);
    } 
    Application.prefs.setValue("extensions.tagger.replace.regexp", this.xul.enableRegExp.checked);
  },
  
  switchAll: function(cb) {
    var checked = cb.checked; 
    for (var i=0;i<this.xul.checkbox.length;i++)
    {
      this.switchOne(i, checked);
    }
  },
  
  switchOne: function(targetIdx, newState)
  {
    this.xul.checkbox[targetIdx].checked = newState;
    this.xul.search[targetIdx].disabled = !newState;
    this.xul.replace[targetIdx].disabled = !newState;
    this.xul.gflag[targetIdx].disabled = !newState;
    this.xul.iflag[targetIdx].disabled = !newState;
  },
  
  onCheck: function (cb)
  {
    var idx = this.indexOfCheckbox(cb);
    if (idx < 0)
      return;
    var checked = cb.checked;
    this.xul.search[idx].disabled = !checked;
    this.xul.replace[idx].disabled = !checked;
    this.xul.gflag[idx].disabled = !checked;
    this.xul.iflag[idx].disabled = !checked;
  },
  
  doReplace: function() {
    if (this._parent.getIsLocked())
      return;
    var actions = new Array();
    var useRegExp = this.xul.enableRegExp.checked;
    var autoCommit = null;
    if (this._parent.autocommit)
      autoCommit = new TaggerCommit();
    for (var i=0;i<this.mappingCount;i++)
    {
      if (this.xul.checkbox[i].checked)
      {
        var item = {};
        var flags = "";
        if (this.xul.gflag[i].checked)
          flags += "g";
        if (this.xul.iflag[i].checked)
          flags += "i";
        if (this.xul.search[i].value == "")
          continue;
        if (useRegExp)
          item.search = new RegExp(this.xul.search[i].value, flags);
        else
          item.search = new RegExp(this._parent.escapeExpression(this.xul.search[i].value), flags);
        item.replace = this.xul.replace[i].value;
        item.property = "http://songbirdnest.com/data/1.0#"+this.mapping[i];
        if (autoCommit)
          autoCommit.addProperty(item.property);
        actions.push(item);
      }
    }
    if (actions.length == 0)
    {
      alert(this._parent._strings.getString("taggerWindowNoAttributesSelected"));
      return;
    }
  
    var selection = this._parent.getMediaListView().selection;
    var mediaItems = selection.selectedMediaItems;
    var count = selection.count;
    
    if (!this._parent.askConfirmation(count))
      return;
    this._parent.initProgress(count);
    for (var i=0;i<count;i++)
    {
      var mediaItem = mediaItems.getNext();
      if (autoCommit)
        autoCommit.addItem(mediaItem);
      for (var j=0;j<actions.length;j++)
      {
        var action = actions[j];
        var property = mediaItem.getProperty(action.property);
        if (property != "")
        {
          property = property.replace(action.search, action.replace);
          try
          {
            mediaItem.setProperty(action.property, property);
          } catch (e)
          {
            //
          }
        }
      }
      this._parent.updateProgress(i+1);
    }
    if (autoCommit)
      autoCommit.commit();
  }
}
