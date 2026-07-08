const DEFAULT_SAFE_AREA = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

const SAFE_AREA = {
  // iPhone 灵动岛
  island: {
    top: 59,
    bottom: 34,
    left: 0,
    right: 0,
  },
  // iPhone 刘海
  notch: {
    top: 47,
    bottom: 34,
    left: 0,
    right: 0,
  },
  // Android 普通全面屏
  android: {
    top: 48,
    bottom: 24,
    left: 0,
    right: 0,
  },
  // Samsung 等大刘海/挖孔
  androidLarge: {
    top: 60,
    bottom: 34,
    left: 0,
    right: 0,
  },
};


// 安全区检测
export function getSafeArea(model = "") {
  // =========================
  // 精确型号匹配
  // =========================
  
  const exactMap = {
    "iPhone16,1": SAFE_AREA.island,
    "iPhone16,2": SAFE_AREA.island,
    "iPhone16,3": SAFE_AREA.island,
    "iPhone16,4": SAFE_AREA.island,
    "iPhone15,2": SAFE_AREA.island,
    "iPhone15,3": SAFE_AREA.island,
    "iPhone15,4": SAFE_AREA.island,
    "iPhone15,5": SAFE_AREA.island,
    "iPhone14,5": SAFE_AREA.notch,
    "iPhone14,7": SAFE_AREA.notch,
    "iPhone14,8": SAFE_AREA.notch,
    "iPhone13,2": SAFE_AREA.notch,
    "iPhone13,3": SAFE_AREA.notch,
    "iPhone12,1": SAFE_AREA.notch,
    "iPhone12,8": DEFAULT_SAFE_AREA,

    "SM-S938B": SAFE_AREA.androidLarge,
    "SM-S928B": SAFE_AREA.androidLarge,
    "SM-S921B": SAFE_AREA.androidLarge,
    "SM-S918B": SAFE_AREA.androidLarge,
    "SM-F956B": SAFE_AREA.androidLarge,
    "SM-F946B": SAFE_AREA.androidLarge,

    // Xiaomi
    "24129PN74C": SAFE_AREA.android,
    "23127PN0CC": SAFE_AREA.android,
    "24030PN60C": SAFE_AREA.android,
    "2211133C": SAFE_AREA.android,

    // Huawei
    "ALN-AL00": SAFE_AREA.android,
    "CET-AL60": SAFE_AREA.android,
    "MNA-AL00": SAFE_AREA.android,

    // Honor
    "PGT-AN00": SAFE_AREA.android,
    "REA-AN00": SAFE_AREA.android,

    // OPPO
    "PKT110": SAFE_AREA.android,
    "PHY110": SAFE_AREA.android,
    "PGFM10": SAFE_AREA.android,

    // OnePlus
    "PJZ110": SAFE_AREA.android,
    "CPH2573": SAFE_AREA.android,

    // vivo
    "V2309A": SAFE_AREA.android,
    "V2241A": SAFE_AREA.android,
  };


  if (exactMap[model]) {

    return exactMap[model];

  }



  // =========================
  // 正则匹配
  // =========================

  const rules = [

    // iPhone 15以后
    {
      regex: /^iPhone1[5-9]/,
      area: SAFE_AREA.island,
    },


    // iPhone X - 14
    {
      regex: /^iPhone1[0-4]/,
      area: SAFE_AREA.notch,
    },


    // Samsung Galaxy S/F系列
    {
      regex: /^SM-(S|F)/,
      area: SAFE_AREA.androidLarge,
    },


    // Xiaomi / Redmi
    {
      regex: /^(22|23|24)\d+/,
      area: SAFE_AREA.android,
    },


    // Huawei/Honor
    {
      regex: /^(ALN|CET|MNA|PGT|REA)-/,
      area: SAFE_AREA.android,
    },


    // OPPO
    {
      regex: /^(PKT|PHY|PGF)/,
      area: SAFE_AREA.android,
    },


    // OnePlus
    {
      regex: /^(PJZ|CPH)/,
      area: SAFE_AREA.android,
    },


    // vivo
    {
      regex: /^V\d{4}/,
      area: SAFE_AREA.android,
    },

  ];


  const matched =
    rules.find(
      item => item.regex.test(model)
    );


  if (matched) {

    return matched.area;

  }


  return DEFAULT_SAFE_AREA;

}