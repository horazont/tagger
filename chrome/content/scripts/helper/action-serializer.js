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
function TaggerActionSerializer()
{

}

TaggerActionSerializer.prototype = {
  deserialize_props: function(str, node)
  {
    var data = str.split(",");
    var len = parseInt(data[0]);
    for (var i=0;i<len;i++)
    {
      var name = data[i*2+1];
      var value = data[i*2+2];
      var prop = node.properties[i];
      if (prop.name == name)
      {
        switch (prop.propType)
        {
          case TA_PROPTYPE_STRING:
          case TA_PROPTYPE_TEXT:
          case TA_PROPTYPE_CUSTOMEXPRESSION:
          {
            if (value == "%null")
              prop.value = null;
            else
              prop.value = unescape(value);
            break;
          }
          case TA_PROPTYPE_INT:
          case TA_PROPTYPE_ENUM:
          {
            if (value == "%null")
              prop.value = null;
            else
              prop.value = parseInt(value);
            break;
          }
          case TA_PROPTYPE_BOOL:
          {
            if (value == "%null")
              prop.value = null;
            else
              prop.value = (value == "true");
            break;
          }
          case TA_PROPTYPE_SET:
          {
            if (value == "%null")
              prop.value = null;
            else
              prop.value = unescape(value).split(",");
            break;
          }
          case TA_PROPTYPE_ACTIONLIST:
          case TA_PROPTYPE_CONDITIONLIST:
          {
            prop.value = this.deserializeActionList(unescape(value));
            break;
          }
        }
      }
    }
  },
  
  deserialize: function(str)
  {
    var data = str.split(",");
    var node = null;
    
    for (var i=0;i<ActionRegistry.length;i++)
    {
      var action = ActionRegistry[i];
      if (action.cc.name == data[0])
      {
        node = new action.cc();
        break;
      }
    }
    if (node == null)
    {
      for (var i=0;i<ConditionRegistry.length;i++)
      {
        var action = ConditionRegistry[i];
        if (action.cc.name == data[0])
        {
          node = new action.cc();
          break;
        }
      }
    }
    if (node == null)
    {
      alert("Error during deserialization. Unknown class \""+data[0]+"\"");
      throw "Error during deserialization: Unknown class \""+data[0]+"\"";
    }
    this.deserialize_props(unescape(data[1]), node);
    return node;
  },
  
  deserializeActionList: function(str)
  {
    if (str.length == 0)
      return new Array();
    var data = str.split(",");
    var list = new Array();
    for (var i=0;i<data.length;i++)
    {
      list.push(this.deserialize(unescape(data[i])));
    }
    return list;
  },
  
  serialize_props: function(props)
  {
    var data = new Array();
    data.push(""+props.length);
    for (var i=0;i<props.length;i++)
    {
      var prop = props[i];
      data.push(prop.name);
      switch (prop.propType)
      {
        case TA_PROPTYPE_STRING:
        case TA_PROPTYPE_TEXT:
        case TA_PROPTYPE_CUSTOMEXPRESSION:
        {
          if (prop.mayBeNull && (prop.value == null))
            data.push("%null");
          else
            data.push(escape(prop.value));
          break;
        }
        case TA_PROPTYPE_INT:
        case TA_PROPTYPE_BOOL:
        case TA_PROPTYPE_ENUM:
        {
          if (prop.mayBeNull && (prop.value == null))
            data.push("%null");
          else
            data.push(prop.value);
          break;
        }
        case TA_PROPTYPE_SET:
        {
          if (prop.mayBeNull && (prop.value == null))
            data.push("%null");
          else
            data.push(escape(prop.value.join(",")));
          break;
        }
        case TA_PROPTYPE_ACTIONLIST:
        case TA_PROPTYPE_CONDITIONLIST:
        {
          data.push(escape(this.serializeActionList(prop.value)));
          break;
        }
        default: throw "Invalid proptype for serialization: "+prop.propType;
      }
    }
    return data.join(",");
  },
  
  serialize: function(action)
  {
    var data = new Array();
    data.push(action.cc.name);
    data.push(escape(this.serialize_props(action.properties)));
    return data.join(",");
  },
  
  serializeActionList: function(list)
  {
    var data = new Array();
    for (var i=0;i<list.length;i++)
      data.push(escape(this.serialize(list[i])));
    return data.join(",");
  }
}