export function getErrorMessage(error) {
  if (!error) return 'An unexpected error occurred.';

  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
      return Object.values(data.fieldErrors).join(', ');
    }
    if (data.message) {
      return data.message;
    }
  }

  if (error.message) {
    return error.message;
  }

  return 'Network error. Please ensure the FitLog server is running.';
}
