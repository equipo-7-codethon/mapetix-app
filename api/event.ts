import { createApi } from '@reduxjs/toolkit/query/react';
import { authApiQuery } from '@/utils/http';

const eventApi = createApi({
  reducerPath: 'eventApi',
  baseQuery: authApiQuery,
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: ({ price, valoration, category }) => {
        const params = new URLSearchParams();

        if (price != null && price !== undefined) {
          params.append('price', price.toString());
        }
        
        if (valoration != null && valoration !== undefined) {
            params.append('valoration', valoration.toString());
        }
        
        if (category != null && category !== undefined) {
            params.append('category', category.toString());
        }
          return `allevents?${params.toString()}`;
      },
    }),
    getEventDetail: builder.query({
      query: (id) => `event/${id}`,
      transformResponse: (response) => response[0],
    }),
    getEventUserRate: builder.query({
      query: (id) => `event/rate/${id}`,
      transformResponse: (response) => response[0],
    }),
    rateEvent: builder.mutation({
      query: ({ eventId, nota, description }) => ({
        url: `plan/rate/${eventId}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  // Esto es importante
        },
        body: JSON.stringify({
          Nota: nota,
          Description: description,
        }),
      }),
    }),
    getCategories: builder.query({
      query: () => 'event/categories',
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventDetailQuery,
  useGetEventUserRateQuery,
  useLazyGetEventsQuery,
  useRateEventMutation,
  useLazyGetCategoriesQuery
} = eventApi;
export default eventApi;
