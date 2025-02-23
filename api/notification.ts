import { createApi } from '@reduxjs/toolkit/query/react';
import { authApiQuery } from '@/utils/http';

const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: authApiQuery,
  endpoints: (builder) => ({
    getUserSubscribed: builder.query({
      query: () => 'notification/subscribed',
      transformResponse: (response) => response,
    }),
    subscribe: builder.mutation({
      query: ({ category }) => ({
        url: 'notification/subscribe',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({
          CategoryId: category,
        }),
      }),
    }),
    unsubscribe: builder.mutation({
        query: ({ category }) => ({
          url: 'notification/unsubscribe',
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json', 
          },
          body: JSON.stringify({
            CategoryId: category,
          }),
        }),
    }),
    insertToken: builder.mutation({
        query: ({ token }) => ({
          url: 'notification/token',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 
          },
          body: JSON.stringify({
            Token: token,
          }),
        }),
    }),
  }),
});

export const {
  useGetUserSubscribedQuery,
  useSubscribeMutation,
  useUnsubscribeMutation,
  useInsertTokenMutation
} = notificationApi;
export default notificationApi;
