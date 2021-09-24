<script>
	export let handleClose;
</script>

<div class="modal-bg">
	<div class="modal">
		<header class="modal-header">
			<button class="font-bold text-text-4" on:click={handleClose}>Close</button>
		</header>
		<slot />
	</div>
</div>

<style lang="postcss">
	.modal-bg {
		background: #00000088;
		z-index: 10;
		@apply fixed left-0 top-0 bottom-0 right-0 flex justify-center items-center;
	}

	.modal {
		min-width: 24rem;
		z-index: 555;
		@apply bg-white p-4 rounded shadow-lg;
	}

	.modal-header {
		@apply flex justify-end;
	}
</style>
