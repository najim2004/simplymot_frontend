export interface ServiceItem {
  id?: string;
  title: string;
  price: number;
  type: "MOT" | "RETEST" | "OTHERS";
  vehicle_class?: string | null;
}

export interface MotGroup {
  vehicle_class: string | null;
  mot: ServiceItem | null;
  mot_retest: ServiceItem | null;
}

export interface ServicesBundle {
  mot_services: MotGroup[];
  other_services: ServiceItem[];
}

export interface ServicesBundleResponse {
  success: boolean;
  message: string;
  data: ServicesBundle;
}

export interface UpsertServiceDto {
  services: ServiceItem[];
}

export interface UpsertServiceResponse {
  success: boolean;
  message: string;
  data: ServiceItem[];
}

export interface DeleteServiceResponse {
  success: boolean;
  message: string;
}
