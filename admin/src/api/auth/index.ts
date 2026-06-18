import request from '/@/utils/request';

export function useAuthApi() {
  return {
    login: (data: object) => {
      return request({
        url: '/admin/api/auth/login',
        method: 'post',
        data,
      });
    },
    info: () => {
      return request({
        url: '/admin/api/auth/info',
        method: 'get',
      });
    },
  };
}
