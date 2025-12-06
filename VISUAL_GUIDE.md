# User Profile System - Visual Guide

## Dashboard Avatar Menu

```
┌─────────────────────────────────────────────────┐
│  Workstation v6.5.1                        [👤] │
│                                            ▲    │
│  (Click avatar to open menu)                    │
└─────────────────────────────────────────────────┘

When clicked, shows:

┌─────────────────────────────┐
│ ┌────────────────────────┐  │
│ │                        │  │
│ │    [Profile Photo]     │  │  ← Profile Photo (or emoji)
│ │    or 👤 initials      │  │
│ │                        │  │
│ └────────────────────────┘  │
│ John Doe                     │  ← Full Name
│ Admin                        │  ← Role
├─────────────────────────────┤
│ 📧 john.doe@example.com    │  ← Email
│ 👤 Administrator           │  ← Role Display
├─────────────────────────────┤
│ ⚙️  Edit Profile           │  ← 4 Menu Items
│ 📝 Edit Details            │
│ 🔐 Change Password         │
│ 📷 Upload Photo            │
├─────────────────────────────┤
│ [      Logout      ]        │
└─────────────────────────────┘
```

---

## Profile Page Layout

### Desktop View (2-Column):

```
┌────────────────────────────────────────────────────────────────┐
│ 👤 User Profile                                   [← Back]      │
└────────────────────────────────────────────────────────────────┘

┌──────────────────────┐ ┌─────────────────────────────────────┐
│                      │ │ Personal Information                │
│  Profile Card        │ │ ┌─────────────────────────────────┐ │
│ ┌──────────────────┐ │ │ First Name: [ John          ]   │ │
│ │ [Profile Photo]  │ │ │ Last Name:  [ Doe           ]   │ │
│ │                  │ │ ├─────────────────────────────────┤ │
│ │    or 👤        │ │ │ Email:      [ john@example.com] │ │
│ └──────────────────┘ │ │ Phone:      [ +1234567890  ]   │ │
│ John Doe             │ │ │
│ Admin                │ │ [💾 Save Changes] [Clear]        │ │
│ john@example.com     │ │ └─────────────────────────────────┘ │
│                      │ │                                     │
│ [🗑️ Remove Photo]    │ │ Security                            │
│                      │ │ ┌─────────────────────────────────┐ │
└──────────────────────┘ │ Current Password: [ ****  ]        │ │
                         │ New Password:      [ ****  ]        │ │
                         │ Confirm Password:  [ ****  ]        │ │
                         │ ✓ Min 6 characters                  │ │
                         │ ✓ Matches with confirm              │ │
                         │                                     │ │
                         │ [🔐 Update Password] [Clear]        │ │
                         │ └─────────────────────────────────┘ │
                         │                                     │
                         │ Account Information                 │
                         │ ┌─────────────────────────────────┐ │
                         │ Username: [ admin        ]          │ │
                         │ Role:     [ Administrator]         │ │
                         │ Created:  [ 05-12-2025 12:30]     │ │
                         │ Updated:  [ 05-12-2025 14:45]     │ │
                         │ └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile View (1-Column):

```
┌──────────────────────┐
│ 👤 User Profile      │
│ [← Back]             │
└──────────────────────┘

┌──────────────────────┐
│ [Profile Photo]      │
│ or 👤               │
│                      │
│ John Doe             │
│ Admin                │
│ john@...com          │
│                      │
│ [🗑️ Remove Photo]    │
└──────────────────────┘

┌──────────────────────┐
│ Personal Information │
│ First Name: [    ]   │
│ Last Name:  [    ]   │
│ Email:      [    ]   │
│ Phone:      [    ]   │
│ [💾 Save]   [Clear]  │
└──────────────────────┘

┌──────────────────────┐
│ Security             │
│ Current Pwd: [ ]     │
│ New Pwd:     [ ]     │
│ Confirm:     [ ]     │
│ [🔐 Update]  [Clear] │
└──────────────────────┘

┌──────────────────────┐
│ Account Information  │
│ Username: admin      │
│ Role: Admin          │
│ Created: 05-12-2025  │
│ Updated: 05-12-2025  │
└──────────────────────┘
```

---

## Color Scheme

### Main Colors:
- **Primary Gradient**: Blue (#3b82f6) → Red (#ef4444)
- **Success**: Green (#10b981)
- **Danger**: Red (#ef4444)
- **Warning**: Orange (#f59e0b)
- **Text**: Dark Blue (#0f172a)
- **Muted Text**: Gray (#6b7280)

### UI Elements:
```
┌─────────────────────────────┐
│ Header: Gradient (Blue→Red) │  ← Title
├─────────────────────────────┤
│ Profile Card: White/Glass   │  ← Sidebar
│ Main Content: White/Glass   │  ← Forms
│ Buttons:                    │
│  • Primary: Gradient        │  ← Main actions
│  • Secondary: Light Blue BG │  ← Secondary
│  • Danger: Red BG           │  ← Delete
└─────────────────────────────┘
```

---

## Interaction Flows

### Upload Profile Photo:

```
1. [Avatar] ──Click──→ Profile Menu
2. Profile Menu ──Click "📷 Upload Photo"──→ Profile Page (photo section)
3. [Avatar Image] ──Click──→ File Input
4. File Input ──Select File──→ Upload Processing
5. [Loading Spinner] ──Wait──→ Server Processing
6. ✅ Success ──Photo Displays──→ Avatar Updated
```

### Change Password:

```
1. [Avatar] ──Click──→ Profile Menu
2. Profile Menu ──Click "🔐 Change Password"──→ Profile Page (security section)
3. [Form Fields] ──Type──→ Input Values
4. Real-time ──Check──→ Validation Feedback
5. ✓ Requirements Met ──Enable──→ Update Button
6. [Update Button] ──Click──→ Send to API
7. ✅ Success ──Show Alert──→ Form Reset
```

### Edit Profile:

```
1. [Avatar] ──Click──→ Profile Menu
2. Profile Menu ──Click "⚙️ Edit Profile"──→ Profile Page
3. [Form Fields] ──Pre-filled with──→ Current Values
4. [Edit Fields] ──Change──→ Input Values
5. [Save Button] ──Click──→ API Update
6. ✅ Success ──Feedback──→ Form Updated
```

---

## Response Indicators

### Success Alert (Green):
```
┌──────────────────────────────────────┐
│ ✓ Profile updated successfully       │
└──────────────────────────────────────┘
```

### Error Alert (Red):
```
┌──────────────────────────────────────┐
│ ✕ Email already in use               │
└──────────────────────────────────────┘
```

### Warning Alert (Orange):
```
┌──────────────────────────────────────┐
│ ⚠ Password must be at least 6 chars  │
└──────────────────────────────────────┘
```

### Loading State:
```
Button: [⟳ Saving...] ← Spinner + Text
During upload/save operations
```

---

## File Upload Requirements

```
┌─────────────────────────────────────┐
│ Profile Photo Upload                │
├─────────────────────────────────────┤
│ Accepted Formats:                   │
│ • PNG (.png)                        │
│ • JPEG (.jpg, .jpeg)                │
│ • GIF (.gif)                        │
│ • WebP (.webp)                      │
│                                     │
│ File Size: Maximum 5 MB             │
│ Dimensions: No restriction (any)    │
│ Display: Circular (50% border-rad)  │
├─────────────────────────────────────┤
│ Upload Methods:                     │
│ 1. Click on avatar → Select file    │
│ 2. Drag & drop → Coming soon        │
│ 3. File input → Direct selection    │
└─────────────────────────────────────┘
```

---

## Form Validation

### Password Requirements:
```
✓ Min 6 characters
  ☐ Length >= 6 chars  (update on keypress)

✓ Matches confirmation
  ☐ New == Confirm     (update on keypress)

Both must be true to enable [Update] button
```

### Email Validation:
```
✓ Valid email format
✓ Unique in database
✗ Already in use → Error message shown
```

### Phone Format:
```
Free format (no specific format required)
Examples: +1-234-567-8900
          (123) 456-7890
          1234567890
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate form fields |
| `Enter` | Submit form (when focused) |
| `Escape` | Close confirmation modal |

---

## Browser Compatibility

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Mobile Chrome
✅ Mobile Safari

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Page Load Time | < 2 seconds |
| Profile Fetch | < 500ms |
| Photo Upload | < 5 seconds (depends on size) |
| Form Save | < 1 second |
| Avatar Update | Instant (cached) |

---

## Accessibility Features

- ✓ Semantic HTML structure
- ✓ ARIA labels on forms
- ✓ Keyboard navigation support
- ✓ Color contrast > 4.5:1
- ✓ Focus indicators visible
- ✓ Error messages tied to inputs
- ✓ Loading states announced
- ✓ Form validation feedback

---

## Mobile Responsiveness

### Breakpoints:
- **Desktop**: > 1024px (2-column)
- **Tablet**: 768px - 1024px (1-column)
- **Mobile**: < 768px (1-column, full width)

### Mobile Optimizations:
- Touch-friendly buttons (44px minimum)
- Single-column layout
- Larger text (16px+)
- Full-width inputs
- Stacked buttons
- Bottom sheet modals

---

**Visual Design Complete** ✅

All UI elements follow modern design patterns with smooth animations and professional styling.
