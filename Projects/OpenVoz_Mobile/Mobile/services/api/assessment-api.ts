export const assessmentApi = {
  getAssessmentPath: (assessmentId: string) => `/assessments/${assessmentId}/`,
  historyPath: '/assessments/history/',
  requestPath: '/assessments/requests/',
  statusPath: (assessmentId: string) => `/assessments/${assessmentId}/status/`,
};
