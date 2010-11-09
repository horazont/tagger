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
function TaggerAction_FromFileName_Execute(state)
{
  if (this.trivial)
    return;
  var mediaItem = state.context.item;
  var simpleFileName = mediaItem.getProperty("http://songbirdnest.com/data/1.0#contentURL");
  var fileName = this.parser.preprocessFileName(simpleFileName, this["autoUpCase"].value, this["replace_"].value);
  var info = this.parser.processString(fileName);
  
  if (this["keepexisting"].value)
  {
    for (var i=0;i<this.parser.fmtTokens.length;i++)
    {
      var prop = this.parser.fmtTokens[i].token.prop;
      var fullProp = "http://songbirdnest.com/data/1.0#"+prop;
      if (prop == "trackName")
      {
        var trackName = mediaItem.getProperty(fullProp);
        if ((!trackName) || (trackName == simpleFileName))
          mediaItem.setProperty(fullProp, info[prop]);
      }
      else
      {
        if (!mediaItem.getProperty(fullProp))
          mediaItem.setProperty(fullProp, info[prop]);
      }
    }
  }
  else
  {
    for (var i=0;i<this.parser.fmtTokens.length;i++)
    {
      var prop = this.parser.fmtTokens[i].token.prop;
      mediaItem.setProperty("http://songbirdnest.com/data/1.0#"+prop, info[prop]);
    }
  }
}

function TaggerAction_FromFileName_Prepare(state)
{
  this.parser = new TaggerTokenparser2(state);
  this.parser.init(this["fileNameFormat"].value, this["directorySupport"].value);
  this.trivial = (this.parser.fmtTokens.length == 0);
}

function TaggerAction_FromFileName()
{
  this.properties = new Array(
    new TAProp("fileNameFormat", i18n("filenameformat"), {"id": TA_PROPTYPE_STRING}, false),
    new TAProp("autoUpCase", i18n("autoupcase"), {"id": TA_PROPTYPE_BOOL}, false),
    new TAProp("replace_", i18n("replace_"), {"id": TA_PROPTYPE_BOOL}, false),
    new TAProp("directorySupport", i18n("directorysupport"), {"id": TA_PROPTYPE_BOOL}, false),
    new TAProp("keepexisting", i18n("keepexisting"), {"id": TA_PROPTYPE_BOOL}, false)
  );
  this.displayName = i18n("fromfilename");
  this.execute = TaggerAction_FromFileName_Execute;
  this.toString = TaggerAction_ToString;
  this.cc = TaggerAction_FromFileName;
  this.prepare = TaggerAction_FromFileName_Prepare;
  TaggerAction_Super(this);
}

TARegister(TaggerAction_FromFileName, "fromfilename", TA_ACTIONTYPE_PERITEM);