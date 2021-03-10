export interface Device {
    equipment: string;
    os: Os;
    browser: Browser;
}

export interface DeviceDto {
    equipments: string[];
    osName: string[];
    osVersion: string[];
    browserName: string[];
    browserVersion: string[];
}