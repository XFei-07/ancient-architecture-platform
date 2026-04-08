import {GET,POST,FILE,FILEPOST,PUT,GETNOBASE} from "../api";
const indexUrl=  {
    'leftTop':'/bigscreen/countDeviceNum',//左上演示数据
    'leftCenter':'/bigscreen/countUserNum',//左中演示数据
    "centerMap":"/bigscreen/centerMap",
    "centerBottom":"/bigscreen/installationPlan",

    'leftBottom':"/bigscreen/leftBottom", //左下演示数据
    'rightTop':"/bigscreen/alarmNum", //右上演示趋势
    'rightBottom':'/bigscreen/rightBottom',//右下演示列表
    'rightCenter':'/bigscreen/ranking',//右中演示排行
}

export default indexUrl

/** 左上--演示统计总览 */
export const countDeviceNum=(param:any={})=>{
    return GET(indexUrl.leftTop,param)
}

/** 左中--演示分类统计 */
export const countUserNum=(param:any={})=>{
    return GET(indexUrl.leftCenter,param)
}

/** 左下--演示时间线 */
export const leftBottom=(param:any={})=>{
    return GET(indexUrl.leftBottom,param)
}

/**中上--地图 */
export const centerMap=(param:any={})=>{
    return GET(indexUrl.centerMap,param)
}

/** 中下--演示数据 */
export const installationPlan=(param:any={})=>{
    return GET(indexUrl.centerBottom,param)
}

/** 右上--演示趋势 */
export const alarmNum=(param:any={})=>{
    return GET(indexUrl.rightTop,param)
}

/** 右中--演示排行 */
export const ranking=(param:any={})=>{
    return GET(indexUrl.rightCenter,param)
}

/** 右下--演示列表 */
export const rightBottom=(param:any={})=>{
    return GET(indexUrl.rightBottom,param)
}
