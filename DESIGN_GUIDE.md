# 🎨 Visual Design Guide - AttendancePro

## Color Palette

### Primary Gradients
```css
/* Purple to Pink */
background: linear-gradient(to right, #8b5cf6, #ec4899);

/* Blue to Cyan */
background: linear-gradient(to right, #3b82f6, #06b6d4);

/* Green to Emerald */
background: linear-gradient(to right, #10b981, #059669);

/* Orange to Red */
background: linear-gradient(to right, #f97316, #ef4444);
```

### Background Gradients
```css
/* Login Page */
background: linear-gradient(to bottom right, #0f172a, #581c87, #0f172a);

/* Super Admin */
background: linear-gradient(to bottom right, #0f172a, #312e81, #0f172a);

/* Company Dashboard */
background: linear-gradient(to bottom right, #f8fafc, #dbeafe, #fae8ff);

/* Employee Dashboard */
background: linear-gradient(to bottom right, #faf5ff, #dbeafe, #fce7f3);
```

## Component Styles

### Glass Cards
```jsx
className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/50"
```

### Gradient Buttons
```jsx
className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all"
```

### Status Badges
```jsx
// Active/Success
className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold"

// Warning/Suspended
className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold"

// Error/Danger
className="bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold"
```

### Input Fields
```jsx
className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
```

## Icon Usage

### Lucide Icons Mapping
- **User/Profile**: `User`, `Users`
- **Building/Company**: `Building2`
- **Security**: `Shield`, `Lock`
- **Actions**: `Plus`, `Edit2`, `Trash2`, `Power`
- **Navigation**: `ArrowRight`, `LogOut`
- **Status**: `CheckCircle`, `AlertTriangle`, `XCircle`
- **Settings**: `Settings`, `Clock`, `MapPin`, `Globe`
- **Hardware**: `Server`, `Fingerprint`
- **Stats**: `BarChart3`, `TrendingUp`, `Activity`
- **Special**: `Sparkles`, `Zap`, `Target`, `Crosshair`

## Layout Patterns

### Header Structure
```jsx
<header className="backdrop-blur-xl bg-white/80 rounded-3xl p-6 shadow-2xl border border-white/50">
  <div className="flex items-center justify-between">
    {/* Left: Logo + Title */}
    <div className="flex items-center gap-4">
      <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-black">Title</h1>
        <p className="text-slate-500 text-sm">Subtitle</p>
      </div>
    </div>
    
    {/* Right: Actions */}
    <button className="bg-gradient-to-r from-red-500 to-pink-500...">
      Logout
    </button>
  </div>
</header>
```

### Tab System
```jsx
<div className="flex gap-3">
  {tabs.map(tab => (
    <button className={`px-6 py-4 rounded-2xl font-bold ${
      activeTab === tab.key 
        ? 'bg-white shadow-2xl scale-105' 
        : 'bg-white/50 hover:bg-white/80'
    }`}>
      <Icon /> {tab.label}
    </button>
  ))}
</div>
```

### Card Grid
```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Sidebar (1 column) */}
  <div className="space-y-6">...</div>
  
  {/* Main Content (2 columns) */}
  <div className="lg:col-span-2 space-y-6">...</div>
</div>
```

## Typography Scale

```css
/* Display */
.text-4xl font-black  /* Page Titles */
.text-3xl font-black  /* Section Titles */
.text-2xl font-bold   /* Card Titles */
.text-xl font-bold    /* Subsection Titles */

/* Body */
.text-base font-semibold  /* Important text */
.text-sm font-medium      /* Labels */
.text-xs font-bold        /* Badges */

/* Special */
.font-mono               /* Code, IDs */
.uppercase tracking-wide /* Labels */
```

## Spacing System

```css
/* Padding */
p-3  /* Small elements */
p-4  /* Medium elements */
p-6  /* Cards */
p-8  /* Large cards */

/* Gap */
gap-2  /* Tight */
gap-3  /* Normal */
gap-4  /* Medium */
gap-6  /* Large */
gap-8  /* Extra large */

/* Margin */
mb-2  /* Small */
mb-4  /* Medium */
mb-6  /* Large */
mb-8  /* Extra large */
```

## Border Radius

```css
rounded-lg    /* Small: 8px */
rounded-xl    /* Medium: 12px */
rounded-2xl   /* Large: 16px */
rounded-3xl   /* Extra large: 24px */
rounded-full  /* Circular */
```

## Shadow Hierarchy

```css
shadow-sm     /* Subtle */
shadow-lg     /* Normal */
shadow-xl     /* Cards */
shadow-2xl    /* Important cards */
```

## Hover Effects

### Button Hover
```jsx
className="transform hover:scale-105 transition-all duration-300"
```

### Card Hover
```jsx
className="hover:shadow-2xl transition-shadow duration-300"
```

### Table Row Hover
```jsx
className="hover:bg-blue-50/50 transition-colors"
```

## Animation Classes

```css
/* Fade In */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Scale In */
@keyframes scale-in {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Slide In */
@keyframes slide-in {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

## Responsive Breakpoints

```jsx
// Mobile First Approach
<div className="
  w-full           /* Mobile */
  md:w-1/2         /* Tablet (768px+) */
  lg:w-1/3         /* Desktop (1024px+) */
  xl:w-1/4         /* Large Desktop (1280px+) */
">
```

## State Colors

### Status Colors
- **Success/Present**: Green (#10b981)
- **Warning/Late**: Orange (#f97316)
- **Danger/Absent**: Red (#ef4444)
- **Info**: Blue (#3b82f6)
- **Neutral**: Slate (#64748b)

### Interactive States
- **Hover**: Scale(1.05) + Darker shade
- **Active**: Gradient background
- **Disabled**: opacity-50
- **Focus**: Ring outline

## Best Practices

1. **Consistency**: Use the same pattern for similar elements
2. **Spacing**: Maintain 8px grid system
3. **Colors**: Stick to the defined palette
4. **Icons**: Always pair with text
5. **Feedback**: Show loading states
6. **Transitions**: Keep under 300ms
7. **Accessibility**: Maintain contrast ratios
8. **Mobile**: Test on small screens

## Quick Reference

### Common Combinations

**Primary Button**:
```jsx
bg-gradient-to-r from-purple-600 to-pink-600 
hover:from-purple-700 hover:to-pink-700 
text-white font-bold py-4 px-6 rounded-xl 
shadow-lg transform hover:scale-105 transition-all
```

**Glass Card**:
```jsx
backdrop-blur-xl bg-white/80 
p-8 rounded-3xl shadow-2xl 
border border-white/50
```

**Status Badge**:
```jsx
inline-flex items-center gap-1 
px-3 py-1 rounded-full text-xs font-bold 
bg-green-100 text-green-700 border border-green-200
```

**Input Field**:
```jsx
w-full bg-white border-2 border-slate-200 
p-3 rounded-xl 
focus:border-blue-500 focus:outline-none 
transition-colors
```

---

This design system ensures **consistency, beauty, and professionalism** across all pages!
