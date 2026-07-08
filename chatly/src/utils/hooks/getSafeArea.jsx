import { getDeviceInfo } from "tauri-plugin-device-info-api";

// 安全区常量
const DEFAULT_SAFE_AREA = { top: 0, bottom: 0, left: 0, right: 0 };
const SAFE_AREA = {
  island: { top: 59, bottom: 34, left: 0, right: 0 },
  notch: { top: 47, bottom: 34, left: 0, right: 0 },
  androidNormal: { top: 50, bottom: 24, left: 0, right: 0 },
  androidLarge: { top: 60, bottom: 34, left: 0, right: 0 },
};

// 异步获取当前设备信息，更名为 globalDevice 避免与函数形参冲突
const globalDevice = await getDeviceInfo();

/**
 * 依据 getDeviceInfo 返回的字段计算安全区
 * @param {object} device getDeviceInfo 原始返回对象，默认值为当前宿主设备信息
 * @returns {object} {top,bottom,left,right}
 */
export function getSafeArea(device = globalDevice) {
  if (!device?.model || !device?.manufacturer) return DEFAULT_SAFE_AREA;
  const { manufacturer, model, os } = device;

  // ==========================================
  // 1. 最高频桌面端拦截
  // ==========================================
  // Windows 桌面端直接拦截归零
  const isWindows = (os && /windows/i.test(os)) || /microsoft/i.test(manufacturer) || /windows/i.test(model);
  if (isWindows) return DEFAULT_SAFE_AREA;

  // ==========================================
  // 2. 安卓大类优先判定（你的核心诉求：不漏掉任何一台安卓机）
  // ==========================================
  // 通过 os、厂商和型号中是否包含 android/linux（安卓底层是linux）或者常见国产厂商来百分百圈定安卓
  const isAndroid =
    (os && /android/i.test(os)) ||
    /Xiaomi|Huawei|Honor|OPPO|vivo|OnePlus|Realme|Meizu|Samsung/i.test(manufacturer) ||
    /android/i.test(model);
  if (isAndroid) {
    // 【详细判断安卓机型】
    // 细分三星或大屏系列
    const isSamsungLarge = /Samsung/i.test(manufacturer) || /^SM-(S9|F9)/.test(model);
    if (isSamsungLarge) return SAFE_AREA.androidLarge;
    // 其余所有安卓机（包括主流国产和未来可能出现的未知安卓品牌）
    // 稳定兜底 50px 状态栏空间，保证最上层时间、Wi-Fi 不被遮挡
    return SAFE_AREA.androidNormal;
  }

  // ==========================================
  // 3. 苹果设备大类判定
  // ==========================================
  const isApple = manufacturer.includes("Apple");
  if (isApple) {
    // 排除苹果桌面端（Mac 归零）
    const isAppleDesktop = /^(Mac|iMac|MacBook)/.test(model);
    if (isAppleDesktop) return DEFAULT_SAFE_AREA;
    // 细分 iPhone 型号
    if (/^iPhone1[5-9],/.test(model)) return SAFE_AREA.island; // iPhone 15 及以上
    if (model === "iPhone12,8") return DEFAULT_SAFE_AREA;       // SE3
    if (/^iPhone1[0-4],/.test(model)) return SAFE_AREA.notch;  // iPhone 10-14
    return SAFE_AREA.island; // 未来新机兜底
  }

  // ==========================================
  // 4. 低频/边缘环境特殊拦截
  // ==========================================
  // 虚拟机与模拟器（通常仅在开发调试或安全审计时触发）
  const isVirtualEnvironment =
    /vmware|virtualbox|qemu|xen|kvm|oracle/i.test(manufacturer) ||
    /vbox|qemu|virtual|simulator|emulator|goldfish|nox|bluestacks|sdk_gphone/i.test(model);
  if (isVirtualEnvironment) return DEFAULT_SAFE_AREA;

  // Linux 桌面端
  const isLinux = (os && /linux/i.test(os)) || /linux/i.test(model);
  if (isLinux) return DEFAULT_SAFE_AREA;

  // 兜底返回
  return DEFAULT_SAFE_AREA;
}