import API from './client';

export const getProfiles = () => API.get('/user/profiles');

export const createProfile = (data) => API.post('/user/profile', data);

export const updateProfile = (profileId, data) =>
  API.put(`/user/profile/${profileId}`, data);

export const deleteProfile = (profileId) =>
  API.delete(`/user/profile/${profileId}`);
