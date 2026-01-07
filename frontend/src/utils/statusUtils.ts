export function getDeviceStatusLabel(status: string): string {
    switch (status) {
        case "assigned":
            return "Birikdirilen";
        case "in_stock":
            return "Ammarda";
        case "repair":
            return "Bejergä mätäç";
        case "written_off":
            return "Ulanyşdan çykarylan";
        default:
            return status;
    }
}

export const STATUS_OPTIONS_MAP = [
    { value: "in_stock", label: "Ammarda" },
    { value: "assigned", label: "Birikdirilen" },
    { value: "repair", label: "Bejergä mätäç" },
    { value: "written_off", label: "Ulanyşdan çykarylan" },
];
