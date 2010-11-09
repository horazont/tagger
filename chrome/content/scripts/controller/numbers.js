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
function TaggerNumbersController(parentController)
{
  this._parent = parentController;
  this.Cc = Components.classes;
  this.Ci = Components.interfaces;
  this.xul = {};
  this.xul.hookButton = document.getElementById("numbers-hookselection");
  this.xul.takeButton = document.getElementById("numbers-takeselection");
  this.xul.offset = document.getElementById("numbers-offset");
  this.xul.list = document.getElementById("numbers-list");
  this.hook = null;
  this.lastHook = null;
}

TaggerNumbersController.prototype = {
  loadSettings: function() {
  
  },
  
  saveSettings: function() {
  
  },  
  
  apply: function() {
    if (this._parent.getIsLocked())
      return;
    var count = this.xul.list.getRowCount();
    if (count == 0)
    {
      alert(this._parent._strings.getString("taggerWindowNoTracksInList"));
      return;
    }
    var offset = parseInt(this.xul.offset.value);
    if (!this._parent.askConfirmation(count))
      return;
    var autoCommit;
    if (this._parent.autocommit)
    {
      autoCommit = new TaggerCommit();
      autoCommit.addProperty("http://songbirdnest.com/data/1.0#trackNumber");
    }
    this._parent.initProgress(count);
    for (var i=0;i<count;i++)
    {
      var item = this.xul.list.getItemAtIndex(i);
      var mediaItem = item.data.item;
      if (autoCommit)
        autoCommit.addItem(mediaItem);
      mediaItem.setProperty("http://songbirdnest.com/data/1.0#trackNumber", offset+i+1);
      this._parent.updateProgress(i+1);
    }
    if (autoCommit)
      autoCommit.commit();
  }
}