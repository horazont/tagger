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

function TaggerToolsController(parentController)
{
  this._parent = parentController;
  this.xul = {};
  this.xul.checkbox = new Array();
  for (var i=0;i<this.mapping.length;i++)
  {
    var checkbox = document.getElementById("tools-target-"+this.mapping[i]);
    checkbox.mappingIndex = i;
    this.xul.checkbox.push(checkbox);
  }
  this.tokenParser2 = new TaggerTokenparser2(this._parent);
}

TaggerToolsController.prototype = {
  mapping: new Array(
    "trackName",
    "albumName",
    "artistName",
    "albumArtistName",
    "composerName",
    "genre",
    "comment"
  ),

  loadSettings: function() {
    var value;
    var mappingName;
    for (var i=0;i<this.mapping.length;i++)
    {
      mappingName = this.mapping[i];
      if ((value = Application.prefs.get("extensions.tagger.tools.target."+mappingName+".enabled")) != null)
        this.switchOne(i, value.value);
    }
  },

  saveSettings: function() {
    var mappingName;
    for (var i=0;i<this.mapping.length;i++)
    {
      mappingName = this.mapping[i];
      Application.prefs.setValue("extensions.tagger.tools.target."+mappingName+".enabled", this.xul.checkbox[i].checked);
    }
  },

  setAllClick: function(cb) {
    var checked = cb.checked;
    for (var i=0;i<this.mapping.length;i++)
    {
      this.switchOne(i, checked);
    }
  },
  
  switchOne: function(idx, newState)
  {
    this.xul.checkbox[idx].checked = newState;
  },
  
  doCorrectCasing: function(item, property)
  {
    var value = item.getProperty(property);
    if (value)
    {
      value = this.tokenParser2.autoUpCase(value);
      item.setProperty(property, value);
    }
  },
  
  countUpperBits: function(charcode)
  {
    var mask = 128;
    var count = 0;
    while ((mask >= 1) && ((charcode & mask) == mask))
    {
      count++;
      mask = mask >>> 1;
    }
    return count;
  },
  
  utf8CharLength: function(str, index)
  {
    var charcode = str.charCodeAt(index);
    if (charcode <= 127)
      return 0;
    var count = this.countUpperBits(charcode);
    if (index+count > str.length)
      return 0;
    for (var i=1;i<count;i++)
    {
      charcode = str.charCodeAt(index+i);
      if (this.countUpperBits(charcode) != 1)
        return 0;
    }
    return count-1;
  },
  
  decodeUTF8: function(str)
  {
    var cc1, cc2, cc3, cc4, value = 0;
    switch (str.length)
    {
      case 1:
        return str.charCodeAt(0);
      case 2:
      {
        cc1 = str.charCodeAt(0);
        cc2 = str.charCodeAt(1);
        return ((cc1 & 31) << 6) | (cc2 & 63);
      }
      case 3:
      {
        cc1 = str.charCodeAt(0);
        cc2 = str.charCodeAt(1);
        cc3 = str.charCodeAt(2);
        return ((cc1 & 15) << 6) | ((cc2 & 63) << 12) | (cc3 & 63);
      }
      case 4:
      {
        cc1 = str.charCodeAt(0);
        cc2 = str.charCodeAt(1);
        cc3 = str.charCodeAt(2);
        cc4 = str.charCodeAt(3);
        return ((cc1 & 7) << 6) | ((cc2 & 63) << 12) | ((cc3 & 63) << 18) | (cc4 & 63);
      }
      default: 
        return 0;
    }
  },
  
  doCorrectUTF8: function(item, property)
  {
    var value = item.getProperty(property);
    if (value)
    {
      var charlen;
      for (var i=0;i<value.length;i++)
      {
        charlen = this.utf8CharLength(value, i);
        if ((charlen > 0) && (charlen <= 3))
        {
          var char = this.decodeUTF8(value.substr(i, charlen+1));
          value = value.substr(0, i) + String.fromCharCode(char) + value.substr(i+charlen+1);
        }
      }
      item.setProperty(property, value);
    }
  },

  doTool: function(toolName) {
    if (this._parent.getIsLocked())
      return;
    if (typeof(this[toolName]) != "function")
      throw "tool \""+toolName+"\" is not a function.";
    var properties = new Array();
    var autoCommit = null;
    if (this._parent.autocommit)
      autoCommit = new TaggerCommit();
    for (var i=0;i<this.mapping.length;i++)
    {
      if (this.xul.checkbox[i].checked)
      {
        var prop = "http://songbirdnest.com/data/1.0#"+this.mapping[i];
        if (autoCommit)
          autoCommit.addProperty(prop);
        properties.push(prop);
      }
    }
    if (properties.length == 0)
    {
      alert(this._parent._strings.getString("taggerWindowNoAttributesToModify"));
      return;
    }
    
    var selection = this._parent.getMediaListView().selection;
    var count = selection.count;
    if (!this._parent.askConfirmation(count))
      return;
    var items = selection.selectedMediaItems;
    var item;
    this.func = this[toolName];
    for (var i = 0; i<count; i++)
    {
      item = items.getNext();
      for (var j = 0; j<properties.length; j++)
      {
        this.func(item, properties[j]);
      }
      if (autoCommit)
        autoCommit.addItem(item);
    }
    if (autoCommit)
      autoCommit.commit();
  }
}