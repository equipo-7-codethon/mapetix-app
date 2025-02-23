import { authApiQuery } from '@/utils/http';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: authApiQuery,
  endpoints: (builder) => ({
    getUserEmail: builder.query<string, void>({
      query: () => 'user/email',
    }),
  }),
});

export const {
  useGetUserEmailQuery
} = userApi;
export default userApi;
