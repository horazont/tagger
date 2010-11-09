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

// Make a namespace.
if (typeof Tagger == 'undefined') {
  var Tagger = {};
}

/**
 * UI controller that is loaded into the main player window
 */
Tagger.Controller = {

  /**
   * Called when the window finishes loading
   */
  onLoad: function() {

    // initialization code
    this._initialized = true;
    this._strings = document.getElementById("tagger-strings");
    
    // Perform extra actions the first time the extension is run
    if (Application.prefs.get("extensions.tagger.firstrun").value) {
      Application.prefs.setValue("extensions.tagger.firstrun", false);
      this._firstRunSetup();
    }


    

    // Make a local variable for this controller so that
    // it is easy to access from closures.
    var controller = this;
  },
  

  /**
   * Called when the window is about to close
   */
  onUnLoad: function() {
    this._initialized = false;
  },


  _firstRunSetup : function() {
    window.gBrowser.loadOneTab("chrome://tagger/content/welcome.xul");
  },
  
  openTestWindow : function() {
    if (window.gBrowser.currentMediaListView.selection.count == 0)
      alert(this._strings.getString("taggerWindowNeedSelection"));
    else
      window.openDialog("chrome://tagger/content/tagger.xul", "", "resizable=yes,modal=yes", window);
  }
};

window.addEventListener("load", function(e) { Tagger.Controller.onLoad(e); }, false);
window.addEventListener("unload", function(e) { Tagger.Controller.onUnLoad(e); }, false);
