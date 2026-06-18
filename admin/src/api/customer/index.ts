import request from '/@/utils/request';

export function useCustomerApi() {
  return {
    list: (params: object) => {
      return request({
        url: '/admin/api/customers',
        method: 'get',
        params,
      });
    },
    detail: (id: number) => {
      return request({
        url: `/admin/api/customers/${id}`,
        method: 'get',
      });
    },
    orders: (id: number) => {
      return request({
        url: `/admin/api/customers/${id}/orders`,
        method: 'get',
      });
    },
  };
}
