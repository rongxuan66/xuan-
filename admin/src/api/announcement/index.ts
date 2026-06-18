import request from '/@/utils/request';

export function useAnnouncementApi() {
  return {
    list: () => {
      return request({
        url: '/admin/api/announcements',
        method: 'get',
      });
    },
    detail: (id: number) => {
      return request({
        url: `/admin/api/announcements/${id}`,
        method: 'get',
      });
    },
    create: (data: object) => {
      return request({
        url: '/admin/api/announcements',
        method: 'post',
        data,
      });
    },
    update: (id: number, data: object) => {
      return request({
        url: `/admin/api/announcements/${id}`,
        method: 'put',
        data,
      });
    },
    remove: (id: number) => {
      return request({
        url: `/admin/api/announcements/${id}`,
        method: 'delete',
      });
    },
  };
}
