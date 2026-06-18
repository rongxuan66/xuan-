import request from '/@/utils/request';

export function useLogApi() {
  return {
    list: (params: object) => {
      return request({
        url: '/admin/api/logs',
        method: 'get',
        params,
      });
    },
  };
}
