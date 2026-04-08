<script setup lang="ts">
import { reactive } from "vue";
import SeamlessScroll from "@/components/seamless-scroll";

import imgDougong from "@/assets/img/components/dougong.jpg";
import imgSoumao from "@/assets/img/components/soumao.jpg";
import imgXieshanding from "@/assets/img/components/xieshanding.jpg";
import imgZaojing from "@/assets/img/components/zaojing.jpg";
import imgQueti from "@/assets/img/components/queti.jpg";
import imgYueliang from "@/assets/img/components/yueliang.jpg";
import imgChiwen from "@/assets/img/components/chiwen.jpg";
import imgBaogushi from "@/assets/img/components/baogushi.jpg";
import imgQiaotai from "@/assets/img/components/qiaotai.jpg";
import imgQiaodun from "@/assets/img/components/qiaodun.jpg";
import imgGongquan from "@/assets/img/components/gongquan.jpg";
import imgFenshuijian from "@/assets/img/components/fenshuijian.jpg";
import imgLanbanWangzhu from "@/assets/img/components/lanban_wangzhu.jpg";
import imgYanchiqiang from "@/assets/img/components/yanchiqiang.jpg";

interface ComponentItem {
  name: string;
  brief: string;
  detail: string;
  img: string;
  category: "木构" | "石构桥梁";
}

interface ComponentMeta {
  era: string;
  material: string;
  role: string;
  example: string;
  distribution: string[];
}

const list: ComponentItem[] = [
  {
    name: "斗拱",
    category: "木构",
    brief: "承重防震的特有木构",
    detail:
      "斗拱位于柱与梁之间，通过层层挑出的‘拱’与‘斗’把庞大屋面的荷载逐级转移到立柱，是中国木构建筑最具辨识度的结构核心。从受力逻辑看，斗拱不仅承担竖向荷载传递，还能在风震作用下通过榫卯节点产生微小弹性位移，形成柔性耗能。正因如此，许多古建在墙体受损后仍能保持梁架稳定。唐宋斗拱雄浑舒展，明清斗拱趋于繁缛装饰，既体现力学智慧，也成为礼制等级与审美秩序的视觉符号。",
    img: imgDougong,
  },
  {
    name: "榫卯",
    category: "木构",
    brief: "无钉无铆的连接绝技",
    detail:
      "榫卯是中国传统木作体系的关键连接技术，通过榫头与卯眼的三维咬合完成构件锁定，不依赖金属钉件即可形成可靠节点。其价值不只在于‘牢’，更在于‘韧’：当建筑受到风荷载、地震或温湿变化影响时，榫卯可通过微量位移释放应力，减少脆性破坏风险。从工艺层面看，榫卯需要极高精度的下料与拼装经验，既是结构问题，也是工艺体系。千百年来，这种连接逻辑贯穿殿堂、民居与园林，构成中国木构可持续维护与重复修缮的技术基础。",
    img: imgSoumao,
  },
  {
    name: "歇山顶",
    category: "木构",
    brief: "仅次于庑殿的华贵屋顶",
    detail:
      "歇山顶是中国古代高等级屋顶形制之一，兼具悬山与庑殿特征，上部收束挺拔、下部四坡舒展，形成极具层次的轮廓线。其价值并非单纯‘好看’，而是同时处理了礼制表达、排水组织与构架稳定。歇山顶通过多脊线分解屋面尺度，使建筑在远观时更具庄重感，在近看时又呈现细部节奏。宋以后，歇山顶在皇宫与官府高等级建筑中广泛应用，成为“等级、技术、审美”三者统一的代表性屋顶体系。",
    img: imgXieshanding,
  },
  {
    name: "藻井",
    category: "木构",
    brief: "穹窿状的华丽天花板",
    detail:
      "藻井常设置在大殿核心位置，采用层层内收的构造形成穹窿式顶心，不仅强调视觉中心，也承担礼仪空间的秩序组织。古人通过斗拱、枋梁与雕饰组合，使其成为“结构与装饰合一”的高阶构件。藻井常配合彩画、鎏金、龙纹或几何纹样，强化空间神圣性与仪式感。其“井”与“藻”的命名还隐含传统防火祈愿，体现古代营造中功能、象征与心理需求的叠合逻辑。",
    img: imgZaojing,
  },
  {
    name: "雀替",
    category: "木构",
    brief: "柱枋交接处的优美支撑",
    detail:
      "雀替位于柱与枋交接部位，早期主要用于分担节点应力、减小梁端悬挑带来的局部变形，是木架稳定性的重要补强构件。进入明清后，雀替逐渐由“纯结构件”向“结构+装饰”复合件演化，出现大量透雕、浮雕与彩绘形式。它既能在檐下形成细部节奏，又能作为礼制与地域风格的表达载体。对研究者而言，雀替是观察古建从实用建造走向审美系统化的重要窗口。",
    img: imgQueti,
  },
  {
    name: "月梁",
    category: "木构",
    brief: "如新月般微弯的秀美横梁",
    detail:
      "月梁因梁身微拱、两端收分而得名，常见于江南与徽派建筑。它并非“装饰性弯曲”，而是与受力分布相吻合的形态优化：梁中部弯矩较大，弧形线条可在视觉和结构上同时回应这种力学状态。月梁让沉重木梁呈现轻盈韵律，弱化体量压迫感，强化室内空间的柔性秩序。它体现了古代匠人将受力经验、材料认知与审美判断融合的造物能力。",
    img: imgYueliang,
  },
  {
    name: "鸱吻",
    category: "木构",
    brief: "镇守屋脊的避火神兽",
    detail:
      "鸱吻位于正脊两端，是高等级屋顶最醒目的脊饰构件之一。结构上，它有助于脊线收口与构件压稳；文化上，它承载镇火避灾、护佑建筑的象征意义。唐宋时期鸱尾形态较为古朴，明清时期鸱吻趋于体量化与装饰化，常与琉璃工艺结合，形成强烈轮廓识别。鸱吻的演变轨迹，能清晰映射中国古建在技术与礼制审美上的历史变迁。",
    img: imgChiwen,
  },
  {
    name: "抱鼓石",
    category: "木构",
    brief: "彰显门第的宅门基座",
    detail:
      "抱鼓石通常位于宅门两侧，是门轴受力系统的外延支撑构件。它通过自重与形体稳定门框节点，减少门扇开合造成的长期扰动。除结构作用外，抱鼓石还具有强烈的社会符号属性，形制、纹样与尺寸常与宅院等级、身份诉求相关。由“门当户对”语义可见其文化影响。它既是建筑五金缺席时代的力学解决方案，也是礼俗秩序在石作中的物化体现。",
    img: imgBaogushi,
  },
  {
    name: "桥台",
    category: "石构桥梁",
    brief: "承接桥身与岸线的基础节点",
    detail:
      "桥台是桥梁与陆地衔接的关键受力单元，承担拱圈或梁体传来的集中荷载，并将推力稳定传入地基。古代工匠在桥台营造中尤其强调地基处理、砌体咬合和排水组织，以防止长期渗水造成松动。桥台同时决定桥头空间的过渡方式，常与踏步、引桥、护岸一体设计。对古桥保护而言，桥台稳定性往往直接决定桥身是否能够长期安全服役。",
    img: imgQiaotai,
  },
  {
    name: "桥墩",
    category: "石构桥梁",
    brief: "支撑跨径并分解水流冲击",
    detail:
      "桥墩是多孔桥体系中的核心竖向承重构件，主要功能是支撑上部结构并将荷载传递至基础。中国古桥桥墩常根据河道条件采用矩形、梭形或分水形，以兼顾结构稳定与水动力表现。优秀桥墩不仅要承受恒载与活载，还需应对洪水冲刷、漂浮物撞击与河床变化。通过细致的石作砌筑与形体优化，古代桥工在无现代钢筋混凝土条件下实现了高耐久的水工构筑体系。",
    img: imgQiaodun,
  },
  {
    name: "拱券",
    category: "石构桥梁",
    brief: "将竖向荷载转化为水平推力",
    detail:
      "拱券是石拱桥的灵魂结构，通过楔形券石的相互挤压形成稳定拱环，把上部竖向荷载转换为沿拱圈传导的压力并最终传至桥台桥墩。其关键在于几何曲线、券石精度与施工顺序的协同。拱券一旦闭合成环，整体刚度与承载能力显著提升。赵州桥等经典实例证明，合理的拱券比例与受力路径可在无胶结或低胶结条件下保持千年耐久，是中国古代工程智慧的重要代表。",
    img: imgGongquan,
  },
  {
    name: "分水尖",
    category: "石构桥梁",
    brief: "削减迎水阻力的水工形体",
    detail:
      "分水尖多设置于桥墩迎水侧，常采用尖劈或圆钝过渡形体，目的在于降低水流正面冲击、减轻局部紊流和淘刷风险。洪水期漂浮物撞击桥墩时，分水尖还能分导冲击路径，保护墩身主结构。它是桥梁结构与水工条件耦合设计的典型成果，体现古代桥梁营造并非只关心“跨得过去”，还高度关注“长期在水中稳定存在”。",
    img: imgFenshuijian,
  },
  {
    name: "栏板与望柱",
    category: "石构桥梁",
    brief: "桥面安全边界与礼仪装饰系统",
    detail:
      "栏板与望柱构成古桥桥面的边界系统，既承担行走安全防护，也承载审美与礼制表达。望柱常置于栏板分段节点，通过柱头雕刻形成节奏与象征；栏板则通过浮雕、线脚和几何纹样强化整体连续性。很多桥梁石构件沿用了木作榫卯逻辑，使其便于预制、拼装与维护。作为“可触达”的桥面界面，栏板与望柱往往最能体现一座古桥的工艺风格与地方文化。",
    img: imgLanbanWangzhu,
  },
  {
    name: "雁翅墙",
    category: "石构桥梁",
    brief: "桥头护岸与导流的扩展构造",
    detail:
      "雁翅墙通常位于桥头两侧，以外展翼状形体连接桥台与河岸护砌，作用是稳定桥头填土、引导水流并减轻冲刷集中。其形体与长度需匹配岸坡、流速与洪水位变化，属于桥梁与河道整治的结合部工程。许多古桥在桥身本体保存较好但桥头失稳时，问题往往出在雁翅墙系统。由此可见，古桥保护必须把桥身、桥台与附属护岸作为整体看待。",
    img: imgYanchiqiang,
  },
];

const componentMeta: Record<string, ComponentMeta> = {
  斗拱: { era: "唐宋至明清", material: "木", role: "荷载传递与抗震耗能", example: "故宫太和殿、平遥县衙", distribution: ["山西", "河北", "陕西"] },
  榫卯: { era: "新石器至明清", material: "木", role: "节点连接与变形协调", example: "故宫太和殿梁架", distribution: ["北京", "山西", "江苏"] },
  歇山顶: { era: "宋至清", material: "木/瓦", role: "屋面收束与等级表达", example: "天安门", distribution: ["北京", "河北", "河南"] },
  藻井: { era: "唐至清", material: "木", role: "室内核心装饰与礼仪焦点", example: "故宫太和殿藻井", distribution: ["北京", "山西", "陕西"] },
  雀替: { era: "宋至清", material: "木", role: "柱枋节点加固与装饰", example: "徽派民居门厅雀替", distribution: ["安徽", "江苏", "浙江"] },
  月梁: { era: "唐宋风格延续", material: "木", role: "横梁受力与形态优化", example: "江南厅堂木构", distribution: ["江苏", "浙江", "安徽"] },
  鸱吻: { era: "唐至清", material: "陶/琉璃", role: "压脊防水与象征", example: "故宫屋脊鸱吻", distribution: ["北京", "山西", "河南"] },
  抱鼓石: { era: "明清", material: "石", role: "门轴承托与门第标识", example: "四合院宅门", distribution: ["北京", "山西", "陕西"] },
  桥台: { era: "隋唐至清", material: "石/砖", role: "承接桥身与地基传力", example: "赵州桥桥台", distribution: ["河北", "江苏", "福建"] },
  桥墩: { era: "汉至清", material: "石", role: "多孔桥竖向承重与分流", example: "宝带桥桥墩", distribution: ["江苏", "浙江", "广东"] },
  拱券: { era: "隋至清", material: "石", role: "拱桥主体受力环", example: "安济桥拱券", distribution: ["河北", "山西", "四川"] },
  分水尖: { era: "宋至清", material: "石", role: "削减迎水冲击与冲刷", example: "广济桥分水墩", distribution: ["广东", "江苏", "福建"] },
  "栏板与望柱": { era: "唐至清", material: "石", role: "桥面防护与礼仪装饰", example: "卢沟桥栏板望柱", distribution: ["北京", "河北", "浙江"] },
  雁翅墙: { era: "宋至清", material: "石/砖", role: "桥头护岸与导流", example: "江南古桥桥头翼墙", distribution: ["江苏", "浙江", "福建"] },
};

const defaultMeta: ComponentMeta = {
  era: "传统时期",
  material: "木/石",
  role: "结构与装饰复合",
  example: "典型古建实例",
  distribution: ["山西", "河南", "浙江"],
};

const state = reactive({
  list,
  scroll: true,
  modalVisible: false,
  activeItem: null as ComponentItem | null,
});

const getMeta = (name: string): ComponentMeta => componentMeta[name] || defaultMeta;

const getDetailedDescription = (item: ComponentItem): string => {
  const meta = getMeta(item.name);
  const categoryExplain =
    item.category === "木构"
      ? "木构系统强调节点协同、尺度递进与构架弹性，构件之间往往通过榫卯和层级构造共同完成受力传导。"
      : "石构桥梁系统强调基础稳定、水工条件与整体受力闭合，构件之间通常通过砌体咬合与几何形体协同工作。";
  return `${item.detail}

从营造语境看，${item.name}主要对应“${meta.role}”这一环节，常见于${meta.example}等实例，集中分布在${meta.distribution.join(
    "、"
  )}等地区。其材料以${meta.material}为主，工匠会根据${meta.era}以来的技术传统，持续调整尺度比例、节点处理与装配顺序，以兼顾结构安全和视觉秩序。${categoryExplain}

在保护修缮实践中，${item.name}通常需要结合构件病害、节点受力与环境变化进行综合判断，重点关注开裂、风化、渗水、松动等问题链条。对于数字展示与教学场景，建议把“几何关系、受力路径、历史语义、工艺流程”四个维度联动表达，这样更有助于观众理解其结构价值与文化价值的统一。`;
};

const syncMapByItem = (item: ComponentItem) => {
  const provinces = getMeta(item.name).distribution;
  if (provinces.length) {
    window.dispatchEvent(new CustomEvent("sync-map-provinces", { detail: { provinces } }));
  }
};

const openDetail = (item: ComponentItem) => {
  state.scroll = false;
  state.activeItem = item;
  state.modalVisible = true;
  syncMapByItem(item);
};

const closeDetail = () => {
  state.modalVisible = false;
  state.activeItem = null;
  state.scroll = true;
};
</script>

<template>
  <div class="right_bottom_wrap">
    <div class="scroll-wrap">
      <SeamlessScroll
        :list="state.list"
        v-model="state.scroll"
        :singleHeight="70"
        :step="1.2"
        :limitScrollNum="3"
        :hover="true"
        :singleWaitTime="1500"
        :wheel="true"
      >
        <ul class="scroll-list">
          <li class="scroll-item" v-for="(item, i) in state.list" :key="item.name + i" @click="openDetail(item)">
            <div class="item-thumb">
              <img v-if="item.img" :src="item.img" :alt="item.name" />
              <div class="thumb-placeholder" v-else>待补图</div>
            </div>
            <div class="item-info">
              <div class="item-name-wrap">
                <div class="item-name">{{ item.name }}</div>
                <span class="item-tag" :class="item.category === '石构桥梁' ? 'bridge' : 'wood'">{{ item.category }}</span>
              </div>
              <div class="item-brief">{{ item.brief }}</div>
            </div>
            <div class="item-arrow">></div>
          </li>
        </ul>
      </SeamlessScroll>
    </div>

    <Teleport to="body">
      <div class="detail-overlay" v-if="state.modalVisible" @click.self="closeDetail">
        <div class="detail-modal">
          <div class="modal-close" @click="closeDetail">&times;</div>
          <div class="modal-body" v-if="state.activeItem">
            <div class="modal-img-wrap">
              <img v-if="state.activeItem.img" :src="state.activeItem.img" :alt="state.activeItem.name" />
              <div class="modal-placeholder" v-else>图片待补充</div>
            </div>

            <div class="modal-text">
              <h2 class="modal-title">{{ state.activeItem.name }}</h2>
              <p class="modal-brief">{{ state.activeItem.brief }}</p>
              <div class="meta-grid">
                <div><span>主要时代</span>{{ getMeta(state.activeItem.name).era }}</div>
                <div><span>主要材质</span>{{ getMeta(state.activeItem.name).material }}</div>
                <div><span>结构作用</span>{{ getMeta(state.activeItem.name).role }}</div>
                <div><span>典型实例</span>{{ getMeta(state.activeItem.name).example }}</div>
                <div class="full"><span>典型分布</span>{{ getMeta(state.activeItem.name).distribution.join("、") }}</div>
              </div>
              <button class="map-link-btn" @click="syncMapByItem(state.activeItem)">在地图定位典型分布</button>

              <div class="modal-detail-wrap">
                <div class="modal-divider"></div>
              <p class="modal-detail">{{ getDetailedDescription(state.activeItem) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
.right_bottom_wrap {
  overflow: hidden;
  width: 100%;
  height: 252px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.scroll-wrap {
  flex: 1;
  min-height: 0;
}

.scroll-list {
  width: 100%;
}

.scroll-item {
  display: flex;
  align-items: center;
  padding: 8px 4px;
  height: 58px;
  border-bottom: 1px solid rgba(201, 169, 110, 0.12);
  transition: background 0.2s;
  cursor: pointer;

  &:hover {
    background: rgba(201, 169, 110, 0.08);
  }

  .item-thumb {
    width: 44px;
    height: 44px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid rgba(201, 169, 110, 0.3);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumb-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: rgba(232, 213, 181, 0.6);
      background: linear-gradient(135deg, rgba(60, 46, 32, 0.9), rgba(38, 30, 22, 0.9));
    }
  }

  .item-info {
    flex: 1;
    margin-left: 10px;
    overflow: hidden;

    .item-name-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 2px;
    }

    .item-name {
      font-size: 14px;
      font-weight: bold;
      color: #D4A847;
    }

    .item-tag {
      font-size: 10px;
      padding: 0 6px;
      border-radius: 8px;
      line-height: 16px;
      border: 1px solid rgba(201, 169, 110, 0.3);
      color: rgba(232, 213, 181, 0.72);

      &.bridge {
        border-color: rgba(91, 137, 115, 0.5);
        color: rgba(146, 198, 171, 0.92);
      }

      &.wood {
        border-color: rgba(212, 168, 71, 0.5);
        color: rgba(240, 216, 157, 0.92);
      }
    }

    .item-brief {
      font-size: 11px;
      color: #E8D5B5;
      opacity: 0.75;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .item-arrow {
    flex-shrink: 0;
    color: rgba(201, 169, 110, 0.5);
    font-size: 16px;
    margin-left: 6px;
    margin-right: 2px;
  }
}
</style>

<style>
.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(26, 20, 16, 0.85);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-modal {
  width: min(92vw, 980px);
  height: min(58vh, 500px);
  background: rgba(34, 25, 18, 0.98);
  border: 1px solid rgba(201, 169, 110, 0.5);
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.42);
  position: relative;
  overflow: hidden;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 18px;
  font-size: 28px;
  color: #C9A96E;
  cursor: pointer;
  z-index: 10;
  line-height: 1;
}

.modal-body {
  display: flex;
  align-items: stretch;
  gap: 16px;
  box-sizing: border-box;
  height: 100%;
  padding: 20px 22px;
  overflow: hidden;
}

.modal-img-wrap {
  width: clamp(340px, 40%, 420px);
  flex-shrink: 0;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(201, 169, 110, 0.3);
  background: rgba(26, 20, 16, 0.65);
}

.modal-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.modal-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(232, 213, 181, 0.7);
  font-size: 14px;
}

.modal-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.modal-title {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 2px;
  margin: 0 0 4px;
  background: linear-gradient(92deg, #C9A96E 0%, #F0D89D 50%, #C9A96E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.modal-brief {
  font-size: 13px;
  color: #D4A847;
  margin: 0 0 8px;
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.meta-grid div {
  font-size: 12px;
  color: rgba(232, 213, 181, 0.9);
  padding: 6px 8px;
  border: 1px solid rgba(201, 169, 110, 0.2);
  border-radius: 4px;
  background: rgba(26, 20, 16, 0.35);
}

.meta-grid div span {
  display: block;
  font-size: 10px;
  color: rgba(232, 213, 181, 0.58);
  margin-bottom: 2px;
}

.meta-grid .full {
  grid-column: 1 / -1;
}

.map-link-btn {
  border: 1px solid rgba(212, 168, 71, 0.55);
  border-radius: 16px;
  background: rgba(26, 20, 16, 0.55);
  color: #F0D89D;
  font-size: 12px;
  padding: 4px 12px;
  cursor: pointer;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.modal-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(201, 169, 110, 0.4), transparent);
  margin: 4px 0 10px;
  flex-shrink: 0;
}

.modal-detail-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-detail {
  font-size: 13px;
  line-height: 1.82;
  color: #E8D5B5;
  text-align: justify;
  margin: 0;
  white-space: pre-line;
  height: 100%;
  overflow-y: auto;
  padding-right: 8px;
}

.modal-detail::-webkit-scrollbar {
  width: 4px;
}

.modal-detail::-webkit-scrollbar-thumb {
  background: rgba(201, 169, 110, 0.35);
  border-radius: 2px;
}
</style>
