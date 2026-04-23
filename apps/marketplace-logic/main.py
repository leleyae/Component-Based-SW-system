from fastapi import FastAPI

app = FastAPI(title="Marketplace Logic API", version="0.1.0")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/marketplace/listings")
def list_listings():
    """Return available designer service listings."""
    return {"listings": []}


@app.post("/marketplace/commission")
def calculate_commission(gross_amount: float):
    """
    Calculate platform commission (20%) and designer payout (80%).
    """
    platform_commission = round(gross_amount * 0.20, 2)
    designer_payout = round(gross_amount - platform_commission, 2)
    return {
        "gross_amount": gross_amount,
        "platform_commission": platform_commission,
        "designer_payout": designer_payout,
    }
