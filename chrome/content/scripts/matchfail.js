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
if (typeof TaggerMatchfail == 'undefined') {
  var TaggerMatchfail = {};
}

TaggerMatchfail.Controller = {

  onLoad: function(window) {
    this.window = window;
    this.info = window.arguments[0];
    
    this.fileName = document.getElementById("fileName");
    this.trackName = document.getElementById("trackName");
    this.albumName = document.getElementById("albumName");
    this.artistName = document.getElementById("artistName");
    
    this.fileName.value = this.info.fileName;
    this.fileName.readonly = "true";
    this.trackName.value = this.info.trackName;
    this.albumName.value = this.info.albumName;
    this.artistName.value = this.info.artistName;
    this.info.skipped = true;
  },

  skip: function() {
    this.info.skipped = true;
    this.window.close();
  },
  
  skipAll: function() {
    this.info.skipped = true;
    this.info.skipAll = true;
    this.window.close();
  },
  
  setInfo: function() {
    this.info.skipped = false;
    this.info.trackName = this.trackName.value;
    this.info.albumName = this.albumName.value;
    this.info.artistName = this.artistName.value;
    this.window.close();
  },
}

window.addEventListener("load", function(e) { TaggerMatchfail.Controller.onLoad(e.currentTarget); }, false);
