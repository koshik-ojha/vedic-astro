import API from './client';

export const login = (email, password) =>
  API.post('/auth/login', { email, password });

export const signup = (name, email, password) =>
  API.post('/auth/signup', { name, email, password });
