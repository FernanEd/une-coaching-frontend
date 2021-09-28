export interface Diplomado {
	id: number;
	nombre: string;
}

export interface Curso {
	id: number;
	nombre: string;
	id_diplomado: number | null;
}
