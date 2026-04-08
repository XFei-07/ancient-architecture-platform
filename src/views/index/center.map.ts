//mapData数据结构
export interface MapdataType {
  name: string;
  value: [number, number, number]; //x,y,value  第一个x 第二个y  第三个value
}
export interface RegionValueItem {
  name: string;
  value: number;
}

type MetricType = "count" | "heat";

export const optionHandle = (
  regionCode: string,
  list: RegionValueItem[],
  mapData: MapdataType[],
  metricType: MetricType = "count"
) => {
  let top = 45;
  let zoom = ["china"].includes(regionCode) ? 1.05 : 1;
  const unitText = metricType === "count" ? "处" : "热力指数";
  const visualMapForCount = [
    { min: 300, label: "300处以上" },
    { min: 200, max: 299, label: "200-299处" },
    { min: 100, max: 199, label: "100-199处" },
    { min: 50, max: 99, label: "50-99处" },
    { min: 20, max: 49, label: "20-49处" },
    { min: 5, max: 19, label: "5-19处" },
    { min: 1, max: 4, label: "1-4处" },
  ];
  const visualMapForHeat = [
    { min: 85, label: "高热 85-100" },
    { min: 70, max: 84, label: "较高 70-84" },
    { min: 55, max: 69, label: "中等 55-69" },
    { min: 40, max: 54, label: "偏低 40-54" },
    { min: 1, max: 39, label: "低热 1-39" },
  ];
  return {
    backgroundColor: "rgba(0,0,0,0)",
    tooltip: {
      show: true,
      trigger: "item",
      backgroundColor: "rgba(26,20,16,.9)",
      borderColor: "rgba(201,169,110,.6)",
      textStyle: {
        color: "#F5F0E8",
      },
      formatter: function (params: any) {
        if (params.data && params.data.value !== undefined) {
          const val = Array.isArray(params.data.value) ? params.data.value[2] : params.data.value;
          return params.name + "：" + val + " " + unitText;
        }
        return params.name;
      },
    },
    legend: {
      show: false,
    },
    visualMap: {
      show: list.length > 0,
      seriesIndex: 0,
      left: 20,
      bottom: 20,
      pieces: metricType === "count" ? visualMapForCount : visualMapForHeat,
      inRange: {
        color:
          metricType === "count"
            ? ["#F5E6CB", "#E8CFA0", "#D2B48C", "#B8860B", "#A0522D", "#8C4356", "#6B2C3E"]
            : ["#F5E6CB", "#E7C879", "#DFA74C", "#C96B3A", "#8C2D3B"],
      },
      textStyle: {
        color: "#E8D5B5",
      },
    },
    geo: [
      {
        map: regionCode,
        roam: false,
        selectedMode: false, //是否允许选中多个区域
        zoom: zoom,
        top: top,
        aspectScale: 0.78,
        show: false,
      },
    ],
    series: [
      {
        name: "MAP",
        type: "map",
        map: regionCode,
        aspectScale: 0.78,
        data: list,
        showLegendSymbol: false, // 禁用默认标记点
        selectedMode: false, //是否允许选中多个区域
        zoom: zoom,
        geoIndex: 2,
        top: top,
        tooltip: {
          show: true,
          formatter: function (params: any) {
            if (params.data) {
              return params.name + "：" + params.data["value"] + " " + unitText;
            } else {
              return params.name;
            }
          },
          backgroundColor: "rgba(26,20,16,.9)",
          borderColor: "rgba(201,169,110,.6)",
          textStyle: {
            color: "#F5F0E8",
          },
        },

        label: {
          show: false,
        },

        emphasis: {
          label: {
            show: true,
            color: "#F0D89D",
            fontSize: 12,
            fontWeight: "bold",
            formatter: function (val: any) {
              if (val.data !== undefined) {
                return metricType === "count"
                  ? val.name + " 共" + val.data.value + "处"
                  : val.name + " 热度" + val.data.value;
              } else {
                return val.name;
              }
            },
          },
          itemStyle: {
            areaColor: "rgba(212,168,71,.6)",
            borderWidth: 2,
            borderColor: "#D4A847",
          },
        },
        itemStyle: {
          borderColor: "rgba(201, 169, 110, .6)",
          borderWidth: 1,
          areaColor: {
            type: "radial",
            x: 0.5,
            y: 0.5,
            r: 0.8,
            colorStops: [
              {
                offset: 0,
                color: "rgba(201, 169, 110, 0)",
              },
              {
                offset: 1,
                color: "rgba(201, 169, 110, .2)",
              },
            ],
            globalCoord: false,
          },
          shadowColor: "rgba(201, 169, 110, .3)",
          shadowOffsetX: -2,
          shadowOffsetY: 2,
          shadowBlur: 10,
        },
      },
        {
          data: mapData,
          type: "effectScatter",
          coordinateSystem: "geo",
          symbolSize: function (val: any) {
            const num = Array.isArray(val) ? val[2] : val;
            const base = metricType === "count" ? 3 : 5;
            const scale = metricType === "count" ? 10 : 13;
            return base + Math.min(scale, Math.sqrt(Math.max(1, num)) / 1.8);
          },
          showEffectOn: "render",
          rippleEffect: {
            scale: metricType === "count" ? 2.2 : 3.2,
            color: "rgba(240,216,157,.5)",
            brushType: "stroke",
          },
          tooltip: {
            show: true,
            formatter: function (params: any) {
              if (params.data) {
                return params.name + "：" + params.data["value"][2] + " " + unitText;
              } else {
                return params.name;
              }
            },
            backgroundColor: "rgba(26,20,16,.9)",
            borderColor: "rgba(201,169,110,.6)",
            textStyle: {
              color: "#F5F0E8",
            },
          },
          label: {
            show: false,
          },
          itemStyle: {
            color: metricType === "count" ? "rgba(212,168,71,.35)" : "rgba(201,75,60,.45)",
            borderColor: "rgba(245,230,203,.8)",
            borderWidth: 0.5,
            shadowColor: "rgba(212,168,71,.45)",
            shadowBlur: 10,
          },
        },
    ],
    //动画效果
    // animationDuration: 1000,
    // animationEasing: 'linear',
    // animationDurationUpdate: 1000
  };
};

export const regionCodes: any = {
  中国: {
    adcode: "100000",
    level: "country",
    name: "中华人民共和国",
  },
  新疆维吾尔自治区: {
    adcode: "650000",
    level: "province",
    name: "新疆维吾尔自治区",
  },
  湖北省: {
    adcode: "420000",
    level: "province",
    name: "湖北省",
  },
  辽宁省: {
    adcode: "210000",
    level: "province",
    name: "辽宁省",
  },
  广东省: {
    adcode: "440000",
    level: "province",
    name: "广东省",
  },
  内蒙古自治区: {
    adcode: "150000",
    level: "province",
    name: "内蒙古自治区",
  },
  黑龙江省: {
    adcode: "230000",
    level: "province",
    name: "黑龙江省",
  },
  河南省: {
    adcode: "410000",
    level: "province",
    name: "河南省",
  },
  山东省: {
    adcode: "370000",
    level: "province",
    name: "山东省",
  },
  陕西省: {
    adcode: "610000",
    level: "province",
    name: "陕西省",
  },
  贵州省: {
    adcode: "520000",
    level: "province",
    name: "贵州省",
  },
  上海市: {
    adcode: "310000",
    level: "province",
    name: "上海市",
  },
  重庆市: {
    adcode: "500000",
    level: "province",
    name: "重庆市",
  },
  西藏自治区: {
    adcode: "540000",
    level: "province",
    name: "西藏自治区",
  },
  安徽省: {
    adcode: "340000",
    level: "province",
    name: "安徽省",
  },
  福建省: {
    adcode: "350000",
    level: "province",
    name: "福建省",
  },
  湖南省: {
    adcode: "430000",
    level: "province",
    name: "湖南省",
  },
  海南省: {
    adcode: "460000",
    level: "province",
    name: "海南省",
  },
  江苏省: {
    adcode: "320000",
    level: "province",
    name: "江苏省",
  },
  青海省: {
    adcode: "630000",
    level: "province",
    name: "青海省",
  },
  广西壮族自治区: {
    adcode: "450000",
    level: "province",
    name: "广西壮族自治区",
  },
  宁夏回族自治区: {
    adcode: "640000",
    level: "province",
    name: "宁夏回族自治区",
  },
  浙江省: {
    adcode: "330000",
    level: "province",
    name: "浙江省",
  },
  河北省: {
    adcode: "130000",
    level: "province",
    name: "河北省",
  },
  香港特别行政区: {
    adcode: "810000",
    level: "province",
    name: "香港特别行政区",
  },
  台湾省: {
    adcode: "710000",
    level: "province",
    name: "台湾省",
  },
  澳门特别行政区: {
    adcode: "820000",
    level: "province",
    name: "澳门特别行政区",
  },
  甘肃省: {
    adcode: "620000",
    level: "province",
    name: "甘肃省",
  },
  四川省: {
    adcode: "510000",
    level: "province",
    name: "四川省",
  },
  天津市: {
    adcode: "120000",
    level: "province",
    name: "天津市",
  },
  江西省: {
    adcode: "360000",
    level: "province",
    name: "江西省",
  },
  云南省: {
    adcode: "530000",
    level: "province",
    name: "云南省",
  },
  山西省: {
    adcode: "140000",
    level: "province",
    name: "山西省",
  },
  北京市: {
    adcode: "110000",
    level: "province",
    name: "北京市",
  },
  吉林省: {
    adcode: "220000",
    level: "province",
    name: "吉林省",
  },
};
