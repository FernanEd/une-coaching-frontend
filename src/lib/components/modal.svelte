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
		z-index: 10;
		@apply fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center;
	}

	.modal {
		margin-top: -8rem;
		min-width: 24rem;
		max-height: 70vh;
		@apply p-4 overflow-auto bg-white rounded shadow-lg;
	}

	.modal-header {
		@apply flex justify-end;
	}
</style>
