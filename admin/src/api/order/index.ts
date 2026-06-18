import request from '/@/utils/request';

export function useOrderApi() {
  return {
    list: (params: object) => {
      return request({
        url: '/admin/api/orders',
        method: 'get',
        params,
      });
    },
    detail: (id: number) => {
      return request({
        url: `/admin/api/orders/${id}`,
        method: 'get',
      });
    },
    deliver: (id: number, data: object) => {
      return request({
        url: `/admin/api/orders/${id}/deliver`,
        method: 'post',
        data,
      });
    },
    confirmPayment: (id: number) => {
      return request({
        url: `/admin/api/orders/${id}/confirm-payment`,
        method: 'post',
      });
    },
    refund: (id: number) => {
      return request({
        url: `/admin/api/orders/${id}/refund`,
        method: 'post',
      });
    },
    exportOrders: (params: object) => {
      return request({
        url: '/admin/api/orders/export',
        method: 'get',
        params,
      });
    },
  };
}
