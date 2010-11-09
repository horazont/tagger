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
TaggerSelectMediaTab = {
  onLoad: function(window)
  {
    this.window = window;
    this.prop = window.arguments[0];
    this.state = window.arguments[1];
    this.gBrowser = window.arguments[2];
    
    this.xul = {};
    this.xul.tabList = document.getElementById("tablist");
    this.xul.tabMenu= document.getElementById("tabmenu");
    this.xul.propName = document.getElementById("propname");
    
    this.xul.propName.value = this.prop.displayName;
    
    var tabs = this.gBrowser.tabContainer;
    for (var i=0;i<tabs.itemCount;i++)
    {
      var tab = tabs.getItemAtIndex(i);
      if (tab.mediaListView)
      {
        var item = document.createElement("menuitem");
        item.setAttribute("label", tab.label);
        item.setAttribute("value", tab.mediaListView);
        this.xul.tabMenu.appendChild(item);
      }
    }
    this.xul.tabList.selectedIndex = 0;
    
    sizeToContent();
  },
  
  acceptEvaluate: function()
  {
    this.prop.value = this.xul.tabList.selectedItem.value;
    this.state.changed = true;
    return true;
  },
  
  onAccept: function()
  {
    if (this.acceptEvaluate())
      this.window.close();
  }
}

window.addEventListener("load", function(e) { TaggerSelectMediaTab.onLoad(e.currentTarget); }, false);
