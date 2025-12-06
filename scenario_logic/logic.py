from typing import Any, Dict, List, Tuple


CRORE_DIVISOR = 1e7
BUCKET_ORDER = ["0", "1-30", "31-60", "61-90", "90+"]


def _to_float(value: Any, default: float = 0.0) -> float:
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return float(value)
    try:
        s = str(value).strip().replace(",", "")
        if not s:
            return default
        return float(s)
    except (ValueError, TypeError):
        return default


def _to_int(value: Any, default: int = 0) -> int:
    if value is None:
        return default
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        return value
    try:
        s = str(value).strip()
        if not s:
            return default
        return int(float(s))
    except (ValueError, TypeError):
        return default


def _clean_category(value: Any, default: str = "Unknown") -> str:
    if value is None:
        return default
    s = str(value).strip()
    return s if s else default


def _to_flag_int(value: Any) -> int:
    # Convert various representations to 0/1.
    # Treat missing/unknown as 0.
    if value is None:
        return 0
    if isinstance(value, bool):
        return 1 if value else 0
    if isinstance(value, (int, float)):
        return 1 if int(value) != 0 else 0

    s = str(value).strip().lower()
    if s in {"1", "y", "yes", "true", "t"}:
        return 1
    return 0


def _summarize_dimensions(accounts: List[Dict[str, Any]]) -> Dict[str, List[str]]:
    regions = set()
    segments = set()
    products = set()
    buckets = set()

    for acc in accounts:
        regions.add(acc.get("Region", "Unknown"))
        segments.add(acc.get("Segment", "Unknown"))
        products.add(acc.get("Product", "Unknown"))
        buckets.add(acc.get("Bucket", "Unknown"))

    # Preserve preferred bucket order where applicable
    ordered_buckets: List[str] = []
    for b in BUCKET_ORDER:
        if b in buckets:
            ordered_buckets.append(b)
    # Add any extra buckets not in the standard order
    for b in sorted(buckets):
        if b not in ordered_buckets:
            ordered_buckets.append(b)

    return {
        "regions": sorted(regions),
        "segments": sorted(segments),
        "products": sorted(products),
        "buckets": ordered_buckets,
    }


def _calculate_key_metrics(
    total_outstanding_inr: float,
    total_npa_outstanding_inr: float,
    total_accounts: int,
    total_npa_accounts: int,
    total_90plus_outstanding_inr: float,
) -> Dict[str, Any]:
    total_outstanding_cr = round(total_outstanding_inr / CRORE_DIVISOR, 2)
    npa_outstanding_cr = round(total_npa_outstanding_inr / CRORE_DIVISOR, 2)
    outstanding_90plus_cr = round(total_90plus_outstanding_inr / CRORE_DIVISOR, 2)

    if total_outstanding_cr > 0:
        npa_percentage = round((npa_outstanding_cr / total_outstanding_cr) * 100.0, 2)
    else:
        npa_percentage = 0.0

    return {
        "Total Outstanding (₹ Cr)": total_outstanding_cr,
        "NPA Outstanding (₹ Cr)": npa_outstanding_cr,
        "NPA Percentage (%)": npa_percentage,
        "Number of Accounts": total_accounts,
        "Number of NPA Accounts": total_npa_accounts,
        "90+ DPD Outstanding (₹ Cr)": outstanding_90plus_cr,
    }


def _clean_account_record(raw: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, float]]:
    # Clean a single raw record and also return contributions for portfolio-level metrics.
    account_id = str(raw.get("Account_ID", "")).strip()
    customer_id = str(raw.get("Customer_ID", "")).strip()

    region = _clean_category(raw.get("Region"))
    segment = _clean_category(raw.get("Segment"))
    product = _clean_category(raw.get("Product"))
    bucket = _clean_category(raw.get("Bucket"))

    outstanding_inr = _to_float(raw.get("Outstanding"), 0.0)
    limit_inr = _to_float(raw.get("Limit"), 0.0)
    outstanding_cr = round(outstanding_inr / CRORE_DIVISOR, 6)  # keep more precision here
    limit_cr = round(limit_inr / CRORE_DIVISOR, 6)

    npa_flag = _to_flag_int(raw.get("NPA_Flag"))
    chargeoff_flag = _to_flag_int(raw.get("Chargeoff_Flag"))
    dpd = _to_int(raw.get("Days_Past_Due"), 0)

    open_date = str(raw.get("Open_Date", "")).strip()
    snapshot_date = str(raw.get("Snapshot_Date", "")).strip()

    cleaned = {
        "Account_ID": account_id,
        "Customer_ID": customer_id,
        "Region": region,
        "Segment": segment,
        "Product": product,
        "Bucket": bucket,
        "Outstanding": outstanding_inr,
        "OutstandingCr": outstanding_cr,
        "Limit": limit_inr,
        "LimitCr": limit_cr,
        "NPA_Flag": npa_flag,
        "Chargeoff_Flag": chargeoff_flag,
        "Days_Past_Due": dpd,
        "Open_Date": open_date,
        "Snapshot_Date": snapshot_date,
    }

    metrics_contrib = {
        "total_outstanding_inr": outstanding_inr,
        "npa_outstanding_inr": outstanding_inr if npa_flag == 1 else 0.0,
        "is_npa": 1 if npa_flag == 1 else 0,
        "is_90plus": 1 if dpd >= 90 else 0,
        "outstanding_90plus_inr": outstanding_inr if dpd >= 90 else 0.0,
    }

    return cleaned, metrics_contrib


def analyze(data: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Main analysis function for the "Credit Card NPA Portfolio Risk" scenario.
    cleaned_accounts: List[Dict[str, Any]] = []

    total_outstanding_inr = 0.0
    total_npa_outstanding_inr = 0.0
    total_accounts = 0
    total_npa_accounts = 0
    total_90plus_outstanding_inr = 0.0

    if not isinstance(data, list):
        data = []

    for raw in data:
        if not isinstance(raw, dict):
            continue

        cleaned, contrib = _clean_account_record(raw)
        cleaned_accounts.append(cleaned)

        total_accounts += 1
        total_outstanding_inr += contrib["total_outstanding_inr"]
        total_npa_outstanding_inr += contrib["npa_outstanding_inr"]
        total_90plus_outstanding_inr += contrib["outstanding_90plus_inr"]
        if contrib["is_npa"]:
            total_npa_accounts += 1

    key_metrics = _calculate_key_metrics(
        total_outstanding_inr=total_outstanding_inr,
        total_npa_outstanding_inr=total_npa_outstanding_inr,
        total_accounts=total_accounts,
        total_npa_accounts=total_npa_accounts,
        total_90plus_outstanding_inr=total_90plus_outstanding_inr,
    )

    dimensions = _summarize_dimensions(cleaned_accounts)

    result: Dict[str, Any] = {
        "key_metrics": key_metrics,
        "accounts": cleaned_accounts,
       "dimensions": dimensions,
        "bucket_order": BUCKET_ORDER,
    }

    return result
