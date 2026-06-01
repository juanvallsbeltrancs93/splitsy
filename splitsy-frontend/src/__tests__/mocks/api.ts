import axios from 'axios';

export const TEST_BASE_URL = 'http://testing-url.com/api/splitsy/v0';

export function provideApi() {
  return axios.create({ baseURL: TEST_BASE_URL });
}
