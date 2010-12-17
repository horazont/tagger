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
function TaggerTokenparser()
{
  this.initialized = false;
  
  this.addParserToken(
    new Array("t", "trackname", "title"),
    "trackName",
    0
  );
  this.addParserToken(
    new Array("a", "artistname", "artist"),
    "artistName",
    0
  );
  this.addParserToken(
    new Array("b", "albumname", "album"),
    "albumName",
    0
  );
  this.addParserToken(
    new Array("albumartistname", "albumartist"),
    "albumArtistName",
    0
  );
  this.addParserToken(
    new Array("genre"),
    "genre",
    0
  );
  this.addParserToken(
    new Array("composer", "composername"),
    "composerName",
    0
  );
  this.addParserToken(
    new Array("comment"),
    "comment",
    0
  );
  this.addParserToken(
    new Array("n", "tracknumber", "track"),
    "trackNumber",
    1
  );
  this.addParserToken(
    new Array("c", "discnumber", "disc"),
    "discNumber",
    1
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
    4
  );
  this.addParserToken(
    new Array("x", "ext", "extension"),
    "",
    2
  );
}

function TaggerTokenparserToken(token, property, kind, infoidx)
{
  this.token = token;
  this.prop = property;
  this.kind = kind;
  this.infoidx = infoidx;
}

TaggerTokenparser.prototype = {
  _tokenList: new Array(
  
  ),
  
  addParserToken: function(token, property, kind)
  {
    if (token.constructor == Array)
    {
      for (var i=0;i<token.length;i++)
        this._tokenList.push(new TaggerTokenparserToken(token[i], property, kind));
    }
    else
    {
      this._tokenList.push(new TaggerTokenparserToken(token, property, kind));
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
  
  _error: 0, // 1: ERR_MISSINGTAG

  init: function(format, requiredTags, presenceFilter) {
    this.format = format;
    if (requiredTags != null)
    {
      this.presenceFilter = 2;
      this.requiredTags = requiredTags;
    }
    else
    {
      if (presenceFilter != null)
        this.presenceFilter = presenceFilter;
      else
        this.presenceFilter = 1;
      this.requiredTags = new Array();
    }
    this.instructions = new Array();
    var expression;
    var match;
    var prev;
    var instruction;
    var token;
    var found = false;
    var lastIndex = 0;
    var currentSkip = 0;
    while (
      (
        (match = 
          (expression = 
            new RegExp("%(\\.+)?(\\:([0-9]+))?(\\?(([0-9]+)|\"(.*?)\")?(\\?*))?([a-zA-Z]+)%", "g")
          ).exec(this.format.substr(lastIndex))
        )
      ) != null
    )
    {
      var matchIndex = 0;
      var matchRaw = match[matchIndex++];
      var matchDots = match[matchIndex++];
      var matchRawZeroFill = match[matchIndex++];
      var matchZeroFill = match[matchIndex++];
      var matchOptional = match[matchIndex++];
      var matchDefaultValueRaw = match[matchIndex++];
      var matchDefaultValueNumeric = match[matchIndex++];
      var matchDefaultValueString = match[matchIndex++];
      var matchSkip = match[matchIndex++];
      var matchToken = match[matchIndex++];
      
      lastIndex += expression.lastIndex;
      prev = RegExp.leftContext;
      if (matchDots)
      {
        prev += "%"+matchRaw.substr(2);
      }
      else
      { 
        token = this._tokenObjectByToken(matchToken);
        if (token == null)
        {
          prev += matchRaw;
        }
        if (prev)
        {
          if ((this.instructions.length > 0) && ((instruction = this.instructions[this.instructions.length-1]).cmd == 0))
          {
            instruction.text += prev;
          }
          else
          {
            instruction = {};
            instruction.cmd = 0;
            instruction.text = prev;
            this.instructions.push(instruction);
            currentSkip--;
          }
        }
        if (token != null)
        {
          instruction = {};
          switch (token.kind)
          {
            case 0:
            case 1:
            case 4:
            {
              instruction.cmd = 1;
              instruction.prop = token.prop;
              instruction.zerofill = false;
              instruction.optional = false;
              if (matchRawZeroFill)
              {
                instruction.zerofill = {};
                instruction.zerofill.count = matchZeroFill;
              }
              if (matchOptional)
              {
                instruction.optional = true;
                if (matchSkip)
                {
                  instruction.nextoptional = matchSkip.length;
                }
                else
                  instruction.nextoptional = 0;
                currentSkip = 1+instruction.nextoptional;
                if (matchDefaultValueRaw)
                {
                  if (matchDefaultValueNumeric)
                  {
                    instruction.defaultValue = matchDefaultValueNumeric;
                  }
                  else if (matchDefaultValueString)
                  {
                    instruction.defaultValue = matchDefaultValueString;
                  }
                }
              }
              if ((this.presenceFilter == 1) && (currentSkip <= 0))
              {
                if (this.requiredTags.join(",").search(token.prop) == -1)
                  this.requiredTags.push(token.prop);
              }
              found = true;
              break;
            }
            case 2:
            {
              instruction.cmd = 2;
              break;
            }
            default: throw "Invalid token kind.";
          }
          this.instructions.push(instruction);
          currentSkip--;
        }
      }
    }
    if (!found)
    {
      this.trivial = true;
      this.trivialText = format;
      this.initialized = true;
      return;
    }
    else
    {
      this.trivial = false;
      this.trivialText = null;
    }
    if ((RegExp.rightContext) && (RegExp.rightContext.length > 0))
    {
      instruction = {};
      instruction.cmd = 0;
      instruction.text = RegExp.rightContext;
      this.instructions.push(instruction);
    }
    this.initialized = true;
  },
  
  execute: function(item) {
    if (!this.initialized)
      throw "Tokenparser was not initialized";
    if (this.trivial)
      return this.trivialText;
    var oldExtension = item.getProperty(SBProperties.contentURL);    
    oldExtension = oldExtension.substr(oldExtension.lastIndexOf(".")+1);
    var instruction;
    var fileName = "";
    var buffer;
    var skip = 0;
    if (this.presenceFilter > 0)
    { 
      for (var i=0;i<this.requiredTags.length;i++)
      {
        buffer = item.getProperty("http://songbirdnest.com/data/1.0#"+this.requiredTags[i]);
        if ((!buffer) || (buffer.length == 0))
        {
          this._error = 1;
          return false;
        }
      }
    }
    for (var i=0;i<this.instructions.length;i++)
    {
      instruction = this.instructions[i];
      if (skip > 0)
      {
        skip--;
        if ((instruction.cmd == 1) && (instruction.nextoptional > skip))
          skip = instruction.nextoptional;
        continue;
      }
      switch (instruction.cmd)
      {
        case 0:
        {
          fileName += instruction.text;
          break;
        }
        case 1:
        {
          buffer = item.getProperty("http://songbirdnest.com/data/1.0#"+instruction.prop);
          if ((instruction.optional) && ((!buffer) || (buffer.length == 0)))
          {
            if (instruction.nextoptional)
              skip = instruction.nextoptional;
            buffer = instruction.defaultValue;
            if (buffer == null)
              continue;
          }
          if (instruction.zerofill)
          {
            var expression = new RegExp("[0-9]+", "g");
            var match;
            var value;
            var matched = false;
            var lastIndex = 0;
            while ((match = expression.exec(buffer.substr(lastIndex))) != null)
            {
              lastIndex += expression.lastIndex;
              matched = true;
              value = match[0];
              while (value.length < instruction.zerofill.count)
                value = "0"+value;
              fileName += RegExp.leftContext + value;
            }
            if (matched)
              fileName += RegExp.rightContext;
            else
            {
              if (buffer == null)
              {
                this._error = 2;
                return false;
              }
              fileName += buffer;
            }
          }
          else
            fileName += buffer;
          break;
        }
        case 2:
        {
          fileName += oldExtension;
          break;
        }
      }
    }
    return fileName;
  },
}
