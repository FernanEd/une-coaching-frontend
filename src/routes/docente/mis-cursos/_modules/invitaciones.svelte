<script lang="ts">
	import { db_asistentesEnCurso, db_invitacionesCurso } from '$lib/stores/db';
	import type { InvitacionCursoConInstructorConCurso } from '$lib/stores/lists/portal-docente/getInvitacionesParaDocente';
	import { toasts } from '$lib/stores/toasts';

	export let invitaciones: InvitacionCursoConInstructorConCurso[] | undefined;
	export let docenteID: number | undefined;

	const handleInvite = async (
		inviteID: number,
		cursoJornadaID: number,
		accept: boolean
	) => {
		if (docenteID) {
			if (accept) {
				let progress = 0;
				try {
					await db_invitacionesCurso.updateItem(inviteID, {
						estado_invitacion: 1,
					});
					progress = 1;
					await db_asistentesEnCurso.addItem({
						id_docente: docenteID,
						id_cursojornada: cursoJornadaID,
						aprobado: false,
						cursado: false,
					});
					progress = 2;
					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				} finally {
					if (progress == 1) {
						try {
							await db_invitacionesCurso.updateItem(inviteID, {
								estado_invitacion: 0,
							});
						} catch (e) {
							console.error(e);
							toasts.error();
						}
					}
				}
			} else {
				try {
					await db_invitacionesCurso.updateItem(inviteID, {
						estado_invitacion: 2,
					});

					toasts.success();
				} catch (e) {
					console.error(e);
					toasts.error();
				}
			}
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
							handleInvite(invitacion.id, invitacion.cursoJornada.id, true);
						}}>Aceptar</button
					>
					<button
						class="link"
						on:click={() => {
							handleInvite(invitacion.id, invitacion.cursoJornada.id, false);
						}}>Rechazar</button
					>
				</div>
			</article>
		{/each}
	</section>
{/if}
