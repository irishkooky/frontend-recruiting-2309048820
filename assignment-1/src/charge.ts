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

export function charge(invoice: Invoice, payments: Payment[]): Receipt {
  const total = invoice.total;
  let deposit = 0;
  let cashDeposit = 0;

  // クーポンによるデポジットを計算
  payments.forEach((payment) => {
    if (payment.type === 'COUPON') {
      if (payment.percentage != null) {
        deposit += Math.floor(total * (payment.percentage / 100));
      } else {
        deposit += payment.amount || 0;
      }
    }
  });

  // クーポンだけで全額カバーされているかチェック
  const isFullyCoveredByCoupons = deposit >= total;

  // 現金によるデポジットを計算
  payments.forEach((payment) => {
    if (payment.type !== 'COUPON') {
      cashDeposit += payment.amount || 0;
    }
  });

  // クーポンだけで全額カバーされている場合、現金の支払いはエラー
  if (isFullyCoveredByCoupons && cashDeposit > 0) {
    throw new Error('OverCharge');
  }

  deposit += cashDeposit;

  // 支払額が足りない場合はエラー
  if (total > deposit) {
    throw new Error('Shortage');
  }

  // クーポンのみの場合はお釣りを出さない
  const isCouponOnly = payments.every((payment) => payment.type === 'COUPON');
  if (isCouponOnly) {
    return { total, deposit, change: 0 };
  }

  return { total, deposit, change: deposit - total };
}
