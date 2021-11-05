<script lang="ts">
	import { currentUser } from '$lib/stores/currentUser';
	import { asistentesEnCurso } from '$lib/stores/db/asistentesEnCurso';
	import { cursosEnJornada } from '$lib/stores/db/cursosEnJornada';
	import type { DocentePortal } from '$lib/stores/docentePortal';
	import { getDocentePortal } from '$lib/stores/docentePortal';
	import type { Readable } from 'svelte/store';

	let docente: Readable<DocentePortal>;
	$: docente = getDocentePortal($currentUser?.id);

	const handleInvite = (inviteID: number, accept: boolean) => {
		asistentesEnCurso.updateItem(inviteID, {
			estado: accept ? 1 : 2
		});
	};
</script>

{#if $docente}
	{#if $docente.invitaciones.length > 0}
		<h2 class="heading">
			Invitaciones ({$docente.invitaciones.length})
		</h2>

		<section class="flex flex-col gap-8 mt-4 mb-8">
			{#each $docente.invitaciones as invitacion (invitacion.id)}
				<article
					class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-4"
				>
					<p class="font-bold">
						Te invitaron a formar parte de este curso
					</p>

					<div>
						<p class="label">
							{invitacion?.curso?.diplomado?.nombre}
						</p>
						<p>{invitacion?.curso?.nombre}</p>
					</div>

					<div>
						<p class="label">Instructor</p>
						<p>
							{invitacion?.instructor?.nombre}
							{invitacion?.instructor?.apellido_paterno}
							{invitacion?.instructor?.apellido_materno}
						</p>
					</div>

					<div class="flex gap-8 justify-center">
						<button
							class="btn primary"
							on:click={() => {
								handleInvite(invitacion.id, true);
							}}>Aceptar</button
						>
						<button
							class="link"
							on:click={() => {
								handleInvite(invitacion.id, false);
							}}>Rechazar</button
						>
					</div>
				</article>
			{/each}
		</section>
	{/if}

	<h2 class="heading">Cursos ({$docente.cursos.length})</h2>

	<hr class="my-2 border-none" />

	{#if $docente.cursos.length == 0}
		<p>No estas inscrito a cursos esta jornada</p>
	{:else}
		<section class="flex flex-col gap-8 mt-4">
			{#each $docente.cursos as cursoDeLaJornada (cursoDeLaJornada.id)}
				<article
					class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-4"
				>
					<p
						class="label"
						class:text-status-danger={cursoDeLaJornada?.estado == 1}
					>
						{cursoDeLaJornada?.estado == 0
							? 'En curso'
							: cursoDeLaJornada?.estado == 1
							? 'Cerrado'
							: '...'}
					</p>

					<div>
						<p class="label">
							{cursoDeLaJornada?.curso?.diplomado?.nombre ||
								'Sin diplomado'}
						</p>
						<p>{cursoDeLaJornada?.curso?.nombre}</p>
					</div>

					<div>
						<p class="label">Instructor</p>
						<p>
							{cursoDeLaJornada?.instructor?.nombre}
							{cursoDeLaJornada?.instructor?.apellido_paterno}
							{cursoDeLaJornada?.instructor?.apellido_materno}
						</p>
					</div>

					{#if cursoDeLaJornada.estado == 1}
						<div>
							<p class="label">Calificación</p>
							<p>
								{cursoDeLaJornada.calificacion}
							</p>
						</div>
					{/if}
				</article>
			{/each}
		</section>
	{/if}
{/if}
