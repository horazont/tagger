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
var PreferencesController = {
  i18n: function(name)
  {
    return document.getElementById(name).getAttribute("label");
  },
  
  

  init: function()
  {
    // Determine the main window for later use
    /*this.mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                       .getInterface(Components.interfaces.nsIWebNavigation)
                       .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                       .rootTreeItem
                       .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                       .getInterface(Components.interfaces.nsIDOMWindow);
    window.addEventListener("close", this.unload, false);*/
  },
  
  changeOSFlag: function(newValue)
  {
    alert(this.i18n("options-osflag-warning"));
  },
  
  unload: function()
  {
    /*alert("meow");
    if (this.mainWindow)
    {
      alert("item count: "+this.mainWindow.__taggerHelper.list.length);
      for (var i=0;i<this.mainWindow.__taggerHelper.list.length;i++)
      { 
        alert("notifing tagger instance");
        this.mainWindow.__taggerHelper.list[i].loadGlobalSettings();
      }
    }
    else
    {
      alert(this.i18n("options-refreshwarning"));
    }*/
  }

}