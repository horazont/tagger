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
function TaggerAction_Replace_Execute(state)
{
  var flags = "";
  if (this["ignorecase"].value)
    flags += "i";
  if (this["global"].value)
    flags += "g";
  var expression = this["search"].value;
  if (!this["regexp"].value)
    expression = state.escapeExpression(expression);
  var search = new RegExp(expression, flags);
  var replace = this["replace"].value;
  
  var item = state.context.item;

  var attribute = this["attribute"].value;
  var base = "http://songbirdnest.com/data/1.0#";
  if (attribute == 0)
  {
    // All
    var propURL;
    var values = this["attribute"].values;
    var value;
    for (var i=1;i<values.length;i++)
    {
      propURL = base + values[i].value;
      value = item.getProperty(propURL);
      value = value.replace(search, replace);
      item.setProperty(propURL, value);
    }
  }
  else
  {
    // One
    attribute = this["attribute"].values[attribute].value;
    var propURL = base + attribute;
    var value = item.getProperty(propURL);
    value = value.replace(search, replace);
    item.setProperty(propURL, value);
  }
}

function TaggerAction_Replace()
{
  this.properties = new Array(
    TAProp_Attribute("attribute", i18n("attribute"), true),
    new TAProp("search", i18n("pattern"), {"id": TA_PROPTYPE_STRING}, false),
    new TAProp("replace", i18n("replacewith"), {"id": TA_PROPTYPE_STRING}, false),
    new TAProp("regexp", i18n("regexpsupport"), {"id": TA_PROPTYPE_BOOL}, false),
    new TAProp("ignorecase", i18n("caseinsensitive"), {"id": TA_PROPTYPE_BOOL}, false),
    new TAProp("global", i18n("globalmatch"), {"id": TA_PROPTYPE_BOOL}, false)
  );
  this.displayName = i18n("replace");
  this.execute = TaggerAction_Replace_Execute;
  this.toString = TaggerAction_ToString;
  this.cc = TaggerAction_Replace;
  TaggerAction_Super(this);
}

TARegister(TaggerAction_Replace, "replace", TA_ACTIONTYPE_PERITEM);