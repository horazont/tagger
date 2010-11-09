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
function TaggerAction_ImportSelection_Execute(state)
{
  var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                       .getInterface(Components.interfaces.nsIWebNavigation)
                       .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                       .rootTreeItem
                       .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                       .getInterface(Components.interfaces.nsIDOMWindow);
  var gBrowser = mainWindow.gBrowser;
  var view = gBrowser.tabContainer.getItemAtIndex(0).mediaListView;
  var selection = view.selection;
  var selectionEnumerator = selection.selectedMediaItems;
  var selectionArray = new Array(selection.count);
  var i=0;
  while (selectionEnumerator.hasMoreElements())
  {
    selectionArray[i] = selectionEnumerator.getNext();
    i++;
  }
  state.selection = selectionArray;
}

function TaggerAction_ImportSelection_EditProp_Source(taggerActions, prop)
{
  var state = {};
  state.changed = false;
  taggerActions.mainWindow.openDialog("chrome://tagger/content/select-media-tab.xul", "", "modal=yes", prop, state, taggerActions.gBrowser);
  return state.changed;
}

function TaggerAction_ImportSelection_PropToStr_Source(prop)
{
  if (prop.value == null)
    return "null";
  return prop.value.toString();
}

function TaggerAction_ImportSelection()
{
  this.properties = new Array(
  );
  this.displayName = i18n("importselection");
  this.execute = TaggerAction_ImportSelection_Execute;
  this.toString = TaggerAction_ToString;
  this.cc = TaggerAction_ImportSelection;
  TaggerAction_Super(this);
}

TARegister(TaggerAction_ImportSelection, "importselection", TA_ACTIONTYPE_SELECTION);