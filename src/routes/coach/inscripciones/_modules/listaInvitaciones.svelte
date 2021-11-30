<script lang="ts">
	import type { InvitacionCursoConDocente } from '$lib/stores/lists/jornada/invitacionesCursoConDocente';

	export let invitaciones: InvitacionCursoConDocente[] | undefined;
</script>

{#if invitaciones}
	<h2 class="heading">Respuesta a las Invitaciones</h2>

	<hr class="border-none my-2" />

	{#if invitaciones.length == 0}
		<p>Ningún docente ha contestado las invitaciones aún.</p>
	{:else}
		<section class="flex flex-col gap-4">
			{#each invitaciones as invitacion (invitacion.id)}
				<div class="p-4 border bg-neutral-100">
					{#if invitacion.estado_invitacion == 0}
						<p class="label">Aún no contesta</p>
					{:else if invitacion.estado_invitacion == 1}
						<p class="label text-status-success">Acepto la invitación</p>
					{:else if invitacion.estado_invitacion == 2}
						<p class="label text-status-danger">Rechazó la invitación</p>
					{/if}
					<p>
						{invitacion.docente.nombre}
						{invitacion.docente.apellido_paterno}
						{invitacion.docente.apellido_materno}
					</p>
				</div>
			{/each}
		</section>
	{/if}
{/if}
