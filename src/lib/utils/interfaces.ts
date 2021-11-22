// ACREDITACIONES

type id_curso = number;
type id_diplomado = number;
type id_competencia = number;
type id_tipoCompetencia = number;

export interface Diplomado {
	id: id_diplomado;
	nombre: string;
}

export interface Curso {
	id: id_curso;
	nombre: string;
	id_diplomado: id_diplomado | null;
}

export interface TipoCompetencia {
	id: id_tipoCompetencia;
	nombre: string;
}

export interface Competencia {
	id: id_competencia;
	nombre: string;
	id_tipo: id_competencia | null;
}

//REGISTROS

type id_registroDiplomado = number;
type id_registroCurso = number;
type id_registroCompetencia = number;

export interface RegistroDiplomado {
	id: id_registroDiplomado;
	id_diplomado: id_diplomado;
	id_acreditor: id_docente;
	id_expeditor: id_administrativo;
	fecha_expedicion: Date;
	documento: string;
}

export interface RegistroCurso {
	id: id_registroCurso;
	id_curso: id_curso;
	id_acreditor: id_docente;
	id_expeditor: id_administrativo;
	fecha_expedicion: Date;
	documento: string;
	cursado: boolean;
	acreditado: boolean;
}

export interface RegistroCompetencia {
	id: id_registroCompetencia;
	id_competencia: id_competencia;
	id_acreditor: id_docente;
	id_expeditor: id_administrativo;
	fecha_expedicion: Date;
	documento: string;
}

// USUARIOS

type id_usuario = number;
type id_coach = number;
type id_docente = number;
type id_administrativo = number;
type id_coordinador = number;
type id_instructor = number;
type id_docenteEnCoach = number;

export interface Usuario {
	id: id_usuario;
	matricula: number;
	nombre: string;
	apellido_paterno: string;
	apellido_materno: string;
	correo: string;
	password: string;
}

export interface Coach {
	id: id_coach;
	id_usuario: id_usuario;
}

export interface Docente {
	id: id_docente;
	id_usuario: id_usuario;
}

export interface Instructor {
	id: id_instructor;
	id_usuario: id_usuario;
}

export interface Coordinador {
	id: id_coordinador;
	id_usuario: id_usuario;
}

export interface Administrativo {
	id: id_administrativo;
	id_usuario: id_usuario;
}

export interface Administrativo {
	id: id_administrativo;
	id_usuario: id_usuario;
}

export interface DocentesEnCoaches {
	id: id_docenteEnCoach;
	id_docente: id_docente;
	id_coach: id_coach;
}

//JORNADA
type id_jornada = number;
type id_cursoEnJornada = number;
type id_asistenteEnCurso = number;
type id_reporte = number;

export interface Jornada {
	id: id_jornada;
	titulo: string;
	fecha_inicio: Date;
	fecha_fin: Date;
	fecha_inscripcion_inicio: Date;
	fecha_inscripcion_fin: Date;
}

// Estados
// 0 - on going
// 1 - closed

export interface CursoEnJornada {
	id: id_cursoEnJornada;
	id_curso: id_curso;
	cupo_maximo: number;
	id_instructor: id_instructor;
	id_jornada: id_jornada;
	estado: 0 | 1;
}

// Estados
// 0 - pending
// 1 - accepted
// 2 - denied

export interface AsistenteEnCurso {
	id: id_asistenteEnCurso;
	id_cursojornada: id_cursoEnJornada;
	id_docente: id_docente;
	estado: 0 | 1 | 2;
	aprobado: boolean;
}

export interface Reporte {
	id: id_reporte;
	fecha_generacion: Date;
	documento: string;
	id_expeditor: id_administrativo;
	id_jornada: id_jornada;
}

// AUTH

export interface JWT {
	userID: id_usuario;
	token: string;
	roles: string[];
}
