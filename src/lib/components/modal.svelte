<script>
	export let handleClose;
</script>

<div class="modal-bg">
	<div class="modal">
		<header class="modal-header">
			<button class="font-bold text-text-4" on:click={handleClose}
				>Cerrar ventana</button
			>
		</header>
		<hr class="my-4 border-none" />
		<slot />
	</div>
</div>

<style lang="postcss">
	.modal-bg {
		background: #00000088;
		@apply fixed left-0 top-0 bottom-0 right-0 flex justify-center items-center;
	}

	.modal {
		margin-top: -8rem;
		min-width: 24rem;
		max-height: 70vh;
		@apply bg-white p-4 rounded shadow-lg overflow-auto;
	}

	.modal-header {
		@apply flex justify-end;
	}
</style>
