// In production (Docker) requests go through the nginx reverse proxy at /nodedash/
// In local dev keep the full URL if you run the backend directly: http://127.0.0.1:5000/nodedash/
export const base_url = '/nodedash/'