import request from '@/utils/request'

export const sendEquation = (data) => {
  return request({
    url: '/api/equation',
    method: 'get',
    params: data,
  })
}