import { CanceledError } from 'axios';

export function attachSessionInterceptors(client, { getSession, refreshSession }) {
  function isStale(config) {
    return config?.sessionVersion !== undefined && config.sessionVersion !== getSession().version;
  }

  const requestId = client.interceptors.request.use(
    (config) => {
      if (config.skipSession) return config;
      if (isStale(config)) throw new CanceledError();

      const { version, accessToken } = getSession();
      config.sessionVersion = version;
      config.sentAccessToken = accessToken;
      if (accessToken) config.headers.set('Authorization', `Bearer ${accessToken}`);
      else config.headers.delete('Authorization');
      return config;
    },
    (error) => {
      throw error;
    },
    { synchronous: true }
  );

  const responseId = client.interceptors.response.use(
    (response) => {
      if (isStale(response.config)) throw new CanceledError();
      return response;
    },
    async (error) => {
      const config = error.config;
      if (isStale(config)) throw new CanceledError();
      if (
        error.response?.status !== 401 ||
        !config?.sentAccessToken ||
        config.sessionRetried ||
        config.signal?.aborted
      ) {
        throw error;
      }

      config.sessionRetried = true;
      // Một 401 đến muộn có thể thuộc về token đã được làm mới.
      if (config.sentAccessToken === getSession().accessToken) {
        await refreshSession(config.sessionVersion);
      }
      if (isStale(config) || config.signal?.aborted) throw new CanceledError();
      return client.request(config);
    }
  );

  return () => {
    client.interceptors.request.eject(requestId);
    client.interceptors.response.eject(responseId);
  };
}
