import { createApi } from '@reduxjs/toolkit/query/react';
import { authApiQuery } from '@/utils/http';

const planApi = createApi({
  reducerPath: 'planApi',
  baseQuery: authApiQuery,
  endpoints: (builder) => ({
    getMyPlans: builder.query({
      // query: () => 'rest/v1/plan',
      query: () => 'plans',
    }),
    getPlanDetails: builder.query({
      query: ({ id, location: { lat, long } }) => {
        console.log('plan', id);
        return `plan/${id}?userLocation=${lat},${long}`;
      },
      // `rest/v1/plan?plan_id=eq.${id}&select=*,plan_event(event(*))`,
      transformResponse: (response) => ({
        ...response[0],
        events: response[0].events.map((event) => event[0]),
      }),
    }),
    generatePlan: builder.mutation({
      query: ({ date, location: { lat, long }, maxDistance, maxPrice  }) => ({
        url:
          `plan?userLocation=${lat},${long}&maxDistance=${maxDistance}&TargetDate=${date}&maxPrice=${maxPrice}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetMyPlansQuery,
  useGetPlanDetailsQuery,
  useLazyGetMyPlansQuery,
  useLazyGetPlanDetailsQuery,
  useGeneratePlanMutation,
} = planApi;
export default planApi;
