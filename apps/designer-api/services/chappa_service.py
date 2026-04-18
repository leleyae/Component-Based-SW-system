from decimal import Decimal

PLATFORM_COMMISSION_RATE = Decimal("0.20")


def calculate_commission(gross_amount: Decimal) -> dict:
    """
    Split a gross payment into designer payout and platform commission.

    Invariants:
      - platform_commission + designer_payout == gross_amount
      - platform_commission == gross_amount * 0.20

    designer_payout is derived as gross - commission (not gross * 0.80)
    to guarantee the sum invariant holds exactly under decimal rounding.
    """
    platform_commission = (gross_amount * PLATFORM_COMMISSION_RATE).quantize(
        Decimal("0.01")
    )
    designer_payout = gross_amount - platform_commission

    return {
        "gross_amount": gross_amount,
        "designer_payout": designer_payout,
        "platform_commission": platform_commission,
    }
