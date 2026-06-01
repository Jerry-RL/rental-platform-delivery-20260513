/** 订单前必读协议（Preview 演示文案，正式环境对接 CMS/法务版本号） */

export const RENTAL_AGREEMENT_VERSION = "2026-06-01";

export const RENTAL_AGREEMENT_STORAGE_KEY = "rental-preview-agreements-accepted";

export type RentalAgreementSection = {
  heading: string;
  body: string;
};

export type RentalAgreementDoc = {
  id: string;
  title: string;
  shortLabel: string;
  sections: RentalAgreementSection[];
};

export const RENTAL_AGREEMENT_DOCS: RentalAgreementDoc[] = [
  {
    id: "service",
    title: "租车服务协议",
    shortLabel: "租车服务协议",
    sections: [
      {
        heading: "服务说明",
        body:
          "您通过本平台预订的车辆，由平台或合作门店提供。订单以系统确认的取还车时间、门店、车型及费用为准。"
      },
      {
        heading: "取还车",
        body:
          "请按订单约定时间到指定门店交车、还车。迟到取车可能缩短租期但不减免费用；延迟还车按超时规则计费。"
      },
      {
        heading: "自驾与包车",
        body:
          "自驾订单须持本人有效驾驶证取车；包车订单由平台指派司机，客户无需提供驾驶证。混合或批量订单按每台车服务方式分别执行。"
      },
      {
        heading: "取消与改期",
        body: "演示环境：未支付订单可直接取消；已支付订单取消与改期规则以订单详情及门店政策为准。"
      }
    ]
  },
  {
    id: "deposit",
    title: "押金与违章须知",
    shortLabel: "押金与违章须知",
    sections: [
      {
        heading: "押金",
        body:
          "取车前可能冻结或收取车辆押金（演示未单独扣款）。还车验车无新增损伤、无未结费用后，押金按渠道规则释放。"
      },
      {
        heading: "违章与事故",
        body:
          "租期内交通违章、事故由实际驾驶人承担处理责任。平台可协助查询违章并代为处理，相关罚款、服务费从押金或后续账单扣除。"
      },
      {
        heading: "车辆损坏",
        body:
          "请如实上报刮蹭、碰撞等情况。还车时发现与取车记录不符的损伤，按维修估价与免赔条款结算。"
      }
    ]
  },
  {
    id: "privacy",
    title: "个人信息与隐私政策",
    shortLabel: "隐私政策",
    sections: [
      {
        heading: "信息收集",
        body:
          "为完成租车、实名与驾照认证、支付及开票，我们将收集姓名、证件号、联系方式、驾驶证信息及订单数据。"
      },
      {
        heading: "信息使用",
        body: "上述信息仅用于身份核验、订单履约、客服联系、风控及法律法规要求的情形，不向无关第三方出售。"
      },
      {
        heading: "您的权利",
        body: "您可在「我的」查看订单与认证状态；如需更正或删除演示数据，请联系平台客服（Preview 为本地模拟数据）。"
      }
    ]
  }
];

export const RENTAL_AGREEMENT_SUMMARY = [
  "取还车时间、门店以订单为准，迟到/延迟还车可能产生附加费用",
  "自驾须本人有效驾照；多台自驾须每台车分别完成驾照认证",
  "押金、违章、车损按协议及还车验车结果结算",
  "提交订单即表示您已阅读并同意相关协议"
] as const;

export const isAgreementAccepted = (stored: string | null): boolean => {
  if (!stored) return false;
  try {
    const parsed = JSON.parse(stored) as { version?: string; accepted?: boolean };
    return parsed.version === RENTAL_AGREEMENT_VERSION && parsed.accepted === true;
  } catch {
    return false;
  }
};

export const buildAgreementAcceptPayload = () =>
  JSON.stringify({ version: RENTAL_AGREEMENT_VERSION, accepted: true, at: new Date().toISOString() });
