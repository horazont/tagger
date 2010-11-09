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
function TaggerAction_Set_Execute(state)
{
  var item = state.context.item;
  var base = "http://songbirdnest.com/data/1.0#";
  var propURL;
  var tokenparser = new TaggerTokenparser();
  var value;
  for (var i=0;i<this.properties.length;i++)
  {
    var prop = this.properties[i];
    if (prop.value == null)
      continue;
    propURL = base + prop.name;
    tokenparser.init(prop.value, null);
    value = tokenparser.execute(item);
    item.setProperty(propURL, value);
  }
}

function TaggerAction_Set()
{
  this.properties = new Array(
    new TAProp("trackName", i18n("trackName"), {"id": TA_PROPTYPE_STRING}, true),
    new TAProp("artistName", i18n("artistName"), {"id": TA_PROPTYPE_STRING}, true),
    new TAProp("albumName", i18n("albumName"), {"id": TA_PROPTYPE_STRING}, true),
    new TAProp("albumArtistName", i18n("albumArtistName"), {"id": TA_PROPTYPE_STRING}, true),
    new TAProp("genre", i18n("genre"), {"id": TA_PROPTYPE_STRING}, true),
    new TAProp("year", i18n("year"), {"id": TA_PROPTYPE_STRING}, true),
    new TAProp("trackNumber", i18n("trackNumber"), {"id": TA_PROPTYPE_INT}, true),
    new TAProp("trackCount", i18n("trackCount"), {"id": TA_PROPTYPE_INT}, true),
    new TAProp("discNumber", i18n("discNumber"), {"id": TA_PROPTYPE_INT}, true),
    new TAProp("discCount", i18n("discCount"), {"id": TA_PROPTYPE_INT}, true),
    new TAProp("comment", i18n("comment"), {"id": TA_PROPTYPE_TEXT}, true)
  );
  this.displayName = i18n("settags");
  this.execute = TaggerAction_Set_Execute;
  this.toString = TaggerAction_ToString;
  this.cc = TaggerAction_Set;
  TaggerAction_Super(this);
}

TARegister(TaggerAction_Set, "settags", TA_ACTIONTYPE_PERITEM);