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
function TaggerAction_RECond_Evaluate(state)
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
  var returnValue;
  if ((!value) || (value == null) || (value.length == 0))
  {
    returnValue = false;
  }
  else
  {
    var flags;
    if (this["ignorecase"].value)
      flags = "i";
    else
      flags = "";
    var regexp = new RegExp(this["expression"].value);
    returnValue = regexp.test(value);
  }
  if (this["invert"].value)
    returnValue = !returnValue;
  if (returnValue)
    state.executeActionList(this["trueactions"].value);
  else
    state.executeActionList(this["falseactions"].value);
  return returnValue;
}

function TaggerAction_RECond()
{
  this.class="new TaggerAction_RECond();";
  this.properties = new Array(
    new TAProp("expression", i18n("expression"), {"id": TA_PROPTYPE_STRING}, false),
    TAProp_Attribute("attribute", i18n("attribute")),
    new TAProp("ignorecase", i18n("caseinsensitive"), {"id": TA_PROPTYPE_BOOL}, false),
    new TAProp("trim", i18n("trim"), {"id": TA_PROPTYPE_BOOL}, false),
    new TAProp("invert", i18n("invert"), {"id": TA_PROPTYPE_BOOL}, false),
    new TAProp("trueactions", i18n("trueactions"), {"id": TA_PROPTYPE_ACTIONLIST}, false),
    new TAProp("falseactions", i18n("falseactions"), {"id": TA_PROPTYPE_ACTIONLIST}, false)
  );
  this.displayName = i18n("recond");
  this.evaluate = TaggerAction_RECond_Evaluate;
  this.toString = TaggerCondition_ToString;
  this.cc = TaggerAction_RECond;
  this.prepare = TaggerAction_Conditional_Prepare;
  TaggerAction_Super(this);
}

TCRegister(TaggerAction_RECond, "recond");