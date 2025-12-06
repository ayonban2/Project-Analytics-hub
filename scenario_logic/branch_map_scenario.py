# scenario_logic/branch_map_scenario.py
#
# Scenario: Branch sales by region
# Output:
#   - key_metrics: 4 metrics
#   - pie_segments: for pie chart (region share)
#   - bar_segments: for bar chart (branch-wise)
#   - map_regions: for \"map\" tiles (region + total sales)

from collections import defaultdict

def analyze(data):
    \"\"
    data: list of dicts with at least:
      - Store (int/str)
      - Date (dd-mm-YYYY)
      - Region (str)
      - Branch (str)
      - Sales (number)

    Returns dict:
      - key_metrics: dict
      - pie_segments: list[{label, value}]
      - bar_segments: list[{label, value}]
      - map_regions: list[{region, total_sales_cr}]
    \"\"

    if not isinstance(data, list):
        raise ValueError(\"Data must be a list of records\")

    total_sales = 0.0
    branches = set()
    regions = set()
    region_sales = defaultdict(float)
    branch_sales = defaultdict(float)

    for row in data:
        region = row.get(\"Region\", \"Unknown\")
        branch = row.get(\"Branch\", f\"Store-{row.get('Store', 'NA')}\")
        sales = float(row.get(\"Sales\", 0.0))

        total_sales += sales
        branches.add(branch)
        regions.add(region)
        region_sales[region] += sales
        branch_sales[branch] += sales

    # Avoid divide-by-zero
    branch_count = len(branches) if branches else 1
    region_count = len(regions) if regions else 1

    avg_sales_per_branch = total_sales / branch_count if branch_count else 0.0
    top_region, top_region_value = (None, 0.0)
    if region_sales:
        top_region, top_region_value = max(region_sales.items(), key=lambda x: x[1])

    # Convert to ₹ Cr (1 Cr = 1e7)
    def to_cr(v):
        return round(v / 1e7, 2)

    key_metrics = {
        \"Total Sales (₹ Cr)\": to_cr(total_sales),
        \"Avg Sales per Branch (₹ Cr)\": to_cr(avg_sales_per_branch),
        \"Branch Count\": branch_count,
        \"Top Region by Sales\": f\"{top_region} (₹ {to_cr(top_region_value)} Cr)\" if top_region else \"N/A\"
    }

    pie_segments = [
        {\"label\": region, \"value\": to_cr(val)}
        for region, val in region_sales.items()
    ]

    bar_segments = [
        {\"label\": branch, \"value\": to_cr(val)}
        for branch, val in branch_sales.items()
    ]

    map_regions = [
        {\"region\": region, \"total_sales_cr\": to_cr(val)}
        for region, val in region_sales.items()
    ]

    return {
        \"key_metrics\": key_metrics,
        \"pie_segments\": pie_segments,
        \"bar_segments\": bar_segments,
        \"map_regions\": map_regions,
    }
