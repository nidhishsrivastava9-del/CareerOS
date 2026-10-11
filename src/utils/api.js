/**
 * CareerOS — Frontend API Client Utility (Day 5)
 * 
 * Reusable functions for communicating with the Node.js + Express backend REST API.
 * Handles JWT token storage, automatic Bearer headers, authentication, and user-scoped resources.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'careeros_auth_token';

/**
 * Token management helpers
 */
export const getAuthToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (err) {
    console.warn('[CareerOS API] Failed to read token from localStorage:', err);
    return null;
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.warn('[CareerOS API] Failed to write token to localStorage:', err);
  }
};

export const removeAuthToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.warn('[CareerOS API] Failed to remove token from localStorage:', err);
  }
};

export const AUTH_UNAUTHORIZED_EVENT = 'careeros_auth_unauthorized';

/**
 * Generic request helper with automatic Authorization header and error handling
 */
async function request(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    // Handle token expiry or invalid token automatically
    if (response.status === 401) {
      if (token) {
        removeAuthToken();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
        }
      }
    }

    const data = await response.json().catch(() => ({
      success: false,
      message: `Failed to parse response (${response.status} ${response.statusText})`
    }));

    data.status = response.status;

    // If HTTP error code is returned, ensure success is marked false
    if (!response.ok && data.success !== false) {
      data.success = false;
    }

    return data;
  } catch (error) {
    console.warn(`[CareerOS API Client] Request failed for ${endpoint}:`, error.message);
    return {
      success: false,
      status: 0,
      message: error.message || 'Network request failed'
    };
  }
}

// 1. Health
export const checkHealth = () => request('/health');

// 2. Auth APIs
export const registerApi = (userData) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

export const loginApi = (credentials) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });

export const getMeApi = () => request('/auth/me');

// 3. Skills
export const getSkillsApi = () => request('/skills');
export const createSkillApi = (skillData) =>
  request('/skills', {
    method: 'POST',
    body: JSON.stringify(skillData)
  });
export const updateSkillApi = (id, skillData) =>
  request(`/skills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(skillData)
  });
export const deleteSkillApi = (id) =>
  request(`/skills/${id}`, {
    method: 'DELETE'
  });

// 4. Projects
export const getProjectsApi = () => request('/projects');
export const createProjectApi = (projectData) =>
  request('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData)
  });
export const updateProjectApi = (id, projectData) =>
  request(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData)
  });
export const deleteProjectApi = (id) =>
  request(`/projects/${id}`, {
    method: 'DELETE'
  });

// 5. Goals
export const getGoalsApi = () => request('/goals');
export const createGoalApi = (goalData) =>
  request('/goals', {
    method: 'POST',
    body: JSON.stringify(goalData)
  });
export const updateGoalApi = (id, goalData) =>
  request(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(goalData)
  });
export const deleteGoalApi = (id) =>
  request(`/goals/${id}`, {
    method: 'DELETE'
  });

// 6. DSA
export const getDSAApi = () => request('/dsa');
export const updateDSAApi = (id, dsaData) =>
  request(`/dsa/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dsaData)
  });

// 7. Seed
export const seedApi = (overwrite = false) =>
  request('/seed', {
    method: 'POST',
    body: JSON.stringify({ overwrite })
  });

// 8. Careers (Day 7)
export const getCareersApi = (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
  if (params.featured) query.append('featured', 'true');
  const qs = query.toString();
  return request(`/careers${qs ? `?${qs}` : ''}`);
};

export const getCareerBySlugApi = (slug) => request(`/careers/${slug}`);

export const getCareerRoadmapApi = (slug) => request(`/careers/${slug}/roadmap`);

export const getModuleApi = (careerSlug, moduleSlug) =>
  request(`/careers/${careerSlug}/modules/${moduleSlug}`);

// 9. Learning Progress (Day 7)
export const getAllProgressApi = () => request('/progress');

export const getCareerProgressApi = (careerSlug) => request(`/progress/${careerSlug}`);

export const toggleLessonProgressApi = (payload) =>
  request('/progress/toggle-lesson', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const submitQuizProgressApi = (payload) =>
  request('/progress/quiz', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const completePracticeProgressApi = (payload) =>
  request('/progress/practice', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

// 10. Content Engine & Learning Resources (Day 8)
export const getResourcesApi = (params = {}) => {
  const query = new URLSearchParams();
  if (params.career) query.append('career', params.career);
  if (params.module) query.append('module', params.module);
  if (params.subject) query.append('subject', params.subject);
  if (params.phase) query.append('phase', params.phase);
  if (params.type && params.type !== 'all') query.append('type', params.type);
  if (params.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
  if (params.language) query.append('language', params.language);
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  if (params.sort) query.append('sort', params.sort);
  const qs = query.toString();
  return request(`/resources${qs ? `?${qs}` : ''}`);
};

export const getResourceByIdApi = (id) => request(`/resources/${id}`);

export const createResourceApi = (resourceData) =>
  request('/resources', {
    method: 'POST',
    body: JSON.stringify(resourceData)
  });

export const updateResourceApi = (id, updates) =>
  request(`/resources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });

export const deleteResourceApi = (id, hard = false) =>
  request(`/resources/${id}${hard ? '?hard=true' : ''}`, {
    method: 'DELETE'
  });

export const ingestResourceApi = (resourceData) =>
  request('/resources/ingest', {
    method: 'POST',
    body: JSON.stringify(resourceData)
  });

// 9. Day 9: Helping AI APIs
export const sendAiChatApi = ({ message, conversationId, careerSlug, moduleSlug, topic }) =>
  request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversationId, careerSlug, moduleSlug, topic })
  });

export const getAiConversationsApi = ({ limit = 20, page = 1 } = {}) =>
  request(`/ai/conversations?limit=${limit}&page=${page}`);

export const getAiConversationByIdApi = (conversationId) =>
  request(`/ai/conversations/${conversationId}`);

export const deleteAiConversationApi = (conversationId) =>
  request(`/ai/conversations/${conversationId}`, {
    method: 'DELETE'
  });

export const quickAiActionApi = ({ action, conversationId, careerSlug, moduleSlug, topic }) =>
  request('/ai/quick-action', {
    method: 'POST',
    body: JSON.stringify({ action, conversationId, careerSlug, moduleSlug, topic })
  });

export const getAiContextApi = ({ careerSlug = '', moduleSlug = '', topic = '' } = {}) =>
  request(`/ai/context?careerSlug=${encodeURIComponent(careerSlug)}&moduleSlug=${encodeURIComponent(moduleSlug)}&topic=${encodeURIComponent(topic)}`);

// 10. Day 10: Knowledge Base & RAG APIs
export const getKnowledgeStatusApi = () =>
  request('/ai/knowledge/status');

export const searchKnowledgeApi = ({ query, careerSlug, moduleSlug, topic, sourceType, limit = 4, minScore = 0.25 }) =>
  request('/ai/knowledge/search', {
    method: 'POST',
    body: JSON.stringify({ query, careerSlug, moduleSlug, topic, sourceType, limit, minScore })
  });

export const reindexKnowledgeApi = ({ career, module: modSlug, force = false } = {}) =>
  request('/ai/knowledge/reindex-all', {
    method: 'POST',
    body: JSON.stringify({ career, module: modSlug, force })
  });

// 10. Assessment Engine APIs (Day 11)
export const getAssessmentsApi = (params = {}) => {
  const query = new URLSearchParams();
  if (params.career) query.append('career', params.career);
  if (params.module) query.append('module', params.module);
  if (params.subject) query.append('subject', params.subject);
  if (params.difficulty) query.append('difficulty', params.difficulty);
  if (params.type) query.append('type', params.type);
  const qStr = query.toString();
  return request(`/assessments${qStr ? `?${qStr}` : ''}`);
};

export const getAssessmentByIdApi = (id) => request(`/assessments/${id}`);

export const submitAssessmentApi = (id, payload) =>
  request(`/assessments/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const getAssessmentAttemptsApi = (params = {}) => {
  const query = new URLSearchParams();
  if (params.assessmentId) query.append('assessmentId', params.assessmentId);
  if (params.limit) query.append('limit', params.limit);
  const qStr = query.toString();
  return request(`/assessments/attempts${qStr ? `?${qStr}` : ''}`);
};

export const getAssessmentAttemptByIdApi = (attemptId) => request(`/assessments/attempts/${attemptId}`);

export const getAssessmentDiagnosticsApi = (career = '') => {
  const qStr = career ? `?career=${encodeURIComponent(career)}` : '';
  return request(`/assessments/diagnostics${qStr}`);
};

export default {
  checkHealth,
  auth: {
    register: registerApi,
    login: loginApi,
    getMe: getMeApi,
    getToken: getAuthToken,
    setToken: setAuthToken,
    removeToken: removeAuthToken
  },
  skills: {
    getAll: getSkillsApi,
    create: createSkillApi,
    update: updateSkillApi,
    delete: deleteSkillApi
  },
  projects: {
    getAll: getProjectsApi,
    create: createProjectApi,
    update: updateProjectApi,
    delete: deleteProjectApi
  },
  goals: {
    getAll: getGoalsApi,
    create: createGoalApi,
    update: updateGoalApi,
    delete: deleteGoalApi
  },
  dsa: {
    getAll: getDSAApi,
    update: updateDSAApi
  },
  seed: seedApi,
  careers: {
    getAll: getCareersApi,
    getBySlug: getCareerBySlugApi,
    getRoadmap: getCareerRoadmapApi,
    getModule: getModuleApi
  },
  progress: {
    getAll: getAllProgressApi,
    getCareerProgress: getCareerProgressApi,
    toggleLesson: toggleLessonProgressApi,
    submitQuiz: submitQuizProgressApi,
    completePractice: completePracticeProgressApi
  },
  resources: {
    getAll: getResourcesApi,
    getById: getResourceByIdApi,
    create: createResourceApi,
    update: updateResourceApi,
    delete: deleteResourceApi,
    ingest: ingestResourceApi
  },
  ai: {
    chat: sendAiChatApi,
    getConversations: getAiConversationsApi,
    getConversationById: getAiConversationByIdApi,
    deleteConversation: deleteAiConversationApi,
    quickAction: quickAiActionApi,
    getContext: getAiContextApi
  },
  assessments: {
    getAll: getAssessmentsApi,
    getById: getAssessmentByIdApi,
    submit: submitAssessmentApi,
    getAttempts: getAssessmentAttemptsApi,
    getAttemptById: getAssessmentAttemptByIdApi,
    getDiagnostics: getAssessmentDiagnosticsApi
  }
};

