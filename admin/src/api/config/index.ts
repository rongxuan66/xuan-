import request from '/@/utils/request';

export function useConfigApi() {
  return {
    list: () => {
      return request({
        url: '/admin/api/configs',
        method: 'get',
      });
    },
    update: (data: object) => {
      return request({
        url: '/admin/api/configs',
        method: 'put',
        data,
      });
    },
    getPayConfig: () => {
      return request({
        url: '/admin/api/configs/pay',
        method: 'get',
      });
    },
    savePayConfig: (data: object) => {
      return request({
        url: '/admin/api/configs/pay',
        method: 'put',
        data,
      });
    },
  };
}
