import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updateSubscriptionStatus } from '@/features/subscriptions'
import { useGetCurrentSubscriptionQuery } from "@/features/garage";

export const useSubscriptionUpdate = () => {
    const dispatch = useAppDispatch()
    const subscriptionState = useAppSelector((state) => state.subscription)
    const { refetch: refetchCurrentSubscription } = useGetCurrentSubscriptionQuery()

    const triggerUpdate = useCallback(() => {
        // Update Redux state immediately
        dispatch(updateSubscriptionStatus())

        // Force refetch to ensure UI updates
        setTimeout(() => {
            refetchCurrentSubscription()
        }, 100)
    }, [dispatch, refetchCurrentSubscription])

    return {
        triggerUpdate,
        lastUpdated: subscriptionState.lastUpdated
    }
}
