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
function TaggerAction_ClearCommitCache_Execute(state)
{
  state.commitCache = new Array();
}

function TaggerAction_ClearCommitCache()
{
  this.properties = new Array(
  );
  this.displayName = i18n("clearcommitcache");
  this.execute = TaggerAction_ClearCommitCache_Execute;
  this.toString = TaggerAction_ToString;
  this.cc = TaggerAction_ClearCommitCache;
  TaggerAction_Super(this);
}

TARegister(TaggerAction_ClearCommitCache, "clearcommitcache", TA_ACTIONTYPE_GENERAL);