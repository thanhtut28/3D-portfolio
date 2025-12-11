# AGENT.md - 3D Avatar Portfolio Context

## Project Overview

This is an interactive 3D avatar portfolio built with React Three Fiber, Vercel AI SDK, and Contentful CMS. The avatar responds to user queries with animated conversations and rich UI components instead of plain text responses.

## Core Technologies

- **React Three Fiber**: 3D avatar rendering and animations
- **Vercel AI SDK**: Conversational AI integration
- **Contentful CMS**: Content management for bio, projects, education, etc.
- **React**: Component-based UI framework
- **Tailwind CSS**: Styling

## Architecture Pattern

The application follows a **conversational UI pattern with widget-based responses**:

1. User asks a question via chat interface
2. AI agent processes the query and determines intent (bio, projects, education, skills, contact, etc.)
3. Instead of text-only responses, the agent returns:
   - Avatar speaking animation
   - Rich UI widgets (cards, timelines, galleries, interactive elements)
   - Contextual content from Contentful CMS

## Content Structure in Contentful

### Content Types

```typescript
// Bio
{
  name: string
  title: string
  description: string
  avatar: Asset
  resumeUrl: string
}

// Project
{
  title: string
  description: string
  technologies: string[]
  liveUrl?: string
  githubUrl?: string
  images: Asset[]
  featured: boolean
}

// Education
{
  institution: string
  degree: string
  field: string
  startDate: Date
  endDate?: Date
  description: string
}

// Experience
{
  company: string
  role: string
  startDate: Date
  endDate?: Date
  description: string
  skills: string[]
}

// Skills
{
  category: string
  items: string[]
  proficiency: number
}
```

## Agent Behavior Guidelines

### Intent Recognition

The agent should recognize these primary intents:

- **Bio/About**: Personal introduction, background, summary
- **Projects**: Portfolio items, work samples, case studies
- **Education**: Academic background, certifications, courses
- **Experience**: Work history, professional roles
- **Skills**: Technical skills, tools, proficiencies
- **Contact**: How to reach out, social links
- **General Chat**: Casual conversation, clarifications

### Response Structure

Each response should contain:

```typescript
{
  intent: string
  avatarAnimation: 'idle' | 'talking' | 'pointing' | 'thinking'
  speech: string // What the avatar says
  widget: {
    type: 'card' | 'timeline' | 'grid' | 'list' | 'contact'
    data: ContentfulData
  }
}
```

### Widget Types by Intent

**Projects Intent → Card Grid Widget**
- Display projects as interactive cards
- Show thumbnail, title, tech stack
- Include "View Live" and "GitHub" links
- Enable filtering by technology

**Education Intent → Timeline Widget**
- Chronological display of education
- Institution logos and dates
- Expandable descriptions

**Experience Intent → Timeline Widget**
- Work history in timeline format
- Company names, roles, dates
- Skill tags for each position

**Skills Intent → Category Grid Widget**
- Group skills by category
- Visual proficiency indicators
- Interactive hover effects

**Contact Intent → Contact Card Widget**
- Social media links with icons
- Email, LinkedIn, GitHub, etc.
- Call-to-action buttons

**Bio Intent → Hero Card Widget**
- Profile photo/avatar
- Name and title
- Brief introduction
- Resume download button

## Avatar Animation Triggers

Map conversation states to avatar animations:

- **Greeting**: Wave animation → talking
- **Explaining projects**: Pointing gesture → talking
- **Thinking/processing**: Thinking animation
- **Idle/listening**: Subtle idle animation
- **Enthusiastic topics**: Excited gestures

## Conversation Flow Examples

### Example 1: Projects Query
```
User: "Show me your projects"
Avatar: *animated talking* "I'd love to show you what I've been working on! Here are some of my featured projects."
Widget: <ProjectGrid with 6 cards, each showing live demo and GitHub links>
```

### Example 2: Skills Query
```
User: "What technologies do you know?"
Avatar: *pointing gesture* "I work with a variety of modern technologies. Let me break them down by category."
Widget: <SkillsGrid with categories: Frontend, Backend, Tools, showing proficiency levels>
```

### Example 3: Contact Query
```
User: "How can I contact you?"
Avatar: *friendly wave* "I'd love to connect! Here are the best ways to reach me."
Widget: <ContactCard with social links, email, calendar booking>
```

## Implementation Guidelines

### Data Fetching Strategy

1. **On Mount**: Fetch all Contentful data and cache
2. **Agent Query**: Map user intent to cached data subset
3. **Widget Rendering**: Pass data to appropriate widget component

### Component Structure

```
src/
├── components/
│   ├── Avatar/
│   │   ├── Avatar3D.tsx
│   │   └── animations.ts
│   ├── Chat/
│   │   ├── ChatInterface.tsx
│   │   └── MessageBubble.tsx
│   ├── Widgets/
│   │   ├── ProjectCard.tsx
│   │   ├── Timeline.tsx
│   │   ├── SkillsGrid.tsx
│   │   └── ContactCard.tsx
│   └── Scene/
│       └── Scene3D.tsx
├── lib/
│   ├── contentful.ts
│   ├── ai-agent.ts
│   └── intent-classifier.ts
└── hooks/
    ├── useContentful.ts
    └── useAvatarAnimation.ts
```

### AI Agent Prompt Pattern

```typescript
const systemPrompt = `You are a 3D avatar portfolio assistant. 
Your role is to present the portfolio owner's information in engaging ways.

When responding:
1. Keep avatar dialogue natural and conversational (2-3 sentences max)
2. Always specify which widget to display
3. Match tone to the query (professional for work, friendly for casual)

Available intents: bio, projects, education, experience, skills, contact, general

Return responses in this format:
{
  "intent": "projects",
  "speech": "I'd love to show you what I've been working on!",
  "widgetType": "projectGrid",
  "widgetData": { ... }
}`;
```

## Best Practices

### Performance
- Lazy load 3D models and textures
- Implement widget virtualization for large datasets
- Cache Contentful responses
- Optimize animations for 60fps

### UX Considerations
- Avatar should face the camera during conversation
- Smooth transitions between widgets
- Loading states for data fetching
- Error boundaries for widget failures
- Mobile-responsive widget layouts

### Accessibility
- Provide text alternatives for 3D content
- Keyboard navigation for all widgets
- ARIA labels for interactive elements
- High contrast mode support

### Content Guidelines
- Keep avatar speech concise and natural
- Avoid jargon in casual conversation
- Use first-person perspective ("I built", "My experience")
- Provide context for technical terms

## Testing Strategy

- **Unit Tests**: Widget components, intent classifier
- **Integration Tests**: Contentful data fetching, AI responses
- **E2E Tests**: Full conversation flows, widget interactions
- **Visual Tests**: 3D avatar rendering, responsive layouts

## Deployment Considerations

- Set Contentful environment variables
- Configure Vercel AI SDK API keys
- Optimize 3D assets for web delivery
- Enable edge caching for Contentful API
- Set up analytics for conversation tracking

## Future Enhancements

- Multi-language support
- Voice input/output
- AR/VR avatar viewing
- Interactive project demos within widgets
- AI-powered project recommendations based on user interests