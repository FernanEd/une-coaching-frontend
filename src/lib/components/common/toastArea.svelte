<script lang="ts">
	import { toasts } from '$lib/stores/toasts';
</script>

<div id="toasts-area" class="fixed right-4 bottom-4 flex flex-col gap-4">
	{#each $toasts as toast (toast.id)}
		<div
			class="text-white p-4 rounded shadow animate-fade-in"
			class:bg-status-success={toast.type == 'success'}
			class:bg-status-danger={toast.type == 'danger'}
			class:bg-neutral-500={toast.type == 'neutral'}
		>
			{toast.content}
		</div>
	{/each}
</div>
