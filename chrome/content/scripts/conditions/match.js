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
function TaggerAction_Match_Evaluate(state)
{
  var propURL = "http://songbirdnest.com/data/1.0#"+this["attribute"].values[this["attribute"].value].value;
  var value = state.context.item.getProperty(propURL);
  if (this["trim"].value)
  {
    var i, j;
    for (i=0;i<value.length;i++)
    {
      if (value.charCodeAt(i) > 32)
        break;
    }
    for (j=value.length-1;j>=i;j--)
    {
      if (value.charCodeAt(j) > 32)
        break;
    }
    value = value.substring(i, j+1);
  }
  var compareTo = this["value"].value;
  var returnValue;
  if ((!value) || (value == null) || (value.length == 0))
  {
    if (compareTo)
      returnValue = false;
    else
      returnValue = true;
  }
  else
  {
    if (this["ignorecase"].value)
    {
      value = value.toLowerCase();
      compareTo = compareTo.toLowerCase();
    }
    switch (this["matchmode"].value)
    {
      case 0:
      {
        // Look for exact match
        returnValue = (value == compareTo);
        break;
      }
      case 1:
      {
        // Look for match at the beginning
        returnValue = (value.substr(0, compareTo.length) == compareTo);
        break;
      }
      case 2:
      {
        // Look for a match at the end
        returnValue = (value.substr(-compareTo.length) == compareTo);
        break;
      }
      case 3:
      {
        // Look for a match anywhere.
        returnValue = (value.indexOf(compareTo) >= 0);
        break;
      }
      default: throw "Invalid enum value.";
    }
  }
  if (this["invert"].value)
    returnValue = !returnValue;
  if (returnValue)
    state.executeActionList(this["trueactions"].value);
  else
    state.executeActionList(this["falseactions"].value);
  return returnValue;
}

function TaggerAction_Match()
{
  this.properties = new Array(
    TAProp_Attribute("attribute", i18n("attribute")),
    new TAProp("matchmode", i18n("matchmode"), {"id": TA_PROPTYPE_ENUM, "values": new Array(
      new TAEnumValue("exact", i18n("match.exact")),
      new TAEnumValue("begin", i18n("match.begin")),
      new TAEnumValue("end", i18n("match.end")),
      new TAEnumValue("contains", i18n("match.contains"))
    )}, false),
    new TAProp("value", i18n("value"), {"id": TA_PROPTYPE_STRING}, false),
    new TAProp("ignorecase", i18n("caseinsensitive"), {"id": TA_PROPTYPE_BOOL}, false),
    new TAProp("trim", i18n("trim"), {"id": TA_PROPTYPE_BOOL}, false),
    new TAProp("invert", i18n("invert"), {"id": TA_PROPTYPE_BOOL}, false),
    new TAProp("trueactions", i18n("trueactions"), {"id": TA_PROPTYPE_ACTIONLIST}, false),
    new TAProp("falseactions", i18n("falseactions"), {"id": TA_PROPTYPE_ACTIONLIST}, false)
  );
  this.displayName = i18n("match");
  this.evaluate = TaggerAction_Match_Evaluate;
  this.toString = TaggerCondition_ToString;
  this.cc = TaggerAction_Match;
  this.prepare = TaggerAction_Conditional_Prepare;
  TaggerAction_Super(this);
}

TCRegister(TaggerAction_Match, "match");