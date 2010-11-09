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

function TaggerRetagController(parentController)
{
  this._parent = parentController;
  this.xul = {};
  this.xul.preview = document.getElementById("retag-filenamefmt-preview");
  this.xul.previewTitle = document.getElementById("retag-filenamefmt-preview-title");
  this.xul.previewAlbum = document.getElementById("retag-filenamefmt-preview-album");
  this.xul.previewArtist = document.getElementById("retag-filenamefmt-preview-artist");
  this.xul.previewTrackNumber = document.getElementById("retag-filenamefmt-preview-number");
  this.xul.previewCDNumber = document.getElementById("retag-filenamefmt-preview-disknumber");
  this.xul.previewYear = document.getElementById("retag-filenamefmt-preview-year");
  this.xul.previewAlbumArtistName = document.getElementById("retag-filenamefmt-preview-albumArtist");
  this.xul.previewComposerName = document.getElementById("retag-filenamefmt-preview-composer");
  this.xul.fmt = document.getElementById("retag-filenamefmt");
  this.xul.keeptags = document.getElementById("retag-keeptags");
  this.xul.autoupcase = document.getElementById("retag-autoupcase");
  this.xul.replace_ = document.getElementById("retag-replace_");
  this.xul.dirsupport = document.getElementById("retag-directorysupport");
  this.parser = new TaggerTokenparser2(this._parent);
}

TaggerRetagController.prototype = {
  loadSettings: function() {
    var value;
    if ((value = Application.prefs.get("extensions.tagger.retag.keeptags")) != null)
      this.xul.keeptags.checked = value.value;
    if ((value = Application.prefs.get("extensions.tagger.retag.autoupcase")) != null)
      this.xul.autoupcase.checked = value.value;
    if ((value = Application.prefs.get("extensions.tagger.retag.replace_")) != null)
      this.xul.replace_.checked = value.value;
    if ((value = Application.prefs.get("extensions.tagger.retag.lastfmt")) != null)
      this.xul.fmt.value = value.value;
    if ((value = Application.prefs.get("extensions.tagger.retag.dirsupport")) != null)
      this.xul.dirsupport.checked = value.value;
  },

  saveSettings: function() {
    Application.prefs.setValue("extensions.tagger.retag.keeptags", this.xul.keeptags.checked);
    Application.prefs.setValue("extensions.tagger.retag.autoupcase", this.xul.autoupcase.checked);
    Application.prefs.setValue("extensions.tagger.retag.replace_", this.xul.replace_.checked);
    Application.prefs.setValue("extensions.tagger.retag.dirsupport", this.xul.dirsupport.checked);
    Application.prefs.setValue("extensions.tagger.retag.lastfmt", this.xul.fmt.value);
  },

  loadParserStates: function() {
    this.keepTags = this.xul.keeptags.checked;
    this.autoUpCase = this.xul.autoupcase.checked;
    this.replace_ = this.xul.replace_.checked;
    this.dirSupport = this.xul.dirsupport.checked;
    var format = this.xul.fmt.value;
    this.parser.init(format, this.dirSupport);
  },

  handleMatchFail: function(fileName, mediaItem) {
    var info = {};
    info.fileName = fileName;
    info.trackName = mediaItem.getProperty(SBProperties.trackName);
    if (info.trackName == null)
      info.trackName = "";
    info.albumName = mediaItem.getProperty(SBProperties.albumName);
    if (info.albumName == null)
      info.albumName = "";
    info.artistName = mediaItem.getProperty(SBProperties.artistName);
    if (info.artistName == null)
      info.artistName = "";
    info.trackNumber = mediaItem.getProperty(SBProperties.trackNumber);
    if (info.trackNumber == null)
      info.trackNumber = "";
    if (this._parent._sidebar)
      this._parent._mainWindow.openDialog("chrome://tagger/content/matchfail.xul", "", "resizable=yes,modal=yes", info);
    else
      window.openDialog("chrome://tagger/content/matchfail.xul", "", "resizable=yes,modal=yes", info);
    return info;
  },

  previewFileNameFormat: function() {
    this.loadParserStates();
    var fileName = this.parser.preprocessFileName(this._parent.getSampleName(), this.autoUpCase, this.replace_);
    var info = this.parser.processStringAsInfo(fileName);
    if (info == null)
    {
      alert(this._parent._strings.getString("taggerWindowFileDoesNotMatchPattern"));
      this.xul.preview.value = fileName;
      return;
    }
    this.xul.preview.value = info.matchdata;
    this.xul.previewTitle.value = info[0];
    this.xul.previewAlbum.value = info[1];
    this.xul.previewArtist.value = info[2];
    this.xul.previewTrackNumber.value = info[3];
    this.xul.previewCDNumber.value = info[4];
    this.xul.previewYear.value = info[5];
    this.xul.previewAlbumArtistName.value = info[6];
    this.xul.previewComposerName.value = info[7];
  },

  doRetag: function() {
    if (this._parent.getIsLocked())
      return;
    this.loadParserStates();

    var selection = this._parent.getMediaListView().selection;
    var mediaItems = selection.selectedMediaItems;
    var count = selection.count;
    if (!this._parent.askConfirmation(count))
      return;
    var mediaItem;
    var fileName;
    var info;
    var skipAll = false;
    
    this._parent.initProgress(count);
    var trackName;
    var simpleFileName;
    var processedFileName;
    
    var autoCommit = null;
    if (this._parent.autocommit)
    {
      autoCommit = new TaggerCommit();
      for (var i=0;i<this.parser.fmtTokens.length;i++)
      {
        autoCommit.addProperty("http://songbirdnest.com/data/1.0#"+this.parser.fmtTokens[i].token.prop);
      }
    }
    
    //var items = this._parent.enumeratorToArray(mediaItems, count);
    
    //this._progressLabel.value = this._parent._strings.getString("taggerWindowProgressRetagging");
    for (var i = 0;i<count;i++)
    {
      if (!mediaItems.hasMoreElements())
        throw "Early out of elements (i="+i+").";
      mediaItem = mediaItems.getNext();
      //mediaItem = items[i];
      simpleFileName = mediaItem.getProperty(SBProperties.contentURL);
      fileName = this.parser.preprocessFileName(simpleFileName, this.autoUpCase, this.replace_);
      simpleFileName = this._parent.decodeFileName(simpleFileName.substr(simpleFileName.lastIndexOf("/")+1));
      processedFileName = fileName;
      try
      {
        info = this.parser.processString(fileName);
        processedFileName = info.matchdata;
        if (this.keepTags)
        {
          trackName = mediaItem.getProperty(SBProperties.trackName);
          for (var j=0;j<this.parser.fmtTokens.length;j++)
          {
            var prop = this.parser.fmtTokens[j].token.prop;
            if (prop == "trackName")
            {
              if ((trackName == null) || (trackName == simpleFileName))
                mediaItem.setProperty("http://songbirdnest.com/data/1.0#trackName", info[prop]);
            }
            else
            {
              var fullProp = "http://songbirdnest.com/data/1.0#"+prop;
              if (mediaItem.getProperty(fullProp) == null)
                mediaItem.setProperty(fullProp, info[prop]);
            }
          }
        }
        else
        {
          for (var j=0;j<this.parser.fmtTokens.length;j++)
          {
            var token = this.parser.fmtTokens[j].token;
            var prop = token.prop;
            mediaItem.setProperty("http://songbirdnest.com/data/1.0#"+prop, info[prop]);
          }
        }
      } catch (e) {
        if (skipAll)
          continue;
        alert(e);
        var customInfo = this.handleMatchFail(fileName, mediaItem);
        if (customInfo.info.skipped)
        {
          if (customInfo.info.skipAll)
	  {
            skipAll = true;
	  }
          continue;
        }
        if (customInfo.trackName != "")
          mediaItem.setProperty(SBProperties.trackName, customInfo.trackName);
        if (customInfo.albumName != "")
          mediaItem.setProperty(SBProperties.albumName, customInfo.albumName);
        if (customInfo.artistName != "")
          mediaItem.setProperty(SBProperties.artistName, customInfo.artistName);
      }
        
      if (autoCommit)
        autoCommit.addItem(mediaItem);
        
      //this._parent._progress.value = i+1;
      this._parent.updateProgress(i+1);
    }
    if (autoCommit)
      autoCommit.commit();
  }
}