<script>
	import { prompts } from '$lib/stores/prompts';
</script>

{#if $prompts}
	<div class="modal-bg">
		<div class="modal">
			<div class="p-4">
				<p class="text-lg font-bold">
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
		@apply w-screen max-w-sm overflow-auto bg-white rounded shadow-lg;
	}

	.modal-header {
		@apply flex justify-end;
	}
</style>
