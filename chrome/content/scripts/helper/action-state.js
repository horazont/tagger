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

Components.utils.import("resource://app/jsmodules/ArrayConverter.jsm");
Components.utils.import("resource://app/jsmodules/sbLibraryUtils.jsm");
Components.utils.import("resource://app/jsmodules/sbProperties.jsm");
Components.utils.import("resource://app/jsmodules/SBJobUtils.jsm");

function TaggerActionState()
{
  this.Cc = Components.classes;
  this.Ci = Components.interfaces;
}

TaggerActionState.prototype = {
  _expressionEscapeList: {
    0: "\\",
    1: "[",
    2: "]",
    3: "^",
    4: "$",
    5: "(",
    6: ")",
    7: "{",
    8: "}",
    9: ".",
    10: "?",
    11: "*",
    12: "+"
  },

  context: {
    "item": null
  },
  
  selection: new Array(),
  
  commitCache: new Array(),
  
  tokenParser2: new Array(),
  
  pollEvents: function()
  {
    var thread = this.Cc["@mozilla.org/thread-manager;1"]
                        .getService(this.Ci.nsIThreadManager)
                        .currentThread;
    thread.processNextEvent(false);
  },
  
  prepareActionList: function(array)
  {
    this.pollEvents();
    for (var i=0;i<array.length;i++)
    {
      var action = array[i];
      if (action.prepare)
        action.prepare(this);
    }
  },
  
  executeActionList: function(array)
  {
    this.pollEvents();
    for (var i=0;i<array.length;i++)
    {
      var action = array[i];
      action.execute(this);
    }
  },
  
  xor: function(a, b)
  {
    return ( a || b ) && !( a && b );
  },
  
  evaluateConditions: function(array, condlink, optimize)
  {
    if ((!array) || (array.length == 0))
      return null;
      
    if ((condlink == 0) || (condlink == "and"))
    {
      var result = true;
      for (var i=0;i<array.length;i++)
      {
        if (!(array[i].evaluate(this)))
        {
          if (optimize)
            return false;
          else
            result = false;
        }
      }
      return result;
    }
    else if ((condlink == 1) || (condlink == "or"))
    {
      var result = false;
      for (var i=0;i<array.length;i++)
      {
        if (array[i].evaluate(this))
        {
          if (optimize)
            return true;
          else
            result = true;
        }
      }
      return false;
    }
    else if ((condlink == 2) || (condlink == "xor"))
    {
      var result = array[0].evaluate(this);
      for (var i=1;array.length;i++)
      {
        result = xor(result, array[i].evaluate(this));
      }
      return result;
    }
    else
      throw "Invalid condlink";
  },
  
  outputNote: function(note)
  {
    var consoleService = this.Cc["@mozilla.org/consoleservice;1"].getService(this.Ci.nsIConsoleService);
    if (consoleService)
    {
      consoleService.logStringMessage("Tagger macro: "+note);
    }
    else
      alert("Tagger action state note:\n"+note);
  },
  
  escapeExpression: function(expression) {
    for (var i in this._expressionEscapeList)
    {
      expression = expression.replace(new RegExp("\\"+this._expressionEscapeList[i], "g"), "\\"+this._expressionEscapeList[i]);
    }
    return expression;
  },
    
  /* NOTE: Changes to this need to be reflected in ../tagger.js! */
  /* ToDo: Branch the file name encoding stuff into a separate class. */

  decodeFileName: function(fileName)
  {
    var components = fileName.split("/");
    var encoded = "";
    for (var i=0;i<components.length;i++)
    {
      if (i>0)
        encoded += this._pathSeparator+decodeURIComponent(components[i]);
      else
        encoded += decodeURIComponent(components[i]);
    }
    return encoded;
  }
}