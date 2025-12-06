#!/usr/bin/env python3
"""
Idempotent script to inject an auto-resolve init into scenario_asset HTML files.
It looks for files under ./scenario_asset/*.html and if they do not contain
`resolveScenarioIdFromAsset` it will replace the `function initDashboard()` block
and the following `document.addEventListener("DOMContentLoaded", initDashboard);`
with an updated implementation that attempts to resolve the scenario id from
`/api/scenarios` when `localStorage.currentScenarioIdForDashboard` is missing.

Run: python3 scripts/patch_scenario_assets.py
"""
import re
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
ASSET_DIR = BASE / 'scenario_asset'

if not ASSET_DIR.exists():
    print(f"No scenario_asset directory at {ASSET_DIR}")
    raise SystemExit(1)

# The replacement block - same code inserted earlier
REPLACEMENT = r"""
    function resolveScenarioIdFromAsset() {
      // Try to find a matching scenario by comparing the stored html_file path
      var filename = window.location.pathname.split('/').pop();
      return fetch('/api/scenarios')
        .then(function(r) { return r.json(); })
        .then(function(list) {
          if (!Array.isArray(list)) return null;
          for (var i = 0; i < list.length; i++) {
            var s = list[i];
            var hf = s.html_file || '';
            if (!hf) continue;
            // html_file may be a full public path like '/scenario_asset/NAME'
            if (hf.endsWith(filename) || hf.indexOf(filename) !== -1) {
              return s.id;
            }
          }
          return null;
        })
        .catch(function() { return null; });
    }

    function initDashboard() {
      function proceed() {
        fetch('/api/scenarios/' + scenarioId + '/analysis/latest')
          .then(function (r) { return r.json(); })
          .then(function (res) {
            var analysis = res.analysis || {};
            var keyMetrics = analysis.key_metrics || {};
            var accountsRaw = analysis.accounts || [];

            allAccounts = normalizeAccounts(accountsRaw);
            filteredAccounts = allAccounts.slice();

            renderKeyMetrics(keyMetrics);
            initFiltersFromData(allAccounts);
            applyFiltersAndUpdate();

            document.getElementById('filterStats').textContent =
              filteredAccounts.length + ' of ' + allAccounts.length + ' videos selected';

            var nicheSelect = document.getElementById('filterNiche');
            var musicSelect = document.getElementById('filterMusicType');
            var durationSelect = document.getElementById('filterDuration');
            var monthSelect = document.getElementById('filterUploadMonth');

            nicheSelect.addEventListener('change', applyFiltersAndUpdate);
            musicSelect.addEventListener('change', applyFiltersAndUpdate);
            durationSelect.addEventListener('change', applyFiltersAndUpdate);
            monthSelect.addEventListener('change', applyFiltersAndUpdate);
          })
          .catch(function (err) {
            console.error('Error fetching analysis:', err);
          });
      }

      if (scenarioId == null || isNaN(scenarioId)) {
        // attempt to auto-resolve using the asset filename -> scenario mapping
        resolveScenarioIdFromAsset().then(function(resolved) {
          if (resolved) {
            scenarioId = parseInt(resolved, 10);
            try { localStorage.setItem('currentScenarioIdForDashboard', String(scenarioId)); } catch(e) {}
            proceed();
          } else {
            console.error('No scenarioId found in localStorage and auto-resolve failed.');
          }
        });
        return;
      }

      proceed();
    }

    document.addEventListener("DOMContentLoaded", initDashboard);
"""

# Regex to find the function initDashboard block up to the DOMContentLoaded listener
PATTERN = re.compile(
    r"function\s+initDashboard\s*\(\)\s*\{[\s\S]*?document\.addEventListener\(\s*\"DOMContentLoaded\"\s*,\s*initDashboard\s*\)\s*;",
    flags=re.MULTILINE
)

patched = []
skipped = []
errors = []

for f in sorted(ASSET_DIR.glob('*.html')):
    try:
        text = f.read_text(encoding='utf-8')
        if 'resolveScenarioIdFromAsset' in text:
            skipped.append(f.name)
            continue
        m = PATTERN.search(text)
        if not m:
            errors.append((f.name, 'initDashboard pattern not found'))
            continue
        new_text = text[:m.start()] + REPLACEMENT + text[m.end():]
        f.write_text(new_text, encoding='utf-8')
        patched.append(f.name)
    except Exception as e:
        errors.append((f.name, str(e)))

print('Patched files:', patched)
print('Skipped (already patched):', skipped)
if errors:
    print('Errors:')
    for en in errors:
        print(' ', en)
