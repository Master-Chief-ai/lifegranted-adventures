export const COMMISSION = {
  total: 0.15,
  guaranteeFund: 0.03,
  operating: 0.12,
  operator: 0.85,
}

export interface BookingFees {
  tourPrice: number
  platformCommission: number
  guaranteeFundContribution: number
  platformOperatingRevenue: number
  operatorPayout: number
  bookingFee: number
  bookingFeeRate: number
  touristTotal: number
}

export function calculateBookingFees(tourPriceUsd: number, paymentMethod: 'card' | 'mobile'): BookingFees {
  const platformCommission = Math.round(tourPriceUsd * COMMISSION.total * 100) / 100
  const guaranteeFundContribution = Math.round(tourPriceUsd * COMMISSION.guaranteeFund * 100) / 100
  const platformOperatingRevenue = Math.round(tourPriceUsd * COMMISSION.operating * 100) / 100
  const operatorPayout = Math.round(tourPriceUsd * COMMISSION.operator * 100) / 100
  const bookingFeeRate = paymentMethod === 'card' ? 0.038 : 0.014
  const bookingFee = Math.round(tourPriceUsd * bookingFeeRate * 100) / 100
  const touristTotal = Math.round((tourPriceUsd + bookingFee) * 100) / 100

  return {
    tourPrice: tourPriceUsd,
    platformCommission,
    guaranteeFundContribution,
    platformOperatingRevenue,
    operatorPayout,
    bookingFee,
    bookingFeeRate,
    touristTotal,
  }
}
