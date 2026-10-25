import { ref } from 'vue'
import { defineStore } from 'pinia'
// import { storeToRefs } from 'pinia';

type ThemeName = 'bronze' | 'emerald'
const FIXED_THEME: ThemeName = 'emerald'

export const useSettingStore = defineStore('setting', () => {
  const settingShow = ref(false);//设置弹窗显隐
  const isScale = ref(true);//默认启用全局适配，避免1920画布在普通屏幕上溢出
  const themeName = ref<ThemeName>(FIXED_THEME);//大屏主题（固定青绿）
  const indexConfig = ref({
    leftBottomSwiper: true,//左轮播
    rightBottomSwiper: true,//右下轮播
  })
  const defaultOption = ref({
    step: 4, // 数值越大速度滚动越快
    hover: true, // 是否开启鼠标悬停stop
    wheel: false,//在开启鼠标悬停的情况下是否开启滚轮滚动，默认不开启
    openWatch: true, // 开启数据实时监控刷新dom
    direction: 1, // 0向下 1向上 2向左 3向右
    limitScrollNum: 4, // 开始无缝滚动的数据量 this.dataList.length
    singleHeight: 0, // 单步运动停止的高度(默认值0是无缝不停止的滚动) direction => 0/1
    singleWidth: 0, // 单步运动停止的宽度(默认值0是无缝不停止的滚动) direction => 2/3
    singleWaitTime: 3000 // 单步运动停止的时间(默认值1000ms)
  })
  const setSettingShow = (flag: boolean) => {
    settingShow.value = flag
  }
  const setIsScale = (flag: boolean) => {
    isScale.value = flag
    setSettingData()
  }
  const setTheme = (_theme: ThemeName) => {
    themeName.value = FIXED_THEME
    setSettingData()
  }
  const setIndexConfig = (Config: any) => {
    indexConfig.value = Config
    localStorage.setItem('loftv-indexConfig', JSON.stringify(indexConfig.value))
  }
  const initSetting = () => {
    let settingData: any = localStorage.getItem('loftv-settingData')
    if (settingData) {
      try {
        settingData = JSON.parse(settingData)
        // v2 修复了旧版本默认关闭自适应的问题；迁移时统一开启一次。
        setIsScale(settingData.layoutVersion >= 2 ? settingData.isScale !== false : true)
      } catch {
        setIsScale(true)
      }
    } else {
      setIsScale(true)
    }
    setTheme(FIXED_THEME)
    let settingIndexConfig: any = localStorage.getItem('loftv-indexConfig')
    if (settingIndexConfig) {
      settingIndexConfig = JSON.parse(settingIndexConfig)
      setIndexConfig(settingIndexConfig)
    }
  }
  const setSettingData = () => {
    localStorage.setItem('loftv-settingData', JSON.stringify({
      layoutVersion: 2,
      isScale: isScale.value,
      themeName: themeName.value,
    }))
  }
  return {
    settingShow,
    setSettingShow,
    isScale,
    setIsScale,
    themeName,
    initSetting,
    setSettingData,
    defaultOption,
    indexConfig,
    setIndexConfig
  }
})
