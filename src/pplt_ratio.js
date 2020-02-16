import { loadCaiyunData, loadTecentData, getConfirmedCount, getColor } from './load_data';
var map;
var disProvince;
var disChongqing;
var layer;
var verbose = false;
var confirmedCount = new Map();
var cache = new Map();

function getCountByName(name) {
  console.log(name);
  let count = 0;
  if (name in city_dict) {
    count = city_dict[name][6]*50;
  }
  return count;
}

function getColorByName(name) {
  const color = getColor(getCountByName(name));
  return color;
}

function getColorForChongqing(name) {
  const color = getColor(getCountByName("重庆市"));
  return color;
}


function initVirusMap() {

  map = new AMap.Map('container', {
    zoom: window.screen.width <= 600 ? 3 : 4,
    center: [104.5, 38.5],
    pitch: 0,
    viewMode: '3D',
  });

  // 创建省份图层
  // 排除重庆(500000)
  var all_provinces = [
    '110000',
    '120000',
    '130000',
    '140000',
    '150000',
    '210000',
    '220000',
    '230000',
    '310000',
    '320000',
    '330000',
    '340000',
    '350000',
    '360000',
    '370000',
    '410000',
    '420000',
    '430000',
    '440000',
    '450000',
    '460000',
    '510000',
    '520000',
    '530000',
    '540000',
    '610000',
    '620000',
    '630000',
    '640000',
    '650000',
    '710000',
    '810000',
    '820000',
  ];
  disProvince = new AMap.DistrictLayer.Province({
    zIndex: 12,
    adcode: all_provinces,
    depth: 1,
    styles: {
      fill: function(properties) {
        return getColorByName(properties.NAME_CHN);
      },
      'province-stroke': 'black',
      'city-stroke': 'cornflowerblue', // 中国地级市边界
      'county-stroke': 'rgba(255,255,255,0.5)', // 中国区县边界
    },
  });

  disProvince.setMap(map);

  disChongqing = new AMap.DistrictLayer.Province({
    zIndex: 12,
    adcode: ['500000'],
    depth: 2,
    styles: {
      fill: function(properties) {
        return getColorForChongqing(properties.NAME_CHN);
      },
      'province-stroke': 'black',
      'city-stroke': 'cornflowerblue', // 中国地级市边界
      'county-stroke': 'rgba(255,255,255,0.5)', // 中国区县边界
    },
  });

  disChongqing.setMap(map);
  map.on('complete', function() {
    layer = new AMap.LabelsLayer({
      fitView: true,
    });
    map.add(layer);
    //map.on('click', clickHander);
  });
}

function clickHander(ev) {
  if (verbose) {
    console.log('ev', ev);
  }
  var px = ev.pixel;
  var props = disProvince.getDistrictByContainerPos(px);
  if (verbose) {
    console.log('props1', props);
  }
  if (!props) {
    props = disChongqing.getDistrictByContainerPos(px);
  }
  if (verbose) {
    console.log('props1', props);
  }
  if (props) {
    const seperator = ' ';
    // 京津沪港澳台
    if (['110000', '120000', '310000', '710000', '810000', '820000'].includes(props.adcode_pro.toString())) {
      const text = props.NAME_CHN + seperator + getCountByName(props.NAME_CHN);
      //console.log('text', text);
      var labelMarker = new AMap.LabelMarker({
        position: [props.x, props.y],
        text: { content: text },
        rank: 2,
      });
      layer.add(labelMarker);
    } else {
      // 展示点击区域所在省份每个市的病例数字
      AMap.plugin('AMap.DistrictSearch', function() {
        const is_chongqing = props.adcode_pro.toString() == '500000';
        const subdistrict = is_chongqing ? 2 : 1;
        //console.log('subdistrict', subdistrict)
        function districtsHandler(result) {
          if (!is_chongqing) {
            for (const entry of result.districtList[0].districtList) {
              const text = entry.name + seperator + getCountByName(entry.name);
              //console.log("text", text);
              const option = {
                position: entry.center,
                text: { content: text },
                rank: entry.adcode == props.adcode.toString() ? 2 : 1,
              };
              if (verbose) {
                console.log('option', option);
              }
              var labelMarker = new AMap.LabelMarker(option);
              layer.add(labelMarker);
            }
          } else {
            // 重庆郊县
            for (const entry of result.districtList[0].districtList[0].districtList) {
              const option = {
                position: entry.center,
                text: {
                  content: entry.name + seperator + getCountByName(entry.name),
                },
                rank: entry.adcode == props.adcode.toString() ? 2 : 1,
              };
              if (verbose) {
                console.log('option, 重庆郊县', option);
              }
              var labelMarker = new AMap.LabelMarker(option);
              layer.add(labelMarker);
            }
            // 重庆城区
            var confirmedCount = 0;
            const chongqing_downtown = result.districtList[0].districtList[1];
            for (const entry of chongqing_downtown.districtList) {
              confirmedCount += getCountByName(entry.name);
            }
            const option = {
              position: chongqing_downtown.center,
              text: {
                content: chongqing_downtown.name + seperator + confirmedCount,
              },
              rank: props.adcode_cit.toString() == '500100' ? 2 : 1,
            };
            if (verbose) {
              console.log('option, 重庆城区', option);
            }
            var labelMarker = new AMap.LabelMarker(option);
            layer.add(labelMarker);
          }
        }
        var districtSearch = new AMap.DistrictSearch({
          level: 'district',
          subdistrict: subdistrict,
        });
        const k = props.adcode_pro.toString();
        if (cache.get(k)) {
          districtsHandler(cache.get(k));
        } else {
          districtSearch.search(k, function(status, result) {
            if (verbose) {
              console.log('status', status);
              console.log('result', result);
            }
            if (status == 'complete') {
              cache.set(k, result);
              districtsHandler(result);
            }
          });
        }
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
/*  loadTecentData({ jsonp: true }).then(data => {
    confirmedCount = getConfirmedCount(data);
    // fix some bugs of AMap
    confirmedCount.set('邳州市', confirmedCount.get('徐州市'));
    confirmedCount.set('莱芜市', confirmedCount.get('济南市'));
    initVirusMap();
  });
  */
    city_dict['邳州市'] = city_dict['徐州市'];
    city_dict['莱芜市'] = city_dict['济南市'];
    console.log(city_dict);

    initVirusMap();
    //confirmedCount = getConfirmedCount(data);
    // fix some bugs of AMap
    //confirmedCount.set('邳州市', confirmedCount.get('徐州市'));
    //confirmedCount.set('莱芜市', confirmedCount.get('济南市'));
    //});

    for (var x in city_dict) {
        var p_name = city_dict[x][0]
        var name = city_dict[x][1]
        var count = city_dict[x][2]
        var area = city_dict[x][3]
        var pplt = city_dict[x][4]
        var ratio_area = city_dict[x][5]
        var ratio_pplt = city_dict[x][6]
        var str = ""
        for (var e in city_dict[x]) {
            str = str + "<td>"+city_dict[x][e] +"</td>"
        }
        $(".remarkup-table>tbody").append("<tr>"+str+"</tr>\n")
    }

});
