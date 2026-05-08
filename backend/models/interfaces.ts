export interface User {
    id?: number;
    name: string;
    email: string;
    password: string;
    role: "paciente" | "medico";
}
export interface Medicamento {
    id?: number;
    name: string;
    description: string;
    type: string;
}
export interface ErrorResponse {
    message: string;
    status: number;
}
