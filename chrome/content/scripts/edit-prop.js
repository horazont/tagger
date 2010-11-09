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
TaggerEditProp = {
  onLoad: function(window)
  {
    this.window = window;
    this.prop = window.arguments[0];
    this.state = window.arguments[1];
    
    this.xul = {};
    this.xul.editString = document.getElementById("edit-string");
    this.xul.editInt = document.getElementById("edit-int");
    this.xul.editBool = document.getElementById("edit-bool");
    this.xul.editEnum = document.getElementById("edit-enum");
    this.xul.editText = document.getElementById("edit-text");
    this.xul.editSet = document.getElementById("edit-set");
    this.xul.setNull = document.getElementById("set-null");
    this.xul.propName = document.getElementById("propname");
    
    this.xul.propName.value = this.prop.displayName;
    
    switch (this.prop.propType)
    {
      case TA_PROPTYPE_STRING:
      {
        this.xul.editString.setAttribute("hidden", "false");
        this.xul.editString.setAttribute("value", this.prop.value);
        break;
      }
      case TA_PROPTYPE_INT:
      {
        this.xul.editInt.setAttribute("hidden","false");
        this.xul.editInt.value = this.prop.value;
        break;
      }
      case TA_PROPTYPE_BOOL:
      {
        this.xul.editBool.setAttribute("hidden","false");
        this.xul.editBool.checked = this.prop.value;
        this.xul.propName.setAttribute("hidden", "true");
        this.xul.editBool.setAttribute("label", this.xul.propName.value);
        break;
      }
      case TA_PROPTYPE_CUSTOMEXPRESSION:
      {
        this.xul.editString.setAttribute("hidden","false");
        this.xul.editString.value = this.prop.value;
        this.regexp = new RegExp(this.prop.propType_Expression);
        break;
      }
      case TA_PROPTYPE_ENUM:
      {
        this.xul.editEnum.setAttribute("hidden", "false");
        var menu = this.xul.editEnum.firstChild;
        var item;
        var enumValue;
        for (var i=0;i<this.prop.values.length;i++)
        {
          enumValue = this.prop.values[i];
          item = document.createElement("menuitem");
          item.setAttribute("value", enumValue.value);
          item.setAttribute("label", enumValue.displayName);
          menu.appendChild(item);
        }
        this.xul.editEnum.selectedIndex = this.prop.value;
        break;
      }
      case TA_PROPTYPE_TEXT:
      {
        this.xul.editText.setAttribute("hidden", "false");
        this.xul.editText.value = this.prop.value;
        break;
      }
      case TA_PROPTYPE_SET:
      {
        this.xul.editSet.setAttribute("hidden", "false");
        var list = this.prop.values;
        var item;
        var listBox = this.xul.editSet;
        var selected = this.prop.value;
        for (var i=0;i<list.length;i++)
        {
          var enumValue = list[i];
          item = document.createElement("listitem");
          item.setAttribute("label", enumValue.displayName);
          item.setAttribute("value", enumValue.value);
          item.setAttribute("type", "checkbox");
          for (var j=0;j<selected.length;j++)
            if (selected[i] == enumValue.value)
              item.setAttribute("checked", "true");
          listBox.appendChild(item);
        }
        break;
      }
      default: throw "Invalid proptype for editor";
    }
    
    if (this.prop.mayBeNull)
    {
      this.xul.setNull.setAttribute("hidden","false");
      this.xul.setNull.checked = (this.prop.value == null);
    }
    else
      this.xul.setNull.checked = false;
    
    sizeToContent();
  },
  
  acceptEvaluate: function()
  {
    if (this.xul.setNull.checked)
    {
      this.prop.value = null;
      this.state.changed = true;
      return true;
    }
    switch (this.prop.propType)
    {
      case TA_PROPTYPE_STRING:
      {
        this.prop.value = this.xul.editString.value;
        this.state.changed = true;
        return true;
      }
      case TA_PROPTYPE_INT:
      {
        this.prop.value = this.xul.editInt.value;
        this.state.changed = true;
        return true;
      }
      case TA_PROPTYPE_BOOL:
      {
        this.prop.value = this.xul.editBool.checked;
        this.state.changed = true;
        return true;
      }
      case TA_PROPTYPE_ENUM:
      {
        this.prop.value = this.xul.editEnum.selectedIndex;
        this.state.changed = true;
        return true;
      }
      case TA_PROPTYPE_CUSTOMEXPRESSION:
      {
        var value = this.xul.editString.value;
        if (!this.regexp.test(value))
        {
          alert("Not matched.");
          return false;
        }
        else
        {
          this.state.changed = true;
          return true;
        }
      }
      case TA_PROPTYPE_TEXT:
      {
        this.prop.value = this.xul.editText.value;
        this.state.changed = true;
        return true;
      }
      case TA_PROPTYPE_SET:
      {
        var value = new Array();
        var node = this.xul.editSet.firstChild;
        while (node)
        {
          if (node.checked)
            value.push(node.value);
          node = node.nextSibling;
        }
        this.prop.value = value;
        this.state.changed = true;
        break;
      }
      default: throw "Invalid proptype for editor";
    }
  },
  
  onAccept: function()
  {
    if (this.acceptEvaluate())
      this.window.close();
  },
  
  onChange: function()
  {
    this.xul.setNull.checked = false;
  }
}

window.addEventListener("load", function(e) { TaggerEditProp.onLoad(e.currentTarget); }, false);
