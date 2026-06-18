import request from '/@/utils/request';

export function usePlatformApi() {
  return {
    list: () => {
      return request({
        url: '/admin/api/platforms',
        method: 'get',
      });
    },
    detail: (id: number) => {
      return request({
        url: `/admin/api/platforms/${id}`,
        method: 'get',
      });
    },
    create: (data: object) => {
      return request({
        url: '/admin/api/platforms',
        method: 'post',
        data,
      });
    },
    update: (id: number, data: object) => {
      return request({
        url: `/admin/api/platforms/${id}`,
        method: 'put',
        data,
      });
    },
    remove: (id: number) => {
      return request({
        url: `/admin/api/platforms/${id}`,
        method: 'delete',
      });
    },
  };
}
