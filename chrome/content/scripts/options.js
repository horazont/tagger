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
function TaggerOptionsController(ownWindow)
{
  this._window = ownWindow;
  if (!this._window.arguments)
    this._mainWindow = null;
  else
    this._mainWindow = this._window.arguments[0];
  this.xul = {};
  this.xul.autocommit = document.getElementById("general-autocommit");
  this.xul.donotask = document.getElementById("general-donotask");
  this.xul.osflag = document.getElementById("extended-osflag");
  this.xul.tabs = document.getElementById("tabs");
  if ((this._window.arguments) && (this._window.arguments.length >= 2) && (this._window.arguments[1] >= 0))
  {
    this.xul.tabs.selectedIndex = this._window.arguments[1];
  }
  this.loadSettings();
}

TaggerOptionsController.prototype = {
  loadSettings: function() {
    var value;
    if ((value = Application.prefs.get("extensions.tagger.autocommit")) != null)
      this.xul.autocommit.checked = value.value;
    if ((value = Application.prefs.get("extensions.tagger.donotask")) != null)
      this.xul.donotask.checked = value.value;
    if ((value = Application.prefs.get("extensions.tagger.osflag")) != null)
    {
      this.osflag = value.value;
      this.xul.osflag.selectedIndex = value.value;
    }
    else
      this.osflag = -1;
  },
  
  saveSettings: function() {
    Application.prefs.setValue("extensions.tagger.autocommit", this.xul.autocommit.checked);
    Application.prefs.setValue("extensions.tagger.donotask", this.xul.donotask.checked);
    Application.prefs.setValue("extensions.tagger.osflag", this.xul.osflag.selectedIndex);
  },
  
  saveAndClose: function() {
    this.saveSettings();
    if ((this._mainWindow != null) && (this._mainWindow.__taggerHelper))
    {
      for (var i=0;i<this._mainWindow.__taggerHelper.list.length;i++)
        this._mainWindow.__taggerHelper.list[i].loadGlobalSettings();
    }
    else if (!this._mainWindow)
    {
      alert(document.getElementById("options-refreshwarning").textContent);
    }
    this._window.close();
  },
  
  cancel: function() {
    if (this.osflag == -1)
    {
      alert(document.getElementById("options-osflag-mustbeset").textContent);
      return;
    }
    this._window.close();
  },
  
  changeOSFlag: function(newValue)
  {
    if ((newValue != this.osflag) && (this.osflag != -1))
    {
      alert(document.getElementById("options-osflag-warning").textContent);
    }
  }
};

var Controller = null;

function Tagger_doLoad(event)
{
  Controller = new TaggerOptionsController(event.currentTarget);
}

window.addEventListener("load", function(e) {Tagger_doLoad(e);}, false);
