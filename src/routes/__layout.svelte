<script context="module">
	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ page, fetch, session, stuff }) {
		const goLogin = {
			status: 302,
			redirect: '/login',
		};

		const goThrough = {
			status: 200,
		};

		const goIndex = {
			status: 302,
			redirect: '/',
		};

		if (page.path == '/login') return goThrough;
		if (!session.isLoggedIn) return goLogin;

		let portal = page.path.split('/').filter((p) => p)[0];

		if (
			portal == 'docente' ||
			portal == 'coordinador' ||
			portal == 'instructor' ||
			portal == 'coach' ||
			portal == 'administrativo'
		) {
			if (!session.roles.includes(portal)) return goIndex;
		}

		//Make the call
		db_usuarios.getItems();
		db_docentes.getItems();
		db_coaches.getItems();
		db_instructores.getItems();
		db_administrativos.getItems();
		db_coordinadores.getItems();

		db_docentesEnCoaches.getItems();

		db_jornadas.getItems();
		db_cursosEnJornada.getItems();
		db_asistentesEnCurso.getItems();
		db_reportes.getItems();

		db_registrosCompetencias.getItems();

		db_registrosCursos.getItems();
		db_registrosDiplomados.getItems();

		db_cursos.getItems();
		db_diplomados.getItems();
		db_competencias.getItems();
		db_tiposCompetencias.getItems();

		return goThrough;
	}
</script>

<script>
	import { session } from '$app/stores';
	import PromptArea from '$lib/components/common/promptArea.svelte';
	import ToastArea from '$lib/components/common/toastArea.svelte';
	import {
		db_administrativos,
		db_asistentesEnCurso,
		db_coaches,
		db_competencias,
		db_coordinadores,
		db_cursos,
		db_cursosEnJornada,
		db_diplomados,
		db_docentes,
		db_docentesEnCoaches,
		db_instructores,
		db_jornadas,
		db_registrosCompetencias,
		db_registrosCursos,
		db_registrosDiplomados,
		db_reportes,
		db_tiposCompetencias,
		db_usuarios,
	} from '$lib/stores/db';
	import '../app.postcss';
</script>

{#if $session.isLoggedIn}
	<slot />
{:else}
	<slot name="login" />
{/if}

<ToastArea />
<PromptArea />
