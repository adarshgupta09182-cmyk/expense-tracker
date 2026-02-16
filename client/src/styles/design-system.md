# Design System - Light Mode

## 🧱 Layout & Spacing

### Background Colors
- **Primary Background**: `var(--bg-default)` - #FFFFFF
- **Card Surfaces**: `var(--bg-surface)` - #F8FAFC
- **Tertiary Background**: `var(--bg-tertiary)` - #F1F5F9

### Spacing Scale (8px increments)
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 40px (2.5rem)
- **3xl**: 48px (3rem)

### Padding & Margins
- **Cards**: 24px (lg)
- **Form Groups**: 16px (md)
- **Input Fields**: 14px vertical, 16px horizontal
- **Buttons**: 14px vertical, 20px horizontal
- **Section Gaps**: 24px (lg) or 32px (xl)

---

## ✍️ Typography

### Font Family
- **Primary**: Inter
- **Headings**: Inter (can use Poppins for emphasis)
- **Body**: Inter

### Font Sizes & Weights

#### Headings
- **H1**: 32px, Bold (700)
- **H2**: 24px, Bold (700)
- **H3**: 20px, Semi-bold (600)

#### Body Text
- **Body**: 16px, Regular (400)
- **Body Small**: 14px, Regular (400)
- **Caption**: 12px, Regular (400)

#### Secondary Text
- **Secondary**: 14px, Regular (400)
- **Muted**: 12px, Regular (400)

### Line Heights
- **Headings**: 1.2
- **Body**: 1.5 - 1.6
- **Compact**: 1.4

### Letter Spacing
- **Headings**: -0.5px to -1px
- **Body**: 0px
- **Uppercase**: 0.5px

---

## 🔘 Buttons

### Primary Button
- **Background**: `var(--primary)` - #4F46E5
- **Text Color**: White (#FFFFFF)
- **Padding**: 14px vertical, 20px horizontal
- **Border Radius**: 10px
- **Font Weight**: 600
- **Font Size**: 15px
- **Hover State**: `var(--primary-hover)` - #4338CA
- **Hover Effect**: Translate Y -3px, Shadow elevation
- **Disabled**: Opacity 0.6, Cursor not-allowed

### Secondary Button
- **Background**: Transparent
- **Border**: 1px solid `var(--border)` - #E5E7EB
- **Text Color**: `var(--text-primary)` - #111827
- **Padding**: 14px vertical, 20px horizontal
- **Border Radius**: 10px
- **Font Weight**: 600
- **Font Size**: 15px
- **Hover State**: 
  - Background: `var(--bg-surface)` - #F8FAFC
  - Border Color: `var(--primary)` - #4F46E5
  - Text Color: `var(--primary)` - #4F46E5
- **Disabled**: Opacity 0.6, Cursor not-allowed

### Button States
- **Default**: Base styling
- **Hover**: Color shift + elevation
- **Active**: Slight scale down (translateY -1px)
- **Disabled**: Reduced opacity, no pointer events
- **Loading**: Spinner animation, opacity 0.9

---

## 📦 Components

### Cards
- **Background**: `var(--bg-default)` - #FFFFFF
- **Border**: 1px solid `var(--border)` - #E5E7EB
- **Border Radius**: 12px
- **Padding**: 24px
- **Shadow**: 0 2px 8px rgba(0, 0, 0, 0.08)
- **Hover Shadow**: 0 4px 16px rgba(0, 0, 0, 0.12)
- **Transition**: all 0.3s ease

### Input Fields
- **Background**: `var(--bg-surface)` - #F8FAFC
- **Border**: 1px solid `var(--border)` - #E5E7EB
- **Border Radius**: 6px
- **Padding**: 10px 12px
- **Font Size**: 14px
- **Font Family**: Inter
- **Focus State**:
  - Border Color: `var(--primary)` - #4F46E5
  - Box Shadow: 0 0 0 3px rgba(79, 70, 229, 0.1)
- **Error State**:
  - Border Color: `var(--error)` - #EF4444
  - Box Shadow: 0 0 0 3px rgba(239, 68, 68, 0.1)

### Form Groups
- **Gap**: 16px (md)
- **Margin Bottom**: 16px (md)

### Badges
- **Padding**: 4px 12px
- **Border Radius**: 12px
- **Font Size**: 12px
- **Font Weight**: 600
- **Background**: Tinted color at 10% opacity
- **Text Color**: Corresponding color

### Tables
- **Header Background**: `var(--bg-surface)` - #F8FAFC
- **Header Border**: 2px solid `var(--border)` - #E5E7EB
- **Row Border**: 1px solid `var(--border)` - #E5E7EB
- **Hover Background**: `var(--bg-surface)` - #F8FAFC
- **Padding**: 14px 12px

---

## 🎨 Color Palette (Light Mode)

### Primary
- **Primary**: #4F46E5
- **Primary Hover**: #4338CA
- **Primary Light**: #6366F1

### Status Colors
- **Success**: #10B981
- **Error**: #EF4444
- **Warning**: #F59E0B
- **Info**: #3B82F6

### Data Accent Colors
- **Success (#10B981)**: Positive numbers, income, gains
- **Warning (#F59E0B)**: Budgets nearing limit, caution alerts
- **Error (#EF4444)**: Overspending alerts, negative values
- **Info (#3B82F6)**: Informational badges, neutral data

### Neutral
- **Text Primary**: #111827
- **Text Secondary**: #6B7280
- **Text Tertiary**: #9CA3AF
- **Border**: #E5E7EB
- **Background Default**: #FFFFFF
- **Background Surface**: #F8FAFC
- **Background Tertiary**: #F1F5F9

---

## ✨ Animations & Transitions

### Timing
- **Fast**: 0.2s
- **Standard**: 0.3s
- **Slow**: 0.6s

### Easing
- **Default**: ease
- **Ease Out**: ease-out
- **Ease In Out**: ease-in-out
- **Cubic Bezier**: cubic-bezier(0.34, 1.56, 0.64, 1)

### Common Animations
- **Fade In**: opacity 0 → 1
- **Slide In**: transform translateX/Y
- **Scale**: transform scale
- **Hover**: translateY -3px + shadow elevation

---

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 480px - 767px
- **Small Mobile**: < 480px

---

## 🔒 Accessibility

- **Contrast Ratio**: Minimum 4.5:1 for text
- **Focus States**: Visible outline or shadow
- **Font Size**: Minimum 14px for body text
- **Line Height**: Minimum 1.5 for readability
- **Touch Targets**: Minimum 44px × 44px

