import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_ENDPOINT,
    credentials: 'include',
    prepareHeaders: (headers) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        // fetchBaseQuery sets application/json automatically for plain objects.
        // Do not force Content-Type here — it breaks multipart FormData uploads.
        return headers;
    },
});
