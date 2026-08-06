import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateSubscriptionStatus } from '../store/subscription.slice';
import { useGetCurrentSubscriptionQuery } from '@/features/garage/api/garage-subscriptions.api';

export const useSubscriptionUpdate = () => {
    const dispatch = useAppDispatch();
    const subscriptionState = useAppSelector((state) => state.subscription);
    const { refetch: refetchCurrentSubscription } = useGetCurrentSubscriptionQuery();

    const triggerUpdate = useCallback(() => {
        dispatch(updateSubscriptionStatus());
        setTimeout(() => {
            refetchCurrentSubscription();
        }, 100);
    }, [dispatch, refetchCurrentSubscription]);

    return {
        triggerUpdate,
        lastUpdated: subscriptionState.lastUpdated
    };
};
