import request from '/@/utils/request';

export function useProductApi() {
  return {
    list: (params: object) => {
      return request({
        url: '/admin/api/products',
        method: 'get',
        params,
      });
    },
    detail: (id: number) => {
      return request({
        url: `/admin/api/products/${id}`,
        method: 'get',
      });
    },
    create: (data: object) => {
      return request({
        url: '/admin/api/products',
        method: 'post',
        data,
      });
    },
    update: (id: number, data: object) => {
      return request({
        url: `/admin/api/products/${id}`,
        method: 'put',
        data,
      });
    },
    remove: (id: number) => {
      return request({
        url: `/admin/api/products/${id}`,
        method: 'delete',
      });
    },
    cards: (productId: number) => {
      return request({
        url: `/admin/api/products/${productId}/cards`,
        method: 'get',
      });
    },
    importCards: (productId: number, data: object) => {
      return request({
        url: `/admin/api/products/${productId}/cards`,
        method: 'post',
        data,
      });
    },
    deleteCard: (cardId: number) => {
      return request({
        url: `/admin/api/products/cards/${cardId}`,
        method: 'delete',
      });
    },
  };
}
