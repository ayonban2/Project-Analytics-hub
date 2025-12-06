from datetime import datetime
from collections import defaultdict
from typing import List, Dict, Any


def parse_dmy(date_str: str) -> datetime:
    return datetime.strptime(date_str, "%d-%m-%Y")


def analyze(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not records:
        return {
            "kpis": {},
            "trend": [],
            "store_share": [],
            "custom": {},
        }

    def safe_date(rec):
        try:
            return parse_dmy(str(rec.get("Date", "")))
        except Exception:
            return datetime.min

    sorted_records = sorted(records, key=safe_date)

    total_sales = 0.0
    weeks = 0
    trend = []
    store_sales = defaultdict(float)

    for r in sorted_records:
        try:
            store = int(r.get("Store", 0))
        except (TypeError, ValueError):
            continue

        date_str = str(r.get("Date", "")).strip()
        try:
            parse_dmy(date_str)
        except Exception:
            continue

        weekly_sales = float(r.get("Weekly_Sales", 0.0) or 0.0)

        total_sales += weekly_sales
        weeks += 1
        store_sales[store] += weekly_sales

        trend.append({
            "date": date_str,
            "store": store,
            "weekly_sales": weekly_sales,
        })

    avg_sales = total_sales / weeks if weeks else 0.0

    store_share = [
        {"store": store, "total_sales": total}
        for store, total in sorted(store_sales.items(), key=lambda x: x[0])
    ]

    holiday_sales = 0.0
    nonholiday_sales = 0.0
    for r in sorted_records:
        flag = r.get("Holiday_Flag", 0)
        ws = float(r.get("Weekly_Sales", 0.0) or 0.0)
        if flag == 1:
            holiday_sales += ws
        else:
            nonholiday_sales += ws

    holiday_vs_nonholiday = [
        {"label": "Holiday Weeks", "sales": holiday_sales},
        {"label": "Non-Holiday Weeks", "sales": nonholiday_sales},
    ]

    return {
        "kpis": {
            "total_sales": total_sales,
            "weeks": weeks,
            "avg_sales": avg_sales,
        },
        "trend": trend,
        "store_share": store_share,
        "custom": {
            "holiday_vs_nonholiday": holiday_vs_nonholiday
        }
    }
