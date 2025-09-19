<<<<<<< HEAD
# dana-dms-frontend
=======
# Document Management System (DMS)

A production-ready Document Management System built with React 18, TypeScript, Vite, and modern web technologies. This application provides a comprehensive solution for managing documents, folders, assignments, and workflows in an enterprise environment.

## 🚀 Features

### Core Functionality
- **Authentication System**: Secure login/logout with JWT token management
- **Multi-tenant Architecture**: Hierarchical tenant switching (Group → Subsidiary → Location → Department)
- **Document Management**: Upload, organize, and manage documents with metadata
- **Folder Organization**: Create and manage folder hierarchies
- **Assignment Tracking**: Task assignment and workflow management
- **Audit Trail**: Document access and modification tracking
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Technical Features
- **Redux Toolkit**: Centralized state management with RTK Query
- **React Router v6**: Client-side routing with protected routes
- **Theme System**: Light/dark mode with system preference detection
- **Error Boundaries**: Comprehensive error handling and recovery
- **Accessibility**: WCAG compliant with keyboard navigation
- **TypeScript**: Full type safety throughout the application

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives
- **Form Handling**: React Hook Form + Zod validation
- **Notifications**: Sonner toast system

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd document-management-system
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Build for production**
   \`\`\`bash
   npm run build
   \`\`\`

## 🔐 Authentication

### Demo Credentials
- **Email**: admin@example.com
- **Password**: password

### User Roles
- **Admin**: Full system access including user management
- **Manager**: Document and folder management within assigned tenants
- **User**: Basic document access and collaboration features

## 🏗 Project Structure

\`\`\`
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components (AppShell, Sidebar, TopBar)
│   ├── providers/         # Context providers (Theme, App)
│   └── ui/               # Reusable UI components (shadcn/ui)
├── data/                 # Mock data and constants
├── hooks/                # Custom React hooks
├── pages/                # Page components
├── router/               # Routing configuration
├── store/                # Redux store and slices
├── types/                # TypeScript type definitions
└── lib/                  # Utility functions
\`\`\`

## 🎨 Design System

### Color Palette
- **Primary**: Professional blue (#2e3793) for primary actions and branding
- **Secondary**: Neutral grays for backgrounds and secondary elements
- **Accent**: Subtle red (#ec242a) for destructive actions and alerts
- **Success**: Green tones for positive feedback
- **Warning**: Orange/yellow for caution states

### Typography
- **Font Family**: System fonts (system-ui, Avenir, Helvetica, Arial)
- **Responsive Scale**: Mobile-first typography with fluid scaling
- **Text Balance**: Optimized line breaks for headings and content

### Layout
- **Mobile-First**: Responsive design starting from 320px
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: CSS Grid and Flexbox for complex layouts
- **Spacing**: Consistent 4px base unit scaling

## 🔧 Configuration

### Environment Variables
\`\`\`env
# Development
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Document Management System

# Production
VITE_API_BASE_URL=https://api.yourdomain.com
\`\`\`

### Theme Configuration
The theme system supports:
- Light mode (default)
- Dark mode
- System preference detection
- Custom CSS properties for easy customization

## 📱 Responsive Design

### Mobile (< 768px)
- Collapsible sidebar with overlay
- Touch-optimized navigation
- Simplified layouts for small screens

### Tablet (768px - 1024px)
- Adaptive sidebar behavior
- Optimized content density
- Touch and mouse interaction support

### Desktop (> 1024px)
- Full sidebar navigation
- Multi-column layouts
- Keyboard shortcuts and accessibility features

## 🧪 Testing

\`\`\`bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
\`\`\`

## 🚀 Deployment

### Build Optimization
\`\`\`bash
npm run build
\`\`\`

### Production Checklist
- [ ] Environment variables configured
- [ ] API endpoints updated
- [ ] Authentication tokens secured
- [ ] Error tracking enabled
- [ ] Performance monitoring setup

## 🔒 Security Features

- **JWT Token Management**: Secure token storage and refresh
- **Route Protection**: Authentication guards on protected routes
- **Input Validation**: Form validation with Zod schemas
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Token-based request validation

## ♿ Accessibility

- **WCAG 2.1 AA Compliant**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Meets minimum contrast ratios

## 🔄 State Management

### Redux Store Structure
\`\`\`typescript
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    currentTenant: Tenant | null,
    tenantHierarchy: Tenant[]
  },
  api: {
    // RTK Query cache and state
  }
}
\`\`\`

## 📊 Performance

- **Code Splitting**: Route-based lazy loading
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: Responsive images with lazy loading
- **Caching Strategy**: Service worker for offline support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ using modern web technologies**
\`\`\`

```typescript file="" isHidden
>>>>>>> 714f58a (first commit)
