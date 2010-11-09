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
function TaggerAction_ActionList_Execute(state)
{
  state.executeActionList(this["actions"].value);
}

function TaggerAction_ActionList_Prepare(state)
{
  state.prepareActionList(this["actions"].value);
}       

function TaggerAction_ActionList()
{
  this.properties = new Array(
    new TAProp("actions", i18n("actions"), {"id": TA_PROPTYPE_ACTIONLIST}, false)
  );
  this.displayName = i18n("actionlist");
  this.execute = TaggerAction_ActionList_Execute;
  this.toString = TaggerAction_ToString;
  this.cc = TaggerAction_ActionList;
  this.prepare = TaggerAction_ActionList_Prepare;
  TaggerAction_Super(this);
}

TARegister(TaggerAction_ActionList, "actionlist", TA_ACTIONTYPE_GENERAL);