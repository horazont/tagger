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


function i18n(code)
{
  var node = document.getElementById(code);
  if (node)
    return node.getAttribute("label");
  return code;
}

function writeStringToFile(file, str)
{
  var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
    .createInstance(Components.interfaces.nsIFileOutputStream);
  outputStream.init(file, -1, -1, 0);
  outputStream.write(str, str.length);
  outputStream.close();
}

function readStringFromFile(file, str)
{
  var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
    .createInstance(Components.interfaces.nsIFileInputStream);
  inputStream.init(file, -1, -1, 0);
  var binStream = Components.classes["@mozilla.org/binaryinputstream;1"].
                        createInstance(Components.interfaces.nsIBinaryInputStream);
  binStream.setInputStream(inputStream);
  var final = binStream.readBytes(binStream.available());
  inputStream.close();
  return final;
}

function taggerThemedDialogLoad(dialog, params)
{
  var nodes = new Array();
  var node = dialog.firstChild;
  while (node)
  {
    var tmp = node.nextSibling;
    nodes.push(node);
    node.parentNode.removeChild(node);
    node = tmp;
  }
  var outerFrame = document.createElement("sb-sys-outer-frame");
  /*var titleBar = document.createElement("sb-sys-dialog-titlebar");
  titleBar.setAttribute("id", "dialog-titlebar");
  titleBar.setAttribute("style", "margin: 0; padding: 0");
  titleBar.setAttribute("hidden", "false");
  outerFrame.appendChild(titleBar);*/
  outerFrame.setAttribute("id", "dialog-outer-frame");
  outerFrame.setAttribute("style", "margin: 0; padding: 0");
  if (params && (params.resizers))
    outerFrame.setAttribute("resizers", params.resizers);
  else
    outerFrame.setAttribute("resizers", "none");
  outerFrame.setAttribute("type", "dialog");
  outerFrame.setAttribute("xbl:inherits", "resizers");
  outerFrame.setAttribute("flex", "1");
  for (var i=0;i<nodes.length;i++)
    outerFrame.appendChild(nodes[i]);
  nodes = null;
  node = null;
  dialog.appendChild(outerFrame);
}