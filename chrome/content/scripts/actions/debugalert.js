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
function TaggerAction_DebugAlert_Execute(state)
{
  var propURL = "http://songbirdnest.com/data/1.0#"+this["attribute"].values[this["attribute"].value].value;
  var item = state.context.item;
  alert(propURL+"\n"+item.getProperty(propURL));
}

function TaggerAction_DebugAlert()
{
  this.properties = new Array(
    TAProp_Attribute("attribute", i18n("attribute"))
  );
  this.displayName = i18n("debugalert");
  this.execute = TaggerAction_DebugAlert_Execute;
  this.toString = TaggerAction_ToString;
  this.cc = TaggerAction_DebugAlert;
  TaggerAction_Super(this);
}

TARegister(TaggerAction_DebugAlert, "debugalert", TA_ACTIONTYPE_PERITEM);