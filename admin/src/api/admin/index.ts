import request from '/@/utils/request';

export function useAdminApi() {
  return {
    list: () => {
      return request({
        url: '/admin/api/admins',
        method: 'get',
      });
    },
    create: (data: object) => {
      return request({
        url: '/admin/api/admins',
        method: 'post',
        data,
      });
    },
    update: (id: number, data: object) => {
      return request({
        url: `/admin/api/admins/${id}`,
        method: 'put',
        data,
      });
    },
    remove: (id: number) => {
      return request({
        url: `/admin/api/admins/${id}`,
        method: 'delete',
      });
    },
  };
}
