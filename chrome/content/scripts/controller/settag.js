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

function TaggerSetTagController(parentController)
{
  this._parent = parentController;
  this.xul = {};
  this.xul.checkbox = new Array();
  this.xul.value = new Array();
  this.xul.all = document.getElementById("settags-all");
  this.xul.keeptags = document.getElementById("settags-keeptags");
  for (var i=0;i<this.mapping.length;i++)
  {
    var checkbox = document.getElementById("settags-"+this.mapping[i]);
    checkbox.mappingIndex = i;
    this.xul.checkbox.push(checkbox);
    this.xul.value.push(document.getElementById("settags-"+this.mapping[i]+"-value"));
  }
}

TaggerSetTagController.prototype = {
  mapping: new Array(
    "trackName",
    "albumName",
    "artistName",
    "albumArtistName",
    "composerName",
    "genre",
    "year",
    "trackNumber",
    "totalTracks",
    "discNumber",
    "totalDiscs",
    "comment"
  ),

  loadSettings: function() {
    var value;
    if ((value = Application.prefs.get("extensions.tagger.settags.keeptags")) != null)
      this.xul.keeptags.checked = value.value;
    var mappingName;
    var enabledCount = 0;
    for (var i=0;i<this.mapping.length;i++)
    {
      mappingName = this.mapping[i];
      if ((value = Application.prefs.get("extensions.tagger.settags."+mappingName+".enabled")) != null)
      {
        this.switchOne(i, value.value);
        if (value.value)
          enabledCount++;
      }
      if ((value = Application.prefs.get("extensions.tagger.settags."+mappingName+".value")) != null)
        this.xul.value[i].value = value.value;
    }
    if (enabledCount >= 5)
      this.xul.all.checked = true;
  },

  saveSettings: function() {
    var mappingName;
    for (var i=0;i<this.mapping.length;i++)
    {
      mappingName = this.mapping[i];
      Application.prefs.setValue("extensions.tagger.settags."+mappingName+".enabled", this.xul.checkbox[i].checked);
      Application.prefs.setValue("extensions.tagger.settags."+mappingName+".value", this.xul.value[i].value);
    }
    Application.prefs.setValue("extensions.tagger.settags.keeptags", this.xul.keeptags.checked);
  },

  setAllClick: function(cb) {
    var checked = cb.checked;
    for (var i=0;i<this.mapping.length;i++)
    {
      this.switchOne(i, checked);
    }
    /*this.xul.trackName.checked = checked;
    this.xul.albumName.checked = checked;
    this.xul.artistName.checked = checked;
    this.xul.albumArtistName.checked = checked;
    this.xul.composerName.checked = checked;
    this.xul.genre.checked = checked;
    this.xul.year.checked = checked;
    this.xul.trackNumber.checked = checked;
    this.xul.discNumber.checked = checked;
    this.xul.comment.checked = checked;*/
  },
  
  switchOne: function(idx, newState)
  {
    this.xul.checkbox[idx].checked = newState;
    this.xul.value[idx].disabled = !newState;
  },
  
  switchCheckBox: function(cb)
  {
    var idx = cb.mappingIndex;
    var checked = cb.checked;
    this.xul.value[idx].disabled = !checked;
  },

  setTags: function() {
    if (this._parent.getIsLocked())
      return;
    var properties = new Array();
    var autoCommit = null;
    if (this._parent.autocommit)
      autoCommit = new TaggerCommit();
    for (var i=0;i<this.mapping.length;i++)
    {
      if (this.xul.checkbox[i].checked)
      {
        var obj = {};
        obj.prop = "http://songbirdnest.com/data/1.0#"+this.mapping[i];
        obj.val = this.xul.value[i];
        obj.parser = new TaggerTokenparser();
        obj.parser.init(obj.val.value, null);
        if (autoCommit)
          autoCommit.addProperty(obj.prop);
        properties.push(obj);
      }
    }
    if (properties.length == 0)
    {
      alert(this._parent._strings.getString("taggerWindowNoAttributesToWrite"));
      return;
    }
    
    var selection = this._parent.getMediaListView().selection;
    var count = selection.count;
    if (!this._parent.askConfirmation(count))
      return;
    var items = selection.selectedMediaItems;
    var item;
    for (var i = 0; i<count; i++)
    {
      item = items.getNext();
      if (this.xul.keeptags.checked)
      {
        for (var j = 0;j<properties.length;j++)
        {
          if (item.getProperty(properties[j].prop) == null)
          {
            item.setProperty(properties[j].prop, properties[j].parser.execute(item));
            
          }
        }
      }
      else
      {
        for (var j = 0;j<properties.length;j++)
        {
          try
          {
            item.setProperty(properties[j].prop, properties[j].parser.execute(item));
          } catch (e)
          {
            //
          }
        }
      }
      if (autoCommit)
        autoCommit.addItem(item);
    }
    if (autoCommit)
      autoCommit.commit();
  },
  
 
  getTags: function() {
    if (this._parent.getIsLocked())
      return;
    var item = this._parent.getSampleItem();  
    for (var i=0;i<this.mapping.length;i++)
    {
      if (this.xul.checkbox[i].checked)
      {
        this.xul.value[i].value=item.getProperty("http://songbirdnest.com/data/1.0#"+this.mapping[i]);
      }
    }
  }

}
