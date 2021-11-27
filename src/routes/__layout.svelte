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

		return goThrough;
	}
</script>

<script>
	import { session } from '$app/stores';
	import LoadingSpinner from '$lib/components/common/loadingSpinner.svelte';
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
	import { onMount } from 'svelte';
	import '../app.postcss';

	export let loading = true;

	onMount(async () => {
		await db_usuarios.getItems();
		await db_docentes.getItems();
		await db_coaches.getItems();
		await db_instructores.getItems();
		await db_administrativos.getItems();
		await db_coordinadores.getItems();
		await db_docentesEnCoaches.getItems();
		await db_jornadas.getItems();
		await db_cursosEnJornada.getItems();
		await db_asistentesEnCurso.getItems();
		await db_reportes.getItems();
		await db_registrosCompetencias.getItems();
		await db_registrosCursos.getItems();
		await db_registrosDiplomados.getItems();
		await db_cursos.getItems();
		await db_diplomados.getItems();
		await db_competencias.getItems();
		await db_tiposCompetencias.getItems();

		loading = false;
	});
</script>

{#if $session.isLoggedIn}
	{#if loading}
		<div
			class="w-screen h-screen flex justify-center items-center flex-col gap-8"
		>
			<p class="text-accent">Cargando el portal...</p>
			<LoadingSpinner />
		</div>
	{:else}
		<slot />
	{/if}
{:else}
	<slot name="login" />
{/if}

<ToastArea />
<PromptArea />
