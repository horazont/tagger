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

function TaggerCommit()
{
  this.Cc = Components.classes;
  this.Cu = Components.utils;
  this.Ci = Components.interfaces;
  this.properties = new Array();
  this.items = this.Cc["@songbirdnest.com/moz/xpcom/threadsafe-array;1"].
    createInstance(this.Ci.nsIMutableArray);
}

TaggerCommit.prototype = {
  
  indexOfProperty: function(property) {
    for (var i=0;i<this.properties.length;i++)
      if (this.properties[i] == property)
        return i;
    return -1;
  },
  
  addProperty: function(property) {
    if (this.indexOfProperty(property) >= 0)
      return;
    this.properties.push(property);
  },
  
  removeProperty: function(property) {
    var idx = this.indexOfProperty(property);
    if (idx < 0)
      return;
    this.properties.splice(idx, 1);
  },
  
  addItem: function(mediaItem, force) {
    if (!LibraryUtils.canEditMetadata(mediaItem) && !force)
      return false;
    this.items.appendElement(mediaItem, false);
    return true;
  },
  
  removeItem: function(mediaItem) {
    var idx = this.items.indexOf(0, mediaItem);
    if (idx < 0)
      return;
    this.items.removeElementAt(idx);
  },
  
  clear: function() {
    this.items.clear();
    this.properties = new Array();
  },
  
  clearItems: function() {
    this.items.clear();
  },
  
  clearProperties: function() {
    this.properties = new Array();
  },
  
  setItemsFromArray: function(items) {
    this.items.clear();
    for (var i=0;i<items.length;i++)
      if (LibraryUtils.canEditMetadata(items[i]))
        this.items.appendElement(items[i], false);
  },
  
  commit: function() {
    if (this.properties.length == 0)
      return;
    var service = this.Cc["@songbirdnest.com/Songbird/FileMetadataService;1"].
      getService(Components.interfaces.sbIFileMetadataService);
    try
    {
        var propArray = ArrayConverter.stringEnumerator(this.properties);
        var job = service.write(this.items, propArray);

        SBJobUtils.showProgressDialog(job, window, 0);    
    } catch (e) {
      this.Cu.reportError(e);
    }
  }
}