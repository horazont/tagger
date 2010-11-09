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

function TaggerTokenparser2(taggerInstance)
{
  this._tagger = taggerInstance;

  this.addParserToken(
    new Array("t", "trackname", "title"),
    "trackName",
    0,
    0
  );
  this.addParserToken(
    new Array("a", "artistname", "artist"),
    "artistName",
    0,
    2
  );
  this.addParserToken(
    new Array("b", "albumname", "album"),
    "albumName",
    0,
    1
  );
  this.addParserToken(
    new Array("albumartistname", "albumartist"),
    "albumArtistName",
    0,
    6
  );
  this.addParserToken(
    new Array("genre"),
    "genre",
    0
  );
  this.addParserToken(
    new Array("composer", "composername"),
    "composerName",
    0,
    7
  );
  this.addParserToken(
    new Array("comment"),
    "comment",
    0
  );
  this.addParserToken(
    new Array("n", "tracknumber", "track"),
    "trackNumber",
    1,
    3
  );
  this.addParserToken(
    new Array("c", "discnumber", "disc"),
    "discNumber",
    1,
    4
  );
  this.addParserToken(
    new Array("trackcount", "totaltracks"),
    "totalTracks",
    1
  );
  this.addParserToken(
    new Array("disccount", "totaldiscs"),
    "totalDiscs",
    1
  );
  this.addParserToken(
    new Array("y", "year"),
    "year",
    4,
    5
  );
}

TaggerTokenparser2.prototype = {
  _tokenList: new Array(
  
  ),
  
  addParserToken: function(token, property, kind, infoidx)
  {
    if (token.constructor == Array)
    {
      for (var i=0;i<token.length;i++)
        this._tokenList.push(new TaggerTokenparserToken(token[i], property, kind, infoidx));
    }
    else
    {
      this._tokenList.push(new TaggerTokenparserToken(token, property, kind, infoidx));
    }
  },
    
  _tokenObjectByToken: function(token) {
    token = token.toLowerCase();
    for (var i=0;i<this._tokenList.length;i++)
    {
      var tokenObj = this._tokenList[i];
      if (tokenObj.token == token)
        return tokenObj;
    }
    return null;
  },
  
  processSpecialChars: function(buffer, allowEndOfPattern) {
    var slashPos = buffer.indexOf("\\");
    var slashChar = "";
    var idxOffset = 0;
    var expression = "";
    while (slashPos >= 0)
    {
      slashChar = buffer.charAt(slashPos+1);
      if (slashPos > 0)
        expression += this._tagger.escapeExpression(buffer.substr(0, slashPos));
      buffer = buffer.substr(slashPos+2);
      slashPos = buffer.indexOf("\\");
      if (slashChar == "t")
      {
        expression += "\\x09";
      }
      else if (slashChar == "n")
      {
        if (allowEndOfPattern)
        {
          //expression += "(\\x0D\\x0A|\\x0D|\\x0A|$)";
          expression += "(\\x0D|\\x0A|$)+";
          idxOffset++;
        }
        else
        {
          expression += "(\\x0D|\\x0A)+";
          idxOffset++;
        }
      }
      else
      {
        expression += this._tagger.escapeExpression(slashChar);
      }
    }
    if (buffer.length > 0)
      expression += this._tagger.escapeExpression(buffer);
    var result = {};
    result.str = expression;
    result.idxOffset = idxOffset;
    return result;
  },

  init: function(format, dirSupport, specialChars) {
    this.dirSupport = dirSupport
    this.initialFormat = format;

    var expression = "";
    //var titleIdx = -1, albumIdx = -1, artistIdx = -1, numberIdx = -1, cdNumberIdx = -1, yearIdx = -1;
    var tokens = new Array();
    var usedProps = new Array();
    var currIdx = 1;
    var currPos;
    var lastPos = 0;
    var currChar;
    var selector;
    if (this.dirSupport)
    {
      selector = "[^/]";
      expression = "((.*?)/)?(";
      currIdx = 4;
    }
    else
      selector = ".";
    
    var lastIndex = 0;
    while (
      (
        match = (
          regexp = new RegExp("%(\\.*)(\\*|[a-zA-Z]+)%", "g")
        ).exec(format.substr(lastIndex))
      ) != null
    )
    {
      var matchIndex = 0;
      var matchRaw = match[matchIndex++];
      var matchDots = match[matchIndex++];
      var matchToken = match[matchIndex++];
    
      lastIndex += regexp.lastIndex;
      prev = RegExp.leftContext;
      if (matchDots)
      {
        prev += "%"+matchRaw.substr(2);
        matchToken = "";
      }
      if ((prev) && (prev.length > 0))
      {
        if (specialChars)
        {
          var parsed = this.processSpecialChars(prev);
          expression += parsed.str;
          currIdx += parsed.idxOffset;
        }
        else
          expression += this._tagger.escapeExpression(prev);
      }
      if ((tokenObj = this._tokenObjectByToken(matchToken)) != null)
      {
        if (usedProps.join(",").indexOf(tokenObj.prop) >= 0)
        {
          alert("token already defined: "+tokenObj.prop);
          throw {msg: "taggerWindowTokenAlreadyDefined", fmt: {"%s": tokenObj.prop}};
        }
        
        var entry = {};
        entry.token = tokenObj;
        entry.idx = currIdx;
        
        switch (tokenObj.kind)
        {
          case 0:
          {
            expression += "("+selector+"*?)";
            break;
          }
          case 1:
          {
            expression += "([0-9]*?)";
            break;
          }
          case 4:
          {
            expression += "([0-9]{2}|[0-9]{4})";
            break;
          }
          default:
          {
            alert("DEBUG: unknown token kind");
            throw {msg: "Unknown token kind: "+tokenObj.kind};
          }
        }
        currIdx++;
        usedProps.push(tokenObj.prop);
        tokens.push(entry);
      }
      else if (matchToken == "*")
      {
        currIdx++;
        expression += "("+selector+"*?)";
      }
      else if (matchToken != "")
      {
        alert("unknown placeholder: "+match[2]);
        throw {msg: "taggerWindowUnknownPlaceholder", fmt: {"%s": match[2]}};
      }
    }
    format = format.substr(lastIndex);
    if (format.length > 0)
    {
      if (specialChars)
      {
        expression += this.processSpecialChars(format).str;
      }
      else
        expression += this._tagger.escapeExpression(format);
    }
    else
    {
      if (expression.substr(-3) == "*?)")
        expression = expression.substr(0, expression.length-2)+")";
    }
    if (this.dirSupport)
      expression += ")$";
    this.fmtExpression = expression;
    this.fmtTokens = tokens;
  },
  
  getInitialFormat: function()
  {
    return this.initialFormat;
  },

  preprocessFileName: function(fileURL, autoUpCase, replace_) {
    var lastSeparator = fileURL.lastIndexOf("/");
    var fileName;
    if (this.dirSupport)
      fileName = fileURL;
    else
      fileName = fileURL.substr(lastSeparator+1);
    var extensionSeparator = fileName.lastIndexOf(".");
    if (extensionSeparator >= 0)
      fileName = fileName.substr(0, extensionSeparator);
    fileName = this._tagger.decodeFileName(fileName);// urldecode(fileName);
    
    if (autoUpCase)
    {
      fileName = this.autoUpCase(fileName);
    }
    if (replace_)
      fileName = fileName.replace(/_/g, " ");
    
    return fileName;
  },
  
  autoUpCase: function(input)
  {
    var lastNonAlpha = true;
    var thisAlpha;
    var charcode;
    for (var i=0;i<input.length;i++)
    {
      charcode = input.charCodeAt(i);
      thisAlpha = ((charcode >= 65) && (charcode <= 90)) || ((charcode >= 97) && (charcode <= 122)) || ((charcode >= 192) && (charcode <= 246)) || ((charcode >= 249) && (charcode <= 255)) || (charcode == 39);
      if (lastNonAlpha && thisAlpha)
        input = input.substr(0, i) + input.substr(i, 1).toUpperCase() + input.substr(i+1);
      lastNonAlpha = !thisAlpha;
    }
    return input;
  },
  
  getDataFromMatch: function(match)
  {
    var props = {};
    if (match != null)
    {
      if (this.dirSupport)
        props.matchdata = match[3];
      else
        props.matchdata = match[0];
      for (var i=0;i<this.fmtTokens.length;i++)
      {
        var value = match[this.fmtTokens[i].idx];
        props[this.fmtTokens[i].token.prop] = value;
      }
    }
    else
    {
      return null;
    }
    return props;
  },

  processString: function(str) {
    var regExpr = new RegExp(this.fmtExpression, "");
    return this.getDataFromMatch(regExpr.exec(str));
  },
  
  processStringAsInfo: function(str) {
    var info = {};
    var regExpr = new RegExp(this.fmtExpression, "");
    var match = regExpr.exec(str);
    if (match != null)
    {
      if (this.dirSupport)
        info.matchdata = match[3];
      else
        info.matchdata = match[0];
      for (var i=0;i<this.fmtTokens.length;i++)
      {
        var value = match[this.fmtTokens[i].idx];
        info[this.fmtTokens[i].token.infoidx] = value;
      }
    }
    else
    {
      return null;
    }
    return info;
  }
  
}
