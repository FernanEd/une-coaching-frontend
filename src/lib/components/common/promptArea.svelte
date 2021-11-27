<script>
	import { prompts } from '$lib/stores/prompts';
	import WarningIcon from 'svelte-icons/md/MdWarning.svelte';
</script>

{#if $prompts}
	<div class="modal-bg">
		<div
			class="modal"
			class:success={$prompts.type == 'success'}
			class:neutral={$prompts.type == 'neutral'}
			class:danger={$prompts.type == 'danger'}
		>
			<div class="modal-body">
				{#if $prompts.type == 'danger'}
					<div class="w-20 text-status-danger flex-shrink-0">
						<WarningIcon />
					</div>
				{/if}

				<p class="text-lg font-bold flex-1">
					{$prompts.message}
				</p>
			</div>

			<footer
				class={`p-4 bg-neutral-100 flex gap-8 ${
					$prompts.type == 'danger'
						? 'flex-row-reverse justify-start'
						: 'justify-end'
				}`}
			>
				<button
					class={$prompts.type == 'danger' ? 'btn primary' : 'link'}
					on:click={() => {
						$prompts?.onCancel?.call(undefined);
						prompts.closePrompt();
					}}>Cancelar</button
				>
				<button
					class={$prompts.type == 'danger' ? 'link' : 'btn primary'}
					on:click={() => {
						$prompts?.onAccept?.call(undefined);
						prompts.closePrompt();
					}}>Aceptar</button
				>
			</footer>
		</div>
	</div>
{/if}

<style lang="postcss">
	.modal-bg {
		background: #00000088;
		z-index: 10;
		@apply fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center;
	}

	.modal {
		margin-top: -8rem;
		min-width: 24rem;
		max-height: 70vh;
		@apply w-screen max-w-lg overflow-auto bg-white rounded shadow-lg;
	}

	.modal-body {
		@apply p-4 flex gap-8 items-center;
	}

	.modal.danger {
		@apply border-status-danger border-2;
	}

	.modal.danger svg {
		@apply text-status-danger;
	}
</style>
