from datetime import datetime
from collections import defaultdict
from typing import List, Dict, Any


def parse_dmy(date_str: str) -> datetime:
    """
    Parse a date in dd-mm-YYYY format.
    """
    return datetime.strptime(date_str, "%d-%m-%Y")


def analyze(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Default scenario analysis.

    records : list of dict like:
        {
          "Store": 1,
          "Date": "05-02-2010",
          "Weekly_Sales": 1643690.9,
          "Holiday_Flag": 0,
          "Temperature": 42.31,
          "Fuel_Price": 2.572,
          "CPI": 211.0963582,
          "Unemployment": 8.106
        }
    """

    if not records:
        return {
            "kpis": {
                "total_sales": 0.0,
                "weeks": 0,
                "avg_sales": 0.0,
            },
            "trend": [],
            "store_share": [],
            "key_metrics": {},
        }

    try:
        sorted_records = sorted(
            records,
            key=lambda r: parse_dmy(str(r.get("Date", "")))
        )
    except Exception:
        sorted_records = records

    total_sales = 0.0
    trend = []
    store_sales = defaultdict(float)

    holiday_sales = 0.0
    weekday_sales = 0.0
    holiday_weeks = 0
    weekday_weeks = 0

    for r in sorted_records:
        try:
            store = int(r.get("Store", 0))
        except (ValueError, TypeError):
            continue

        date_str = str(r.get("Date", "")).strip()
        try:
            parse_dmy(date_str)
        except Exception:
            continue

        weekly_sales = float(r.get("Weekly_Sales", 0.0) or 0.0)
        flag = r.get("Holiday_Flag", 0)

        total_sales += weekly_sales
        store_sales[store] += weekly_sales

        if flag == 1:
            holiday_sales += weekly_sales
            holiday_weeks += 1
        else:
            weekday_sales += weekly_sales
            weekday_weeks += 1

        trend.append({
            "date": date_str,
            "store": store,
            "weekly_sales": weekly_sales,
        })

    weeks = len(trend)
    avg_sales = total_sales / weeks if weeks else 0.0

    store_share = [
        {"store": store, "total_sales": sales}
        for store, sales in sorted(store_sales.items(), key=lambda x: x[0])
    ]

    key_metrics = {
        "Total Sales (₹ Cr)": round(total_sales / 1e7, 2),
        "Holiday Sales (₹ Cr)": round(holiday_sales / 1e7, 2),
        "Weekday Sales (₹ Cr)": round(weekday_sales / 1e7, 2),
        "Holiday Weeks": holiday_weeks,
        "Weekday Weeks": weekday_weeks,
    }

    return {
        "kpis": {
            "total_sales": total_sales,
            "weeks": weeks,
            "avg_sales": avg_sales,
        },
        "trend": trend,
        "store_share": store_share,
        "key_metrics": key_metrics,
    }