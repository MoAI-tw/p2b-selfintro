# 自我介紹產生器 (Self-Introduction Generator) - Project Structure

## Overview

自我介紹產生器是一個幫助用戶生成專業自我介紹的Web應用，支持多種大型語言模型 (LLM)，包括 OpenAI GPT 和 Google Gemini。此外，它還提供自我介紹優化功能，可以通過上傳錄音獲取AI反饋以改進自我介紹演講。

## Project Structure

### Core Directories

```
p2b_selfintro_frontend/
├── public/              # Static assets and HTML template
├── src/                 # Source code
│   ├── assets/          # Images, fonts, and other static resources
│   ├── components/      # Reusable UI components
│   ├── context/         # React context providers
│   ├── data/            # Static data files (schools, departments, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   │   ├── FAQ/         # FAQ page
│   │   ├── Features/    # Features page
│   │   ├── History/     # History page
│   │   ├── Optimizer/   # Self-introduction optimizer pages
│   │   ├── Projects/    # Projects management page
│   │   ├── PromptEditor/# Prompt template editor
│   │   └── UseCases/    # Use cases page
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── .env                 # Environment variables
└── package.json         # Project dependencies and scripts
```

## Main Features

The application offers two primary features:

1. **Self-Introduction Generator**: Creates tailored self-introductions for various professional and social contexts
2. **Self-Introduction Optimizer**: Analyzes recorded self-introductions and provides AI feedback for improvement

## Pages and Their Functions

### Core Pages

#### Home (`src/pages/Home.tsx`)
- Landing page with introduction to the application
- Links to create new self-introduction or optimize existing ones
- Language selector (English/Chinese)
- Responsive design with hero section and product features

#### Projects (`src/pages/Projects/index.tsx`)
- Displays all saved self-introduction projects
- Create, edit, view, and delete projects
- Search functionality for projects
- Pagination for large project collections

#### Profile (`src/pages/Profile.tsx`)
- User information input form
- Education background (school, degree, major)
- Work experience details (company, position, duration)
- Skills and achievements
- Project saving functionality
- Form validation for required fields

#### Industry (`src/pages/Industry.tsx`)
- Industry and job position selection
- Focus areas configuration for the self-introduction
- Job-specific keyword selection
- Target position customization

#### Settings (`src/pages/Settings.tsx`)
- Generation settings configuration
  - Language selection (Chinese, English, etc.)
  - Tone selection (professional, casual, etc.)
  - Output length configuration
  - Model selection (OpenAI GPT, Google Gemini)
- API key management for LLM providers
- Custom prompt template management
- Cost estimation for API calls

#### Result (`src/pages/Result.tsx`)
- Displays generated self-introduction
- Copy to clipboard functionality
- Download as text file
- Regenerate with different settings
- Save to project history
- Provide feedback on generation quality
- Display generation details (model used, cost, etc.)

### Optimizer Pages

#### Optimizer Home (`src/pages/Optimizer/index.tsx`)
- List of optimization projects
- Create, view, edit, and delete optimization projects
- Search functionality for projects
- Access to optimization history

#### Recorder (`src/pages/Optimizer/Recorder.tsx`)
- Audio recording interface
- Upload existing audio files
- Audio playback and review
- Recording duration tracking
- Save recording to project

#### Optimize (`src/pages/Optimizer/Optimize.tsx`)
- Optimization settings configuration
- Model selection for speech analysis
- Focus areas selection for feedback
- Language selection
- Process audio for AI feedback

#### Optimizer Result (`src/pages/Optimizer/Result.tsx`)
- Display AI feedback on self-introduction
- Improvement suggestions
- Performance metrics (speech rate, clarity, confidence)
- Compare original and improved versions
- Download report and improved speech text

#### Optimizer History (`src/pages/Optimizer/History.tsx`)
- View all past optimization attempts
- Compare different versions
- Delete optimization records
- Search and filter history

### Additional Pages

#### Features (`src/pages/Features/index.tsx`)
- Detailed description of application features
- Benefits for users
- Step-by-step guide to using the application

#### Use Cases (`src/pages/UseCases/index.tsx`)
- Examples of common use cases
- Sample self-introductions for different industries
- Success stories

#### FAQ (`src/pages/FAQ/index.tsx`)
- Frequently asked questions
- Troubleshooting tips
- Usage guidance

#### Prompt Editor (`src/pages/PromptEditor/index.tsx`)
- Advanced feature for customizing LLM prompts
- Template management
- Variables and placeholders support

## Key Components

- **ProgressBar**: Shows the progress through the self-introduction generation workflow
- **Navbar**: Navigation and user interface controls
- **Footer**: Links to resources and legal information
- **ApiKeySettings**: Interface for managing API keys securely
- **Autocomplete**: Used for school, company, department selection
- **ModelSettingsDashboard**: Dashboard for selecting and configuring AI models
- **ToastContainer**: Notification system for user feedback
- **Modal & DraggableModal**: Dialog components for various interactions

## Context Providers

- **FormContext**: Manages form data across all pages
- **ApiKeyContext**: Handles API key storage and validation
- **OptimizerPromptContext**: Manages prompt templates for the optimizer feature

## Data Flow

1. User creates a new project or opens an existing one (`src/pages/Projects/index.tsx`)
2. User fills in personal information (Profile page) (`src/pages/Profile.tsx`)
3. User configures industry settings (Industry page) (`src/pages/Industry.tsx`)
4. User adjusts generation settings (Settings page) (`src/pages/Settings.tsx`)
5. Application generates a self-introduction using selected LLM (`src/utils/openai.ts:156-208` or `src/utils/gemini.ts`)
6. Result is displayed and can be saved, copied, or downloaded (`src/pages/Result.tsx`)
7. Projects are stored in localStorage for persistence (`src/context/FormContext.tsx:428-461`)

## Version Prompt Data Flow

1. System first checks localStorage for previously saved prompt templates, and only loads predefined templates from FormContext if none exist (`src/context/FormContext.tsx:110-166`)
2. User selects a target version or style for their self-introduction via the Versions page (`src/pages/Versions.tsx:18-199`)
3. Selected version prompt gets combined with user input data through the prompt generation logic (`src/utils/openai.ts:27-147`)
4. The combined prompt is sent to the selected LLM along with version-specific parameters (`src/utils/modelService.ts:32-73`)
5. Generated content preserves version-specific characteristics and tone based on the settings
6. Version metadata is saved with the project for consistent regeneration (`src/context/FormContext.tsx:96-112`)
7. Users can compare outputs from different version prompts side-by-side (`src/pages/Versions.tsx:133-142`)
8. Custom version prompts can be created and saved via the Prompt Editor (`src/pages/PromptEditor/index.tsx`)

## Technologies Used

- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Font Awesome**: Icon library
- **OpenAI API**: For GPT models integration
- **Google Gemini API**: For Gemini models integration
- **Web Audio API**: For audio recording in optimizer feature
- **localStorage**: For client-side data persistence

## Security Considerations

- API keys are stored securely in browser storage
- Sensitive data is not sent to external servers except as needed for API calls
- Environment variables are used for API configuration 