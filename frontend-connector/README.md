# Frontend Connector - NerdNest

A modern, responsive web application for organizing sources, notes, and ideas in notebooks with AI-powered chat assistance.

## ✨ Features

- **📚 Notebook Management**: Create, organize, and manage notebooks
- **🤖 AI Chat Assistant**: Ask questions about your notebook content
- **📝 Note Taking**: Create and edit notes within notebooks
- **🎙️ Audio Generation**: Generate audio overviews from your content
- **📱 Fully Responsive**: Mobile-first design that works on all devices
- **🎨 Modern UI**: Clean, intuitive interface with smooth animations

## 🚀 Responsive Design System

This application is built with a **mobile-first responsive design** approach, ensuring optimal experience across all device sizes.

### Breakpoints

- **Mobile**: `< 640px` - Optimized for smartphones
- **Tablet**: `640px - 1024px` - Optimized for tablets
- **Desktop**: `≥ 1024px` - Full desktop experience

### Mobile-First Features

- **Touch-Friendly**: 44px minimum touch targets
- **Mobile Navigation**: Slide-out sidebar for mobile devices
- **Responsive Grid**: Adaptive layouts that work on all screen sizes
- **Mobile Typography**: Readable text at all sizes
- **Touch Gestures**: Optimized for mobile interactions

### Responsive Components

- **Adaptive Headers**: Collapsible navigation on mobile
- **Mobile Tabs**: Touch-friendly tab navigation
- **Responsive Cards**: Cards that adapt to screen size
- **Mobile Forms**: Optimized form inputs for mobile
- **Touch-Friendly Buttons**: Proper sizing for mobile devices

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Query for server state
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Package Manager**: npm/yarn

## 📱 Mobile Experience

### Mobile Navigation
- **Hamburger Menu**: Accessible navigation on mobile devices
- **Slide-out Sidebar**: Smooth mobile navigation experience
- **Touch Gestures**: Swipe and tap interactions
- **Mobile Tabs**: Tab-based navigation for mobile layouts

### Mobile Optimizations
- **Touch Targets**: Minimum 44px for all interactive elements
- **Mobile Typography**: Optimized font sizes for mobile reading
- **Mobile Spacing**: Appropriate spacing for mobile devices
- **Mobile Forms**: Mobile-friendly input fields and buttons
- **Mobile Cards**: Responsive card layouts for small screens

## 🎨 Design System

### Colors
- **Primary**: Purple-based color scheme
- **Background**: Light, clean backgrounds
- **Accent**: Subtle accent colors for highlights
- **Dark Mode**: Full dark mode support

### Typography
- **Mobile-First**: Responsive font sizing
- **Readability**: Optimized for all screen sizes
- **Hierarchy**: Clear visual hierarchy
- **Accessibility**: High contrast and readable fonts

### Spacing
- **Mobile**: Compact spacing for small screens
- **Tablet**: Balanced spacing for medium screens
- **Desktop**: Generous spacing for large screens
- **Consistent**: 4px base unit system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd frontend-connector

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 📱 Mobile Development

### Responsive Utilities
The project includes custom Tailwind utilities for mobile-first development:

```css
/* Mobile-first spacing */
.mobile-padding { @apply py-4 sm:py-6 lg:py-8; }
.mobile-container { @apply px-4 sm:px-6 lg:px-8; }

/* Mobile-first typography */
.mobile-text { @apply text-sm sm:text-base lg:text-lg; }
.mobile-heading { @apply text-xl sm:text-2xl lg:text-3xl xl:text-4xl; }

/* Mobile-first grid */
.mobile-grid { @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4; }
```

### Mobile Hooks
Custom React hooks for mobile detection and responsive behavior:

```typescript
import { useMobile } from '@/hooks/use-mobile';

function MyComponent() {
  const { isMobile, isTablet, isDesktop, screenSize } = useMobile();
  
  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {/* Responsive content */}
    </div>
  );
}
```

## 🎯 Best Practices

### Mobile-First Development
1. **Start with Mobile**: Design for mobile first, then enhance for larger screens
2. **Touch-Friendly**: Ensure all interactive elements are touch-friendly
3. **Performance**: Optimize for mobile performance and loading times
4. **Accessibility**: Maintain accessibility across all device sizes

### Responsive Design
1. **Flexible Layouts**: Use CSS Grid and Flexbox for responsive layouts
2. **Breakpoint Strategy**: Use consistent breakpoints throughout the application
3. **Content Priority**: Prioritize content based on screen size
4. **Performance**: Optimize images and assets for different screen sizes

## 🔧 Customization

### Theme Configuration
The design system can be customized through the `tailwind.config.ts` file:

```typescript
// Custom breakpoints
screens: {
  'xs': '475px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}

// Custom colors
colors: {
  primary: 'hsl(var(--primary))',
  // ... more colors
}
```

### CSS Variables
Custom CSS properties for consistent theming:

```css
:root {
  --primary: 250 55% 55%;
  --background: 0 0% 98%;
  --radius: 0.75rem;
  /* ... more variables */
}
```

## 📱 Testing Mobile Experience

### Device Testing
- Test on actual mobile devices
- Use browser dev tools for mobile simulation
- Test touch interactions and gestures
- Verify responsive breakpoints

### Performance Testing
- Lighthouse mobile performance scores
- Core Web Vitals on mobile
- Mobile network simulation
- Touch target verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow mobile-first design principles
4. Test on multiple device sizes
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the responsive design guidelines

---

**Built with ❤️ and mobile-first design principles**
