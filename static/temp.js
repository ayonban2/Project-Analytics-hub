        // Utility: format timestamp
        function formatTimestamp(ts) {
            const d = new Date(ts);
            if (isNaN(d.getTime())) return "";
            let dd = String(d.getDate()).padStart(2, '0');
            let mm = String(d.getMonth() + 1).padStart(2, '0');
            let yyyy = d.getFullYear();
            let hours = d.getHours();
            let mins = String(d.getMinutes()).padStart(2, '0');
            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            if (hours === 0) hours = 12;
            return dd + "-" + mm + "-" + yyyy + " --- " + hours + ":" + mins + " " + ampm;
        }

        // LOGIN
        function doLogin() {
            fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: loginUser.value,
                    password: loginPass.value
                })
            })
                .then(r => r.json())
                .then(res => {
                    if (!res.success) {
                        loginError.style.display = "block";
                        loginError.textContent = res.message;
                        return;
                    }
                    localStorage.setItem("user", JSON.stringify(res.user));
                    loginScreen.style.display = "none";
                    hubScreen.style.display = "flex";
                    showTab("overview");
                });
        }

        // User profile popup functions
        function toggleUserProfile() {
            const popup = document.getElementById("userProfilePopup");
            popup.classList.toggle("active");
        }

        // Close popup when clicking outside
        document.addEventListener("click", function (event) {
            const popup = document.getElementById("userProfilePopup");
            const btn = document.getElementById("userAvatarBtn");
            if (popup && !popup.contains(event.target) && !btn.contains(event.target)) {
                popup.classList.remove("active");
            }
        });

        // Initialize user profile on page load
        function initializeUserProfile() {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    const initials = (user.username || "U").substring(0, 2).toUpperCase();

                    // Fetch full profile data to get profile photo
                    fetch(`/api/profile/${user.id}`)
                        .then(r => r.json())
                        .then(data => {
                            if (data.success && data.profile) {
                                const profile = data.profile;
                                const avatarBtn = document.getElementById("userAvatarBtn");
                                const avatarLarge = document.getElementById("profileAvatarLarge");

                                // Update avatar with photo if available
                                if (profile.profile_photo) {
                                    avatarBtn.style.backgroundImage = `url('${profile.profile_photo}')`;
                                    avatarBtn.style.backgroundSize = 'cover';
                                    avatarBtn.style.backgroundPosition = 'center';
                                    avatarBtn.textContent = '';
                                    avatarBtn.style.border = 'none';

                                    avatarLarge.style.backgroundImage = `url('${profile.profile_photo}')`;
                                    avatarLarge.style.backgroundSize = 'cover';
                                    avatarLarge.style.backgroundPosition = 'center';
                                    avatarLarge.textContent = '';
                                } else {
                                    avatarBtn.textContent = initials;
                                    avatarLarge.textContent = initials;
                                }

                                // Update user info
                                const displayName = (profile.first_name && profile.last_name)
                                    ? profile.first_name + ' ' + profile.last_name
                                    : profile.username;
                                document.getElementById("profileUserName").textContent = displayName || "User";
                                // The original code had profileUserRole and profileUserRoleDisplay.
                                // The new menu doesn't use these directly in the links, but the header still does.
                                // Ensure profileUserRoleDisplay is updated.
                                document.getElementById("profileUserRoleDisplay").textContent = profile.role || "Analyst";
                                document.getElementById("profileUserEmail").textContent = profile.email || "user@company.com";
                            }
                        })
                        .catch(err => {
                            // Fallback to basic avatar
                            document.getElementById("userAvatarBtn").textContent = initials;
                            document.getElementById("profileAvatarLarge").textContent = initials;
                            document.getElementById("profileUserName").textContent = user.username || "User";
                            document.getElementById("profileUserRoleDisplay").textContent = user.role || "Analyst";
                        });
                } catch (e) {
                    console.error("Error parsing user data:", e);
                }
            }
        }

        function logout() {
            fetch("/api/logout", { method: "POST" }).finally(() => {
                localStorage.clear();
                location.reload();
            });
        }

        // Profile navigation functions (removed as per refactor, but keeping stubs if needed elsewhere)
        function goToProfile(e) {
            e.preventDefault();
            console.log("Navigating to Profile Settings");
            // window.location.href = `/profile.html?tab=personal`;
        }

        function goToEditDetails(e) {
            e.preventDefault();
            console.log("Navigating to Profile Settings (Edit Details)");
            // window.location.href = `/profile.html?tab=personal`;
        }

        function goToChangePassword(e) {
            e.preventDefault();
            console.log("Navigating to Security Settings (Change Password)");
            // window.location.href = `/profile.html?tab=security`;
        }

        function goToUploadPhoto(e) {
            e.preventDefault();
            console.log("Navigating to Profile Settings (Update Photo)");
            // window.location.href = `/profile.html?tab=personal`;
        }

        // AUTO-SHOW MENU IF ALREADY LOGGED IN
        document.addEventListener("DOMContentLoaded", () => {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                loginScreen.style.display = "none";
                hubScreen.style.display = "flex";
                showTab("overview");
                initializeUserProfile();
            } else {
                loginScreen.style.display = "flex";
                hubScreen.style.display = "none";
            }

            // The original scenarioSearch was an input, now it's a select.
            // The event listener for 'input' is no longer relevant for the select.
            // The select now has an onchange handler.
            // const searchEl = document.getElementById("scenarioSearch");
            // if (searchEl) {
            //     searchEl.addEventListener("input", filterScenarios);
            // }

            const analyseSel = document.getElementById("analyseScenario");
            if (analyseSel) {
                analyseSel.addEventListener("change", () => {
                    updateAnalyseMetaForCurrent();
                });
            }
        });

        // TABS + active nav highlight
        function showTab(name, btn) {
            document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
            const tabEl = document.getElementById(name);
            if (tabEl) tabEl.style.display = "block";

            const navButtons = document.querySelectorAll(".nav-btn");
            navButtons.forEach(b => b.classList.remove("nav-btn-active"));
            if (btn) {
                btn.classList.add("nav-btn-active");
            } else {
                navButtons.forEach(b => {
                    if (b.getAttribute("data-tab") === name) {
                        b.classList.add("nav-btn-active");
                    }
                });
            }

            if (name === "overview") {
                loadOverviewStats();
            }
            if (name === "scenarioMgmt") {
                loadScenarios();
                fetchNextScenarioCode();
                loadScenariosForUpdateClose();
                showScenarioSubtab("create");
            }
            if (name === "analyse") {
                loadScenariosForAnalysis();
                updateAnalyseMetaForCurrent();
            }
            if (name === "comm") {
                loadScenariosForComm();
            }
            if (name === "users") {
                loadUsersSimple(); // Call the updated loader
            }
        }

        // Scenario Management sub-tabs
        function showScenarioSubtab(which, btn) {
            const panels = document.querySelectorAll(".scenario-subtab-panel");
            panels.forEach(p => p.classList.remove("active"));

            const targetId = {
                create: "scenarioSubCreate",
                saved: "scenarioSubSaved",
                update: "scenarioSubUpdate",
                close: "scenarioSubClose"
            }[which];

            if (targetId) {
                const el = document.getElementById(targetId);
                if (el) el.classList.add("active");
            }

            if (which === 'create') {
                if (typeof renderBuilderMetrics === 'function') {
                    renderBuilderMetrics();
                }
                loadUsersForAssignment();
            }

            const buttons = document.querySelectorAll(".ui-tab-btn");
            buttons.forEach(b => b.classList.remove("active"));
            if (btn) {
                btn.classList.add("active");
            } else {
                buttons.forEach(b => {
                    if (b.getAttribute("data-subtab") === which) {
                        b.classList.add("active");
                    }
                });
            }
        }

        // Load users for assignment dropdown
        function loadUsersForAssignment() {
            fetch("/api/users")
                .then(r => r.json())
                .then(users => {
                    const select = document.getElementById("scAssignedUser");
                    if (!select) return;
                    const currentValue = select.value;
                    select.innerHTML = '<option value="">-- Select User --</option>';
                    users.forEach(u => {
                        const opt = document.createElement("option");
                        opt.value = u.id;
                        opt.textContent = u.username + " (" + u.role + ")";
                        select.appendChild(opt);
                    });
                    select.value = currentValue;
                })
                .catch(err => console.error("Error loading users:", err));
        }

        // OVERVIEW STATISTICS
        function loadOverviewStats() {
            fetch("/api/overview/stats")
                .then(r => r.json())
                .then(res => {
                    if (res.success) {
                        const stats = res.stats;

                        // Update main cards
                        document.getElementById("totalScenarios").textContent = stats.total_scenarios;
                        document.getElementById("openScenarios").textContent = stats.status_counts.Open;
                        document.getElementById("partialScenarios").textContent = stats.status_counts["Partially Closed"];
                        document.getElementById("closedScenarios").textContent = stats.status_counts["Fully Closed"];

                        // Update FY stats
                        const fyStatsEl = document.getElementById("fyStats");
                        if (fyStatsEl) {
                            let fyHtml = "";
                            stats.financial_year_stats.forEach(fy => {
                                fyHtml += `
                        <div class="fy-stat-card">
                            <div class="fy-stat-year">${fy.financial_year}</div>
                            <div class="fy-stat-details">
                                <div class="fy-stat-item">
                                    <span>Total:</span>
                                    <span class="fy-stat-value">${fy.total_scenarios}</span>
                                </div>
                                <div class="fy-stat-item">
                                    <span>Open:</span>
                                    <span class="fy-stat-value">${fy.open_scenarios}</span>
                                </div>
                                <div class="fy-stat-item">
                                    <span>Partial:</span>
                                    <span class="fy-stat-value">${fy.partially_closed}</span>
                                </div>
                                <div class="fy-stat-item">
                                    <span>Closed:</span>
                                    <span class="fy-stat-value">${fy.fully_closed}</span>
                                </div>
                            </div>
                        </div>`;
                            });
                            fyStatsEl.innerHTML = fyHtml;
                        }

                        // Update recent activities
                        const recentEl = document.getElementById("recentActivities");
                        if (recentEl) {
                            let activitiesHtml = "";
                            stats.recent_activities.forEach(act => {
                                const date = new Date(act.created_at);
                                const dateStr = date.toLocaleDateString();
                                let statusBadge = "";
                                if (act.status === "Open") {
                                    statusBadge = '<span class="status-badge status-open">Open</span>';
                                } else if (act.status === "Partially Closed") {
                                    statusBadge = '<span class="status-badge status-partial">Partial</span>';
                                } else {
                                    statusBadge = '<span class="status-badge status-closed">Closed</span>';
                                }

                                activitiesHtml += `
                        <div class="recent-activity-item">
                            <div class="recent-activity-info">
                                <div class="recent-activity-code">${act.scenario_code}</div>
                                <div class="recent-activity-name">${act.name}</div>
                                <div class="recent-activity-meta">
                                    <span>Created by: ${act.created_by_user}</span>
                                    <span>${dateStr}</span>
                                    ${statusBadge}
                                </div>
                            </div>
                        </div>`;
                            });
                            recentEl.innerHTML = activitiesHtml;
                        }
                    }
                })
                .catch(err => console.error("Error loading overview:", err));
        }

        // AUTO SCENARIO CODE
        function fetchNextScenarioCode() {
            fetch("/api/scenarios/next-code")
                .then(r => r.json())
                .then(res => {
                    scCode.value = res.code || "";
                });
        }

        // File tick handling
        const htmlInput = document.getElementById("scHTMLFile");
        const pyInput = document.getElementById("scPyFile");
        const htmlTick = document.getElementById("scHTMLTick");
        const pyTick = document.getElementById("scPyTick");

        if (htmlInput) {
            htmlInput.addEventListener("change", () => {
                if (htmlInput.files.length > 0) htmlTick.classList.remove("hidden");
                else htmlTick.classList.add("hidden");
            });
        }
        if (pyInput) {
            pyInput.addEventListener("change", () => {
                if (pyInput.files.length > 0) pyTick.classList.remove("hidden");
                else pyTick.classList.add("hidden");
            });
        }

        // KEY METRICS BUILDER
        let builderMetrics = [
            { name: "Total Outstanding", unit: "₹ Cr" },
            { name: "NPA Percentage", unit: "%" },
            { name: "Number of Accounts", unit: "Count" }
        ];

        function renderBuilderMetrics() {
            const listEl = document.getElementById("metricsBuilderList");
            if (!listEl) return;
            listEl.innerHTML = "";

            builderMetrics.forEach((m, idx) => {
                const item = document.createElement("div");
                item.style.display = "flex";
                item.style.alignItems = "center";
                item.style.justifyContent = "space-between";
                item.style.background = "white";
                item.style.padding = "6px 10px";
                item.style.borderRadius = "6px";
                item.style.border = "1px solid #e2e8f0";

                item.innerHTML = `
            <span style="font-size:0.85rem; color:#334155;">
                <strong>${m.name}</strong> <span style="color:#64748b;">(${m.unit})</span>
            </span>
            <button onclick="removeMetricFromBuilder(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold;">×</button>
        `;
                listEl.appendChild(item);
            });
        }

        function addMetricToBuilder() {
            const nameInput = document.getElementById("newMetricName");
            const unitInput = document.getElementById("newMetricUnit");
            const name = nameInput.value.trim();
            const unit = unitInput.value.trim();

            if (!name) {
                alert("Please enter a metric name");
                return;
            }

            builderMetrics.push({ name, unit });
            nameInput.value = "";
            unitInput.value = "";
            renderBuilderMetrics();
        }

        function removeMetricFromBuilder(idx) {
            builderMetrics.splice(idx, 1);
            renderBuilderMetrics();
        }

        // SCENARIO MANAGEMENT
        function saveScenario() {
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            const formData = new FormData();
            formData.append("scenario_code", scCode.value);
            formData.append("name", scName.value);
            formData.append("verticals", scVerticals.value);
            formData.append("user_id", user.id || "");

            // Use builderMetrics instead of textarea
            formData.append("key_metrics", JSON.stringify(builderMetrics));

            formData.append("existing_html_file", "");
            formData.append("existing_analysis_module", "");

            // Add assigned user if selected
            const assignedUserSelect = document.getElementById("scAssignedUser");
            if (assignedUserSelect && assignedUserSelect.value) {
                formData.append("assigned_user_id", assignedUserSelect.value);
            }

            // Add optional report file if selected
            const reportFile = document.getElementById("scReportFile").files[0];
            if (reportFile) {
                formData.append("report_file", reportFile);
            }

            const htmlFile = htmlInput.files[0];
            const pyFile = pyInput.files[0];

            if (!scName.value.trim()) {
                alert("Enter scenario name");
                return;
            }
            if (!htmlFile || !pyFile) {
                alert("Please select both HTML and Python files.");
                return;
            }

            formData.append("html_file", htmlFile);
            formData.append("py_module_file", pyFile);

            fetch("/api/scenarios", {
                method: "POST",
                body: formData
            })
                .then(r => r.json())
                .then(res => {
                    if (!res.success) {
                        alert(res.message || "Error saving scenario");
                        return;
                    }
                    alert("Scenario saved successfully");
                    scName.value = "";
                    scVerticals.value = "";

                    // Reset metrics to default
                    builderMetrics = [
                        { name: "Total Outstanding", unit: "₹ Cr" },
                        { name: "NPA Percentage", unit: "%" },
                        { name: "Number of Accounts", unit: "Count" }
                    ];
                    renderBuilderMetrics();

                    htmlInput.value = "";
                    pyInput.value = "";
                    htmlTick.classList.add("hidden");
                    pyTick.classList.add("hidden");

                    // Reset optional fields
                    assignedUserSelect.value = "";
                    document.getElementById("scReportFile").value = "";

                    loadScenarios();
                    fetchNextScenarioCode();
                    loadScenariosForAnalysis();
                    loadScenariosForComm();
                    loadScenariosForUpdateClose();
                    loadOverviewStats();
                });
        }

        function loadScenarios() {
            fetch("/api/scenarios")
                .then(r => r.json())
                .then(list => {
                    const bodyEl = document.getElementById("scenarioTableBody");
                    // Populate Filter Dropdown
                    const searchSelect = document.getElementById("scenarioSearchSelect");
                    if (searchSelect) {
                        // Keep the default option
                        const currentValue = searchSelect.value;
                        searchSelect.innerHTML = '<option value="">-- Select Scenario --</option>';
                        list.forEach(s => {
                            const opt = document.createElement("option");
                            opt.value = s.name; // User asked for Name, using Name for filtering
                            opt.textContent = s.name;
                            searchSelect.appendChild(opt);
                        });
                        if (currentValue) searchSelect.value = currentValue;
                    }

                    let html = "";
                    list.forEach(s => {
                        let statusBadge = "";
                        if (s.status === "Open") {
                            statusBadge = '<span class="status-badge status-open">Open</span>';
                        } else if (s.status === "Partially Closed") {
                            statusBadge = '<span class="status-badge status-partial">Partial</span>';
                        } else {
                            statusBadge = '<span class="status-badge status-closed">Closed</span>';
                        }

                        const createdDate = s.created_at ? new Date(s.created_at).toLocaleDateString() : "";
                        const metricsInfo = `${s.metrics_status.open} / ${s.metrics_status.total}`;

                        html += `
              <tr>
                <td><strong>${s.scenario_code || ""}</strong></td>
                <td>${s.name || ""}</td>
                <td>${statusBadge}</td>
                <td>${metricsInfo}</td>
                <td>${createdDate}</td>
                <td>
                    <button class="btn-action" data-tooltip="Details" onclick="viewScenarioDetails(${s.id})"><svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><path d="M12 17v4M8.5 11c0-1.93 1.5-3.5 3.5-3.5s3.5 1.57 3.5 3.5"></path><circle cx="12" cy="7" r="1"></circle></svg></button>
                    <button class="btn-action" data-tooltip="Analyse" onclick="analyseScenario(${s.id})"><svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></button>
                    <button class="btn-action" data-tooltip="Download" onclick="downloadScenario(${s.id})"><svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button>
                    <button class="btn-action btn-action-warning" data-tooltip="Close" onclick="openCloseModal(${s.id})"><svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></button>
                    <button class="btn-action btn-action-danger" data-tooltip="Delete" onclick="deleteScenario(${s.id})"><svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                </td>
              </tr>`;
                    });
                    if (bodyEl) bodyEl.innerHTML = html;
                    filterScenarios();
                });
        }

        function deleteScenario(id) {
            if (!confirm("Are you sure you want to delete this scenario? This action cannot be undone.")) {
                return;
            }
            fetch("/api/scenarios/" + id, { method: "DELETE" })
                .then(() => {
                    loadScenarios();
                    loadScenariosForAnalysis();
                    loadScenariosForComm();
                    loadScenariosForUpdateClose();
                    loadOverviewStats();
                });
        }

        // populate dropdowns for Update/Close subtabs
        function loadScenariosForUpdateClose() {
            fetch("/api/scenarios")
                .then(r => r.json())
                .then(list => {
                    // Populate Update List
                    const updateSel = document.getElementById("updateScenarioSelect");
                    if (updateSel) {
                        updateSel.innerHTML = '<option value="">-- Select Scenario --</option>';
                        list.forEach(s => {
                            if (s.status !== 'Fully Closed') { // Only open scenarios
                                const opt = document.createElement("option");
                                opt.value = s.id;
                                opt.textContent = s.scenario_code + " - " + s.name;
                                updateSel.appendChild(opt);
                            }
                        });
                    }

                    // Populate Close List
                    const closeSel = document.getElementById("closeScenarioSelect");
                    if (closeSel) {
                        closeSel.innerHTML = '<option value="">-- Select Scenario --</option>';
                        list.forEach(s => {
                            if (s.status !== 'Fully Closed') {
                                const opt = document.createElement("option");
                                opt.value = s.id;
                                opt.textContent = s.scenario_code + " - " + s.name;
                                closeSel.appendChild(opt);
                            }
                        });
                    }
                });
        }

        function loadKeyMetricsForClosure(sid) {
            fetch(`/api/scenarios/${sid}/key-metrics`)
                .then(r => r.json())
                .then(metrics => {
                    const checklistEl = document.getElementById("metricsChecklist");
                    let html = "";
                    metrics.forEach(metric => {
                        const isClosed = metric.is_closed ? "checked disabled" : "";
                        const closedDate = metric.closed_at ? new Date(metric.closed_at).toLocaleDateString() : "";
                        const closedInfo = metric.is_closed ?
                            `<small style="color:#64748b;"> (Closed on ${closedDate})</small>` : "";

                        html += `
                <div style="margin: 4px 0; padding: 8px; background: #f8fafc; border-radius: 4px;">
                    <label>
                        <input type="checkbox" name="metric_${metric.id}" value="${metric.id}" ${isClosed}>
                        ${metric.metric_name} ${metric.metric_unit ? `(${metric.metric_unit})` : ""}
                        ${closedInfo}
                    </label>
                </div>`;
                    });
                    checklistEl.innerHTML = html;
                });
        }

        function toggleClosureOptions() {
            const closureType = document.getElementById("closureType").value;
            const partialOptions = document.getElementById("partialClosureOptions");
            if (closureType === "partial") {
                partialOptions.style.display = "block";
            } else {
                partialOptions.style.display = "none";
            }
        }

        function toggleAllMetrics() {
            const closeAll = document.getElementById("closeAllMetrics").checked;
            const checkboxes = document.querySelectorAll('#metricsChecklist input[type="checkbox"]:not(:disabled)');
            checkboxes.forEach(cb => {
                cb.checked = closeAll;
            });
        }

        function selectClosureType(type) {
            // UI Logic for selection
            document.querySelectorAll('.closure-option').forEach(el => el.classList.remove('selected'));
            const radio = document.querySelector(`input[name="closureType"][value="${type}"]`);
            if (radio) {
                radio.checked = true;
                radio.closest('.closure-option').classList.add('selected');
            }

            if (type === 'partial') {
                document.getElementById('partialClosureOptions').style.display = 'block';
            } else {
                document.getElementById('partialClosureOptions').style.display = 'none';
            }
        }

        function confirmClosure() {
            const sid = document.getElementById("closeScenarioSelect").value;
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            const closureTypeEl = document.querySelector('input[name="closureType"]:checked');
            if (!closureTypeEl) {
                alert("Please select a closure type (Partial or Full).");
                return;
            }
            const closureType = closureTypeEl.value;

            const closureNotes = document.getElementById("closureNotes").value;

            const partialStatus = document.getElementById("partialCloseStatus").value;

            if (!closureNotes.trim()) {
                alert("Please enter closure notes");
                return;
            }

            // Construct payload
            // Note: identifying partial/full logic
            // If partial, we might update status to 'Partially Closed' and sub-status to selected outcome
            // If full, status = 'Fully Closed'

            // Backend expects: closure_type, closure_notes, etc.
            // Adjusting to match existing API or updating API?
            // Existing API seems to expect metric-level closure for partial?
            // "Partially Close (Close specific metrics)" was old logic.
            // The new requirement implies "Proceed for closure" -> Partial/Full.
            // If Partial -> Select Outcome (Undergoing Changes, etc.)

            // I will send the status update request

            // NOTE: Re-using /api/scenarios/<sid>/close might need adjustment if it expects metrics list.
            // The previous UI had metrics checklist. The new UI (Requested) just shows Outcome dropdown for Partial.
            // I will assume for now we are just setting status.

            fetch(`/api/scenarios/${sid}/close`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    closure_type: closureType, // 'partial' or 'full'
                    closure_notes: closureNotes,
                    partial_outcome: (closureType === 'partial') ? partialStatus : null
                })
            })
                .then(r => r.json())
                .then(res => {
                    if (!res.success) {
                        alert(res.message || "Error closing scenario");
                        return;
                    }
                    alert(`Scenario ${closureType === "full" ? "fully" : "partially"} closed successfully!`);

                    // Reset UI
                    document.getElementById("closeStep2").style.display = "none";
                    document.getElementById("btnProceedClosure").style.display = "block";
                    document.getElementById("closureNotes").value = "";

                    // Reload
                    loadScenariosForUpdateClose();
                    loadScenarios();
                });
        }

        function reopenScenario() {
            const sid = closeScenarioSelect.value;
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            if (!confirm("Are you sure you want to reopen this scenario?")) {
                return;
            }

            fetch(`/api/scenarios/${sid}/reopen`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    reopen_notes: "Reopened by user",
                    reopen_type: "full"
                })
            })
                .then(r => r.json())
                .then(res => {
                    if (!res.success) {
                        alert(res.message || "Error reopening scenario");
                        return;
                    }
                    alert("Scenario reopened successfully!");

                    // Reload data
                    loadScenarioForClosure();
                    loadScenarios();
                    loadScenariosForAnalysis();
                    loadScenariosForComm();
                    loadOverviewStats();
                });
        }

        // Modal functions
        function openCloseModal(sid) {
            // Switch to Scenario Management tab first
            showTab("scenarioMgmt");

            // Then switch to Close subtab
            showScenarioSubtab("close");

            // Select the scenario in the dropdown
            const closeSel = document.getElementById("closeScenarioSelect");
            if (closeSel) {
                // We need to wait for the dropdown to populate if it hasn't already
                // But loadScenariosForUpdateClose is called in showTab("scenarioMgmt")
                // So we might need a small delay or check if populated.
                // For simplicity, let's set the value. If options aren't there yet, this might fail.
                // Better: re-fetch or wait. 
                // Actually, showTab calls loadScenariosForUpdateClose().
                // Let's set a timeout to allow fetch to complete, or better, manually trigger the load and then set.

                fetch("/api/scenarios")
                    .then(r => r.json())
                    .then(list => {
                        closeSel.innerHTML = "";
                        list.forEach(s => {
                            const opt = document.createElement("option");
                            opt.value = s.id;
                            opt.textContent = (s.scenario_code || "") + " - " + (s.name || "");
                            closeSel.appendChild(opt);
                        });
                        closeSel.value = sid;
                        updateCloseDetails(); // Call this to load details for the selected scenario
                    });
            }
        }
        function closeModal() {
            document.getElementById("closeModal").style.display = "none";
        }

        // Search filter for Saved Scenarios
        function filterScenarios() {
            const searchSelect = document.getElementById("scenarioSearchSelect");
            const searchVal = searchSelect ? searchSelect.value.toLowerCase() : "";
            const statusVal = document.getElementById("scenarioStatusFilter")?.value || "";

            const trs = document.querySelectorAll("#scenarioTableBody tr");
            trs.forEach(tr => {
                const nameText = tr.children[1].textContent.toLowerCase();
                const statusHtml = tr.children[2].innerHTML;
                const matchesSearch = !searchVal || nameText.includes(searchVal); // nameText includes selected name (exact match usually)

                let matchesStatus = true;
                if (statusVal) {
                    if (statusVal === "Open") matchesStatus = statusHtml.includes("Open");
                    else if (statusVal === "Partially Closed") matchesStatus = statusHtml.includes("Partial");
                    else if (statusVal === "Fully Closed") matchesStatus = statusHtml.includes("Closed");
                }
                tr.style.display = (matchesSearch && matchesStatus) ? "" : "none";
            });
        }

        // Export scenarios to CSV
        function exportScenarios() {
            fetch("/api/scenarios")
                .then(r => r.json())
                .then(list => {
                    let csv = "Scenario Code,Name,Status,Key Metrics,Created\n";
                    list.forEach(s => {
                        const metrics = `${s.metrics_status.open}/${s.metrics_status.total}`;
                        const created = s.created_at ? new Date(s.created_at).toLocaleDateString() : "";
                        csv += `"${s.scenario_code || ""}","${s.name || ""}","${s.status}","${metrics}","${created}"\n`;
                    });
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "scenarios.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                });
        }

        // View scenario details in a modal
        function viewScenarioDetails(id) {
            // Fetch scenarios list and key metrics
            Promise.all([
                fetch("/api/scenarios").then(r => r.json()),
                fetch("/api/scenarios/" + id + "/key-metrics").then(r => r.json())
            ])
                .then(([scenarios, metricsData]) => {
                    const scenario = scenarios.find(s => s.id === id);
                    if (!scenario) {
                        alert("Scenario not found");
                        return;
                    }

                    const metrics = metricsData.metrics || [];
                    const metricsHtml = metrics.length > 0
                        ? metrics.map(m => `<li><strong>${m.name}</strong> (${m.unit}) - ${m.is_closed ? '🔒 Closed' : '🔓 Open'}</li>`).join('')
                        : '<li>No metrics defined</li>';

                    const detailsHtml = `
                    <div style="padding: 16px;">
                        <div style="margin-bottom: 16px;">
                            <strong style="color: #2563eb; font-size: 1.2rem;">${scenario.scenario_code}</strong>
                            <span style="margin-left: 8px; color: #64748b;">${scenario.name}</span>
                        </div>
                        <table style="width: 100%; font-size: 0.9rem;">
                            <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Status:</td><td><span class="status-badge ${scenario.status === 'Open' ? 'status-open' : scenario.status === 'Partially Closed' ? 'status-partial' : 'status-closed'}">${scenario.status}</span></td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Verticals:</td><td>${scenario.verticals || 'N/A'}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Created:</td><td>${scenario.created_at ? new Date(scenario.created_at).toLocaleString() : 'N/A'}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Metrics Status:</td><td>${scenario.metrics_status.open} open / ${scenario.metrics_status.total} total</td></tr>
                        </table>
                        <div style="margin-top: 16px;">
                            <strong style="color: #475569;">Key Metrics:</strong>
                            <ul style="margin: 8px 0 0 20px; color: #334155;">${metricsHtml}</ul>
                        </div>
                        <div style="margin-top: 20px; text-align: right;">
                            <button class="btn-action btn-action-warning" data-tooltip="Modify" onclick="closeModal(); modifyScenario(${id});"><svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                            <button class="btn btn-primary" onclick="closeModal();" style="margin-left: 8px;">Close</button>
                        </div>
                    </div>
                `;

                    document.getElementById("closeModalContent").innerHTML = detailsHtml;
                    document.querySelector(".modal-title").textContent = "Scenario Details";
                    document.getElementById("closeModal").style.display = "flex";
                })
                .catch(err => {
                    alert("Error loading scenario details: " + err.message);
                });
        }

        // Navigate to Update Scenario tab with scenario pre-selected
        function modifyScenario(id) {
            // Switch to the Update Scenario tab
            showScenarioSubtab('update');

            // Pre-select the scenario in the dropdown
            setTimeout(() => {
                const select = document.getElementById("updateScenarioSelect");
                if (select) {
                    select.value = id;
                    loadScenarioDetailsForUpdate(); // Trigger load
                }
            }, 100);
        }

        // Navigate to Analyse Scenario tab with scenario pre-selected
        function analyseScenario(id) {
            // Switch to the Analyse tab
            showTab('analyse');

            // Pre-select the scenario in the dropdown
            setTimeout(() => {
                const select = document.getElementById("analyseScenario");
                if (select) {
                    select.value = id;
                    updateAnalyseMetaForCurrent();
                }
            }, 100);
        }

        // Download scenario - placeholder for future implementation
        function downloadScenario(id) {
            // TODO: Implement download functionality
            console.log("Download scenario: " + id);
        }

        // ANALYSE SCENARIO
        function loadScenariosForAnalysis() {
            fetch("/api/scenarios")
                .then(r => r.json())
                .then(list => {
                    const sel = document.getElementById("analyseScenario");
                    if (!sel) return;
                    sel.innerHTML = "";
                    list.forEach(s => {
                        const opt = document.createElement("option");
                        opt.value = s.id;
                        opt.textContent = (s.scenario_code || "") + " - " + (s.name || "");
                        sel.appendChild(opt);
                    });
                    updateAnalyseMetaForCurrent();
                });
        }

        // Save history of key metrics for each scenario (store all uploads)
        function saveAnalysisHistory(sid, keyMetrics) {
            const key = "analysisHistory_" + sid;
            let hist = [];
            try {
                hist = JSON.parse(localStorage.getItem(key) || "[]");
            } catch (e) {
                hist = [];
            }
            const entry = { ts: Date.now(), keyMetrics: keyMetrics };
            hist.push(entry);
            // Removed the slice limit to store all history
            localStorage.setItem(key, JSON.stringify(hist));
        }

        // Show last upload info + multi-column key metrics
        function updateAnalyseMetaForCurrent() {
            const sel = document.getElementById("analyseScenario");
            if (!sel || !sel.value) {
                const info = document.getElementById("lastUploadInfo");
                if (info) info.textContent = "";
                const km = document.getElementById("keyMetricsArea");
                if (km) km.innerHTML = "<em>No scenario selected.</em>";
                return;
            }
            const sid = sel.value;
            const key = "analysisHistory_" + sid;
            let hist = [];
            try {
                hist = JSON.parse(localStorage.getItem(key) || "[]");
            } catch (e) {
                hist = [];
            }

            const infoEl = document.getElementById("lastUploadInfo");
            if (hist.length && infoEl) {
                const latest = hist[hist.length - 1];
                infoEl.textContent = "Last data uploaded on " + formatTimestamp(latest.ts);
            } else if (infoEl) {
                infoEl.textContent = "No data uploaded yet for this scenario.";
            }

            renderKeyMetricsHistory(hist);
        }

        // Render key metrics table with Last 3 uploads + % Change columns
        function renderKeyMetricsHistory(hist) {
            const area = document.getElementById("keyMetricsArea");
            if (!area) return;

            if (!hist || !hist.length) {
                area.innerHTML = "<em>No key metrics available yet. Upload JSON to view analysis.</em>";
                return;
            }

            // Get relevant entries: Initial (0), Previous (N-1), Current (N)
            // If hist.length == 1: Initial=Current. Prev=null.
            const initialEntry = hist[0];
            const currentEntry = hist[hist.length - 1];
            const prevEntry = hist.length > 1 ? hist[hist.length - 2] : null;

            // We will show columns for: Upload N-2, Upload N-1, Upload N (The last 3)
            // AND columns for % Change (vs Last) and % Change (vs Initial)

            // Collect union of metric keys
            const allKeys = new Set();
            hist.forEach(entry => {
                const km = entry.keyMetrics || {};
                if (km && typeof km === "object") {
                    Object.keys(km).forEach(k => allKeys.add(k));
                }
            });
            const keysArr = Array.from(allKeys);

            // Determine which uploads to show columns for (Last 3)
            let showUploads = hist.slice(-3); // Get last 3

            let thead = "<tr><th>Metric</th>";
            showUploads.forEach((h, idx) => {
                const dateStr = formatTimestamp(h.ts);
                const isLast = idx === showUploads.length - 1;
                thead += `<th${isLast ? " class='key-metrics-latest'" : ""}>Upload<br><small>${dateStr}</small></th>`;
            });
            thead += "<th style='color:#2563eb'>% Since Last</th>";
            thead += "<th style='color:#059669'>% Since Initial</th>";
            thead += "</tr>";

            let tbody = "";
            keysArr.forEach(metric => {
                // Calculate Changes
                let valInitial = (initialEntry.keyMetrics || {})[metric];
                let valPrev = prevEntry ? (prevEntry.keyMetrics || {})[metric] : null;
                let valCurrent = (currentEntry.keyMetrics || {})[metric];

                // Helper to parse if string contains units
                const parseVal = (v) => {
                    if (typeof v === 'number') return v;
                    if (typeof v === 'string') return parseFloat(v.replace(/[^\d.-]/g, ''));
                    return NaN;
                };

                const numInitial = parseVal(valInitial);
                const numPrev = parseVal(valPrev);
                const numCurrent = parseVal(valCurrent);

                const calcPct = (curr, base) => {
                    if (isNaN(curr) || isNaN(base) || base === 0) return "-";
                    const p = ((curr - base) / base) * 100;
                    const color = p > 0 ? '#10b981' : (p < 0 ? '#ef4444' : '#64748b');
                    const arrow = p > 0 ? '↑' : (p < 0 ? '↓' : '');
                    return `<span style="color:${color}; font-weight:600;">${arrow} ${p.toFixed(1)}%</span>`;
                };

                const pctVsLast = (prevEntry) ? calcPct(numCurrent, numPrev) : "-";
                const pctVsInitial = (hist.length > 1) ? calcPct(numCurrent, numInitial) : "-";

                tbody += "<tr><td>" + metric + "</td>";

                // Show values for last 3
                showUploads.forEach((entry, idx) => {
                    const km = entry.keyMetrics || {};
                    const val = (km && Object.prototype.hasOwnProperty.call(km, metric)) ? km[metric] : "-";
                    const isLast = idx === showUploads.length - 1;
                    tbody += `<td${isLast ? " class='key-metrics-latest'" : ""}>${val}</td>`;
                });

                tbody += `<td>${pctVsLast}</td>`;
                tbody += `<td>${pctVsInitial}</td>`;
                tbody += "</tr>";
            });

            area.innerHTML = "<div style='overflow-x:auto;'><table class='table key-metrics-table'><thead>" + thead + "</thead><tbody>" + tbody + "</tbody></table></div>";
        }

        function uploadJSON() {
            const jsonUploadEl = document.getElementById("jsonUpload");
            const analyseScenarioEl = document.getElementById("analyseScenario");

            const file = jsonUploadEl.files[0];
            if (!file) {
                alert("Choose JSON file");
                return;
            }

            if (!analyseScenarioEl.value) {
                alert("Please select a scenario first");
                return;
            }

            const reader = new FileReader();
            reader.onload = function () {
                let data;
                try { data = JSON.parse(reader.result); }
                catch (e) { alert("Invalid JSON"); return; }

                const user = JSON.parse(localStorage.getItem("user") || "{}");
                const sid = analyseScenarioEl.value;

                fetch("/api/scenarios/" + sid + "/upload-data", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: user.id,
                        data: data
                    })
                })
                    .then(r => {
                        if (!r.ok) {
                            throw new Error("HTTP error, status = " + r.status);
                        }
                        return r.json();
                    })
                    .then(res => {
                        if (!res.success) {
                            alert(res.message || "Upload error");
                            return;
                        }
                        alert("Uploaded successfully!");
                        // Save history & refresh meta/metrics
                        saveAnalysisHistory(sid, res.key_metrics || {});
                        updateAnalyseMetaForCurrent();
                        // Clear file input
                        jsonUploadEl.value = "";
                    })
                    .catch(err => {
                        console.error("Upload error:", err);
                        alert("Error uploading file: " + err.message);
                    });
            };
            reader.readAsText(file);
        }

        function goToDashboard() {
            const analyseScenarioEl = document.getElementById("analyseScenario");
            const sid = analyseScenarioEl.value;

            if (!sid) {
                alert("Please select a scenario first");
                return;
            }

            fetch("/api/scenarios")
                .then(r => {
                    if (!r.ok) {
                        throw new Error("HTTP error, status = " + r.status);
                    }
                    return r.json();
                })
                .then(list => {
                    const scen = list.find(x => x.id == sid);
                    if (!scen) {
                        alert("Scenario not found");
                        return;
                    }
                    localStorage.setItem("currentScenarioIdForDashboard", sid);
                    localStorage.setItem("scenarioMeta_" + sid, JSON.stringify(scen));
                    window.location.href = scen.html_file;
                })
                .catch(err => {
                    console.error("Error loading scenarios:", err);
                    alert("Error loading dashboard: " + err.message);
                });
        }

        // USER MANAGEMENT (Updated)

        function switchUserMgmtTab(tab) {
            const listTab = document.getElementById("userMgmtList");
            const createTab = document.getElementById("userMgmtCreate");
            const btns = document.querySelectorAll("#scenarioSubUserMgmt .ui-tab-btn");

            if (tab === 'list') {
                listTab.style.display = "block";
                createTab.style.display = "none";
                btns[0].classList.add("active");
                btns[1].classList.remove("active");
                loadUsersSimple();
            } else {
                listTab.style.display = "none";
                createTab.style.display = "block";
                btns[0].classList.remove("active");
                btns[1].classList.add("active");
            }
        }

        // Removed Modal functions as form is now inline

        function loadUsersSimple() {
            loadUsers();
        }

        function loadUsers() {
            fetch("/api/users")
                .then(r => r.json())
                .then(users => {
                    // Update Summary Cards
                    const totalEl = document.getElementById("totalUsersCount");
                    if (totalEl) totalEl.textContent = users.length;
                    const adminEl = document.getElementById("adminUsersCount");
                    if (adminEl) adminEl.textContent = users.filter(u => u.role === 'admin').length;
                    const analystEl = document.getElementById("analystUsersCount");
                    if (analystEl) analystEl.textContent = users.filter(u => u.role === 'analyst').length;
                    const visibleEl = document.getElementById("visibleUsersCount");
                    if (visibleEl) visibleEl.textContent = users.length;

                    const bodyEl = document.getElementById("userTable");
                    const searchInput = document.getElementById("userSearch");
                    const searchQuery = searchInput ? searchInput.value.toLowerCase() : "";

                    if (!bodyEl) return;
                    bodyEl.innerHTML = "";

                    let visibleCount = 0;

                    users.forEach(u => {
                        // Search Filter validation
                        const name = (u.username + " " + (u.first_name || "") + " " + (u.last_name || "")).toLowerCase();
                        if (searchQuery && !name.includes(searchQuery)) return;

                        visibleCount++;

                        const initials = (u.first_name ? u.first_name[0] : (u.username[0] || "?")).toUpperCase();
                        const photoUrl = u.profile_photo ? '/static/uploads/profile_photos/' + u.profile_photo : null;

                        let avatarHtml = photoUrl
                            ? '<img src="' + photoUrl + '" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">'
                            : '<div class="user-avatar-small">' + initials + '</div>';

                        const tr = document.createElement("tr");
                        tr.innerHTML = '<td>' +
                            '<div class="user-list-item">' +
                            avatarHtml +
                            '<div>' +
                            '<div class="user-name">' + (u.first_name || "") + ' ' + (u.last_name || "") + ' (' + u.username + ')</div>' +
                            '<div class="user-email">' + (u.email || "No email") + '</div>' +
                            '</div>' +
                            '</div>' +
                            '</td>' +
                            '<td><span class="role-badge role-' + u.role + '">' + u.role + '</span></td>' +
                            '<td>' + (u.phone || "-") + '</td>' +
                            '<td><button class="btn btn-outline" onclick="deleteUser(' + u.id + ')">Delete</button></td>';

                        bodyEl.appendChild(tr);
                    });
                    document.getElementById("visibleUsersCount").textContent = visibleCount;
                });
        }

        // Add User Search Listener (if not added globally)
        const userSearchInput = document.getElementById("userSearch");
        if (userSearchInput) {
            userSearchInput.addEventListener("input", loadUsers);
        }

        function saveUser() {
            fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: document.getElementById("uName").value,
                    password: document.getElementById("uPass").value,
                    role: document.getElementById("uRole").value,
                    first_name: document.getElementById("uFirstName").value,
                    last_name: document.getElementById("uLastName").value,
                    email: document.getElementById("uEmail").value,
                    phone: document.getElementById("uPhone").value
                })
            })
                .then(r => r.json())
                .then(res => {
                    if (!res.success) {
                        alert(res.message || "Error saving user");
                        return;
                    }
                    hideCreateUserModal();
                    loadUsers();
                });
        }



        function deleteUser(id) {
            fetch("/api/users/" + id, { method: "DELETE" })
                .then(() => loadUsers());
        }

        // UPDATE SCENARIO LOGIC

        let updateBuilderMetrics = [];

        function renderUpdateBuilderMetrics() {
            const listEl = document.getElementById("updateMetricsBuilderList");
            if (!listEl) return;
            listEl.innerHTML = "";

            updateBuilderMetrics.forEach((m, idx) => {
                const item = document.createElement("div");
                item.style.display = "flex";
                item.style.alignItems = "center";
                item.style.justifyContent = "space-between";
                item.style.background = "white";
                item.style.padding = "6px 10px";
                item.style.borderRadius = "6px";
                item.style.border = "1px solid #e2e8f0";

                item.innerHTML = '<span style="font-size:0.85rem; color:#334155;">' +
                    '<strong>' + m.name + '</strong> <span style="color:#64748b;">(' + m.unit + ')</span>' +
                    '</span>' +
                    '<button onclick="removeMetricFromUpdateBuilder(' + idx + ')" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold;">×</button>';
                listEl.appendChild(item);
            });
        }

        function addMetricToUpdateBuilder() {
            const nameInput = document.getElementById("updateNewMetricName");
            const unitInput = document.getElementById("updateNewMetricUnit");
            const name = nameInput.value.trim();
            const unit = unitInput.value.trim();

            if (!name) {
                alert("Please enter a metric name");
                return;
            }

            updateBuilderMetrics.push({ name, unit });
            nameInput.value = "";
            unitInput.value = "";
            renderUpdateBuilderMetrics();
        }

        function removeMetricFromUpdateBuilder(idx) {
            updateBuilderMetrics.splice(idx, 1);
            renderUpdateBuilderMetrics();
        }

        function loadScenarioDetailsForUpdate() {
            const sid = document.getElementById("updateScenarioSelect").value;
            if (!sid) return;

            // Fetch details & metrics
            Promise.all([
                fetch("/api/scenarios").then(r => r.json()),
                fetch('/api/scenarios/' + sid + '/key-metrics').then(r => r.json())
            ])
                .then(([list, metricsRes]) => {
                    const s = list.find(x => x.id == sid);
                    if (s) {
                        document.getElementById("updateScName").value = s.name || "";
                        document.getElementById("updateScVerticals").value = s.verticals || "";
                        if (document.getElementById("updateScAssignedUser")) {
                            loadUsersForUpdateAssignment(s.assigned_user_id || "");
                        }
                    }

                    // Populate metrics builder
                    const metrics = metricsRes.metrics || [];
                    updateBuilderMetrics = metrics.map(m => ({ name: m.metric_name || m.name, unit: m.metric_unit || m.unit }));
                    renderUpdateBuilderMetrics();
                });
        }

        function loadUsersForUpdateAssignment(selectedId) {
            fetch("/api/users")
                .then(r => r.json())
                .then(users => {
                    const select = document.getElementById("updateScAssignedUser");
                    if (!select) return;
                    select.innerHTML = '<option value="">-- Select User --</option>';
                    users.forEach(u => {
                        const opt = document.createElement("option");
                        opt.value = u.id;
                        opt.textContent = u.username + " (" + u.role + ")";
                        select.appendChild(opt);
                    });
                    if (selectedId) select.value = selectedId;
                });
        }

        function updateScenario() {
            const sid = document.getElementById("updateScenarioSelect").value;
            if (!sid) {
                alert("Please select a scenario to update");
                return;
            }

            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const formData = new FormData();

            formData.append("user_id", user.id || "");
            formData.append("name", document.getElementById("updateScName").value);
            formData.append("verticals", document.getElementById("updateScVerticals").value);
            formData.append("key_metrics", JSON.stringify(updateBuilderMetrics));

            const htmlFile = document.getElementById("updateScHTML").files[0];
            const pyFile = document.getElementById("updateScPy").files[0];
            const reportFile = document.getElementById("updateScReport").files[0];
            const assignedUserId = document.getElementById("updateScAssignedUser").value;

            if (htmlFile) formData.append("html_file", htmlFile);
            if (pyFile) formData.append("py_module_file", pyFile);
            if (reportFile) formData.append("report_file", reportFile);
            if (assignedUserId) formData.append("assigned_user_id", assignedUserId);

            fetch('/api/scenarios/' + sid + '/update', {
                method: "POST",
                body: formData
            })
                .then(r => r.json())
                .then(res => {
                    if (!res.success) {
                        alert(res.message || "Error updating scenario");
                        return;
                    }
                    alert("Scenario updated successfully");
                    loadScenarios();
                    loadScenariosForAnalysis();
                    loadScenarioDetailsForUpdate(); // Refresh details
                })
                .catch(err => {
                    console.error("Update error:", err);
                    alert("Error updating: " + err.message);
                });
        }

        // COMMUNICATION
        function loadScenariosForComm() {
            fetch("/api/scenarios")
                .then(r => r.json())
                .then(list => {
                    const sel = document.getElementById("commScenario");
                    if (!sel) return;
                    sel.innerHTML = "";
                    list.forEach(s => {
                        const opt = document.createElement("option");
                        opt.value = s.id;
                        opt.textContent = (s.scenario_code || "") + " - " + (s.name || "");
                        sel.appendChild(opt);
                    });
                    loadNotesForCurrent();
                });
        }

        function addNewNote() {
            const sid = commScenario.value;
            const text = newNoteText.value.trim();
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            if (!sid) { alert("Select scenario"); return; }
            if (!text) { alert("Enter note text"); return; }

            fetch('/api/scenarios/' + sid + '/notes', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    text: text
                })
            })
                .then(r => r.json())
                .then(res => {
                    if (!res.success) {
                        alert(res.message || "Error saving note");
                        return;
                    }
                    newNoteText.value = "";
                    loadNotesForCurrent();
                });
        }

        function loadNotesForCurrent() {
            const sid = commScenario.value;
            const body = document.getElementById("commTableBody");
            if (!sid) { if (body) body.innerHTML = ""; return; }

            fetch('/api/scenarios/' + sid + '/notes')
                .then(r => r.json())
                .then(notes => renderNotesTable(notes));
        }

        function renderNotesTable(notes) {
            const body = document.getElementById("commTableBody");
            if (!body) return;
            if (!notes || !notes.length) {
                body.innerHTML = '<tr><td colspan="4"><em>No notes for this scenario.</em></td></tr>';
                return;
            }

            let html = "";
            notes.forEach(n => {
                let repliesHtml = "";
                (n.replies || []).forEach(r => {
                    const dt = new Date(r.created_at).toLocaleString();
                    repliesHtml += '<div class="comm-reply">' +
                        '<div class="comm-meta"><strong>' + r.created_by + '</strong> • ' + dt + '</div>' +
                        '<div>' + r.text + '</div>' +
                        '</div>';
                });

                const mainDate = new Date(n.created_at).toLocaleString();

                html += '<tr>' +
                    '<td>' + (n.scenario_code || "") + '</td>' +
                    '<td>' + (n.scenario_name || "") + '</td>' +
                    '<td>' + n.status + '</td>' +
                    '<td>' +
                    '<div><strong>Note:</strong> ' + n.text + '</div>' +
                    '<div class="comm-meta">By ' + n.created_by + ' • ' + mainDate + '</div>' +
                    repliesHtml +
                    '<div style="margin-top:6px;">' +
                    '<select onchange="noteActionChange(' + n.id + ', this.value)">' +
                    '<option value="">Select</option>' +
                    '<option>Approved</option>' +
                    '<option>Undergoing Changes</option>' +
                    '<option>Changes Implemented</option>' +
                    '<option>Under Discussion</option>' +
                    '<option>Not Feasible</option>' +
                    '<option>Reply</option>' +
                    '</select>' +
                    '<div id="actionBox_' + n.id + '"></div>' +
                    '</div>' +
                    '</td>' +
                    '</tr>';
            });

            body.innerHTML = html;
        }

        function noteActionChange(noteId, action) {
            const box = document.getElementById('actionBox_' + noteId);
            if (!box) return;
            box.innerHTML = "";

            if (!action) return;

            box.innerHTML = '<textarea id="reasonText_' + noteId + '" placeholder="Write reason..."></textarea>' +
                '<button class="btn btn-primary" style="margin-top:4px;" onclick="postNoteAction(' + noteId + ', \'' + action + '\')">Post</button>';
        }

        function postNoteAction(noteId, action) {
            const txtEl = document.getElementById('reasonText_' + noteId);
            if (!txtEl) return;
            const reason = txtEl.value.trim();
            if (!reason) {
                alert("Please enter reason/comment");
                return;
            }

            const user = JSON.parse(localStorage.getItem("user") || "{}");

            if (action === "Reply") {
                fetch('/api/notes/' + noteId + '/reply', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: reason,
                        user_id: user.id
                    })
                })
                    .then(r => r.json())
                    .then(res => {
                        if (!res.success) {
                            alert(res.message || "Error posting reply");
                            return;
                        }
                        loadNotesForCurrent();
                    });
            } else {
                fetch('/api/notes/' + noteId + '/status', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: action,
                        reason: reason,
                        user_id: user.id
                    })
                })
                    .then(r => r.json())
                    .then(res => {
                        if (!res.success) {
                            alert(res.message || "Error updating status");
                            return;
                        }
                        loadNotesForCurrent();
                    });
            }
        }
    </script>



    <!-- Create User Modal Removed (Moved to Tab) -->
</body>

</html>