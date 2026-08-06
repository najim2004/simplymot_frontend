import { useState, useEffect, useMemo } from 'react';
import { useGetVehiclesQuery, useGetVehicleMotReportsQuery, ApiVehicle, MotTest } from '../api/driver-vehicles.api';
import { getBrandLogo } from '@/lib/helper/vehicle.helper';

export interface MOTReport {
  id: number;
  color: string;
  fuelType: string;
  registrationDate: string;
  motTestNumber: string;
  motPassDate: string;
  motExpiryDate: string;
  motStatus: 'Pass' | 'Fail';
}

export interface Vehicle {
  id: number;
  apiVehicleId: string;
  registrationNumber: string;
  expiryDate: string;
  roadTax: string;
  make: string;
  model: string;
  year: number;
  image: string;
  motReport: MOTReport[];
}

export interface MotReportWithVehicle extends MOTReport {
  vehicleId: string;
  vehicleReg: string;
  vehicleImage: string;
  vehicleMake: string;
  vehicleModel: string;
}

export const useVehicleData = (
    vehicleIdFromURL: string | null,
    page: number = 1,
    limit: number = 10,
    status: string = ''
) => {
    const { data: vehiclesResponse, isLoading: isLoadingVehicles, error: vehiclesError } = useGetVehiclesQuery();
    
    const foundVehicle = useMemo(() => {
        if (!vehiclesResponse?.data || !vehicleIdFromURL) return null;
        return vehiclesResponse.data.find(v => 
            v.id === vehicleIdFromURL
        );
    }, [vehiclesResponse?.data, vehicleIdFromURL]);
    
    const vehicleIdForQuery = foundVehicle?.id || vehicleIdFromURL || '';
    const { data: motReportsData, isLoading: isLoadingMotReports, error: motReportsError } = useGetVehicleMotReportsQuery(
        { 
            id: vehicleIdForQuery,
            page,
            limit,
            status
        },
        { skip: !vehicleIdForQuery }
    );

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [motReports, setMotReports] = useState<MotReportWithVehicle[]>([]);

    const transformApiVehicle = (apiVehicle: ApiVehicle): Vehicle => {
        let roadTax = 'N/A';
        try {
            const dvlaData = JSON.parse(apiVehicle.dvla_data || '{}');
            roadTax = dvlaData.taxDueDate || apiVehicle.mot_expiry_date || 'N/A';
        } catch (e) {
            roadTax = apiVehicle.mot_expiry_date || 'N/A';
        }

        const imageUrl = getBrandLogo(apiVehicle.make);
        
        const motReportArray: MOTReport[] = [];
        try {
            const motData = JSON.parse(apiVehicle.mot_data || '{}');
            if (motData.motTests && Array.isArray(motData.motTests)) {
                motData.motTests.forEach((test: MotTest) => {
                    motReportArray.push({
                        id: parseInt(test.motTestNumber) || Date.now(),
                        color: motData.primaryColour || apiVehicle.color,
                        fuelType: motData.fuelType || apiVehicle.fuel_type,
                        registrationDate: motData.registrationDate || motData.firstUsedDate || '',
                        motTestNumber: test.motTestNumber,
                        motPassDate: test.completedDate,
                        motExpiryDate: test.expiryDate || '',
                        motStatus: test.testResult === 'PASSED' ? 'Pass' : 'Fail'
                    });
                });
            }
        } catch (e) {
            console.error('Error transforming mot tests:', e);
        }

        return {
            id: Date.now(),
            apiVehicleId: apiVehicle.id,
            registrationNumber: apiVehicle.registration_number,
            expiryDate: apiVehicle.mot_expiry_date || '',
            roadTax: roadTax,
            make: apiVehicle.make,
            model: apiVehicle.model,
            year: apiVehicle.year_of_manufacture,
            image: imageUrl,
            motReport: motReportArray
        };
    };

    useEffect(() => {
        if (vehiclesResponse?.data) {
            const transformedVehicles = vehiclesResponse.data.map(transformApiVehicle);
            setVehicles(transformedVehicles);

            const processedReports: MotReportWithVehicle[] = [];
            transformedVehicles.forEach(vehicle => {
                const apiVehicle = vehiclesResponse.data.find(av => 
                    av.registration_number === vehicle.registrationNumber
                );
                
                if (vehicle.motReport && vehicle.motReport.length > 0) {
                    const latestReport = vehicle.motReport[0];
                    processedReports.push({
                        ...latestReport,
                        vehicleId: apiVehicle?.id || '',
                        vehicleReg: vehicle.registrationNumber,
                        vehicleImage: vehicle.image,
                        vehicleMake: vehicle.make,
                        vehicleModel: vehicle.model
                    });
                } else {
                    processedReports.push({
                        id: vehicle.id,
                        color: '',
                        fuelType: '',
                        registrationDate: '',
                        motTestNumber: '',
                        motPassDate: '',
                        motExpiryDate: vehicle.expiryDate || '',
                        motStatus: 'Pass' as const,
                        vehicleId: apiVehicle?.id || '',
                        vehicleReg: vehicle.registrationNumber,
                        vehicleImage: vehicle.image,
                        vehicleMake: vehicle.make,
                        vehicleModel: vehicle.model
                    });
                }
            });
            setMotReports(processedReports);
        }
    }, [vehiclesResponse]);

    useEffect(() => {
        if (motReportsData && foundVehicle && vehicles.length > 0) {
            const transformedReports: MOTReport[] = motReportsData.motTests.map((test: MotTest) => ({
                id: parseInt(test.motTestNumber) || Date.now(),
                color: motReportsData.primaryColour || foundVehicle.color,
                fuelType: motReportsData.fuelType || foundVehicle.fuel_type,
                registrationDate: motReportsData.registrationDate || motReportsData.firstUsedDate || '',
                motTestNumber: test.motTestNumber,
                motPassDate: test.completedDate,
                motExpiryDate: test.expiryDate || '',
                motStatus: test.testResult === 'PASSED' ? 'Pass' : 'Fail'
            }));

            setVehicles(prevVehicles => {
                return prevVehicles.map(vehicle => {
                    if (vehicle.apiVehicleId === foundVehicle.id) {
                        if (page === 1) {
                            return {
                                ...vehicle,
                                motReport: transformedReports
                            };
                        } else {
                            const existingIds = new Set(vehicle.motReport.map(r => r.id));
                            const newReports = transformedReports.filter(r => !existingIds.has(r.id));
                            return {
                                ...vehicle,
                                motReport: [...vehicle.motReport, ...newReports]
                            };
                        }
                    }
                    return vehicle;
                });
            });
        }
    }, [motReportsData, foundVehicle, vehicles.length, page, status]);

    const hasMore = motReportsData ? motReportsData.motTests.length === limit : false;

    return {
        vehicles,
        motReports,
        foundVehicle,
        isLoadingVehicles,
        isLoadingMotReports,
        vehiclesError,
        motReportsError,
        hasMore,
        totalReports: motReportsData?.motTests?.length || 0
    };
};
