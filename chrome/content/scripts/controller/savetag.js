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

function TaggerSaveTagController(parentController)
{
  this._parent = parentController;
  this.xul = {};
  this.xul.all = document.getElementById("save-all");
  this.xul.title = document.getElementById("save-title");
  this.xul.album = document.getElementById("save-album");
  this.xul.artist = document.getElementById("save-artist");
  this.xul.albumArtist = document.getElementById("save-albumArtist");
  this.xul.composer = document.getElementById("save-composer");
  this.xul.genre = document.getElementById("save-genre");
  this.xul.year = document.getElementById("save-year");
  this.xul.trackNumber = document.getElementById("save-trackNumber");
  this.xul.discNumber = document.getElementById("save-discNumber");
  this.xul.comment = document.getElementById("save-comment");
}

TaggerSaveTagController.prototype = {
  loadSettings: function() {

  },

  saveSettings: function() {

  },

  saveAllClick: function(cb) {
    var checked = cb.checked;
    this.xul.title.checked = checked;
    this.xul.album.checked = checked;
    this.xul.artist.checked = checked;
    this.xul.albumArtist.checked = checked;
    this.xul.composer.checked = checked;
    this.xul.genre.checked = checked;
    this.xul.year.checked = checked;
    this.xul.trackNumber.checked = checked;
    this.xul.discNumber.checked = checked;
    this.xul.comment.checked = checked;
  },

  saveTags: function() {
    if (this._parent.getIsLocked())
      return;
    //var properties = new Array();
    var selection = this._parent.getMediaListView().selection;
    var count = selection.count;
    var failed = new Array();
    if (!this._parent.askConfirmation(count))
      return;
    var commit = new TaggerCommit();
    if (this.xul.title.checked)
      commit.addProperty(SBProperties.trackName);
    if (this.xul.artist.checked)
      commit.addProperty(SBProperties.artistName);
    if (this.xul.album.checked)
      commit.addProperty(SBProperties.albumName);
    if (this.xul.albumArtist.checked)
      commit.addProperty(SBProperties.albumArtistName);
    if (this.xul.genre.checked)
      commit.addProperty(SBProperties.genre);
    if (this.xul.composer.checked)
      commit.addProperty(SBProperties.composerName);
    if (this.xul.year.checked)
      commit.addProperty(SBProperties.year);
    if (this.xul.trackNumber.checked)
      commit.addProperty(SBProperties.trackNumber);
    if (this.xul.discNumber.checked)
      commit.addProperty(SBProperties.discNumber);
    if (this.xul.comment.checked)
      commit.addProperty(SBProperties.comment);
      
    this._parent.lockUI();
    try
    {
      this._parent.initProgress(count);
      this._parent.updateProgress(0);
      var i=0, j=0;
      selection = selection.selectedMediaItems;
      while (selection.hasMoreElements())
      {
        var item = selection.getNext();
        commit.addItem(item, true);
        i++; j++;
        if (j >= 10)
        {
          j = 0;
          this._parent.updateProgress(i);
        }
      }
      this._parent.updateProgress(0, -1);
      commit.commit();
      this._parent.updateProgress(0, 1);
    }
    finally
    {
      this._parent.unlockUI();
    }
  }
}