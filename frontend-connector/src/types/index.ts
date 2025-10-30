// Type definitions for Open Notebook
export interface Notebook {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface Note {
  id: string;
  notebook_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface Source {
  id: string;
  notebook_id?: string;
  type: 'link' | 'upload' | 'text' | 'pdf' | 'txt' | 'doc' | 'youtube' | 'website';
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created?: string;
  updated?: string;
  created_at?: string; // For backward compatibility
  updated_at?: string; // For backward compatibility
  content?: string;
  full_text?: string;
  url?: string;
  file_path?: string;
  metadata?: Record<string, any>;
  insights?: SourceInsight[];
  embedded_chunks?: number;
}

export interface SourceInsight {
  id: string;
  source?: string;
  title?: string;
  content: string;
  type?: string; // For backward compatibility
  insight_type?: string; // This is what the API actually returns
  created?: string;
  updated?: string;
  metadata?: Record<string, any>;
}

export interface Podcast {
  id: string;
  name: string;
  template: string;
  template_name?: string;
  notebook_name?: string;
  instructions?: string;
  text?: string;
  audio_url?: string;
  audio_file?: string;
  duration?: number;
  created: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

export interface ChatMessage {
  id: string;
  notebook_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Model {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'loading' | 'error';
  description?: string;
}

export interface Transformation {
  id: string;
  name: string;
  title: string;
  description: string;
  prompt: string;
  apply_default: boolean;
  created: string;
  updated: string;
}

export interface PodcastTemplate {
  name: string;
  podcast_name: string;
  podcast_tagline: string;
  output_language: string;
  person1_role: string[];
  person2_role: string[];
  conversation_style: string[];
  engagement_technique: string[];
  dialogue_structure: string[];
  transcript_model?: string;
  transcript_model_provider?: string;
  user_instructions?: string;
  ending_message?: string;
  creativity: number;
  provider: string;
  voice1: string;
  voice2: string;
  model: string;
}