function TrackTypeQuery(kind, keywords, server)
{
  if ((kind != "album") && (kind != "track"))
    throw "Invalid kind parameter.";
  hello = "songbird addons.songbirdnest.com Tagger 0.9.2.4";
  url = server + "?cmd=cddb%20" + kind+"%20"+encodeURIComponent(keywords)+"&hello="+encodeURIComponent(hello);
  
  request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
  request.open("GET", url, false);
  request.send(false);
  this.rows = new Array();
  if (request.status == 200)
  {
    var str = request.responseText;
    var splitup = str.split("\n", 1);
    var data = str.substr(splitup.length+1);;
    var cddbResponse = parseInt(splitup[0].split(" ", 1));
    switch (cddbResponse)
    {
      case 202: // no matches
      { 
        alert("no match");
        break;
      }
      case 211: // close matches found
      {
        this.rows = new Array();
        var expression = new RegExp("([a-z]+) ([0-9a-z]{8}) (.*?) / (.*)", "g");
        while ((match = expression.exec(data)))
        {
          var row = {
            "genre": match[1],
            "discid": match[2],
            "artist": match[3],
            "album": match[4]
          };
          this.rows.push(row);
        }
        break;
      }
      default:
        throw "Unexpected TrackType.org response code: "+splitup[0];
    }
  }
  else
  {
    throw "HTTP error "+request.status;
  }
}

TrackTypeQuery.prototype = {
  position: 0,
  
  fetchRow: function()
  {
    if (this.position < this.rows.length)
    {
      return this.rows[this.position++];
    }
    else
      return false;
  }
};
