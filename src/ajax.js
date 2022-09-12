import axios from 'axios'
import config from './config'

/*
 * Wrapper for axios AJAX library.
 *
 * Basically, we use axios directly. But before axios can be used,
 * - we create an new axios instance
 * - give than instance an AJAX fetched CSRF token, which it will send as header 'X-CSRF-Token' with every request
 * - tell the instance that it should include credentials (cookie) with every request
 * - tell the instance that it should include the query parameter "?_format=json" with every request
 *
 * Finally, we wrap this activity in a Promise and return it, so that callers can
 * rely on the promise to call their own callback on successful resolution of the promise
 * or an error handler if the promise gets rejected.
 */
let singleton = null // a singleton instance of axios that the default init function returns

// note the 'async' keyword, it allows us to call 'await' later
// eslint-disable-next-line
export default async () => {
  if (!singleton) {
    const tokenURL = config.drupal_url + '/session/token';
    try {
      const response = await axios.get(tokenURL, {
        withCredentials: true // required to send auth cookie
      })
      console.log(response);
      const csrfToken = response.data
      singleton = axios.create({
        baseURL: config.drupal_url, // every request is relative to this URL
        withCredentials: true, // include auth cookie in every request
        headers: { 'X-CSRF-Token': csrfToken }, // include this header in every request
        params: { _format: 'json' } // add these query params to every request
      });
      console.log('Created new axios instance', singleton)
    } catch (error) {
      console.error(error)
    }
  }
  return singleton
}
