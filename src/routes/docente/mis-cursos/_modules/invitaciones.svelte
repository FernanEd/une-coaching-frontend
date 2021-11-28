<script lang="ts">
	import { db_invitacionesCurso } from '$lib/stores/db';
	import type { InvitacionCursoConInstructorConCurso } from '$lib/stores/lists/portal-docente/getInvitacionesParaDocente';
	import { toasts } from '$lib/stores/toasts';

	export let invitaciones: InvitacionCursoConInstructorConCurso[] | undefined;

	const handleInvite = async (inviteID: number, accept: boolean) => {
		try {
			await db_invitacionesCurso.updateItem(inviteID, {
				estado_invitacion: accept ? 1 : 2,
			});

			toasts.success();
		} catch (e) {
			console.error(e);
			toasts.error();
		}
	};
</script>

{#if invitaciones}
	<h2 class="heading">
		Invitaciones ({invitaciones.length})
	</h2>

	<section class="flex flex-col gap-8 mt-4 mb-8">
		{#each invitaciones as invitacion (invitacion.id)}
			<article
				class="rounded-2xl shadow-fix text-center p-4 flex flex-col gap-4"
			>
				<p class="font-bold">Te invitaron a formar parte de este curso</p>

				<div>
					<p class="label">
						{#if invitacion.curso.diplomado}
							<p>{invitacion.curso.diplomado.nombre}</p>
						{:else}
							<p>Sin diplomado</p>
						{/if}
					</p>
					<p>{invitacion.curso.nombre}</p>
				</div>

				<div>
					<p class="label">Instructor</p>
					{#if invitacion.instructor}
						<p>
							{invitacion.instructor.nombre}
							{invitacion.instructor.apellido_paterno}
							{invitacion.instructor.apellido_materno}
						</p>
					{:else}
						<p>Sin instructor asignado aún</p>
					{/if}
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
