export type Invoice = {
  total: number;
};

export type Receipt = {
  total: number;
  deposit: number;
  change: number;
};

export type Payment = {
  type: 'CASH' | 'COUPON';
  percentage?: number;
  amount?: number;
};

export function charge(invoice: Invoice, payments: Payment[]) {
  const total = invoice.total;
  // デポジットを加算していくためlet
  let deposit = 0;

  payments
    // COUPONを最初にくるようにして、割引をしてからCASHを計算する
    .sort((payment) => (payment.type !== 'CASH' ? -1 : 1))
    // 各支払いを計算
    .forEach((payment) => {
      // クーポンの場合
      if (payment.type === 'COUPON') {
        // パーセントがあれば
        if (payment.percentage != null) {
          // 割引率を計算してデポジットに加算
          deposit += Math.floor(total * (payment.percentage / 100));
          // パーセントでなければ
        } else {
          // 割引額をデポジットに加算
          deposit += payment.amount || 0;
        }
        // キャッシュの場合
      } else {
        // クーポンでまかない切れていたらエラー
        if (deposit >= total) {
          throw new Error('OverCharge');
        }
        // 足りなければデポジットに加算
        deposit += payment.amount || 0;
      }
    });
  // トータルに足りなかったら
  if (total > deposit) {
    throw new Error('Shortage');
  }

  // 全てクーポンか判定する処理
  let isCoupon = true;
  for (let i = 0; i < payments.length; i++) {
    if (payments[i].type !== 'COUPON') {
      isCoupon = false;
      continue;
    }
  }
  // 全てクーポンならchargeを0にする
  if (isCoupon) return { total, deposit, change: 0 };
  // そうでなければ、chargeを出す
  return { total: total, deposit: deposit, change: deposit - total };
}
