import request from '/@/utils/request';

export function useDashboardApi() {
  return {
    stats: () => {
      return request({
        url: '/admin/api/dashboard/stats',
        method: 'get',
      });
    },
  };
}
