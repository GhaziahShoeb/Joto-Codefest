# Joto - AI-Powered Study Companion

![Joto Logo](src/assets/joto_logo.png)

Joto is a cutting-edge, AI-powered study assistant designed to revolutionize the way students create, organize, and enhance their study materials. By leveraging the power of Generative AI, Joto transforms ordinary notes into comprehensive study resources, helping students learn more effectively and efficiently.

## 🌐 Live Application

**Visit Joto:** [https://joto-codefest.vercel.app/](https://joto-codefest.vercel.app/)

## ✨ Key Features

### 📝 Smart Note Taking
- **Rich Text Editor**: Create and format notes with a Microsoft Word-like interface
- **AI Beautifier**: Instantly transform plain text into well-structured, formatted documents
- **Selection Tools**: Select and enhance specific sections of your notes
- **Real-time Saving**: Auto-save functionality ensures you never lose your work

### 🤖 AI Study Assistant
- **Contextual Help**: Get explanations, examples, and clarifications on any concept
- **Intelligent Enhancements**: Improve writing clarity, fix grammar, and reorganize content
- **Study Guidance**: Receive personalized study tips based on your content
- **Reference Finder**: Discover relevant academic resources, videos, and articles

### 📚 Flashcard Generation
- **Auto-Generation**: Create flashcards from your notes with a single click
- **Customizable Difficulty**: Choose between easy, medium, and hard difficulty levels
- **Multiple Styles**: Generate term-definition, concept-based, or question-answer cards
- **Study Mode**: Flip, shuffle, and review cards in an interactive interface
- **Export Capabilities**: Save your flashcards for use in other applications

### ❓ Question Generation
- **Multiple Formats**: Create multiple-choice, short-answer, or essay questions
- **Customizable Difficulty**: Adjust question complexity to match your study needs
- **Contextual Awareness**: Questions are perfectly tailored to your specific content
- **Practice Mode**: Test yourself with generated questions and track your progress

### 🔗 Reference Management
- **File Upload**: Import PDFs, presentations, and other documents as reference materials
- **Web Links**: Add and organize web resources alongside your notes
- **AI Processing**: Extract key information from uploaded materials
- **Priority System**: Assign importance levels to different references
- **Note Generation**: Create comprehensive notes from your reference materials

### 🎨 User Experience
- **Dark Mode**: Comfortable studying day or night with theme support
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Intuitive Interface**: Clean layout designed for productive studying
- **Keyboard Shortcuts**: Efficient navigation for power users

## 🛠️ Technical Architecture

### Frontend Framework
- **React**: Component-based UI architecture
- **TypeScript**: Type-safe code for better maintainability
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Shadcn UI**: Component library for consistent design language

### AI Integration
- **Gemini API**: Powers intelligent content generation and processing
- **ReactMarkdown**: Renders AI-generated markdown content

### State Management
- **React Hooks**: Efficient, component-level state management
- **Custom Hooks**: Encapsulated logic for reusable functionality

### Data Flow
- **Custom Services**: Structured API communication
- **Local Storage**: Persistent data for better user experience

## 📁 Key Files & Components

### Core Components
- **`ai-assistant-button.tsx`**: Floating AI assistant interface
- **`ReferencesTab.tsx`**: Reference material management
- **`FlashcardsTab.tsx`**: Flashcard generation and study
- **`QuestionsTab.tsx`**: Question generation and practice
- **`EditorTab.tsx`**: Rich text editor implementation

### Services
- **`ai-service.ts`**: Handles communication with Gemini AI API
- **`utils.ts`**: Common utility functions

### Pages
- **`Home.tsx`**: Landing page with feature showcase
- **`Notes.tsx`**: Main note-taking interface
- **`Assistant.tsx`**: Dedicated AI assistant page

### Hooks
- **`use-ai-assistant.ts`**: AI functionality wrapper
- **`use-theme.ts`**: Dark/light mode management
- **`use-toast.ts`**: Notification system
- **`use-text-selection.ts`**: Text selection utilities

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn UI
- **State Management**: React Hooks, Context API
- **AI**: Gemini API (Google AI)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom utilities
- **UI Components**: Radix UI primitives with Shadcn UI
- **Animation**: Framer Motion
- **Markdown**: ReactMarkdown
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🏁 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/joto.git
   cd joto
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Gemini API key to `.env.local`:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment on Vercel

The application is currently deployed at: [https://joto-codefest.vercel.app/](https://joto-codefest.vercel.app/)

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fyour-repo%2Fjoto)

### Option 2: Manual Deployment

1. Fork the repository.
2. Create an account on [Vercel](https://vercel.com) if you don't have one.
3. Create a new project and import your forked repository.
4. Configure environment variables:
   - Go to Project Settings > Environment Variables
   - Add your `VITE_API_KEY` for Gemini API 
5. Deploy with the default settings.
6. Your app will be deployed and available at a Vercel URL.

### Environment Variables

Make a copy of `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Update the values in this file with your own API keys and configuration.

## Contribution

We welcome contributions! Feel free to open issues or submit pull requests to improve Joto.

## Credits

**Created By Team ReadLine** 
---

#GSoC-Innovator-Club
#Summer-of-CodeFest-25

Happy Studying! 🎓
contributor -ghaziah
