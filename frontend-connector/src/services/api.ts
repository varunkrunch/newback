// Real API Service for Frontend-Backend Integration
import type { Notebook, Note, Source, Podcast } from '@/types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
const API_VERSION = '/api/v1';

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${API_VERSION}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete defaultOptions.headers?.['Content-Type'];
  }

  
  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
      
      // Add status code to error message for better error handling
      if (response.status === 404) {
        throw new Error(`404: ${errorMessage}`);
      } else if (response.status === 400) {
        throw new Error(`400: ${errorMessage}`);
      } else if (response.status === 403) {
        throw new Error(`403: ${errorMessage}`);
      } else if (response.status === 500) {
        throw new Error(`500: ${errorMessage}`);
      }
      
      throw new Error(`${response.status}: ${errorMessage}`);
    }
    
    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        return JSON.parse(text);
      } else {
        return null;
      }
    } else {
      // For non-JSON responses, return the text
      return await response.text();
    }
  } catch (error) {
    throw error;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

// Notebooks API
export const notebookAPI = {
  list: async () => {
    console.log("notebookAPI.list called");
    return await apiRequest('/notebooks');
  },
  
  get: async (id: string) => {
    console.log("notebookAPI.get called with id:", id);
    return await apiRequest(`/notebooks/${id}`);
  },
  
  getByName: async (name: string) => {
    console.log("notebookAPI.getByName called with name:", name);
    return await apiRequest(`/notebooks/by-name/${encodeURIComponent(name)}`);
  },
  
  create: async (data: { name: string; description: string }) => {
    console.log("notebookAPI.create called with:", data);
    return await apiRequest('/notebooks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (id: string, data: Partial<Notebook>) => {
    console.log("notebookAPI.update called with id:", id, "data:", data);
    return await apiRequest(`/notebooks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (id: string) => {
    console.log("notebookAPI.delete called with id:", id);
    return await apiRequest(`/notebooks/${id}`, {
      method: 'DELETE',
    });
  },
  
  archive: async (id: string) => {
    console.log("notebookAPI.archive called with id:", id);
    return await apiRequest(`/notebooks/${id}/archive`, {
      method: 'POST',
    });
  },
  
  unarchive: async (id: string) => {
    console.log("notebookAPI.unarchive called with id:", id);
    return await apiRequest(`/notebooks/${id}/unarchive`, {
      method: 'POST',
    });
  },
  
  archiveByName: async (name: string) => {
    console.log("notebookAPI.archiveByName called with name:", name);
    return await apiRequest(`/notebooks/by-name/${encodeURIComponent(name)}/archive`, {
      method: 'POST',
    });
  },
  
  unarchiveByName: async (name: string) => {
    console.log("notebookAPI.unarchiveByName called with name:", name);
    return await apiRequest(`/notebooks/by-name/${encodeURIComponent(name)}/unarchive`, {
      method: 'POST',
    });
  },
  
  updateByName: async (name: string, data: Partial<Notebook>) => {
    console.log("notebookAPI.updateByName called with name:", name, "data:", data);
    return await apiRequest(`/notebooks/by-name/${encodeURIComponent(name)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Notes API
export const notesAPI = {
  list: async (notebookId?: string) => {
    console.log("notesAPI.list called with notebookId:", notebookId);
    if (notebookId) {
      return await apiRequest(`/notebooks/${notebookId}/notes`);
    }
    return await apiRequest('/notes');
  },
  
  listByNotebookName: async (notebookName: string) => {
    console.log("notesAPI.listByNotebookName called with name:", notebookName);
    return await apiRequest(`/notebooks/by-name/${encodeURIComponent(notebookName)}/notes`);
  },
  
  getByTitle: async (noteTitle: string) => {
    console.log("notesAPI.getByTitle called with title:", noteTitle);
    return await apiRequest(`/notes/by-title/${encodeURIComponent(noteTitle)}`);
  },
  
  create: async (data: { title: string; content: string; notebook_id: string }) => {
    console.log("notesAPI.create called with:", data);
    return await apiRequest('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createInNotebook: async (notebookName: string, data: { title: string; content: string }) => {
    console.log("notesAPI.createInNotebook called with notebook:", notebookName, "data:", data);
    return await apiRequest(`/notebooks/by-name/${encodeURIComponent(notebookName)}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  get: async (id: string) => {
    console.log("notesAPI.get called with id:", id);
    return await apiRequest(`/notes/${id}`);
  },
  
  update: async (id: string, data: any) => {
    console.log("notesAPI.update called with id:", id, "data:", data);
    return await apiRequest(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (id: string) => {
    console.log("notesAPI.delete called with id:", id);
    return await apiRequest(`/notes/${id}`, {
      method: 'DELETE',
    });
  },
  
  createFromChat: async (content: string, notebookId: string) => {
    console.log("notesAPI.createFromChat called with content length:", content.length, "notebookId:", notebookId);
    return await apiRequest('/notes/from-chat', {
      method: 'POST',
      body: JSON.stringify({
        content,
        notebook_id: notebookId
      }),
    });
  },
};

// Sources API
export const sourcesAPI = {
  list: async (notebookId?: string) => {
    console.log("sourcesAPI.list called with notebookId:", notebookId);
    if (notebookId) {
      const response = await apiRequest(`/notebooks/${notebookId}/sources`);
      // Backend returns SourceListResponse with sources array
      return response.sources || response;
    }
    return await apiRequest('/sources');
  },
  
  listByNotebookName: async (notebookName: string) => {
    console.log("🔍 sourcesAPI.listByNotebookName called with name:", notebookName);
    const url = `/notebooks/by-name/${encodeURIComponent(notebookName)}/sources`;
    console.log("🌐 sourcesAPI: Making request to:", url);
    const response = await apiRequest(url);
    console.log("📊 sourcesAPI: Raw response:", response);
    console.log("📊 sourcesAPI: Response type:", typeof response, "Array?", Array.isArray(response));
    console.log("📊 sourcesAPI: Response.sources:", response.sources);
    // Backend returns SourceListResponse with sources array
    const result = response.sources || response;
    console.log("✅ sourcesAPI: Returning:", result);
    return result;
  },
  
  get: async (id: string) => {
    console.log("sourcesAPI.get called with id:", id);
    return await apiRequest(`/sources/${encodeURIComponent(id)}`);
  },
  
  getByTitle: async (title: string) => {
    console.log("sourcesAPI.getByTitle called with title:", title);
    return await apiRequest(`/sources/by-title/${encodeURIComponent(title)}`);
  },
  
  create: async (notebookId: string, data: FormData) => {
    console.log("sourcesAPI.create called with notebookId:", notebookId);
    const url = `${API_BASE_URL}${API_VERSION}/notebooks/${notebookId}/sources`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: data, // FormData doesn't need Content-Type header
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Source upload failed:`, error);
      throw error;
    }
  },
  
  createByNotebookName: async (notebookName: string, data: FormData) => {
    console.log("sourcesAPI.createByNotebookName called with name:", notebookName);
    const url = `${API_BASE_URL}${API_VERSION}/notebooks/by-name/${encodeURIComponent(notebookName)}/sources`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Source upload failed:`, error);
      throw error;
    }
  },
  
  update: async (id: string, data: Partial<Source>) => {
    console.log("sourcesAPI.update called with id:", id, "data:", data);
    return await apiRequest(`/sources/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  updateByTitle: async (title: string, data: Partial<Source>) => {
    console.log("sourcesAPI.updateByTitle called with title:", title, "data:", data);
    return await apiRequest(`/sources/by-title/${encodeURIComponent(title)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (id: string) => {
    console.log("sourcesAPI.delete called with id:", id);
    return await apiRequest(`/sources/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
  
  deleteByTitle: async (title: string) => {
    console.log("sourcesAPI.deleteByTitle called with title:", title);
    return await apiRequest(`/sources/by-title/${encodeURIComponent(title)}`, {
      method: 'DELETE',
    });
  },

  saveInsightAsNote: async (sourceId: string, insightId: string, notebookId: string) => {
    console.log("sourcesAPI.saveInsightAsNote called with:", { sourceId, insightId, notebookId });
    return await apiRequest(`/sources/${encodeURIComponent(sourceId)}/insights/${encodeURIComponent(insightId)}/save-as-note?notebook_id=${encodeURIComponent(notebookId)}`, {
      method: 'POST',
    });
  },
  
  runTransformations: async (id: string, transformationNames: string, llmId?: string) => {
    console.log("sourcesAPI.runTransformations called with id:", id, "transformations:", transformationNames);
    const params = new URLSearchParams({ transformation_names: transformationNames });
    if (llmId) params.append('llm_id', llmId);
    
    return await apiRequest(`/sources/${encodeURIComponent(id)}/run-transformations?${params.toString()}`, {
      method: 'POST',
    });
  },
  
  runTransformationsByTitle: async (title: string, transformationNames: string, llmId?: string) => {
    console.log("sourcesAPI.runTransformationsByTitle called with title:", title, "transformations:", transformationNames);
    const params = new URLSearchParams({ transformation_names: transformationNames });
    if (llmId) params.append('llm_id', llmId);
    
    return await apiRequest(`/sources/by-title/${encodeURIComponent(title)}/run-transformations?${params.toString()}`, {
      method: 'POST',
    });
  },
  
  generateTitle: async (id: string) => {
    console.log("sourcesAPI.generateTitle called with id:", id);
    return await apiRequest(`/sources/${encodeURIComponent(id)}/generate-title`, {
      method: 'POST',
    });
  },
};

// Podcasts API
export const podcastsAPI = {
  list: async (notebookId?: string) => {
    console.log("podcastsAPI.list called with notebookId:", notebookId);
    // Always use the episodes endpoint since the backend doesn't have notebook-specific podcast endpoints
    return await apiRequest('/podcasts/episodes');
  },

  listByNotebookName: async (notebookName: string) => {
    console.log("podcastsAPI.listByNotebookName called with notebookName:", notebookName);
    return await apiRequest(`/podcasts/episodes/by-notebook/${encodeURIComponent(notebookName)}`);
  },
  
  generate: async (data: { 
    template_name: string; 
    notebook_name: string; 
    episode_name?: string; 
    instructions?: string; 
    podcast_length?: string;
  }) => {
    console.log("podcastsAPI.generate called with:", data);
    return await apiRequest('/podcasts/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  get: async (id: string) => {
    console.log("podcastsAPI.get called with id:", id);
    return await apiRequest(`/podcasts/${id}`);
  },
  
  getAudio: (id: string) => {
    // If it's already a full URL, return as is
    if (id.startsWith('http')) {
      return id;
    }
    
    console.log('Getting audio for episode name/ID:', id);
    
    // Use the provided episode name/ID
    const episodeId = id;
    
    // Construct the URL using the episode name
    const url = `${API_BASE_URL}${API_VERSION}/podcasts/episodes/${encodeURIComponent(episodeId)}/audio`;
    console.log('Constructed audio URL:', url);
    return url;
  },
  
  delete: async (id: string) => {
    console.log("podcastsAPI.delete called with id:", id);
    return await apiRequest(`/podcasts/episodes/${id}`, {
      method: 'DELETE',
    });
  },

  // Additional podcast API methods
  getTemplates: async () => {
    console.log("podcastsAPI.getTemplates called");
    return await apiRequest('/podcasts/templates');
  },

  createTemplate: async (data: {
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
  }) => {
    console.log("podcastsAPI.createTemplate called with:", data);
    
    // Convert arrays to comma-separated strings for form data
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('podcast_name', data.podcast_name);
    formData.append('podcast_tagline', data.podcast_tagline);
    formData.append('output_language', data.output_language);
    formData.append('person1_role', data.person1_role.join(','));
    formData.append('person2_role', data.person2_role.join(','));
    formData.append('conversation_style', data.conversation_style.join(','));
    formData.append('engagement_technique', data.engagement_technique.join(','));
    formData.append('dialogue_structure', data.dialogue_structure.join(','));
    if (data.transcript_model) formData.append('transcript_model', data.transcript_model);
    if (data.transcript_model_provider) formData.append('transcript_model_provider', data.transcript_model_provider);
    if (data.user_instructions) formData.append('user_instructions', data.user_instructions);
    if (data.ending_message) formData.append('ending_message', data.ending_message);
    formData.append('creativity', data.creativity.toString());
    formData.append('provider', data.provider);
    formData.append('voice1', data.voice1);
    formData.append('voice2', data.voice2);
    formData.append('model', data.model);

    return await apiRequest('/podcasts/templates', {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type, let browser set it for FormData
    });
  },

  updateTemplate: async (templateIdentifier: string, data: {
    name?: string;
    podcast_name?: string;
    podcast_tagline?: string;
    output_language?: string;
    person1_role?: string[];
    person2_role?: string[];
    conversation_style?: string[];
    engagement_technique?: string[];
    dialogue_structure?: string[];
    transcript_model?: string;
    transcript_model_provider?: string;
    user_instructions?: string;
    ending_message?: string;
    creativity?: number;
    provider?: string;
    voice1?: string;
    voice2?: string;
    model?: string;
  }) => {
    console.log("podcastsAPI.updateTemplate called with:", templateIdentifier, data);
    
    // Convert arrays to comma-separated strings for form data
    const formData = new FormData();
    
    // Required fields - always send these
    formData.append('name', data.name || '');
    formData.append('podcast_name', data.podcast_name || '');
    formData.append('podcast_tagline', data.podcast_tagline || '');
    formData.append('output_language', data.output_language || 'English');
    formData.append('person1_role', (data.person1_role || []).join(','));
    formData.append('person2_role', (data.person2_role || []).join(','));
    formData.append('conversation_style', (data.conversation_style || []).join(','));
    formData.append('engagement_technique', (data.engagement_technique || []).join(','));
    formData.append('dialogue_structure', (data.dialogue_structure || []).join(','));
    formData.append('creativity', (data.creativity || 0.5).toString());
    formData.append('provider', data.provider || 'openai');
    formData.append('voice1', data.voice1 || '');
    formData.append('voice2', data.voice2 || '');
    formData.append('model', data.model || 'tts-1');
    
    // Optional fields - only send if they have values
    if (data.transcript_model) formData.append('transcript_model', data.transcript_model);
    if (data.transcript_model_provider) formData.append('transcript_model_provider', data.transcript_model_provider);
    if (data.user_instructions) formData.append('user_instructions', data.user_instructions);
    if (data.ending_message) formData.append('ending_message', data.ending_message);

    return await apiRequest(`/podcasts/templates/${encodeURIComponent(templateIdentifier)}`, {
      method: 'PUT',
      body: formData,
      headers: {}, // Don't set Content-Type, let browser set it for FormData
    });
  },

  deleteTemplate: async (templateIdentifier: string) => {
    console.log("podcastsAPI.deleteTemplate called with:", templateIdentifier);
    return await apiRequest(`/podcasts/templates/${encodeURIComponent(templateIdentifier)}`, {
      method: 'DELETE',
    });
  },

  getModels: async () => {
    console.log("podcastsAPI.getModels called");
    return await apiRequest('/podcasts/models');
  },

  getSuggestions: async () => {
    console.log("podcastsAPI.getSuggestions called");
    return await apiRequest('/podcasts/suggestions');
  },
};

// Search API
export const searchAPI = {
  search: async (query: string, notebookId?: string) => {
    console.log("searchAPI.search called with query:", query, "notebookId:", notebookId);
    const params = new URLSearchParams({ q: query });
    if (notebookId) params.append('notebook_id', notebookId);
    
    return await apiRequest(`/search?${params.toString()}`);
  },
};

// Models API
export const modelsAPI = {
  list: async () => {
    return await apiRequest('/models');
  },
  
  getProviders: async () => {
    return await apiRequest('/models/providers');
  },
  
  getProvidersForType: async (modelType: string) => {
    return await apiRequest(`/models/providers/${modelType}`);
  },
  
  getDefaults: async () => {
    return await apiRequest('/models/config/defaults');
  },
  
  updateDefaults: async (defaults: any) => {
    const formData = new FormData();
    Object.entries(defaults).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    return await apiRequest('/models/config/defaults', {
      method: 'PATCH',
      body: formData
    });
  },
  
  create: async (model: any) => {
    try {
      return await apiRequest('/models', {
        method: 'POST',
        body: JSON.stringify(model)
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw new Error(`Model with name '${model.name}', provider '${model.provider}', and type '${model.type}' already exists`);
      }
      throw error;
    }
  },
  
  delete: async (modelId: string) => {
    return await apiRequest(`/models/${modelId}`, {
      method: 'DELETE'
    });
  },
  
  test: async (modelId: string, testPrompt: string) => {
    return await apiRequest(`/models/${modelId}/test`, {
      method: 'POST',
      body: JSON.stringify({ test_prompt: testPrompt })
    });
  },
  
  clearCache: async () => {
    return await apiRequest('/models/cache/clear', {
      method: 'POST'
    });
  },
  
  deleteByTypeAndName: async (modelType: string, provider: string, modelName: string) => {
    return await apiRequest(`/models/by-type/${modelType}/${provider}/${encodeURIComponent(modelName)}`, {
      method: 'DELETE'
    });
  }
};

// Transformations API
export const transformationsAPI = {
  list: async (sortBy?: string, order?: string) => {
    console.log("transformationsAPI.list called with sortBy:", sortBy, "order:", order);
    const params = new URLSearchParams();
    if (sortBy) params.append('sort_by', sortBy);
    if (order) params.append('order', order);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/transformations?${queryString}` : '/transformations';
    return await apiRequest(endpoint);
  },
  
  get: async (id: string) => {
    console.log("transformationsAPI.get called with id:", id);
    return await apiRequest(`/transformations/${encodeURIComponent(id)}`);
  },
  
  create: async (data: { name: string; title: string; description: string; prompt: string; apply_default?: boolean }) => {
    console.log("transformationsAPI.create called with:", data);
    return await apiRequest('/transformations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (id: string, data: { name?: string; title?: string; description?: string; prompt?: string; apply_default?: boolean }) => {
    console.log("transformationsAPI.update called with id:", id, "data:", data);
    return await apiRequest(`/transformations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (id: string) => {
    console.log("transformationsAPI.delete called with id:", id);
    return await apiRequest(`/transformations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
  
  transform: async (data: { text: string; transformation_type: string }) => {
    console.log("transformationsAPI.transform called with:", data);
    return await apiRequest('/transformations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  setDefault: async (id: string) => {
    console.log("transformationsAPI.setDefault called with id:", id);
    return await apiRequest(`/transformations/${encodeURIComponent(id)}/set-default`, {
      method: 'POST',
    });
  },

  unsetDefault: async () => {
    console.log("transformationsAPI.unsetDefault called");
    return await apiRequest('/transformations/unset-default', {
      method: 'POST',
    });
  },
};

// Chat API
export const chatAPI = {
  send: async (data: { message: string; notebook_id: string; session_id?: string; context_config?: Record<string, string> }) => {
    console.log("chatAPI.send called with:", data);
    const params = new URLSearchParams({ notebook_id: data.notebook_id });
    if (data.session_id) params.append('session_id', data.session_id);
    
    const requestBody = { 
      message: data.message,
      context_config: data.context_config || {}
    };
    console.log("Request body:", requestBody);
    console.log("Request URL:", `/chat/message?${params.toString()}`);
    
    return await apiRequest(`/chat/message?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  },
  
  history: async (notebookId: string, sessionId?: string) => {
    console.log("chatAPI.history called with notebookId:", notebookId, "sessionId:", sessionId);
    const params = new URLSearchParams({ notebook_id: notebookId });
    if (sessionId) params.append('session_id', sessionId);
    
    return await apiRequest(`/chat/history?${params.toString()}`);
  },
  
  getContext: async (notebookId: string) => {
    console.log("chatAPI.getContext called with notebookId:", notebookId);
    const params = new URLSearchParams({ notebook_id: notebookId });
    
    return await apiRequest(`/chat/context?${params.toString()}`);
  },
};

// Serper API for Google Search
export const serperAPI = {
  getOptions: async () => {
    console.log("serperAPI.getOptions called");
    return await apiRequest('/serper/options');
  },
  
  search: async (query: string, options?: {
    num_results?: number;
    country?: string;
    language?: string;
  }) => {
    console.log("serperAPI.search called with query:", query, "options:", options);
    const params = new URLSearchParams({ query });
    if (options?.num_results) params.append('num_results', options.num_results.toString());
    if (options?.country) params.append('country', options.country);
    if (options?.language) params.append('language', options.language);
    
    const endpoint = `/serper/search?${params.toString()}`;
    console.log("🌐 Making request to endpoint:", endpoint);
    console.log("🌐 Full URL would be:", `${API_BASE_URL}${API_VERSION}${endpoint}`);
    
    try {
      const result = await apiRequest(endpoint);
      console.log("✅ serperAPI.search successful:", result);
      return result;
    } catch (error) {
      console.error("❌ serperAPI.search failed:", error);
      throw error;
    }
  },
};