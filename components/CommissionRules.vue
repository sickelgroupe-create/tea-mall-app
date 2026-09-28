<template>
  <view class="commission-rules-copy">
    <text>直属好友固定提成</text>
    <text>仅启用且审核通过的合伙人可获得直属好友订单提成。金额由后台商品管理设置，以下单时保存的金额为准；提成为 0 元的商品不产生佣金。</text>
    <text>每单每种商品计一次，同商品多件不重复计算。支付成功后进入待结算，订单确认完成后转为可提现。</text>
    <text>取消订单不产生佣金；退款时撤回已全退商品的提成，同商品尚有未退件数时保留提成。</text>
  </view>
</template>
<style scoped>
.commission-rules-copy { display: flex; flex-direction: column; gap: 18rpx; padding: 24rpx; background: #fff; border-radius: 18rpx; }
.commission-rules-copy text { font-size: 25rpx; line-height: 1.7; color: #68746c; white-space: normal; }
.commission-rules-copy text:first-child { font-size: 29rpx; font-weight: 600; color: #174b34; }
</style>
