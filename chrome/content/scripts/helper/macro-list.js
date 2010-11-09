TaggerMacroUtils = {
  serialize: function(macro)
  {
    return escape(macro.name)+","+escape(macro.description)+","+escape(macro.code);
  },
  
  deserialize: function(str)
  {
    var data = str.split(",");
    return new TaggerMacro(unescape(data[0]), unescape(data[2]), unescape(data[1]));
  }
};

function TaggerMacro(name, code, description)
{
  this.name = name;
  this.code = code;
  this.description = description;
}

TaggerMacro.prototype = {
  instanciate: function()
  {
    if (this.code)
      return (new TaggerActionSerializer()).deserializeActionList(this.code);
    return null;
  },
  
  toString: function()
  {
    return this.name;
  }
}

function TaggerMacroList(notifier)
{
  this.notifier = notifier;
  this.Cc = Components.classes;
  this.Ci = Components.interfaces;
  this.writeStringToFile = writeStringToFile;
  this.readStringFromFile = readStringFromFile;
  this.utils = TaggerMacroUtils;
  if (!this.Cc || !this.Ci || !this.writeStringToFile || !this.readStringFromFile || !this.utils)
    alert("TaggerMacroList has not all dependencies fulfilled.......");
  this.load();
}

TaggerMacroList.prototype = 
{
  macros: {},
  
  notifyUpdate: function(skipSave)
  {
    if (!skipSave)
      this.save();
    this.notifier.callEvent("onMacroListChange");
  },
  
  load: function(silent)
  {
    var file = this.Cc["@mozilla.org/file/directory_service;1"].
                     getService(this.Ci.nsIProperties).
                     get("ProfD", this.Ci.nsIFile);
    file.append("macros.tagger@sotecware.net");
    if (!file)
      throw "Could not load macros!";
    this.macros = {};
    try
    {
      if (!file.exists())
        return;
      var data = this.readStringFromFile(file).split(",");
      if ((data.length == 0) || (data[0].length == 0))
        return;
      for (var i=0;i<data.length;i++)
      {
        this.saveMacro(this.utils.deserialize(unescape(data[i])), true);
      }
    }
    finally
    {
      if (!silent)
        this.notifyUpdate(true);
    }
  },
  
  save: function()
  {
    var file = this.Cc["@mozilla.org/file/directory_service;1"].
                     getService(this.Ci.nsIProperties).
                     get("ProfD", this.Ci.nsIFile);
    file.append("macros.tagger@sotecware.net");
    if (!file)
      throw "Could not save macros!";
    var items = new Array();
    for (var key in this.macros)
    {
      if (this.macros[key] != null)
        items.push(escape(this.utils.serialize(this.macros[key])));
    }
    this.writeStringToFile(file, items.join(","));
  },
  
  saveMacro: function(macro, silent)
  {
    this.macros[macro.name] = macro;
    if (!silent)
      this.notifyUpdate();
  },
  
  getMacro: function(name)
  {
    if (this.macros[name])
      return this.macros[name];
    return null;
  },
  
  deleteMacro: function(name, silent)
  {
    this.macros[name] = null;
    if (!silent)
	this.notifyUpdate();
  },
  
  enumMacrosByCallback: function(callback, data)
  {
    for (var item in this.macros)
    {
      if (this.macros[item])
	callback(item, this.macros[item], data);
    }
  }
}

function getMacroList(owner)
{
  if (owner.__taggerMacroList)
    return owner.__taggerMacroList;
  return (owner.__taggerMacroList = new TaggerMacroList(getNotifier(owner)));
}