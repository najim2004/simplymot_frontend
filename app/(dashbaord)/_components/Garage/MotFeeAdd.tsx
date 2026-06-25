'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'react-toastify'
import {
    setMot,
    setRetest,
    setClass7Enabled,
    setClass7Mot,
    setClass7Retest,
    setPricingFromResponse,
    useAppDispatch,
    useAppSelector,
    useCreatePricingMutation
} from '@/rtk'
import { store } from '@/rtk/store'
import { syncAdditionalServicesForm } from './AdditionalServicesAdd'
import { Plus, X } from 'lucide-react'

// Shared loading state for Save button
let isLoadingState = false
export const getPricingLoadingState = () => isLoadingState

interface MotFeeFormData {
    motFee: string
    motRetestFee: string
    class7MotFee: string
    class7MotRetestFee: string
}

export default function MotFeeAdd() {
    const dispatch = useAppDispatch()
    const { mot, retest, class7, additionals, formVersion } = useAppSelector(state => state.pricing)
    const [createPricing, { isLoading }] = useCreatePricingMutation()
    const prevFormVersionRef = React.useRef(formVersion)
    const hasInitializedRef = React.useRef(false)

    // Update shared loading state
    React.useEffect(() => {
        isLoadingState = isLoading
    }, [isLoading])

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<MotFeeFormData>({
        defaultValues: {
            motFee: mot.price ?? '',
            motRetestFee: retest.price ?? '',
            class7MotFee: class7.mot.price ?? '',
            class7MotRetestFee: class7.retest.price ?? ''
        }
    })

    const motFeeValue = watch('motFee')
    const retestFeeValue = watch('motRetestFee')
    const class7MotFeeValue = watch('class7MotFee')
    const class7RetestFeeValue = watch('class7MotRetestFee')

    // Initialize form when data changes
    useEffect(() => {
        if (prevFormVersionRef.current !== formVersion || !hasInitializedRef.current) {
            prevFormVersionRef.current = formVersion
            hasInitializedRef.current = true
            reset({
                motFee: mot.price ?? '',
                motRetestFee: retest.price ?? '',
                class7MotFee: class7.mot.price ?? '',
                class7MotRetestFee: class7.retest.price ?? ''
            })
        }
    }, [formVersion, reset, mot.price, retest.price, class7.mot.price, class7.retest.price])

    // Sync form values to Redux
    useEffect(() => {
        if (motFeeValue !== (mot.price ?? '')) {
            dispatch(setMot({ price: motFeeValue ?? '' }))
        }
    }, [motFeeValue, dispatch, mot.price])

    useEffect(() => {
        if (retestFeeValue !== (retest.price ?? '')) {
            dispatch(setRetest({ price: retestFeeValue ?? '' }))
        }
    }, [retestFeeValue, dispatch, retest.price])

    useEffect(() => {
        if (class7MotFeeValue !== (class7.mot.price ?? '')) {
            dispatch(setClass7Mot({ price: class7MotFeeValue ?? '' }))
        }
    }, [class7MotFeeValue, dispatch, class7.mot.price])

    useEffect(() => {
        if (class7RetestFeeValue !== (class7.retest.price ?? '')) {
            dispatch(setClass7Retest({ price: class7RetestFeeValue ?? '' }))
        }
    }, [class7RetestFeeValue, dispatch, class7.retest.price])

    const parsePrice = (value: string) => {
        const parsed = parseFloat(value)
        return Number.isNaN(parsed) ? 0 : parsed
    }

    const onSubmit = async (data: MotFeeFormData) => {
        // Sync and get latest additional services from form
        const syncedServices = syncAdditionalServicesForm()
        let currentAdditionals = syncedServices

        // Fallback to Redux if no synced services
        if (currentAdditionals.length === 0) {
            const reduxState = store.getState().pricing.additionals || additionals
            currentAdditionals = reduxState.map(service => ({
                id: service.id ?? null,
                name: service.name
            }))
        }

        // Build payload
        const payload = {
            class4: {
                mot: { name: mot.name || 'MOT Test', price: parsePrice(data.motFee) },
                retest: { name: retest.name || 'MOT Retest', price: parsePrice(data.motRetestFee) },
            },
            class7: class7.enabled
                ? {
                    enabled: true,
                    mot: { name: class7.mot.name || 'Class 7 MOT Test', price: parsePrice(data.class7MotFee) },
                    retest: { name: class7.retest.name || 'Class 7 MOT Retest', price: parsePrice(data.class7MotRetestFee) },
                }
                : { enabled: false },
            additionals: currentAdditionals
                .filter(service => service.name?.trim())
                .map(service => ({ name: service.name.trim() }))
        }

        try {
            const response = await createPricing(payload).unwrap()
            dispatch(setPricingFromResponse(response.data))
            toast.success(response.message || 'Service prices updated successfully')
        } catch (error: any) {
            toast.error(error?.data?.message || 'Error updating service prices. Please try again.')
        }
    }

    return (
        <div className="mb-6">
            <Card className="border border-[#19CA32]">
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="rounded-md border border-[#19CA32] p-4">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-base font-semibold text-gray-900">Class 4</h3>
                                {!class7.enabled && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => dispatch(setClass7Enabled(true))}
                                        className="h-9 border-[#19CA32] text-[#19CA32] hover:bg-green-50"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add class 7
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    MOT Fee
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                        £
                                    </span>
                                    <Input
                                        {...register('motFee', {
                                            required: 'MOT Fee is required',
                                            pattern: {
                                                value: /^\d+(\.\d{1,2})?$/,
                                                message: 'Please enter a valid amount'
                                            }
                                        })}
                                        type="number"
                                        step="0.01"
                                        placeholder=""
                                        className="h-11 pl-8 border border-[#19CA32] focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                {errors.motFee && (
                                    <p className="text-sm text-red-500">{errors.motFee.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    MOT Retest Fee
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                        £
                                    </span>
                                    <Input
                                        {...register('motRetestFee', {
                                            required: 'MOT Retest Fee is required',
                                            pattern: {
                                                value: /^\d+(\.\d{1,2})?$/,
                                                message: 'Please enter a valid amount'
                                            }
                                        })}
                                        type="number"
                                        step="0.01"
                                        placeholder=""
                                        className="h-11 pl-8 border border-[#19CA32] focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                {errors.motRetestFee && (
                                    <p className="text-sm text-red-500">{errors.motRetestFee.message}</p>
                                )}
                            </div>
                            </div>
                        </div>

                        {class7.enabled && (
                            <div className="rounded-md border border-[#19CA32] p-4">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <h3 className="text-base font-semibold text-gray-900">Class 7</h3>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setValue('class7MotFee', '')
                                            setValue('class7MotRetestFee', '')
                                            dispatch(setClass7Enabled(false))
                                        }}
                                        className="h-8 w-8 hover:bg-red-50"
                                        aria-label="Remove class 7"
                                    >
                                        <X className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            MOT Fee
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                                £
                                            </span>
                                            <Input
                                                {...register('class7MotFee', {
                                                    required: class7.enabled ? 'Class 7 MOT Fee is required' : false,
                                                    pattern: {
                                                        value: /^\d+(\.\d{1,2})?$/,
                                                        message: 'Please enter a valid amount'
                                                    }
                                                })}
                                                type="number"
                                                step="0.01"
                                                placeholder=""
                                                className="h-11 pl-8 border border-[#19CA32] focus:border-green-500 focus:ring-green-500"
                                            />
                                        </div>
                                        {errors.class7MotFee && (
                                            <p className="text-sm text-red-500">{errors.class7MotFee.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            MOT Retest Fee
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                                £
                                            </span>
                                            <Input
                                                {...register('class7MotRetestFee', {
                                                    required: class7.enabled ? 'Class 7 MOT Retest Fee is required' : false,
                                                    pattern: {
                                                        value: /^\d+(\.\d{1,2})?$/,
                                                        message: 'Please enter a valid amount'
                                                    }
                                                })}
                                                type="number"
                                                step="0.01"
                                                placeholder=""
                                                className="h-11 pl-8 border border-[#19CA32] focus:border-green-500 focus:ring-green-500"
                                            />
                                        </div>
                                        {errors.class7MotRetestFee && (
                                            <p className="text-sm text-red-500">{errors.class7MotRetestFee.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        <p className="text-sm text-gray-600">
                            Don&apos;t forget to click &quot;Save&quot; below to confirm your class / price changes.
                        </p>

                        <Button
                            id="pricing-main-save"
                            type="submit"
                            disabled={isLoading}
                            className="hidden"
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
