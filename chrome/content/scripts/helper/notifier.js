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
function TaggerNotifier()
{
  var me = this;
  var observerFunction = function() {
    me.callEvent("onGlobalConfigChange");
  }
  this.observer = new PreferenceObserver("extensions.tagger.", observerFunction,
  [
    "autocommit",
    "donotask",
    "filterfilenames",
    "osflag",
    "filter.replace",
    "filter.replacement"
  ]);
  this.observer.register();
}

TaggerNotifier.prototype = {
  events: {
    "onglobalconfigchange": new Array(),
    "onmacrolistchange": new Array()
  },
  
  notifierRegistered: function(event, handler)
  {
    var list = this.events[event];
    for (var i=0;i<list.length;i++)
    {
      if (list[i] == handler)
        return true;
    }
    return false;
  },
  
  addHandler: function(event, handler)
  {     
    event = event.toLowerCase();
    if (!this.events[event])
      throw "Invalid event: "+event;
    if (this.notifierRegistered(event, handler))
      return;
    this.events[event].push(handler);
  },
  
  removeHandler: function(event, handler)
  {
    event = event.toLowerCase();
    var list = this.events[event];
    if (!list)
      throw "Invalid event: "+event;
    
    for (var i=0;i<list.length;i++)
    {
      if (list[i] == handler)
        list.splice(i, 1);
    }
  },
  
  callEvent: function(event)
  {
    event = event.toLowerCase();
    var list = this.events[event];
    for (var i=0;i<list.length;i++)
      list[i]();
  }
};

function getNotifier(owner)
{
  if (owner.__taggerNotifier)
    return owner.__taggerNotifier;
  return (owner.__taggerNotifier = new TaggerNotifier());
}