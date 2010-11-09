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
function TaggerAction_CondSelect_Execute(state)
{
  switch (this["source"].value)
  {
    case 0:
    {
      // From whole list
      var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                       .getInterface(Components.interfaces.nsIWebNavigation)
                       .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                       .rootTreeItem
                       .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                       .getInterface(Components.interfaces.nsIDOMWindow);
      var gBrowser = mainWindow.gBrowser;
      var list = gBrowser.tabContainer.getItemAtIndex(0).mediaListView.mediaList;
      var count = list.length;
      var selection = new Array(count);
      var arrayI = 0;
      var item;
      var evaluation;
      var condlink = this["conditionlink"].value;
      var invert = this["invert"].value;
      var optimize = this["optimize"].value;
      var conditions = this["conditions"].value;
      for (var i=0;i<count;i++)
      {
        item = list.getItemByIndex(i);
        state.context.item = item;
        
        evaluation = state.evaluateConditions(conditions, condlink, optimize);
        if (invert)
          evaluation = !evaluation;
          
        if (evaluation)
        {
          selection[arrayI] = item;
          arrayI++;
        }
      }
      selection.splice(arrayI, selection.length - arrayI);
      state.selection = selection;
      return;
    }
    case 1:
    {
      // From current filtered view
      var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                       .getInterface(Components.interfaces.nsIWebNavigation)
                       .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                       .rootTreeItem
                       .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                       .getInterface(Components.interfaces.nsIDOMWindow);
      var gBrowser = mainWindow.gBrowser;
      var view = gBrowser.tabContainer.getItemAtIndex(0).mediaListView;
      var count = view.length;
      var selection = new Array(count);
      var arrayI = 0;
      var item;
      var evaluation;
      var condlink = this["conditionlink"].value;
      var invert = this["invert"].value;
      var optimize = this["optimize"].value;
      var conditions = this["conditions"].value;
      for (var i=0;i<count;i++)
      {
        item = view.getItemByIndex(i);
        state.context.item = item;
        
        evaluation = state.evaluateConditions(conditions, condlink, optimize);
        if (invert)
          evaluation = !evaluation;
          
        if (evaluation)
        {
          selection[arrayI] = item;
          arrayI++;
        }
      }
      selection.splice(arrayI, selection.length - arrayI);
      state.selection = selection;
      return;
    }
    case 2:
    {
      // Previous selection in the state
      var previousSelection = state.selection;
      var selection = new Array(previousSelection.length);
      var arrayI = 0;
      var item;
      var condlink = this["conditionlink"].value;
      var invert = this["invert"].value;
      var optimize = this["optimize"].value;
      var conditions = this["conditions"].value;
      for (var i=0;i<previousSelection.length;i++)
      {
        item = previousSelection[i];
        state.context.item = item;
        
        evaluation = state.evaluateConditions(conditions, condlink, optimize);
        if (invert)
          evaluation = !evaluation;
          
        if (evaluation)
        {
          selection[arrayI] = item;
          arrayI++;
        }
      }
      selection.splice(arrayI, selection.length - arrayI);
      state.selection = selection;
      return;
    }
    default: throw "Invalid enum value.";
  }
}

function TaggerAction_CondSelect()
{
  this.properties = new Array(
    new TAProp("source", i18n("source"), {"id": TA_PROPTYPE_ENUM, "values": new Array(
      new TAEnumValue("library", i18n("wholelibrary")),
      new TAEnumValue("filteredlibrary", i18n("filteredlibrary")),
      new TAEnumValue("currentselection", i18n("currentselection"))
    )}, false),
    new TAProp("conditionlink", i18n("conditionlink"), {"id": TA_PROPTYPE_ENUM, "values": new Array(
      new TAEnumValue("and", i18n("condlink_and")), 
      new TAEnumValue("or", i18n("condlink_or")),
      new TAEnumValue("xor", i18n("condlink_xor"))
    )}, false),
    new TAProp("invert", i18n("invert"), {"id": TA_PROPTYPE_BOOL}, false),
    new TAProp("optimize", i18n("optimize"), {"id": TA_PROPTYPE_BOOL}, false),
    new TAProp("conditions", i18n("conditions"), {"id": TA_PROPTYPE_CONDITIONLIST}, false)
  );
  this.displayName = i18n("condselect");
  this.execute = TaggerAction_CondSelect_Execute;
  this.toString = TaggerAction_ToString;
  this.cc = TaggerAction_CondSelect;
  TaggerAction_Super(this);
}

TARegister(TaggerAction_CondSelect, "condselect", TA_ACTIONTYPE_SELECTION);