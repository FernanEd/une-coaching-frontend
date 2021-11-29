<script lang="ts">
	import { session } from '$app/stores';
	import AcreditacionesDocente from '$lib/components/acreditaciones/acreditacionesDocente.svelte';
	import { docentesComoUsuarios } from '$lib/stores/lists/docentesComoUsuario';

	let docenteID: number | undefined;
	$: docenteID = $docentesComoUsuarios.find(
		(d) => d.id == $session?.user?.id
	)?.id_docente;
</script>

<AcreditacionesDocente {docenteID} />
