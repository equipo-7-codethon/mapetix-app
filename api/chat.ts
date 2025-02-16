import { createApi } from '@reduxjs/toolkit/query/react';
import { authApiQuery } from '@/utils/http';

const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: authApiQuery,
  endpoints: (builder) => ({
    getMessages: builder.query({
      query: (id) => `messages/${id}`,
      transformResponse: (response) => response,
    }),
    insertMessage: builder.mutation({
      query: ({ eventId, message }) => ({
        url: 'messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  // Esto es importante
        },
        body: JSON.stringify({
          Message: message,
          EventId: eventId,
        }),
      }),
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useInsertMessageMutation
} = chatApi;
export default chatApi;
